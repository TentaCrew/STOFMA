'use strict';

angular.module('stofmaApp.controllers')
    .controller('StallProductCtrl', ['$scope', 'productsData', 'ProductFactory', function ($scope, productsData, ProductFactory) {
      $scope.products = productsData;

      $scope.getCurrentUser().then(function (u) {
        console.log(u);
        $scope.levelPrice = ProductFactory.getLevelPrice(u.isMember);
      });
    }]);
