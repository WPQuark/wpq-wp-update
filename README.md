# WordPress Plugin/Theme Update Server for Envato

**Originally developed at [WPQuark Private GitLab](https://wpquark.io/wpq-server/wpq-wp-update)**

This plugins aims to convert your WordPress installation to a secure update server
for your plugins and themes hosted on envato market place.

## Usage

This plugin provides a server for easy updates with purchase code verification.
To set things up you need to install the server and configure your plugin.

### Installing the Server

* Install this plugin by a git clone.
* Install composer dependency `composer install`
* Make sure you have grunt available globally. `npm install grunt-cli -g`
* Build the plugin `npm install && grunt build`
* Activate Plugin.
* Go to WP Update > Settings
* Enter your Envato API Key and distribution directory
* Map Envato Item ID with ZIP Slug.

### Configuring your plugin/theme

* Modify and include the file under `client/class-plugin-autoupdate.php`.
* Point to your distribution server by editing the constants.
* Now you provide a UI for collecting purchase code from your user and when saving simply call like this:

```php
$updater = Plugin_AutoUpdate::instance();
$updater->set_token_from_code( wp_unslash( $_POST['purchase_code'] ) );
```

To show the activation status call this from anywhere

```php
$updater = Plugin_AutoUpdate::instance();
$activation_status = $updater->current_activation_status( $settings['purchase_code'] );
echo '<p>Activation Status: ' . ( true == $activation_status['activated'] ? 'Active' : 'Inactive' ) . '</p>';
echo '<p>Message: ' . $activation_status['msg'] . '</p>';
```

Hack away buddy, hack away.

## ScreenShots

![Screenshot](screenshot.jpg)

## Credits

* [wp-update-server](https://github.com/YahnisElsts/wp-update-server) - For providing the update server.
* [plugin-update-checker](https://github.com/YahnisElsts/plugin-update-checker) - For providing the client library.
* [WordPress Rest API](https://developer.wordpress.org/rest-api/extending-the-rest-api/) - For giving an access point for easy activation flow.

## License

**WordPress Update Server** is licensed under GPL-3.0.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

## RoadMap

Right now the plugin is in alpha stage. This works, but requires you to build it.
Also the dashboard functionality isn't implemented.

* Complete the build process and host on WordPress.org
* Implement Dashboard with statistics.
* Write PHPUnit tests.

Originally developed at [WPQuark Private GitLab](https://wpquark.io/wpq-server/wpq-wp-update)
