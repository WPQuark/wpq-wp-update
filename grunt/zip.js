/**
 * Zip Tasks
 */
module.exports = function( grunt ) {
	grunt.config( 'zip', {
		'dist': {
			cwd: '<%= paths.dir.build %>',
			src: '<%= paths.dir.plugin %>/**',
			dest: '<%= paths.dir.plugin %>.zip',
			compression: 'DEFLATE',
			dot: true,
		},
	} );
};
