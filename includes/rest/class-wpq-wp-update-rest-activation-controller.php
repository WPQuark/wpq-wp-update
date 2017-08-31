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

	}

	public function get_activation( $request ) {

	}

	public function set_activation( $request ) {

	}
}
