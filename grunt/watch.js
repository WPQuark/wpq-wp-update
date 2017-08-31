/**
 * Custom watch file to automate some tasks on file changes
 *
 * 1. Minify JS file on change
 * 2. Compile SCSS files on change
 */
module.exports = function( grunt ) {
	grunt.config( 'watch', {
		options: {
			event: ['changed', 'added', 'deleted']
		},
		phplint: {
			files: grunt.config.get( 'paths' ).php.files_std,
			tasks: [ 'phplint' ],
			options: {
				spawn: false,
			},
		},
		js_admin: {
			files: [ '<%= paths.js.admin.files_std %>', '!<%= paths.js.admin.ignores %>' ],
			tasks: [ 'jshint:admin', 'uglify:admin' ],
			options: {
				spawn: false,
			},
		},
		js_front: {
			files: [ '<%= paths.js.front.files_std %>', '!<%= paths.js.front.ignores %>' ],
			tasks: [ 'jshint:front', 'uglify:front' ],
			options: {
				spawn: false,
			},
		},
		sass_admin: {
			files: [ '<%= paths.sass.admin.target_std %>' ],
			tasks: [ 'sass:admin' ],
			options: {
				spawn: false,
			},
		},
		sass_front: {
			files: [ '<%= paths.sass.front.target_std %>' ],
			tasks: [ 'sass:front' ],
			options: {
				spawn: false,
			},
		},
	} );

	// Make sure only relevant files are taken care of
	grunt.event.on( 'watch', function( action, filepath, target ) {
		var get_ext = function(path) {
			var ret = '';
			var i = path.lastIndexOf('.');
			if ( -1 !== i && i <= path.length ) {
				ret = path.substr(i + 1);
			}
			return ret;
		},
		path = require( 'path' );
		switch ( get_ext( filepath ) ) {
			// PHP
			case 'php':
				grunt.config( 'paths.php.files', [ filepath ] );
				break;
			case 'js':
				switch ( target ) {
					case 'js_admin':
						grunt.config( 'paths.js.admin.files', [ filepath ] );
						break;
					case 'js_front':
						grunt.config( 'paths.js.front.files', [ filepath ] );
						break;
				}
				break;
			// We can not make this dynamic, because it is just too slow on windows
			case 'scss':
				// Get the subsequent directory after scss
				var parts = filepath.split( path.sep ),
				watchDir = '';
				for ( var i = 0; i < parts.length; i++ ) {
					if ( 'scss' == parts[ i ] ) {
						watchDir = parts[ i + 1 ];
						break;
					}
				}
				if ( 'string' == typeof( watchDir ) ) {
					switch ( target ) {
						case 'sass_admin':
							grunt.config( 'paths.sass.admin.target', '<%= paths.sass.admin.src %>/' + watchDir + '/**/*.scss' );
							break;
						case 'sass_front':
							grunt.config( 'paths.sass.front.target', '<%= paths.sass.front.src %>/' + watchDir + '/**/*.scss' );
							break;
					}
				}
				break;
		}
	} );
};
