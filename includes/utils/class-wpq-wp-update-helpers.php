<?php
/**
 * Some helper utility methods to speed up stuff and avoid duplication
 *
 * @package WPUpdate
 * @subpackage Utils
 * @author Swashata Ghosh <swashata@wpquark.com>
 */
class WPQ_WP_Update_Helpers {
	/**
	 * Checks if a slug is present in the system settings
	 *
	 * If present, then return the envato ID, otherwise return false
	 *
	 * @param      string  $slug   The slug
	 *
	 * @return     boolean|string  false if not found, envato item ID if found
	 */
	public static function check_slug_presence( $slug ) {
		global $wpq_wp_update_config;
		foreach ( (array) $wpq_wp_update_config['product_maps'] as $product ) {
			if ( $slug == $product['slug'] ) {
				return $product['item_id'];
			}
		}
		return false;
	}

	public static function get_purchase_data( $item_id, $purchase_code ) {
		global $wpq_wp_update_config;
		// If requesting through a masterkey, then just return
		if ( $wpq_wp_update_config['masterkey'] == $purchase_code ) {
			return array(
				'item_id' => $item_id,
				'expiry' => date( 'Y-m-d H:i:s', strtotime( '+100 years' ) ),
			);
		}
		// Now we need to check with the server
		$url = 'https://api.envato.com/v3/market/author/sale?code=' . urlencode( $purchase_code );
		$response = \Httpful\Request::get( $url )
			->expectsJson()
			->addHeaders( array(
				'Authorization'  => 'Bearer ' . $wpq_wp_update_config['envato_api'],
			) )
			->send();

		// Check
		if ( $response && is_object( $response ) && isset( $response->body->purchase_count ) ) {
			return array(
				'item_id' => $response->body->item->id,
				'expiry' => date( 'Y-m-d H:i:s', strtotime( $response->body->supported_until ) ),
				'buyer' => $response->body->buyer,
				'license' => $response->body->license,
				'purchase_date' => $response->body->sold_at,
			);
		} else {
			return false;
		}
	}
}
