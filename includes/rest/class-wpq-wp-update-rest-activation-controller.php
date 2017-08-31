<?php
/**
 * Class for handling activation procedure
 *
 * @package WPUpdate
 * @subpackage Rest
 * @author Swashata Ghosh <swashata@wpquark.com>
 */
class WPQ_WP_Update_Rest_Activation_Controller {
	public function __construct() {
		$this->namespace = '/wpupdate/v1';
		$this->resource_name = 'activate/(?P<slug>[a-zA-Z0-9\-]+)';
	}

	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->resource_name, array(
			// Read Activation Status
			array(
				'methods' => 'GET',
				'callback' => array( $this, 'get_activation' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			// Write Activation Status
			array(
				'methods' => 'POST',
				'callback' => array( $this, 'set_activation' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
		WPQ_WP_Update_Loader::init_globals();
	}

	public function get_activation( $request ) {
		return rest_ensure_response( $this->get_activation_data( $request ) );
	}

	private function get_activation_data( $request ) {
		global $wpdb, $wpq_wp_update, $wpq_wp_update_config;

		// Now go fetch the record
		$purchase_code = wp_unslash( $_REQUEST['purchase_code'] );
		$record = $wpdb->get_row( $wpdb->prepare( "SELECT purchase_code, domain, expire FROM {$wpq_wp_update['token_table']} WHERE purchase_code = %s AND slug = %s", $purchase_code, $request['slug'] ) ); // WPCS: unprepared SQL ok.

		if ( ! $record ) {
			return new WP_Error( 'rest_invalid_param', esc_html__( 'Invalid Purchase Code or Slug', 'wpq-wp-update' ), array(
				'status' => 404,
			) );
		} else {
			return $record;
		}
	}

	public function set_activation( $request ) {
		$purchase_code = wp_unslash( $_REQUEST['purchase_code'] );
		$item_id = WPQ_WP_Update_Helpers::check_slug_presence( $request['slug'] );
		return rest_ensure_response( $this->register_activation( $request['slug'], $item_id, $purchase_code, $_REQUEST['domain'] ) );
	}

	private function register_activation( $slug, $item_id, $purchase_code, $domain ) {
		global $wpdb, $wpq_wp_update;
		// Get the item data
		$item_data = $this->verify_purchase_code( $item_id, $purchase_code );
		// If could not verify
		if ( ! $item_data ) {
			return new WP_Error( 'rest_invalid_param', esc_html__( 'Invalid Purchase Code', 'wpq-wp-update' ), array(
				'status' => 401,
			) );
		}
		// If found, but item id does not match
		if ( $item_id != $item_data['item_id'] ) {
			return new WP_Error( 'rest_forbidden', esc_html__( 'Purchase Code not valid for slug', 'wpq-wp-update' ), array(
				'status' => 401,
			) );
		}
		// Item data found, so save it with a new register token
		// First delete the existing one, if any
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpq_wp_update['token_table']} WHERE purchase_code = %s", $purchase_code ) ); // WPCS: unprepared SQL ok.
		// Create a new token
		$token = bin2hex( random_bytes( 16 ) );
		// Prepare the insert
		$data = array(
			'purchase_code' => $purchase_code,
			'domain' => $domain,
			'expire' => $item_data['expiry'],
			'token' => $token,
			'slug' => $slug,
			'license' => $item_data['license'],
			'purchase_date' => $item_data['purchase_date'],
			'buyer' => $item_data['buyer'],
		);
		$result = $wpdb->insert( $wpq_wp_update['token_table'], $data, '%s' );
		if ( $result ) {
			return $data;
		} else {
			return new WP_Error( 'rest_error', esc_html__( 'Something went wrong, please try again.', 'wpq-wp-update' ), array(
				'status' => 503,
			) );
		}
	}

	private function verify_purchase_code( $item_id, $purchase_code ) {
		return WPQ_WP_Update_Helpers::get_purchase_data( $item_id, $purchase_code );
	}

	public function check_permission( $request ) {
		global $wpdb, $wpq_wp_update, $wpq_wp_update_config;
		// Check the slug
		if ( ! isset( $request['slug'] ) || empty( $request['slug'] ) ) {
			return new WP_Error( 'rest_forbidden', esc_html__( 'No slug specified', 'wpq-wp-update' ), array(
				'status' => 401,
			) );
		}
		// Check purchase code
		if ( ! isset( $_REQUEST['purchase_code'] ) ) {
			return new WP_Error( 'rest_forbidden', esc_html__( 'No purchase code specified', 'wpq-wp-update' ), array(
				'status' => 401,
			) );
		}
		// Now see if the slug is present in the config
		$envato_id = WPQ_WP_Update_Helpers::check_slug_presence( $request['slug'] );
		if ( false === $envato_id ) {
			return new WP_Error( 'rest_invalid_param', esc_html__( 'Invalid Slug', 'wpq-wp-update' ), array(
				'status' => 400,
			) );
		}
		// See if domain is present
		if ( ! isset( $_REQUEST['domain'] ) ) {
			return new WP_Error( 'rest_invalid_param', esc_html__( 'Domain Not Present', 'wpq-wp-update' ), array(
				'status' => 400,
			) );
		}
		return true;
	}
}
