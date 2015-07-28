/**
 * Link dependencies properly.
 *
 * ---------------------------------------------------------------
 *
 * This grunt task is configured to put front-end dependencies to the better place (css in css folder, javascript in js folder)
 *
 */
module.exports = function(grunt) {

	grunt.config.set('bower', {
		dev: {
			dest: '.tmp/public',
			js_dest: '.tmp/public/js/lib',
			css_dest: '.tmp/public/styles/lib'
		}
	});

	grunt.loadNpmTasks('grunt-bower');
};
