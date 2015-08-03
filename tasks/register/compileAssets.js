module.exports = function (grunt) {
	grunt.registerTask('compileAssets', [
		'clean:dev',
		'bower:dev',
		'jst:dev',
		'sass:dev',
		'copy:dev',
		'coffee:dev'
	]);
};
