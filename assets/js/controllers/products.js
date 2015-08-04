'use strict';

angular.module('stofmaApp.controllers')

    .controller('ProductCtrl', ['$scope', 'productsData', 'ProductFactory', function ($scope, productsData) {
      $scope.categories = [
        {
          id: 'DRINK',
          name: 'Boissons'
        },
        {
          id: 'FOOD',
          name: 'Nourritures'
        },
        {
          id: 'OTHER',
          name: 'Autres'
        }
      ];

      $scope.products = productsData;
    }]);
