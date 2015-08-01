angular.module('stofmaApp.auth')
    .constant('AccessLevels', {
      anon: 0,
      user: 1,
      manager: 2,
      admin: 3
    });
