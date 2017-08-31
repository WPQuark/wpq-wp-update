<?php
/**
 * Main Abstract class for creating many admin pages
 *
 * Check the methods and examples
 *
 * @package    WPUpdate
 * @subpackage Admin\Pages
 * @author     Swashata Ghosh <swashata@wpquark.com>
 *
 */
abstract class WPQ_WP_Update_Admin {
	/**
	 * Duplicates the $_POST content and properly process it
	 * Holds the typecasted (converted int and floats properly and escaped html) value after the constructor has been called
	 *
	 * @var array
	 */
	public $post = array();

	/**
	 * Holds the hook of this page
	 *
	 * @var string Pagehook
	 * Should be set during the construction
	 */
	public $pagehook;

	/**
	 * The nonce for admin-post.php
	 * Should be set the by extending class
	 *
	 * @var string
	 */
	public $action_nonce;

	/**
	 * The class of the admin page icon
	 * Should be set by the extending class
	 *
	 * @var string
	 */
	public $icon;

	/**
	 * This gets passed directly to current_user_can
	 * Used for security and should be set by the extending class
	 *
	 * @var string
	 */
	public $capability;

	/**
	 * Holds the post result message string
	 * Each entry is an associative array with the following options
	 *
	 * $key : The code of the post_result value =>
	 *
	 *      'type' => 'update' : The class of the message div update | error
	 *
	 *      'msg' => '' : The message to be displayed
	 *
	 * @var array
	 */
	public $post_result = array();

	/**
	 * The action value to be used for admin-post.php
	 * This is generated automatically by appending _post_action to the action_nonce variable
	 *
	 * @var string
	 */
	public $admin_post_action;

	/**
	 * Whether or not to print form on the admin wrap page
	 * Mainly for manually printing the form
	 *
	 * @var bool
	 */
	public $print_form;

	/**
	 * Whether we are expecting an ajax form
	 *
	 * @var        boolean
	 */
	public $ajax_form = false;

	/**
	 * The USER INTERFACE Object
	 *
	 * @var WPQ_WP_Update_Admin_UI
	 */
	public $ui;

	/**
	 * Constructor function
	 *
	 * Does all the hooking and page loading
	 *
	 * @param      boolean  $gets_hooked  Whether this would actually create a
	 *                                    page in the admin menu
	 * @param      boolean  $ajax_form    Whether the form (if any) would be
	 *                                    hooked to ajax
	 */
	public function __construct( $gets_hooked = true, $ajax_form = false ) {
		// A shortcut for getting the post values
		if ( 'POST' == $_SERVER['REQUEST_METHOD'] ) {
			// we do not need to check on magic quotes
			// as wordpress always adds magic quotes
			// @link {http://codex.wordpress.org/Function_Reference/stripslashes_deep}
			$this->post = wp_unslash( $_POST );
		}

		// Store the UI
		$this->ui = WPQ_WP_Update_Admin_UI::get_instance();

		// Default action messages
		$this->post_result = array(
			1 => array(
				'type' => 'okay',
				'msg' => __( 'Successfully saved the options.', 'wpq-wp-update' ),
			),
			2 => array(
				'type' => 'error',
				'msg' => __( 'Either you have not changed anything or some error has occured. Please contact the developer.', 'wpq-wp-update' ),
			),
			3 => array(
				'type' => 'okay',
				'msg' => __( 'The Master Reset was successful.', 'wpq-wp-update' ),
			),
		);
		// Calculate the admin post action
		$this->admin_post_action = $this->action_nonce . '_post_action';

		// Add pages
		if ( $gets_hooked ) {
			// register admin_menu hook
			add_action( 'admin_menu', array( $this, 'admin_menu' ) );

			// register admin-post.php hook
			add_action( 'admin_post_' . $this->admin_post_action, array( $this, 'save_post' ) );
		}

		// If expecting ajax form
		if ( $ajax_form ) {
			$this->ajax_form = true;
			add_action( 'wp_ajax_' . $this->admin_post_action, array( $this, 'ajax_save' ) );
		}
	}

	/*==========================================================================
	 * System Methods
	 *========================================================================*/
	/**
	 * Hook to the admin menu Should be overriden and also the hook should be
	 * saved in the $this->pagehook In the end, the parent::admin_menu() should
	 * be called for load to hooked properly
	 *
	 * @codeCoverageIgnore
	 */
	public function admin_menu() {
		add_action( 'load-' . $this->pagehook, array( $this, 'on_load_page' ) );
	}

	/**
	 * Use this to generate the admin page always call parent::index() so the
	 * save post is called also call $this->index_foot() after the generation of
	 * page (the last line of this function) to give some compatibility (mainly
	 * with the metaboxes)
	 *
	 * @access     public
	 */
	abstract public function index();

