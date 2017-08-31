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
	protected $item_id;
	protected $token;
	protected $purchase_code;
	protected $domain;

	public function __construct( $slug, $domain = '', $purchase_code = '', $token = '' ) {
		$this->slug = $slug;
		$this->item_id = WPQ_WP_Update_Helpers::check_slug_presence( $slug );
		$this->token = $token;
		$this->purchase_code = $purchase_code;
		$this->domain = $domain;
	}

	public function get_activation_data() {
		global $wpdb, $wpq_wp_update;
		// If item_id not set, then it has to be error
		if ( false === $this->item_id ) {
			return false;
		}
		// Now get the row and return
		return $wpdb->get_row( $wpdb->prepare( "SELECT purchase_code, domain, expire FROM {$wpq_wp_update['token_table']} WHERE purchase_code = %s AND slug = %s", $this->purchase_code, $this->slug ) ); // WPCS: unprepared SQL ok.
	}

	public function register_activation() {
		global $wpdb, $wpq_wp_update;
		// If item_id not set, then it has to be error
		if ( false === $this->item_id ) {
			return false;
		}
		// Get the item data
		$item_data = WPQ_WP_Update_Helpers::get_purchase_data( $this->item_id, $this->purchase_code );
		// If could not verify
		if ( ! $item_data ) {
			return array(
				'success' => false,
				'error' => __( 'Invalid Purchase Code', 'wpq-wp-update' ),
			);
		}
		// Found, so check with item_id
		if ( $this->item_id != $item_data['item_id'] ) {
			return array(
				'success' => false,
				'error' => __( 'Invalid Purchase Code', 'wpq-wp-update' ),
			);
		}
		// Item data found, so save it with a new register token
		// First delete the existing one, if any
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpq_wp_update['token_table']} WHERE purchase_code = %s", $this->purchase_code ) ); // WPCS: unprepared SQL ok.
		// Create a new token
		$token = bin2hex( random_bytes( 16 ) );
		// Prepare the insert
		$data = array(
			'purchase_code' => $this->purchase_code,
			'domain' => $this->domain,
			'expire' => $item_data['expiry'],
			'token' => $token,
			'slug' => $this->slug,
			'license' => $item_data['license'],
			'purchase_date' => $item_data['purchase_date'],
			'buyer' => $item_data['buyer'],
		);
		$result = $wpdb->insert( $wpq_wp_update['token_table'], $data, '%s' );
		if ( $result ) {
			return array(
				'success' => true,
				'data' => $data,
			);
		} else {
			return array(
				'success' => false,
				'dberror' => true,
				'error' => __( 'Something went wrong, please try again.', 'wpq-wp-update' ),
			);
		}
	}
}