angular.module('stofmaApp.auth', []);

angular.module('stofmaApp.services', []);

angular.module('stofmaApp.components', []);

angular.module('stofmaApp.controllers', [
  'stofmaApp.services'
]);

angular.module('stofmaApp')
    .constant('version', '1.2.0');
