/**
 * Link dependencies properly.
 *
 * ---------------------------------------------------------------
 *
 * This grunt task is configured to put front-end dependencies to the better place (css in css folder, js in js folder)
 *
 */
module.exports = function (grunt) {

  var path = require('path');

  grunt.config.set('bower', {
    dev: {
      options: {
        targetDir: './.tmp/public/lib',
        cleanTargetDir: true,
        layout: function (type, component, source) {
          /* workaround for https://github.com/yatskevich/grunt-bower-task/issues/121 */
          if (type === '__untyped__') {
            type = source.substring(source.lastIndexOf('.') + 1);
          }

          var renamedType = type;

          if (type === 'js') renamedType = './js';
          else if (type === 'css') renamedType = './css';

          return path.join(renamedType, component);
        },
        verbose: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower-task');
};
