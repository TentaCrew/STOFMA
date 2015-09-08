angular.module('stofmaApp.auth')
    .constant('AccessLevels', {
      anon: 'ANONYMOUS',
      user: 'USER',
      manager: 'MANAGER',
      admin: 'ADMINISTRATOR'
    });
