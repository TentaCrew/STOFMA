'use strict';

angular.module('stofmaApp.controllers')
    .controller('StallProductCtrl', ['$scope', 'productsData', function ($scope, productsData) {
      $scope.products = productsData;
    }]);
