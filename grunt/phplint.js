/**
 * Lint PHP for possible errors
 */
module.exports = function( grunt ) {
	grunt.config( 'phplint', {
		options: {
			phpArgs: {
				'-l': null,
				'-f': null,
			},
		},
		all: {
			src: '<%= paths.php.files %>',
		}
	} );
};
