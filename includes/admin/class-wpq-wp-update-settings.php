<?php
/**
 * WP Updaters Dashboard
 *
 * @package    WPUpdate
 * @subpackage Admin\Pages
 * @author     Swashata Ghosh <swashata@wpquark.com>
 *
 */
class WPQ_WP_Update_Settings extends WPQ_WP_Update_Admin {
	/**
	 * @codeCoverageIgnore
	 */
	public function __construct() {
		$this->capability = 'manage_options';
		$this->action_nonce = 'wpq_wp_update_settings_nonce';

		parent::__construct( true, true );

		$this->icon = 'cog';
	}

	/**
	 * @codeCoverageIgnore
	 */
	public function admin_menu() {
		$this->pagehook = add_submenu_page( 'wpq_wp_update_dashboard', __( 'WP Update Server Settings', 'wpq-wp-update' ), __( 'Settings', 'wpq-wp-update' ), $this->capability, 'wpq_wp_update_settings', array( $this, 'index' ) );
	}

	/**
	 * @codeCoverageIgnore
	 */
	public function index() {
		$this->index_head( __( 'WP Update Server', 'wpq-wp-update' ), true, true, '100%', array() );
		$this->ui->iconbox( __( 'Server Settings', 'wpq-wp-update' ), array( array( $this, 'server_settings' ), array() ), 'key2', 0, '', array(), array( 'has-inner-ui' ) );
		$this->index_foot( true, true );
	}

	/**
	 * @codeCoverageIgnore
	 */
	public function server_settings() {
		global $wpq_wp_update_config;
		// Items
		$items = array();
		// Envato API Key
		$items[] = array(
			'name' => 'wpq_wpupdate_config[envato_api]',
			'label' => __( 'Envato API Key', 'wpq-wp-update' ),
			'ui' => 'text',
			'param' => array( 'wpq_wpupdate_config[envato_api]', $wpq_wp_update_config['envato_api'], __( 'Required', 'wpq-wp-update' ) ),
			'help' => __( 'Envato API Key with all needed permissions.', 'wpq-wp-update' ),
		);
		// distribution
		$items[] = array(
			'name' => 'wpq_wpupdate_config[distribution]',
			'label' => __( 'Path to Distribution Zip Files', 'wpq-wp-update' ),
			'ui' => 'text',
			'param' => array( 'wpq_wpupdate_config[distribution]', $wpq_wp_update_config['distribution'], __( 'Required', 'wpq-wp-update' ) ),
			'help' => __( 'Use real and absolute path where we will find every package inside <code>slug/slug.zip</code> and banners inside <code>slug/banners/...</code> directory and file.', 'wpq-wp-update' ),
		);
		// Master Key
		$items[] = array(
			'name' => 'wpq_wpupdate_config[masterkey]',
			'label' => __( 'Master Key to override Purchase code', 'wpq-wp-update' ),
			'ui' => 'text',
			'param' => array( 'wpq_wpupdate_config[masterkey]', $wpq_wp_update_config['masterkey'], __( 'Required', 'wpq-wp-update' ) ),
			'help' => __( 'If a request is sent with this value as <code>purchase_code</code> parameter, then we skip checking envato API.', 'wpq-wp-update' ),
		);
		$this->ui->form_table( $items );
	}

	/**
	 * @codeCoverageIgnore
	 */
	public function ajax_save( $check_referer = true ) {
		// Check for permissions and stuff
		parent::ajax_save();

		$return = array(
			'status' => 'error',
			'msg' => '',
		);

		if ( $this->save_options() ) {
			$return['status'] = 'success';
			$return['msg'] = __( 'Successfully saved the options.', 'wpq-wp-update' );
		} else {
			$return['msg'] = __( 'Either you have not changed anything or some error has occured. Please contact the developer.', 'wpq-wp-update' );
		}

		echo json_encode( (object) $return );
		die();
	}

	/**
	 * @codeCoverageIgnore
	 */
	public function save_post( $check_referer = true ) {
		// Check for permissions and stuff
		parent::save_post();

		// Save
		if ( $this->save_options() ) {
			// Redirect on success
			wp_redirect( add_query_arg( array(
				'post_result' => '1',
			), $_REQUEST['_wp_http_referer'] ) );
		} else {
			// Also on error
			wp_redirect( add_query_arg( array(
				'post_result' => '2',
			), $_REQUEST['_wp_http_referer'] ) );
		}
		// Nothing much to do
		die();
	}

	public function save_options() {
		global $wpq_wp_update_load;
		// Return if nothing is there
		if ( ! isset( $this->post['wpq_wpupdate_config'] ) ) {
			return false;
		}
		// Save
		$new_options = array(
			'envato_api' => isset( $this->post['wpq_wpupdate_config']['envato_api'] ) ? strip_tags( $this->post['wpq_wpupdate_config']['envato_api'] ) : '',
			'distribution' => isset( $this->post['wpq_wpupdate_config']['distribution'] ) ? strip_tags( $this->post['wpq_wpupdate_config']['distribution'] ) : dirname( ABSPATH ) . '/distributions/',
			'masterkey' => isset( $this->post['wpq_wpupdate_config']['masterkey'] ) ? strip_tags( $this->post['wpq_wpupdate_config']['masterkey'] ) : uniqid( 'wpq-wp-update-' ),
		);
		update_option( 'wpq_wp_update_config', $new_options );
		// Update globals
		$wpq_wp_update_load->init_globals();
		return true;
	}
}
