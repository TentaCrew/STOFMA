angular.module('stofmaApp.auth')
    .factory('Auth', ['$http', 'LocalStorage', 'AccessLevels', function ($http, LocalStorage, AccessLevels) {
      return {
        authorize: function (access) {
          if (access !== AccessLevels.anon) {
            return this.isAuthenticated();
          } else {
            return true;
          }
        },
        isAuthenticated: function () {
          return LocalStorage.get('auth_token');
        },
        login: function (credentials) {
          var login = $http.put('/user/login', credentials);
          login.success(function (result) {
            LocalStorage.set('auth_token', JSON.stringify(result));
          });
          return login;
        },
        logout: function () {
          // The backend doesn't care about logouts, delete the token and you're good to go.
          var logout = $http.put('/user/logout');
          logout.success(function () {
            LocalStorage.unset('auth_token');
          });
          return logout;
        },
        register: function (formData) {
          LocalStorage.unset('auth_token');
          var register = $http.post('/user', formData);
          register.success(function (result) {
            LocalStorage.set('auth_token', JSON.stringify(result));
          });
          return register;
        }
      }
    }])
    .factory('AuthInterceptor', function ($q, $injector) {
      var LocalStorage = $injector.get('LocalStorage');

      return {
        request: function (config) {
          var token;
          if (LocalStorage.get('auth_token')) {
            token = angular.fromJson(LocalStorage.get('auth_token')).token;
          }
          if (token) {
            config.headers.Authorization = 'Bearer ' + token;
          }
          return config;
        },
        responseError: function (response) {
          if (response.status === 401 || response.status === 403) {
            LocalStorage.unset('auth_token');
            $injector.get('$state').go('anon.login');
          }
          return $q.reject(response);
        }
      }
    })
    .config(function ($httpProvider) {
      $httpProvider.interceptors.push('AuthInterceptor');
    });
