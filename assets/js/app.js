'use strict';

angular.module('stofmaApp', [
  'ngMaterial',
  'ngAnimate',
  'ui.router',
  'stofmaApp.main',
  'stofmaApp.home',
  'stofmaApp.sell',
  'stofmaApp.sales',
  'oitozero.ngSweetAlert'
])
  .config(['$urlRouterProvider', '$locationProvider', '$mdThemingProvider', function ($urlRouterProvider, $locationProvider, $mdThemingProvider) {
    // TOFIX Uncomment to use pretty url.
    //$urlRouterProvider.otherwise('/404');
    //$locationProvider.html5Mode(true);
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
  }]);
