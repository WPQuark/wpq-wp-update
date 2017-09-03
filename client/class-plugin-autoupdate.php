<?php
/**
 * Class for providing automatic updates to your plugin
 *
 * Uses our distribution server with purchase code verification
 *
 * This is a singleton class
 *
 * Make sure you have plugin-update-checker class installed
 *
 * @link       {https://github.com/YahnisElsts/plugin-update-checker}
 *
 * To install perform
 *
 * `composer require yahnis-elsts/plugin-update-checker`
 *
 * Then rename this class to something like {Your_Plugin}AutoUpdate and hack
 * away
 *
 * @package    WPUpdate
 * @subpackage Client
 * @author     Swashata Ghosh <swashata@wpquark.com>
 */
class Plugin_AutoUpdate {
	/**
	 * Server URL. Change this to point to your server
	 *
	 * @var        string
	 */
	const SERVER = 'http://wpupdate.dev';

	/**
	 * Plugin slug which is registered to the update server
	 *
	 * @var        string
	 */
	const SLUG = 'plugin-slug';

	/**
	 * WP Options Table key, where token would be stored
	 *
	 * @var        string
	 */
	const TOKEN_OPTIONS = 'plugin_update_token';

	/**
	 * Plugin absolute path. Change this to point to your plugin
	 *
	 * @var        string
	 */
	const PLUGIN_ABS_FILE = '/home/user/public_html/wp-content/plugins/my-plugin/plugin.php';

	/**
	 * Activation endpoint. Do not change this
	 *
	 * @var        string
	 */
	const ACTIVATION_ENDPOINT = 'wpupdate/v1/activate';

	/**
	 * Singleton instance variable
	 */
	private static $instance = null;

	/**
	 * Update Server Variable
	 *
	 * @var        Puc_v4_Factory
	 */
	protected $update_server;

	/**
	 * Get the instance of this singleton class
	 *
	 * @return     Plugin_AutoUpdate  The instance of the class
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new static();
		}
		return self::$instance;
	}

	private function __construct() {
		if ( ( ! defined( 'WP_DEBUG' ) || true !== WP_DEBUG )
			&& $this->get_token() ) {
			$this->update_server = Puc_v4_Factory::buildUpdateChecker(
				$this->get_update_server_url(),
				self::PLUGIN_ABS_FILE,
				self::SLUG
			);
		}
		if ( ! $this->get_token() ) {
			add_action( 'admin_notices', array( $this, 'activation_notice' ) );
		}
	}

	/**
	 * Show activation notice if token is not found
	 */
	public function activation_notice() {
		echo '<div class="notice notice-warning is-dismissible"><p>' . __( 'Plugin is not activated. To get automatic updates and other features, please activate Plugin.', 'ipt_fsqm' );
		echo ' <a href="' . add_query_arg( array(
			'page' => 'ipt_fsqm_settings',
		), admin_url( 'admin.php' ) ) . '" class="button button-primary">' . __( 'Activate Plugin', 'ipt_fsqm' ) . '</a>';
		echo '</p></div>';
	}

	/**
	 * Gets the update server url.
	 *
	 * @return     string  The update server url.
	 */
	protected function get_update_server_url() {
		$token_data = $this->get_token();
		$domain = $this->get_domain();
		$query_args = array(
			'wpq_wp_update_token' => $token_data,
			'wpq_wp_update_domain' => $domain,
			'wpq_wp_update_action' => 'get_metadata',
			'wpq_wp_update_slug' => self::SLUG,
		);
		return add_query_arg( $query_args, self::SERVER );
	}

	/**
	 * Get current activation status with flag and message.
	 *
	 * Use this to show activation status within your plugin.
	 *
	 * @param      string  $purchase_code  The purchase code
	 *
	 * @return     array   associative array with 'activated' flag (bool) and 'msg'
	 */
	public function current_activation_status( $purchase_code ) {
		$token_data = $this->get_token();
		if ( $this->get_activation_status( $purchase_code ) ) {
			$return = array(
				'activated' => true,
				'msg' => __( 'Your product Plugin is activated and receiving automatic updates.', 'ipt_fsqm' ),
			);
		} elseif ( '' != $purchase_code && '' == $token_data ) {
			$return = array(
				'activated' => false,
				'msg' => __( 'The purchase code is invalid. Please enter a correct one.', 'ipt_fsqm' ),
			);
		} elseif ( '' == $token_data ) {
			$return = array(
				'activated' => false,
				'msg' => __( 'Your product Plugin is not activated. Please enter your purchase code.', 'ipt_fsqm' ),
			);
		} else {
			$return = array(
				'activated' => false,
				'msg' => __( 'Your product Plugin is activated for another domain. Activating it here will remove activation from the other domain.', 'ipt_fsqm' ),
			);
		}
		return $return;
	}

	/**
	 * Sets the token from purchase code.
	 *
	 * @param      string   $purchase_code  The purchase code
	 *
	 * @return     boolean  whether successfully stored or not. On success, returns the json output from the server
	 */
	public function set_token_from_code( $purchase_code ) {
		if ( '' == $purchase_code ) {
			// Reset activation
			update_option( self::TOKEN_OPTIONS, '' );
			return false;
		}
		$result = wp_remote_post( $this->get_activation_url(), array(
			'body' => array(
				'purchase_code' => $purchase_code,
				'domain' => $this->get_domain(),
			),
		) );
		if ( is_wp_error( $result ) ) {
			return false;
		}

		$json = json_decode( $result['body'], true );

		if ( isset( $json['token'] ) && ! empty( $json['token'] ) ) {
			update_option( self::TOKEN_OPTIONS, $json['token'] );
		}
		return $json;
	}

	/**
	 * Gets the activation status.
	 *
	 * @param      string   $purchase_code  The purchase code
	 *
	 * @return     boolean  The activation status.
	 */
	public function get_activation_status( $purchase_code ) {
		$result = wp_remote_get( $this->get_activation_url(), array(
			'body' => array(
				'purchase_code' => $purchase_code,
				'domain' => $this->get_domain(),
			),
		) );
		if ( is_wp_error( $result ) || 200 != $result['response']['code'] ) {
			return false;
		}

		$json = json_decode( $result['body'], true );

		if ( $this->get_domain() == $json['domain'] && $this->get_token() == $json['token'] ) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Gets the activation url.
	 *
	 * @return     string  The activation url.
	 */
	protected function get_activation_url() {
		return self::SERVER . '/wp-json/' . self::ACTIVATION_ENDPOINT . '/' . self::SLUG;
	}

	/**
	 * Gets the domain of this WordPress installation
	 *
	 * @return     string  The domain.
	 */
	protected function get_domain() {
		return $_SERVER['HTTP_HOST'];
	}

	/**
	 * Gets the token from WP Options Table
	 *
	 * @return     string  The token.
	 */
	protected function get_token() {
		return get_option( self::TOKEN_OPTIONS, '' );
	}
}
