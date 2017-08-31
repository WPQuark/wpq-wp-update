/**
 * Run PHPUnit through grunt-exec
 */
module.exports = function( grunt ) {
	grunt.config( 'exec', {
		phpunit: {
			cmd: 'phpunit -c phpunit.ci.xml',
		},
		composerprod: {
			cmd: 'composer install --no-dev && composer dump-autoload --optimize',
		},
		composerdev: {
			cmd: 'composer dump-autoload',
		},
		composer: {
			cmd: 'composer install',
		},
	} );
};
