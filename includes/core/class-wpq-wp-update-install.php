<?php
/**
 * Does stuff for all installation related functions
 *
 * It installs databases, setup default options and also gives capabilities to
 * needed roles.
 *
 * @package    WPUpdate
 * @subpackage Core\Install
 * @author     Swashata Ghosh <swashata@wpquark.com>
 */
class WPQ_WP_Update_Install {
	/**
	 * Install the plugin on the site
	 *
	 * Assumes that plugin wasn't installed or was not active
	 *
	 * @param      boolean  $network_wide  Whether networkwide installation
	 *
	 * @codeCoverageIgnore
	 */
	public function install( $network_wide = false ) {
		$plugin = plugin_basename( WPQ_WP_Update_Loader::$abs_file );

		// Check for PHP Version
		if ( version_compare( PHP_VERSION, '5.4.0', '<' ) ) {
			deactivate_plugins( $plugin, false, $network_wide );
			wp_die( __( 'Sorry, WP Update requires PHP 5.4 or better!', 'wpq-wp-update' ) );
			return;
		}

		// Check for WordPress Version
		if ( version_compare( get_bloginfo( 'version' ), '4.0.0', '<' ) ) {
			deactivate_plugins( $plugin, false, $network_wide );
			wp_die( __( 'Sorry, WP Update requires WordPress version 4.0.0 or better!', 'wpq-wp-update' ) );
			return;
		}

		// No errors, so do stuff
		$this->upgrade();
	}

	/**
	 * Upgrades the plugin on the go
	 *
	 * Assuems that plugin is already active
	 *
	 * @codeCoverageIgnore
	 */
	public function upgrade() {
		// Check Options
		$this->check_op();

		// Check Databases
		$this->check_db();
	}

	public function check_db() {
		/**
		 * Include the necessary files
		 * Also the global options
		 */
		if ( file_exists( ABSPATH . 'wp-admin/includes/upgrade.php' ) ) {
			require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		} else {
			require_once ABSPATH . 'wp-admin/upgrade-functions.php';
		}
		global $charset_collate, $wpdb;

		$prefix = $wpdb->prefix;
		$sqls = array();

		$sqls[] = "CREATE TABLE {$prefix}wpq_wpupdate_log (
			id BIGINT(20) UNSIGNED NOT NULL auto_increment,
			accesstime DATETIME NOT NULL default '0000-00-00 00:00:00',
			ip VARCHAR(50) NOT NULL default '0.0.0.0',
			action VARCHAR(255) NOT NULL default '',
			slug VARCHAR(50) NOT NULL default '',
			itmversion VARCHAR(10) NOT NULL default '',
			wpversion VARCHAR(10) NOT NULL default '',
			site_url VARCHAR(255) NOT NULL default '',
			query_string VARCHAR(255) NOT NULL default '',
			method VARCHAR(10) NOT NULL default 'GET',
			PRIMARY KEY  (id),
			KEY action ( action ),
			KEY accesstime ( accesstime ),
			KEY slug ( slug ),
			KEY wpversion ( wpversion )
		) $charset_collate;";

		$sqls[] = "CREATE TABLE {$prefix}wpq_wpupdate_token (
			id BIGINT(20) UNSIGNED NOT NULL auto_increment,
			purchase_code VARCHAR(50) NOT NULL default '',
			domain VARCHAR(50) NOT NULL default '',
			expire DATETIME NOT NULL default '0000-00-00 00:00:00',
			token VARCHAR(50) NOT NULL default '',
			slug VARCHAR(50) NOT NULL default '',
			license VARCHAR(50) NOT NULL default '',
			purchase_date DATETIME NOT NULL default '0000-00-00 00:00:00',
			buyer VARCHAR(20) NOT NULL default '',
			item_id BIGINT(20) UNSIGNED NOT NULL default '0',
			PRIMARY KEY  (id),
			UNIQUE KEY token (token),
			UNIQUE KEY purchase_code ( purchase_code ),
			KEY domain ( domain )
		) $charset_collate;";

		foreach ( $sqls as $sql ) {
			dbDelta( $sql );
		}
	}

	/**
	 * Check the options during installation or upgrade
	 *
	 * It is smart enough to understand whether installation is going on or
	 * performing an upgrade and it will act accordingly.
	 *
	 * @codeCoverageIgnore
	 */
	private function check_op() {
		// The info variable, holding version information and some other stuff
		$this->_check_info_option();

		// Reinit the globals
		$this->_reinit_globals();
	}

	/**
	 * Reinitialize all the global variable this plugin uses
	 *
	 * @global $wpq_wp_update
	 *
	 * @codeCoverageIgnore
	 */
	private function _reinit_globals() {
		global $wpq_wp_update, $wpq_wp_update_config;
		$wpq_wp_update = get_option( 'wpq_wp_update' );
		$wpq_wp_update_config = get_option( 'wpq_wp_update_config' );
	}

	/**
	 * Check the information variable and upgrade it
	 *
	 * @codeCoverageIgnore
	 */
	private function _check_info_option() {
		$info = array(
			'version' => WPQ_WP_Update_Loader::$version,
		);
		$config = array(
			'distribution' => dirname( ABSPATH ) . '/distributions',
			'masterkey' => uniqid( 'wpq-wp-update-' ),
			'envato_api' => '',
			'envato_user' => '',
			'product_maps' => array(),
		);

		$existing_info = get_option( 'wpq_wp_update', false );

		if ( false == $existing_info ) { // New install?
			add_option( 'wpq_wp_update', $info );
			add_option( 'wpq_wp_update_config', $config );
		} else { // Existing install?
			$new_info = wp_parse_args( $existing_info, $info );
			update_option( 'wpq_wp_update', $new_info );
			$new_config = wp_parse_args( get_option( 'wpq_wp_update_config' ), $config );
			update_option( 'wpq_wp_update_config', $new_config );
		}
	}
}
