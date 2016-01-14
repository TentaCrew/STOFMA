'use strict';

angular.module('stofmaApp.controllers')

    .controller('SalesCtrl', ['$scope', '$timeout', '$state', 'salesData', 'SaleService', 'UserService', '$mdBottomSheet', '$mdToast', 'DateUtils', 'isManager', 'ownSale', function ($scope, $timeout, $state, salesData, SaleService, UserService, $mdBottomSheet, $mdToast, DateUtils, isManager, ownSale) {
      $scope.isManager = isManager;

      var subHeaderHandler = DateUtils.setDateSubHeader(salesData, 'saleDate', function (sale) {
        sale.pairs = [];
        angular.forEach(sale.products, function (pair) {
          sale.pairs.push({
            name: pair.product.name,
            quantity: pair.quantity,
            price: pair.quantity * pair.unitPrice
          });
        });
        return sale;
      }, function (list) {
        $scope.sales = list;
      });

      subHeaderHandler();

      $scope.remove = function (id, index, header) {
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
              $scope.sales[header].list.splice(index, 1);
              if ($scope.sales[header].list.length == 0)
                delete $scope.sales[header];
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

        (ownSale ? SaleService.getOwnSales(false, undefined, true) : SaleService.getSales(false, undefined, false, true)).then(function (ss) {
          subHeaderHandler(ss);
        }).catch(function () {
          $scope.stopInfinite = true;
        });

        timeout = $timeout(function () {
          timeout = false;
        }, 500);
      };
    }
    ]);