	/**
	 * Prints the head of the page
	 *
	 * This effectively wraps everything into a class where UI is applied Also
	 * Prints a form if needed
	 *
	 * @param      string   $title        The page title
	 * @param      boolean  $print_form   Whether to print an HTML form
	 * @param      boolean  $apply_ui     Whether to apply User Interface JS &
	 *                                    CSS
	 * @param      string   $max_width    The maximum width
	 * @param      array    $page_action  The page action
	 * @param      boolean  $skip_css     The skip css
	 */
	protected function index_head( $title, $print_form = true, $apply_ui = true, $max_width = '100%', $page_action = array(), $skip_css = false ) {
		// Store the print form for use in index_foot
		$this->print_form = $print_form;

		$ui_class = array();
		// Generic UI class
		if ( ! $skip_css ) {
			$ui_class[] = 'wpq-sp-admin-ui'; // The one that gets CSS
		}
		if ( true == $apply_ui ) {
			$ui_class[] = 'wpq-sp-backoffice'; // This is the class which will get JS init
		}
		// The default WP Core class
		$ui_class[] = 'wrap';
		?>
<div class="<?php echo esc_attr( implode( ' ', $ui_class ) ); ?>" id="<?php echo $this->pagehook; ?>_widgets">
	<div class="icon32">
		<span class="ipticm ipt-icomoon-<?php echo $this->icon; ?>"></span>
	</div>
	<h1 class="wp-heading-inline"><?php echo $title; ?></h1>
	<?php if ( ! empty( $page_action ) ) : ?>
		<a href="<?php echo esc_attr( $page_action['url'] ); ?>" class="page-title-action"><?php echo $page_action['label']; ?></a>
	<?php endif; ?>
	<?php $this->ui->clear(); ?>
	<?php if ( ! $skip_css ) : ?>
		<?php
		$this->ui->ajax_loader( false, true, __( 'Loading', 'wpq-wp-update' ), 'wpq-sp-backoffice-init-ajax-loader', array( 'wpq-sp-backoffice-init-ajax-loader' ) );
		?>
	<?php endif; ?>
	<div class="ipt-ui-backoffice-main-wrap" style="max-width: <?php echo esc_attr( $max_width ); ?>">
	<?php
	if ( isset( $_GET['post_result'] ) ) {
		$msg = @$this->post_result[ (int) $_GET['post_result'] ]; // Suppress a PHP Notice if msg not found
		// @codeCoverageIgnoreStart
		if ( ! empty( $msg ) ) {
			if ( 'update' == $msg['type'] || 'updated' == $msg['type'] ) {
				$this->ui->msg_update( $msg['msg'] );
			} elseif ( 'okay' == $msg['type'] ) {
				$this->ui->msg_okay( $msg['msg'] );
			} else {
				$this->ui->msg_error( $msg['msg'] );
			}
		}
		// @codeCoverageIgnoreEnd
	}
	$form_classes = array();
	if ( $this->print_form ) {
		$form_classes[] = 'wpq-sp-backoffice-form';
		if ( $this->ajax_form ) {
			$form_classes[] = 'wpq-sp-backoffice-form-ajax';
			$this->ui->ajax_loader( true, false, __( 'Processing', 'wpq-wp-update' ), 'wpq-sp-backoffice-form-ajax-loader', array( 'wpq-sp-backoffice-ajax-loader' ), array(
				'success' => __( 'Successfully saved the options', 'wpq-wp-update' ),
				'error' => __( 'Some error has occured', 'wpq-wp-update' ),
			) );
		}
	}
	?>
	<?php if ( $this->print_form ) : ?>
		<form method="post" action="admin-post.php" id="<?php echo $this->pagehook; ?>_form_primary" class="<?php echo implode( ' ', $form_classes ); ?>">
			<input type="hidden" name="action" value="<?php echo $this->admin_post_action; ?>" />
			<?php wp_nonce_field( $this->action_nonce ); ?>
	<?php endif; ?>
	<?php do_action( $this->pagehook . '_page_before', $this ); ?>
		<?php
	}

	public function index_foot( $submit = true, $tab_submit = false, $do_action = true, $save = '', $reset = '' ) {
		// Calculate the buttons
		$buttons = array();
		if ( false !== $save ) {
			$save = ( empty( $save ) ? __( 'Save Changes', 'wpq-wp-update' ) : $save );
			$buttons[] = array( $save, 'submit', 'medium' );
		}
		if ( false !== $reset ) {
			$reset = ( empty( $reset ) ? __( 'Reset', 'wpq-wp-update' ) : $reset );
			$buttons[] = array( $reset, 'reset', 'medium' );
		}

		$button_container_classes = array( 'ipt_uif_page_buttons' );
		if ( true == $tab_submit ) {
			$button_container_classes[] = 'ipt_uif_tab_buttons';
			$button_container_classes[] = 'ipt_uif_ui_hidden_init';
		}
		// Print the page footer
		?>
	<?php if ( $this->print_form ) : ?>
		<?php if ( $submit && ! empty( $buttons ) ) : ?>
			<?php $this->ui->clear(); ?>
			<?php $this->ui->buttons( $buttons, true, $this->pagehook . '_page_buttons', $button_container_classes ); ?>
		<?php endif; ?>
		</form>
		<?php $this->ui->clear(); ?>
	<?php endif; ?>
	<?php if ( $do_action ) : ?>
		<?php do_action( $this->pagehook . '_page_after', $this ); ?>
	<?php endif; ?>
	</div>
</div>
		<?php
	}

