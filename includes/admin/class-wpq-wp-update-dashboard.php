<?php
/**
 * WP Updaters Dashboard
 *
 * @todo
 *
 *
 * @package    WPUpdate
 * @subpackage Admin\Pages
 * @author     Swashata Ghosh <swashata@wpquark.com>
 *
 */
class WPQ_WP_Update_Dashboard extends WPQ_WP_Update_Admin {
	/**
	 * @codeCoverageIgnore
	 */
	public function __construct() {
		$this->capability = 'manage_options';
		$this->action_nonce = 'wpq_wp_update_dashboard_nonce';

		parent::__construct( true, true );

		$this->icon = 'cog';
	}

	/**
	 * @codeCoverageIgnore
	 */
	public function admin_menu() {
		$this->pagehook = add_menu_page( __( 'WP Update Server', 'wpq-wp-update' ), __( 'WP Update', 'wpq-wp-update' ), $this->capability, 'wpq_wp_update_dashboard', array( $this, 'index' ), 'dashicons-admin-site' );
		add_submenu_page( 'wpq_wp_update_dashboard', __( 'WP Update Server', 'wpq-wp-update' ), __( 'Dashboard', 'wpq-wp-update' ), $this->capability, 'wpq_wp_update_dashboard', array( $this, 'index' ) );
	}

	/**
	 * @codeCoverageIgnore
	 */
	public function index() {
		echo '<h1>Hello World</h1>';
	}
}
