angular.module('stofmaApp.auth')
    .constant('AccessLevels', {
      anon: 'anonymous',
      user: 'user',
      manager: 'manager',
      admin: 'administrator'
    });
