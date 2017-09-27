/**
 * Concurrent tasks for development
 */
module.exports = function( grunt ) {
	grunt.config( 'concurrent', {
		jscss: [ 'watch:sass_admin', 'watch:sass_front', 'watch:js_admin', 'watch:js_front' ],
		all: [ 'watch:phplint', 'watch:sass_admin', 'watch:sass_front', 'watch:js_admin', 'watch:js_front' ],
		js: [ 'watch:js_admin', 'watch:js_front' ],
		css: [ 'watch:sass_admin', 'watch:sass_front' ],
	} );
}
