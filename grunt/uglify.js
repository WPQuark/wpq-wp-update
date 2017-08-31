/**
 * Uglify our javascript
 */
module.exports = function( grunt ) {
	grunt.config( 'uglify', {
		options: {
			mangle: {
				reserved: [ 'jQuery', 'Vue', 'Vuex' ],
			},
			sourceMap: '<%= development %>',
			report: 'min',
			output: {
				comments: 'some',
			},
			banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
			        '<%= grunt.template.today("yyyy-mm-dd") %> */',
		},
		admin: {
			files: [
				{
					expand: true,
					cwd: '.',
					src: [ '<%= paths.js.admin.files %>', '!<%= paths.js.admin.ignores %>' ],
					dest: '',
					rename: function ( dst, src ) {
						return src.replace( '/jsdev/', '/js/' ).replace( '.js', '.min.js' );
					},
				}
			],
		},
		front: {
			files: [
				{
					expand: true,
					cwd: '.',
					src: [ '<%= paths.js.front.files %>', '!<%= paths.js.front.ignores %>' ],
					dest: '',
					rename: function ( dst, src ) {
						return src.replace( '/jsdev/', '/js/' ).replace( '.js', '.min.js' );
					},
				}
			],
		}
	} );

	// Register new task for all
	grunt.registerTask( 'uglify:all', [
		'uglify:admin',
		'uglify:front',
	] );
};
