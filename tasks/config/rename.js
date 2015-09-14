/**
 * Break cache of assets files
 *
 * ---------------------------------------------------------------
 *
 * This grunt task is configured to break cache assets like javascript and css files.
 *
 */
module.exports = function (grunt) {

  var versionDate = new Date().getTime();

  grunt.config.set('rename', {
    js: {
      src: '.tmp/public/min/production.min.js',
      dest: '.tmp/public/min/production.' + versionDate + '.min.js'
    },
    css: {
      src: '.tmp/public/min/production.min.css',
      dest: '.tmp/public/min/production.' + versionDate + '.min.css'
    }
  });

  grunt.loadNpmTasks('grunt-rename');
};
