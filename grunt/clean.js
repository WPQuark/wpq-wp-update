/**
 * Cleanup tasks
 */
module.exports = function( grunt ) {
	grunt.config( 'clean', {
		options: {
			cwd: '<%= paths.dir.source %>',
		},
		all: [ '<%= paths.dir.build %>', 'static/**/*.map' ],
		dist: ['<%= paths.dir.plugin %>'],
		maps: [ 'static/**/*.map' ],
	} );
};
