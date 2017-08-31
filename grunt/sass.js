/**
 * Compile our SASS/SCSS files
 */
module.exports = function( grunt ) {
	grunt.config( 'sass', {
		options: {
			outputStyle: 'expanded',
			sourceMap: '<%= development %>',
		},
		admin: {
			files: [{
				expand: true,
				src: [ '<%= paths.sass.admin.target %>', '!<%= paths.sass.admin.exclude %>' ], // Files we are willing to target
				srcd: '<%= paths.sass.admin.src %>', // We pass the option to the rename for cleverly routing the output to `css/<dir>/output.css`
				dest: '<%= paths.sass.admin.dest %>',
				ext: '<%= paths.sass.ext %>',
				rename: function ( dest, src, options ) {
					return src.replace( options.srcd, dest );
				},
			}],
		},
		front: {
			files: [{
				expand: true,
				src: [ '<%= paths.sass.front.target %>', '!<%= paths.sass.front.exclude %>' ], // Files we are willing to target
				srcd: '<%= paths.sass.front.src %>', // We pass the option to the rename for cleverly routing the output to `css/<dir>/output.css`
				dest: '<%= paths.sass.front.dest %>',
				ext: '<%= paths.sass.ext %>',
				rename: function ( dest, src, options ) {
					return src.replace( options.srcd, dest );
				},
			}],
		},
	} );
	// Register new task for all
	grunt.registerTask( 'sass:all', [
		'sass:admin',
		'sass:front',
	] );
};