	/**
	 * Override to manage the save_post This should be written by all the
	 * classes extending this
	 *
	 * For security do a parent::save_post beforehand
	 * It will stop if current user can not do the capability
	 *
	 * Also in case of checking referer, it will check from $_POST variable
	 *
	 * @param      boolean  $check_referer  The check referer
	 *
	 * @codeCoverageIgnore
	 */
	public function save_post( $check_referer = true ) {
		// User permission check
		if ( ! current_user_can( $this->capability ) ) {
			wp_die( __( 'Cheatin&#8217; uh?' ) );
		}

		// Check nonce
		if ( $check_referer ) {
			if ( ! wp_verify_nonce( $_POST['_wpnonce'], $this->action_nonce ) ) {
				wp_die( __( 'Cheatin&#8217; uh?' ) );
			}
		}

		// lets redirect the post request into get request
		// you may add additional params at the url
		// if you need to show save results
		//
		// wp_redirect( add_query_arg( array(), $_POST['_wp_http_referer'] ) );
		// The above should be done by the extending method
		// after calling parent::save_post and processing post
	}

	/**
	 * Callback for ajax save function
	 *
	 * This automatically checks for capabilities and nonce. Also outputs header
	 * for json data.
	 *
	 * @param      boolean  $check_referer  Whether to check referer from post
	 *                                      data
	 *
	 * @codeCoverageIgnore
	 */
	public function ajax_save( $check_referer = true ) {
		// User permission check
		if ( ! current_user_can( $this->capability ) ) {
			wp_die( __( 'Cheatin&#8217; uh?' ) );
		}

		// Check nonce
		if ( $check_referer ) {
			if ( ! wp_verify_nonce( $_POST['_wpnonce'], $this->action_nonce ) ) {
				wp_die( __( 'Cheatin&#8217; uh?' ) );
			}
		}

		// Now you would execute your ajax save logic and return something json
		// So we add the header as well
		@header( 'Content-Type: application/json; charset=' . get_option( 'blog_charset' ) );
	}

	/**
	 * Hook to the load plugin page
	 * This should be overriden
	 * If you want to add screen options
	 *
	 */
	public function on_load_page() {}

	/**
	 * Get the pagehook of this class
	 *
	 * @return     string
	 *
	 * @codeCoverageIgnore
	 */
	public function get_pagehook() {
		return $this->pagehook;
	}

	/**
	 * Parses argument with respect to the provided defaults
	 *
	 * This is better than wp_parse_args because it recursively checks for all
	 * variables within an array and replaces accordingly. Works very well for
	 * multilevel associative array and also perfectly handles the SDA UI from
	 * the library.
	 *
	 * Use this when saving data from $this->post
	 *
	 * This also rejects all variables within $args which are not present in
	 * $defaults
	 *
	 * @param      array    $args        The original arguments array
	 * @param      array    $defaults    The default arguments array
	 * @param      boolean  $merge_only  If true, then for boolean types, the
	 *                                   original value will be assigned if not
	 *                                   present. If false, then for boolean
	 *                                   types, false would be assigned
	 *
	 * @return     array    Merged and sanitized array
	 */
	public function parse_args( $args, $defaults, $merge_only = false ) {
		$fresh = array();
		foreach ( (array) $defaults as $d_key => $d_val ) {
			if ( is_array( $d_val ) ) {
				// sda arrays in structures are always empty
				if ( empty( $d_val ) ) {
					$fresh[ $d_key ] = isset( $args[ $d_key ] ) ? $args[ $d_key ] : array();
				} else {
					// If sequential numeric array, then just replace
					if ( array_keys( $d_val ) === range( 0, count( $d_val ) - 1 ) ) {
						$fresh[ $d_key ] = isset( $args[ $d_key ] ) ? $args[ $d_key ] : array();
					} else {
						// Associative array, so look into it
						$new_args = isset( $args[ $d_key ] ) ? $args[ $d_key ] : array();
						$fresh[ $d_key ] = $this->parse_args( $new_args, $d_val, $merge_only );
					}
				}
			} else if ( is_bool( $d_val ) ) {
					$fresh[ $d_key ] = ( ( isset( $args[ $d_key ] ) && null !== $args[ $d_key ] && false !== $args[ $d_key ] && '' !== $args[ $d_key ] && 0 !== $args[ $d_key ] && 'false' !== $args[ $d_key ] && '0' !== $args[ $d_key ] ) ? true : ( ( $merge_only && ! isset( $args[ $d_key ] ) ) ? $d_val : false ) ); //Check for ajax submission as well
			} else {
				$fresh[ $d_key ] = isset( $args[ $d_key ] ) ? $args[ $d_key ] : $d_val;
			}
		}
		return $fresh;
	}
}
