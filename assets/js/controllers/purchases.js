'use strict';

angular.module('stofmaApp.controllers')

    .controller('PurchaseCtrl', ['$scope', 'purchasesData', 'PurchaseService', '$state', '$mdBottomSheet', '$mdToast', 'DateUtils', '$timeout', function ($scope, purchasesData, PurchaseService, $state, $mdBottomSheet, $mdToast, DateUtils, $timeout) {
      $scope.purchases = purchasesData;

      for (var i = 0; i < $scope.purchases.length; i++) {
        var purchase = $scope.purchases[i];

        $scope.purchases[i].pairs = [];
        angular.forEach(purchase.products, function (pair) {
          $scope.purchases[i].pairs.push({
            name: pair.product.name,
            quantity: pair.quantity,
            price: pair.quantity * pair.unitPrice
          });
        });
      }

      var subHeaderHandler =DateUtils.instanceDateSubHeader($scope.purchases, 'purchaseDate', function (type, title) {
        return {
          'title': title,
          'type': 'header'
        }
      });

      subHeaderHandler();

      $scope.setFabButton('add', function () {
        $state.go('manager.addpurchase');
      });

      $scope.remove = function (id, index) {
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
              $scope.purchases.splice(index, 1);
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

        PurchaseService.getPurchases(false).then(function (ss) {

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

            $scope.purchases.push(ss[k]);
          });
        }).catch(function(){
          $scope.stopInfinite = true;
        });

        timeout = $timeout(function () {
          timeout = false;
        }, 500);
      };
    }]);
