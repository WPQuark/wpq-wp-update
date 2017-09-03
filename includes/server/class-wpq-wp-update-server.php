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
		parent::__construct( home_url( '/' ), rtrim( $wpq_wp_update_config['distribution'], '/' ) );
	}

	// Override the generate download URL to include the token and new action
	protected function generateDownloadUrl( Wpup_Package $package ) {
		$query = array(
			'wpq_wp_update_action' => 'download',
			'wpq_wp_update_slug' => $package->slug,
			'wpq_wp_update_token' => get_query_var( 'wpq_wp_update_token' ),
			'wpq_wp_update_domain' => get_query_var( 'wpq_wp_update_domain' ),
		);
		return self::addQueryArg( $query, $this->serverUrl );
	}

	// Check authorization with our license server
	protected function checkAuthorization( $request ) {
		// Check with license
		$license = new WPQ_WP_Update_License( $request->param( 'slug', '' ), $request->param( 'domain', '' ), '', $request->param( 'token', '' ) );
		if ( ! $license->validation_token() ) {
			$this->exitWithError( __( 'Invalid or expired token', 'wpq-wp-update' ), 400 );
		}
	}

	// Override the log to use database and not file
	protected function logRequest( $request ) {
		global $wpdb, $wpq_wp_update;
		$data = array(
			'accesstime' => current_time( 'mysql' ),
			'ip' => $request->clientIp,
			'action' => $request->param( 'action', '-' ),
			'slug' => $request->param( 'slug', '-' ),
			'itmversion' => $request->param( 'installed_version', '-' ),
			'phpversion' => $request->param( 'php', '-' ),
			'wpversion' => isset($request->wpVersion) ? $request->wpVersion : '-',
			'site_url' => isset($request->wpSiteUrl) ? $request->wpSiteUrl : '-',
			'query_string' => http_build_query( $request->query, '', '&' ),
			'method' => $request->httpMethod,
		);
		$wpdb->insert( $wpq_wp_update['log_table'], $data, '%s' );
	}

	// Override handleRequest to log after success
	public function handleRequest( $query = null, $headers = null ) {
		$this->startTime = microtime( true );

		$request = $this->initRequest( $query, $headers );

		$this->loadPackageFor( $request );
		$this->validateRequest( $request );
		$this->checkAuthorization( $request );
		$this->logRequest( $request );
		$this->dispatch( $request );
		exit;
	}
}
