<?php
/*
Plugin Name: WP Update Server
Description: WP Update Server for your private & commercial Plugins hosted on Envato
Plugin URI: https://github.com/WPQuark/wpq-wp-update
Author: Swashata
Author URI: http://swashata.me
Version: 0.4.0
License: GPL3
Text Domain: wpq-wp-update
Domain Path: translations
*/

/*

    Copyright (C) 2017  Swashata  swashata@wpquark.com

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

// Some constants
define( 'WPQ_WPUPDATE_ABSPATH', trailingslashit( dirname( __FILE__ ) ) );

// Include composer
require_once WPQ_WPUPDATE_ABSPATH . 'vendor/autoload.php';
// Manually include the UpdateServer
require_once WPQ_WPUPDATE_ABSPATH . 'vendor/yahnis-elsts/wp-update-server/loader.php';

global $wpq_wp_update_load, $wpq_wp_update;
// Initiate the globals first
WPQ_WP_Update_Loader::init_globals();
$wpq_wp_update_load = WPQ_WP_Update_Loader::instance( __FILE__, '0.4.0' );
$wpq_wp_update_load->load();
