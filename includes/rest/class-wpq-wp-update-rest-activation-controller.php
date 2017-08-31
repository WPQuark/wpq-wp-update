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
		$license = new WPQ_WP_Update_License( $request['slug'], wp_unslash( $_REQUEST['domain'] ), $purchase_code );
		$record = $license->get_activation_data();

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
		// License Utility
		$license = new WPQ_WP_Update_License( $slug, $domain, $purchase_code );
		// Register it
		$result = $license->register_activation();
		// If error
		if ( false == $result['success'] ) {
			$error_type = isset( $result['dberror'] ) && true == $result['dberror'] ? 'rest_error' : 'rest_forbidden';
			$status = 'rest_error' == $error_type ? 503 : 401;
			return new WP_Error( $error_type, esc_html( $result['error'] ), array(
				'status' => $status,
			) );
		} else {
			// All good
			return $result['data'];
		}
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
