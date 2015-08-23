'use strict';

angular.module('stofmaApp.controllers')
    .controller('ProductCtrl', ['$scope', 'productsData', function ($scope, productsData) {
      $scope.products = productsData;
    }]);
