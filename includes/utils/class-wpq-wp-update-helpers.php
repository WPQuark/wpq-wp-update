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
				'buyer' => 'master',
				'license' => 'perpetual',
				'purchase_date' => current_time( 'mysql' ),
			);
		}

		// Get the response from the envato API
		$result = self::get_envato_restclient()
			->get( 'author/sale', array(
				'code' => $purchase_code,
			) );
		// Check
		if ( 200 == $result->info->http_code ) {
			$response = $result->decode_response();
			if ( $response && is_object( $response ) && isset( $response->purchase_count ) ) {
				return array(
					'item_id' => $response->item->id,
					'expiry' => date( 'Y-m-d H:i:s', strtotime( $response->supported_until ) ),
					'buyer' => $response->buyer,
					'license' => $response->license,
					'purchase_date' => date( 'Y-m-d H:i:s', strtotime( $response->sold_at ) ),
				);
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	public static function get_envato_restclient( $base_url = 'https://api.envato.com/v3/market' ) {
		global $wpq_wp_update_config;
		$api = new RestClient( array(
			'base_url' => $base_url,
			'format' => 'json',
			'headers' => array(
				'Authorization'  => 'Bearer ' . $wpq_wp_update_config['envato_api'],
			),
		) );
		return $api;
	}
}
