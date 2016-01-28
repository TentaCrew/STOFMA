'use strict';

angular.module('stofmaApp.controllers')
    .controller('CafetProductCtrl', ['$scope', 'productsData', 'ProductFactory', '$state', function ($scope, productsData, ProductFactory, $state) {
      $scope.products = productsData;

      $scope.levelPrice = ProductFactory.getLevelPrice(false);
      
      $scope.setIconToolbarButtons('S\'inscrire', 'person_add', function () {
        $state.go('anon.register');
      });
      
      $scope.setIconToolbarButtons('Se connecter', 'exit_to_app', function () {
        $state.go('anon.register');
      });

    }]);
