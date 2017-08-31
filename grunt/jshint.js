/**
 * jshinting our JavaScript files
 *
 * @param      {grunt}  grunt   The grunt
 */
module.exports = function( grunt ) {
	grunt.config( 'jshint', {
		// Options
		options: {
			reporter: require('jshint-stylish'),
			curly: true,
			eqeqeq: false,
			expr: true,
			loopfunc: true,
			immed: true,
			latedef: true,
			newcap: false,
			noarg: true,
			sub: true,
			undef: true,
			unused: false,
			boss: true,
			eqnull: true,
			browser: true,
			jquery: true,
			devel: true,
			esversion: 6,
			globals: {
				jQuery: true,
				console: true,
				Vue: true,
				Vuex: true,
				ERINVl10n: true,
				ajaxurl: true,
				initWPQSPUI: true,
				wp: true,
				tb_show: true,
			}
		},
		// :grunt jshint
		grunt: {
			options: {
				node: true,
			},
			src: [ 'Gruntfile.js', 'grunt/*.js' ],
		},
		// :admin
		admin: {
			src: [ '<%= paths.js.admin.files %>', '!<%= paths.js.admin.ignores %>' ],
		},
		// :front
		front: {
			src: [ '<%= paths.js.front.files %>', '!<%= paths.js.front.ignores %>' ],
		},
	} );
	// Register new task for all
	grunt.registerTask( 'jshint:all', [
		'jshint:admin',
		'jshint:front',
	] );
};
