<?php
/**
 * Proxy the Wpup_UpdateServer through WordPress Template direct
 *
 * @package WPUpdate
 * @subpackage Server
 * @author Swashata Ghosh <swashata@wpquark.com>
 */
class WPQ_WP_Update_Handler {
	protected $update_server;

	public function __construct() {
		$this->update_server = new WPQ_WP_Update_Server();

		// Add custom query vars
		add_filter( 'query_vars', array( $this, 'add_query_vars' ) );
		// Custom output through template_redirect
		add_action( 'template_redirect', array( $this, 'handle_update_request' ) );
	}

	public function add_query_vars( $query_vars ) {
		$query_vars = array_merge( $query_vars, array(
			'wpq_wp_update_action',
			'wpq_wp_update_slug',
			'wpq_wp_update_token',
			'wpq_wp_update_domain',
		) );
		return $query_vars;
	}

	public function handle_update_request() {
		if ( get_query_var( 'wpq_wp_update_action' ) ) {
			$this->update_server->handleRequest( array(
				'action' => get_query_var( 'wpq_wp_update_action' ),
				'slug' => get_query_var( 'wpq_wp_update_slug' ),
				'token' => get_query_var( 'wpq_wp_update_token' ),
				'domain' => get_query_var( 'wpq_wp_update_domain' ),
				'installed_version' => isset( $_GET['installed_version'] ) ? $_GET['installed_version'] : '-',
				'php' => isset( $_GET['php'] ) ? $_GET['php'] : '-',
			) );
		}
	}
}
