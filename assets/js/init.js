angular.module('stofmaApp.auth', []);

angular.module('stofmaApp.services', []);

angular.module('stofmaApp.components', []);

angular.module('stofmaApp.controllers', [
  'stofmaApp.services',
  'mdPickers'
]);

angular.module('stofmaApp')
    .constant('version', '1.0.3');
