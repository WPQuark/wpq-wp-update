<?php
/**
 * Does stuff for all installation related functions
 *
 * It installs databases, setup default options and also gives capabilities to
 * needed roles.
 *
 * @package    SocialPress - WordPress Social Marketing Solution
 * @subpackage System Classes
 * @author     Swashata Ghosh <swashata@wpquark.com>
 */
class WPQ_SP_Install {
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
		$plugin = plugin_basename( WPQ_SP_Loader::$abs_file );

		// Check for PHP Version
		if ( version_compare( PHP_VERSION, '5.4.0', '<' ) ) {
			deactivate_plugins( $plugin, false, $network_wide );
			wp_die( __( 'Sorry, SocialPress requires PHP 5.4 or better!', 'wpq-sp' ) );
			return;
		}

		// Check for WordPress Version
		if ( version_compare( get_bloginfo( 'version' ), '4.0.0', '<' ) ) {
			deactivate_plugins( $plugin, false, $network_wide );
			wp_die( __( 'Sorry, SocialPress requires WordPress version 4.0.0 or better!', 'wpq-sp' ) );
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

		// Finally Set the capability
		$this->set_capabilities();
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

		// Account API related stuff
		$this->_check_accapi_options();

		// Reinit the globals
		$this->_reinit_globals();
	}

	/**
	 * Reinitialize all the global variable this plugin uses
	 *
	 * @global $wpq_sp_info
	 *
	 * @codeCoverageIgnore
	 */
	private function _reinit_globals() {
		global $wpq_sp_info;
		$wpq_sp_info = get_option( 'wpq_sp_info' );
	}

	/**
	 * Check the information variable and upgrade it
	 *
	 * @codeCoverageIgnore
	 */
	private function _check_info_option() {
		global $wpqsp;
		$socialpress_info = $wpqsp->data->defaults->info();

		$existing_info = get_option( 'wpq_sp_info', false );

		if ( false == $existing_info ) { // New install?
			add_option( 'wpq_sp_info', $socialpress_info );
		} else { // Existing install?
			$new_info = wp_parse_args( $existing_info, $socialpress_info );
			update_option( 'wpq_sp_info', $new_info );
		}
	}

	/**
	 * Check the account API related options and upgrade them if necessary
	 *
	 * @codeCoverageIgnore
	 */
	private function _check_accapi_options() {
		global $wpqsp;
		// Set the accapi variable
		$socialpress_accapi = $wpqsp->data->defaults->accapis();

		// Now check if those are there, if not add, if there update
		foreach ( $socialpress_accapi as $accapi_op => $accapi_default ) {
			$possible_op = get_option( $accapi_op, false );
			// New install or new API?
			if ( false == $possible_op ) {
				add_option( $accapi_op, $accapi_default );
			} else {
				// Do a upgrade
				update_option( $accapi_op, wp_parse_args( $possible_op, $accapi_default ) );
			}
		}
	}

	/**
	 * Sets the capabilities.
	 *
	 * @codeCoverageIgnore
	 */
	private function set_capabilities() {
		global $wpqsp;
		// Set the default capabilities
		$socialpress_caps = $wpqsp->data->defaults->caps();

		// Loop through and add the capabilities
		foreach ( $socialpress_caps as $role => $caps ) {
			if ( ! empty( $caps ) ) {
				$role_obj = get_role( $role );
				foreach ( $caps as $cap ) {
					$role_obj->add_cap( $cap );
				}
			}
		}
	}
}
