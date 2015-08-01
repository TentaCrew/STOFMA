'use strict';

angular.module('stofmaApp', [
  'stofmaApp.controllers',
  'stofmaApp.components',
  'stofmaApp.auth',
  'ngMaterial',
  'ngAnimate',
  'ngMessages',
  'ui.router',
  'oitozero.ngSweetAlert'
])
    .config(['$urlRouterProvider', '$locationProvider', '$mdThemingProvider', function ($urlRouterProvider, $locationProvider, $mdThemingProvider) {
      $locationProvider.hashPrefix('!');
      $mdThemingProvider.theme('default')
          .primaryPalette('blue')
          .accentPalette('pink');
    }])
    .config(['$provide', function ($provide) {
      $provide.decorator('$templateCache', function ($delegate) {
        var originalGet = $delegate.get;

        $delegate.get = function (key) {
          var value;
          value = originalGet(key);
          if (!value) {
            value = JST[key] && JST[key]();
            if (value) {
              $delegate.put(key, value);
            }
          }
          return value;
        };

        return $delegate;
      });

      return this;
    }])
    .run(['$rootScope', '$state', 'Auth', function ($rootScope, $state, Auth) {
      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (!Auth.authorize(toState.data.access)) {
          event.preventDefault();

          $state.go('anon.login');
        }
      });
    }]);
