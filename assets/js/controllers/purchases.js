'use strict';

angular.module('stofmaApp.controllers')

    .controller('PurchaseCtrl', ['$scope', 'purchasesData', 'PurchaseFactory', function ($scope, purchasesData, SaleFactory) {
      $scope.purchases = purchasesData;
    }]);
