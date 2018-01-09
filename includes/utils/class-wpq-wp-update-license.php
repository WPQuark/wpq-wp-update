<?php
/**
 * License verifier and authenticator class
 *
 * @package WPUpdate
 * @subpackage Utils
 * @author Swashata Ghosh <swashata@wpquark.com>
 */
class WPQ_WP_Update_License {
	protected $slug;
	protected $item_ids;
	protected $token;
	protected $purchase_code;
	protected $domain;

	public function __construct( $slug, $domain = '', $purchase_code = '', $token = '' ) {
		$this->slug = $slug;
		$this->item_ids = WPQ_WP_Update_Helpers::check_slug_presence( $slug );
		$this->token = $token;
		$this->purchase_code = $purchase_code;
		$this->domain = $domain;
	}

	public function get_activation_data() {
		global $wpdb, $wpq_wp_update;
		// If item_id not set, then it has to be error
		if ( empty( $this->item_ids ) ) {
			return false;
		}
		// Now get the row and return
		return $wpdb->get_row( $wpdb->prepare( "SELECT purchase_code, domain, expire, token FROM {$wpq_wp_update['token_table']} WHERE purchase_code = %s AND slug = %s", $this->purchase_code, $this->slug ) ); // WPCS: unprepared SQL ok.
	}

	public function register_activation() {
		global $wpdb, $wpq_wp_update;
		// If item_id not set, then it has to be error
		if ( empty( $this->item_ids ) ) {
			return false;
		}
		// Get the item data
		$item_data = WPQ_WP_Update_Helpers::get_purchase_data( $this->item_ids, $this->purchase_code );
		// If could not verify
		if ( ! $item_data ) {
			return array(
				'success' => false,
				'error' => __( 'Invalid Purchase Code', 'wpq-wp-update' ),
			);
		}
		// Found, so check with item_id
		if ( ! in_array( $item_data['item_id'], $this->item_ids ) ) {
			return array(
				'success' => false,
				'error' => __( 'Invalid Purchase Code', 'wpq-wp-update' ),
			);
		}
		// Item data found, so save it with a new register token
		// Here we have a scope for perpetual license
		if ( 'perpetual' == $item_data['license'] ) {
			$purchase_code = bin2hex( random_bytes( 16 ) );
		} else {
			$purchase_code = $this->purchase_code;
		}
		// First delete the existing one, if any
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpq_wp_update['token_table']} WHERE purchase_code = %s", $purchase_code ) ); // WPCS: unprepared SQL ok.
		// Create a new token
		$token = bin2hex( random_bytes( 16 ) );
		// Prepare the insert
		$data = array(
			'purchase_code' => $purchase_code,
			'domain' => $this->domain,
			'expire' => $item_data['expiry'],
			'token' => $token,
			'slug' => $this->slug,
			'license' => $item_data['license'],
			'purchase_date' => $item_data['purchase_date'],
			'buyer' => $item_data['buyer'],
			'item_id' => $item_data['item_id'],
		);
		$result = $wpdb->insert( $wpq_wp_update['token_table'], $data, '%s' );
		if ( $result ) {
			return array(
				'success' => true,
				'data' => $data,
			);
		} else {
			$wpdb->show_errors();
			ob_start();
			$wpdb->print_error();
			var_dump( $data, $wpdb->last_query );
			error_log( ob_get_clean() );
			return array(
				'success' => false,
				'dberror' => true,
				'error' => __( 'Something went wrong, please try again.', 'wpq-wp-update' ),
			);
		}
	}

	public function validation_token() {
		global $wpdb, $wpq_wp_update;
		if ( $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$wpq_wp_update['token_table']} WHERE token = %s AND domain = %s", $this->token, $this->domain ) ) ) {
			return true;
		}
		return false;
	}
}
