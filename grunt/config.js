/**
 * Change configuration variable on the fly to properly build JS and CSS
 * files
 */
module.exports = function( grunt ) {
	grunt.config( 'config', {
		dev: {
			options: {
				variables: {
					development: true,
				},
			},
		},
		prod: {
			options: {
				variables: {
					development: false,
				},
			},
		},
	} );
};
