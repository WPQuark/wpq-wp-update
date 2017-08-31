/**
 * Gruntfile for building SocialPress Plugin
 *
 * Tasks it handles
 * 		1. Minify javascript files
 * 			a. Look into static directory
 * 			b. Find all .js files
 * 			c. Minify and save .min.js file under the same directory
 * 		2. Compile SASS and save
 * 			a. Look into static/.../scss directory
 * 			b. Compile and save into static/.../css directory with source mapping
 * 		3. Make pot file
 * 			a. Use wp18n to generate pot file `wpq-sp.pot` under translations directory
 * 		4. Make Build
 * 			a. Copy all files except scss, tests, node_module, .git, bin,
 * 			   .travis.yml, composer.*, package*, phpunit*, phpcs* to
 * 			   ../../build directory
 *
 *
 * @param      grunt  grunt   The grunt
 */
module.exports = function(grunt) {
	// Load tasks.
	require('load-grunt-tasks')(grunt);

	require('time-grunt')(grunt);

	// Project Configuration
	grunt.initConfig( {
		// Metadata
		pkg: grunt.file.readJSON( 'package.json' ),
		// Build environment
		development: true,
		// Project variables
		paths: {
			// Base assets directory
			base: 'static',
			// Useful directory structures
			dir: {
				// Build directory
				build: 'build/package',
				// Plugin directory
				plugin: '<%= paths.dir.build %>/wpq-wp-update',
				// Source directory - Not sure why using
				source: '.',
				// Bower source
				bower_source: 'bower_components',
				// Bower Build
				bower_builds: 'bower_builds',
			},
			// Different assets
			assets: {
				admin: {
					src: '<%= paths.base %>/admin', // static/admin
				},
				front: {
					src: '<%= paths.base %>/front', // static/front
				},
				lib: {
					src: '<%= paths.base %>/lib', // static/lib
				}
			},
			// PHP assets
			php: {
				files_std: [ 'includes/**/*.php', 'tests/**/*.php', 'wpq-social-press.php' ], // Standard file match
				files: '<%= paths.php.files_std %>' // Dynamic file match
			},
			// JavsScript Assets
			js: {
				// Our own packages
				admin: {
					src: '<%= paths.assets.admin.src %>/jsdev', // Source for this assets
					files_std: '**/<%= paths.js.admin.src %>/**/*.js', // Standard file match
					files: '<%= paths.js.admin.files_std %>', // Dynamic file match,
					ignores: '<%= paths.js.admin.src %>/**/*.min.js', // Ignores
				},
				front: {
					src: '<%= paths.assets.front.src %>/jsdev', // Source for this assets
					files_std: '**/<%= paths.js.front.src %>/**/*.js', // Standard file match
					files: '<%= paths.js.front.files_std %>', // Dynamic file match
					ignores: '<%= paths.js.front.src %>/**/*.min.js', // Ignores
				},
			},
			// Sass assets
			sass: {
				ext: '.css', // Compiled extension
				// Admin
				admin: {
					src: '<%= paths.assets.admin.src %>/scss', // Source for this assets
					dest: '<%= paths.assets.admin.src %>/css', // Destination
					target_std: '<%= paths.sass.admin.src %>/**/*.scss', // All SCSS files in current and subdirectory
					target: '<%= paths.sass.admin.target_std %>', // Dynamic binding
					exclude: '<%= paths.sass.admin.src %>/**/_*.scss', // No need to even pass the partials
				},
				// Front
				front: {
					src: '<%= paths.assets.front.src %>/scss', // Source for this assets
					dest: '<%= paths.assets.front.src %>/css', // Destination
					target_std: '<%= paths.sass.front.src %>/**/*.scss', // All SCSS files in current and subdirectory
					target: '<%= paths.sass.front.target_std %>', // Dynamic binding
					exclude: '<%= paths.sass.front.src %>/**/_*.scss', // No need to even pass the partials
				},
			},
		},
	} );

	// Now separately register our config to make them more readable
	// This loads all files under `grunt/` directory
	grunt.loadTasks( 'grunt' );

	// Create a combined task for processing CSS
	grunt.registerTask( 'css', [ 'sass:all', 'postcss:all' ] );
	grunt.registerTask( 'css:admin', [ 'sass:admin', 'postcss:admin' ] );
	grunt.registerTask( 'css:front', [ 'sass:front', 'postcss:front' ] );

	// Default Tasks For testing
	grunt.registerTask( 'test', [ 'clean:dist', 'phplint', 'exec:phpunit', 'jshint:all' ] );
	grunt.registerTask( 'default', 'test' );

	// Task for installing all dependencies
	grunt.registerTask( 'install', [ 'clean:dist', 'exec:composer', 'exec:composerdev' ] );

	// Build Task
	// This is for development environment
	// The files are created with source mapping for easier mapping
	// Use this locally
	grunt.registerTask( 'build', [ 'config:dev', 'clean:dist', 'uglify:all', 'css:all', 'makepot' ] );

	// Production Task
	grunt.registerTask( 'prod', [ 'config:prod', 'clean:dist', 'uglify:all', 'css:all', 'makepot' ] );

	// Shortcut build task
	// We will use this to speed up the testing time in CI
	grunt.registerTask( 'prep', [ 'config:prod', 'clean:maps', 'uglify:all', 'sass:all' ] );

	// Make distribution
	// This is for production purpose
	// Shall only be used by the release command on the CI
	grunt.registerTask( 'dist', [ 'clean:all', 'prod', 'copy:dist' ] );

	// Make zip
	grunt.registerTask( 'make', [ 'dist', 'zip:dist' ] );

	// Release Task
	grunt.registerTask( 'release', [ 'make', 'clean:dist' ] );

	// Make zip
	grunt.registerTask( 'make', [ 'dist', 'zip:dist' ] );

	// Release Task
	grunt.registerTask( 'release', [ 'make', 'clean:dist' ] );

	// Clean stuff after deploy
	grunt.registerTask( 'cleanup', [ 'clean:all' ] );

	// Common Watchers
	grunt.registerTask( 'live', [ 'config:dev', 'clean:dist', 'concurrent:all' ] );
	grunt.registerTask( 'live:css', [ 'config:dev', 'clean:dist', 'concurrent:css' ] );
	grunt.registerTask( 'live:js', [ 'config:dev', 'clean:dist', 'concurrent:js' ] );
	grunt.registerTask( 'live:jscss', [ 'config:dev', 'clean:dist', 'concurrent:jscss' ] );
};
