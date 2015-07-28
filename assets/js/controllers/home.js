'use strict';

angular.module('stofmaApp.home', [])

  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('home', {
      url: '/home',
      views: {
        'main-content': {
          controller: 'HomeCtrl',
          templateUrl: 'assets/templates/home.html'
        }
      },
      data: {
        name: 'Accueil'
      }
    })
  }])

  .controller('HomeCtrl', ['$scope', function ($scope) {
  }]);