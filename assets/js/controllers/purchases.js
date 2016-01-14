'use strict';

angular.module('stofmaApp.controllers')

    .controller('PurchaseCtrl', ['$scope', 'purchasesData', 'PurchaseService', '$state', '$mdBottomSheet', '$mdToast', 'DateUtils', '$timeout', function ($scope, purchasesData, PurchaseService, $state, $mdBottomSheet, $mdToast, DateUtils, $timeout) {
      var subHeaderHandler = DateUtils.setDateSubHeader(purchasesData, 'purchaseDate', function (purchase) {
        purchase.pairs = [];
        angular.forEach(purchase.products, function (pair) {
          purchase.pairs.push({
            name: pair.product.name,
            quantity: pair.quantity,
            price: pair.quantity * pair.unitPrice
          });
        });
        return purchase;
      }, function (list) {
        $scope.purchases = list;
      });

      subHeaderHandler();

      $scope.setFabButton('add', function () {
        $state.go('manager.addpurchase');
      });

      $scope.remove = function (id, index, header) {
        $mdBottomSheet.show({
          templateUrl: 'assets/js/components/bottom-sheet/bottom-sheet-confirm-remove-purchase.html',
          controller: 'BottomSheetConfirmCtrl',
          locals: {
            data: {}
          }
        }).then(function (response) {
          if (response.confirm) {
            PurchaseService.deletePurchase(id).then(function () {
              $mdToast.show(
                  $mdToast.simple()
                      .content('Achat supprimé.')
                      .position("bottom right")
                      .hideDelay(3000)
              );
              $scope.purchases[header].list.splice(index, 1);
              if($scope.purchases[header].list.length == 0)
                delete $scope.purchases[header];
            }).catch(function (err) {
              $mdToast.show(
                  $mdToast.simple()
                      .content('L\'a n\'a pas été supprimé.')
                      .position("bottom right")
                      .hideDelay(5000)
              );
            });
          }
        });
      };

      $scope.amend = function (id) {
        $state.go('manager.editpurchase', {
          id: id
        });
      };

      var timeout;
      $scope.onScroll = function () {
        if (timeout)
          return;

        PurchaseService.getPurchases(false, undefined, true).then(function (ss) {
          subHeaderHandler(ss);
        }).catch(function () {
          $scope.stopInfinite = true;
        });

        timeout = $timeout(function () {
          timeout = false;
        }, 500);
      };
    }]);
