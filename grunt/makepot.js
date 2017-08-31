/**
 * Makes a pot file for translations
 */
module.exports = function( grunt ) {
	grunt.config( 'makepot', {
		target: {
			options: {
				cwd: '.',                          // Directory of files to internationalize.
				domainPath: 'translations/',                   // Where to save the POT file.
				exclude: [ 'vendor' ],                      // List of files or directories to ignore.
				include: [],                      // List of files or directories to include.
				mainFile: 'wpq-wp-update.php.php',                     // Main project file.
				potComments: 'Copyright WPQuark (c) {{year}}',                  // The copyright at the beginning of the POT file.
				potHeaders: {
					poedit: true,                 // Includes common Poedit headers.
					'x-poedit-keywordslist': true // Include a list of all possible gettext functions.
				},                                // Headers to add to the generated POT file.
				processPot: null,                 // A callback function for manipulating the POT file.
				type: 'wp-plugin',                // Type of project (wp-plugin or wp-theme).
				updateTimestamp: false,            // Whether the POT-Creation-Date should be updated without other changes.
				updatePoFiles: true,              // Whether to update PO files in the same directory as the POT file.
			},
		},
	} );
};
