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
		// Envato User
		$items[] = array(
			'name' => 'wpq_wpupdate_config[envato_user]',
			'label' => __( 'Envato User Name', 'wpq-wp-update' ),
			'ui' => 'text',
			'param' => array( 'wpq_wpupdate_config[envato_user]', $wpq_wp_update_config['envato_user'], __( 'Required', 'wpq-wp-update' ) ),
			'help' => __( 'Your envato username.', 'wpq-wp-update' ),
		);
		// Envato API Key
		$items[] = array(
			'name' => 'wpq_wpupdate_config[envato_api]',
			'label' => __( 'Envato API Key (Personal Token)', 'wpq-wp-update' ),
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
		// Product Maps
		$product_maps_columns = array(
			0 => array(
				'label' => __( 'Envato Item ID', 'wpq-wp-update' ),
				'size' => '25',
				'type' => 'spinner',
			),
			1 => array(
				'label' => __( 'Plugin/Theme SLUG', 'wpq-wp-update' ),
				'size' => '75',
				'type' => 'text',
			),
		);
		$product_maps_labels = array(
			'add' => __( 'Add New Product', 'wpq-wp-update' ),
		);
		$product_maps_name_prefix = 'wpq_wpupdate_config[product_maps][__SDAKEY__]';
		$product_maps_data = array(
			0 => array( $product_maps_name_prefix . '[item_id]', '', __( 'Required', 'wpq-wp-update' ) ),
			1 => array( $product_maps_name_prefix . '[slug]', '', __( 'Required', 'wpq-wp-update' ) ),
		);
		$product_maps_items = array();
		$product_maps_items_name_prefix = 'wpq_wpupdate_config[product_maps][%d]';
		$max_key = null;
		foreach ( (array) $wpq_wp_update_config['product_maps'] as $key => $val ) {
			$product_maps_items[] = array(
				0 => array( sprintf( $product_maps_items_name_prefix . '[item_id]', $key ), $val['item_id'], __( 'Required', 'wpq-wp-update' ) ),
				1 => array( sprintf( $product_maps_items_name_prefix . '[slug]', $key ), $val['slug'], __( 'Required', 'wpq-wp-update' ) ),
			);
			$max_key = max( array( $key, $max_key ) );
		}
		$items[] = array(
			'name' => '',
			'label' => __( 'Envato Items', 'wpq-wp-update' ),
			'ui' => 'sda_list',
			'param' => array(
				array(
					'columns' => $product_maps_columns,
					'labels' => $product_maps_labels,
					'features' => array(
						'draggable' => false,
					),
				),
				$product_maps_items,
				$product_maps_data,
				$max_key,
			),
			'help' => __( 'Map envato items with slug. slug is the relative path to the distribution directory where we will try to find slug.zip for package.', 'wpq-wp-update' ),
			'description' => __( 'You can map to same slug for multiple item ids or vice-versa.', 'wpq-wp-update' ),
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
			'envato_user' => isset( $this->post['wpq_wpupdate_config']['envato_user'] ) ? strip_tags( $this->post['wpq_wpupdate_config']['envato_user'] ) : '',
			'envato_api' => isset( $this->post['wpq_wpupdate_config']['envato_api'] ) ? strip_tags( $this->post['wpq_wpupdate_config']['envato_api'] ) : '',
			'distribution' => isset( $this->post['wpq_wpupdate_config']['distribution'] ) ? strip_tags( rtrim( $this->post['wpq_wpupdate_config']['distribution'], '/' ) ) : dirname( ABSPATH ) . '/distributions',
			'masterkey' => isset( $this->post['wpq_wpupdate_config']['masterkey'] ) ? strip_tags( $this->post['wpq_wpupdate_config']['masterkey'] ) : uniqid( 'wpq-wp-update-' ),
			'product_maps' => isset( $this->post['wpq_wpupdate_config']['product_maps'] ) ? (array) $this->post['wpq_wpupdate_config']['product_maps'] : array(),
		);
		update_option( 'wpq_wp_update_config', $new_options );
		// Update globals
		$wpq_wp_update_load->init_globals();
		// Create the directories if not present
		$distribution = trailingslashit( $new_options['distribution'] );
		wp_mkdir_p( $distribution . 'cache' );
		wp_mkdir_p( $distribution . 'logs' );
		wp_mkdir_p( $distribution . 'banners' );
		wp_mkdir_p( $distribution . 'packages' );
		return true;
	}
}
