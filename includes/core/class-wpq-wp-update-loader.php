<?php
/**
 * Class to load Plugin functionality
 *
 * @package WPUpdate
 * @subpackage Core\Loader
 */
class WPQ_WP_Update_Loader {
	/**
	 * Absolute path of this plugin
	 */
	public static $abs_path;

	/**
	 * Absolute filepath of the main plugin file
	 */
	public static $abs_file;

	/**
	 * Current script version of the plugin
	 */
	public static $version;

	/**
	 * The instance variable
	 *
	 * This is a singleton class and we are going to use this
	 * for getting the only instance
	 */
	private static $instance = null;

	/**
	 * Admin classes to instantiate
	 *
	 * @var        array
	 */
	private static $init_classes = array();

	/**
	 * Get the singleton instance
	 *
	 * @param      string         $plugin_file  The plugin file
	 * @param      string         $version      The version
	 *
	 * @return     WP_CPL_Loader  The singleton instance
	 *
	 * @codeCoverageIgnore
	 */
	public static function instance( $plugin_file, $version ) {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self( $plugin_file, $version );
		}
		return self::$instance;
	}

	/**
	 * Constructor function
	 *
	 * We declare as private to make the class singleton
	 *
	 * @param      string  $plugin_file  The plugin file
	 * @param      string  $version      The version
	 *
	 * @codeCoverageIgnore
	 */
	private function __construct( $plugin_file, $version ) {
		// Set the plugin file
		self::$abs_file = $plugin_file;

		// Set the plugin directory
		self::$abs_path = dirname( $plugin_file );

		// Set version
		self::$version = $version;

		// Set Admin classes
		self::$init_classes = array();
	}

	/**
	 * The loader function
	 *
	 * Does all sorts of hooking, filtering & enqueue
	 *
	 * @codeCoverageIgnore
	 */
	public function load() {
		// First the activation hook
		register_activation_hook( self::$abs_file, array( $this, 'plugin_install' ) );

		// Load text domain for translation
		load_plugin_textdomain( 'wpq-wp-update', false, dirname( plugin_basename( self::$abs_file ) ) . '/translations' );

		// Auto upgrade
		add_action( 'plugins_loaded', array( $this, 'auto_upgrade' ) );

		// Init globals
		self::init_globals();

		// Do some admin related stuff
		if ( is_admin() ) {
			// Extendible WP CPL Settings
			add_action( 'plugins_loaded', array( $this, 'init_admin_menus' ), 20 );
			// Add our glorified settings page
			self::$init_classes = array( 'WPQ_WP_Update_Dashboard', 'WPQ_WP_Update_Settings' );
			add_action( 'admin_init', array( $this, 'gen_admin_menu' ), 20 );
			// Add some CSS/JS to the widgets and customizer area
			add_action( 'admin_enqueue_scripts', array( $this, 'admin_menu_style' ) );
		}

		// Register rest
		add_action( 'rest_api_init', array( $this, 'rest_init' ) );

		// Load our custom handler
		new WPQ_WP_Update_Handler();
	}

	public static function init_globals() {
		global $wpq_wp_update, $wpq_wp_update_config, $wpdb;
		$wpq_wp_update = get_option( 'wpq_wp_update', array() );
		$wpq_wp_update_config = get_option( 'wpq_wp_update_config' );
		$wpq_wp_update['token_table'] = $wpdb->prefix . 'wpq_wpupdate_token';
		$wpq_wp_update['log_table'] = $wpdb->prefix . 'wpq_wpupdate_log';
	}

	public function rest_init() {
		// Activator
		$activation_controller = new WPQ_WP_Update_Rest_Activation_Controller();
		$activation_controller->register_routes();
	}

	/*==========================================================================
	 * System Hooks
	 *========================================================================*/
	/**
	 * Init Admin Menu
	 *
	 * With the possibility of hooking
	 *
	 * @codeCoverageIgnore
	 */
	public function init_admin_menus() {
		self::$init_classes = apply_filters( 'wpq_wp_update_admin_classes', self::$init_classes );
		foreach ( (array) self::$init_classes as $class ) {
			if ( class_exists( $class ) ) {
				global ${'admin_menu' . $class};
				${'admin_menu' . $class} = new $class();
			}
		}
	}

	/**
	 * Hooks to the admin_menu to create WP CPL Settings page
	 *
	 * @codeCoverageIgnore
	 */
	public function gen_admin_menu() {
		$admin_menus = array();
		foreach ( (array) self::$init_classes as $class ) {
			if ( class_exists( $class ) ) {
				global ${'admin_menu' . $class};
				$admin_menus[] = ${'admin_menu' . $class}->get_pagehook();
			}
		}

		foreach ( $admin_menus as $menu ) {
			add_action( 'admin_print_styles-' . $menu, array( $this, 'admin_enqueue_script_style' ) );
		}
	}

	/*==========================================================================
	 * Enqueues
	 *========================================================================*/

	/**
	 * Admin related enqueues
	 *
	 * @codeCoverageIgnore
	 */
	public function admin_menu_style() {
		global $pagenow;
		// Just our expanding JS + CSS for the advanced options
		// if ( 'widgets.php' == $pagenow || 'customize.php' == $pagenow ) {
		// 	// TODO
		// }
	}

	/**
	 * Enqueues on pages handled by WP CPL
	 *
	 * @codeCoverageIgnore
	 */
	public function admin_enqueue_script_style() {
		// All files needed by UI
		$ui = WPQ_WP_Update_Admin_UI::get_instance();
		$ui->enqueue( apply_filters( 'wpq_wp_update_admin_ignore_js', array() ) );

		// Other files needed by the main plugin
	}

	/*==========================================================================
	 * Activation & Deactivation
	 *========================================================================*/
	/**
	 * Does a few stuff on plugin install
	 *
	 * It basically checks if the option is installed If it is, then merge with
	 * the new one
	 *
	 * If not, then create it
	 *
	 * @param      boolean  $network_wide  Whether network activation
	 *
	 * @codeCoverageIgnore
	 */
	public function plugin_install( $network_wide = false ) {
		$install = new WPQ_WP_Update_Install();
		$install->install( $network_wide );
	}

	/**
	 * @codeCoverageIgnore
	 */
	public function auto_upgrade() {
		global $wpq_wp_update;
		if ( ! isset( $wpq_wp_update['version'] ) || version_compare( $wpq_wp_update['version'], self::$version, '<' ) ) {
			$install = new WPQ_WP_Update_Install();
			$install->upgrade();
		}
	}
}
