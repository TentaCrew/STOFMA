angular.module('stofmaApp.auth')
    .factory('CurrentUser', function (LocalStorage) {
      return {
        user: function () {
          if (LocalStorage.get('auth_token')) {
            console.log(angular.fromJson(LocalStorage.get('auth_token')));
            return angular.fromJson(LocalStorage.get('auth_token'));
          } else {
            return {};
          }
        }
      };
    });
