'use strict';

angular.module('stofmaApp.controllers')

    .controller('SalesCtrl', ['$scope', '$timeout', '$state', 'salesData', 'SaleService', 'UserService', '$mdBottomSheet', '$mdToast', 'DateUtils', 'isManager', 'ownSale', function ($scope, $timeout, $state, salesData, SaleService, UserService, $mdBottomSheet, $mdToast, DateUtils, isManager, ownSale) {
      $scope.sales = salesData;
      $scope.isManager = isManager;

      for (var i = 0; i < $scope.sales.length; i++) {
        var sale = $scope.sales[i];

        $scope.sales[i].pairs = [];
        angular.forEach(sale.products, function (pair) {
          $scope.sales[i].pairs.push({
            name: pair.product.name,
            quantity: pair.quantity,
            price: pair.quantity * pair.unitPrice
          });
        });
      }

      var subHeaderHandler = DateUtils.instanceDateSubHeader($scope.sales, 'saleDate', function (type, title) {
        return {
          'title': title,
          'type': 'header'
        }
      });

      subHeaderHandler();

      $scope.remove = function (id, index) {
        $mdBottomSheet.show({
          templateUrl: 'assets/js/components/bottom-sheet/bottom-sheet-confirm-remove-sale.html',
          controller: 'BottomSheetConfirmCtrl',
          locals: {
            data: {}
          }
        }).then(function (response) {
          if (response.confirm) {
            SaleService.deleteSale(id).then(function () {
              $mdToast.show(
                  $mdToast.simple()
                      .content('Vente supprimée.')
                      .position("bottom right")
                      .hideDelay(3000)
              );
              $scope.sales.splice(index, 1);
            }).catch(function (err) {
              $mdToast.show(
                  $mdToast.simple()
                      .content('La vente n\'a pas été supprimée.')
                      .position("bottom right")
                      .hideDelay(5000)
              );
            });
          }
        });
      };

      $scope.amend = function (id) {
        $state.go('manager.editsale', {
          id: id
        });
      };

      var timeout;
      $scope.onScroll = function () {
        if (timeout)
          return;

        (ownSale ? SaleService.getOwnSales() : SaleService.getSales(false)).then(function (ss) {

          subHeaderHandler(ss);

          angular.forEach(ss, function (v, k) {
            v.pairs = [];
            angular.forEach(v.products, function (pair) {
              v.pairs.push({
                name: pair.product.name,
                quantity: pair.quantity,
                price: pair.quantity * pair.unitPrice
              });
            });

            ss[k] = v;

            $scope.sales.push(ss[k]);
          });
        }).catch(function () {
          $scope.stopInfinite = true;
        });

        timeout = $timeout(function () {
          timeout = false;
        }, 500);
      };
    }]);
