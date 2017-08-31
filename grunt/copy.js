/**
 * Create a release free from all clutters
 *
 * Copy all files except tests, node_module, .git, bin,
 * 			   .travis.yml, composer.*, package*, phpunit*, phpcs* to
 * 			   ../../build directory
 */
module.exports = function( grunt ) {
	// Copy module
	grunt.config( 'copy', {
		dist: {
			files: [{
				dot: true,
				expand: true,
				cwd: '<%= paths.dir.source %>',
				src: [
					'includes/**',
					'static/**/js/**',
					'static/**/css/**',
					'static/**/images/**',
					// == Vendors
					// All of the licenses
					'vendor/**/LICENSE*',
					'vendor/**/license*',
					// All of the readme
					'vendor/**/README*',
					'vendor/**/readme*',
					// All of the php file
					'vendor/**/*.php',
					'vendor/**/*.inc',
					// But none of the tests
					'!vendor/**/tests/**',
					'!vendor/**/test/**',
					// None of the docs
					'!vendor/**/doc/**',
					'!vendor/**/docs/**',
					// None of the examples
					'!vendor/**/examples/**',
					'!vendor/**/example/**',
					// == End Vendors
					'README.md',
					'wpq-wp-update.php',
					'translations/**',
					'LICENSE',
				],
				dest: '<%= paths.dir.plugin %>',
			}],
		}
	} );
};
