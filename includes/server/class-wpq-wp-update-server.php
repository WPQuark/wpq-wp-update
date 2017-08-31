<?php
/**
 * Class for handling Server metadata and download actions
 *
 * @package WPUpdate
 * @subpackage Server
 * @author Swashata Ghosh <swashata@wpquark.com>
 */
class WPQ_WP_Update_Server extends Wpup_UpdateServer {
	protected $license;

	// Modify the constructor to pass default home URL and server directory
	public function __construct( $serverUrl = null, $serverDirectory = null ) {
		global $wpq_wp_update_config;
		parent::__construct( home_url( '/' ), ltrim( $wpq_wp_update_config['distribution'], '/' ) );
	}


}
