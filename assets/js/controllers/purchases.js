'use strict';

angular.module('stofmaApp.controllers')

    .controller('PurchaseCtrl', ['$scope', 'purchasesData', 'PurchaseService', '$state', '$mdBottomSheet', '$mdToast', function ($scope, purchasesData, PurchaseService, $state, $mdBottomSheet, $mdToast) {
      $scope.purchases = purchasesData;

      // Possible header title : today, yesterday, week, past
      var headerDate = '',
          h = headerDate,
          headerTitles = {
            today: 'aujourd\'hui',
            yesterday: 'hier',
            week: 'la semaine dernière',
            past: 'il y a plus d\'une semaine'
          };

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

        var date = moment(purchase.purchaseDate);

        if (moment().diff(date, 'days') == 0 && headerDate != 'today') {
          h = 'today';
        } else if (moment().diff(date, 'days') == 1 && headerDate != 'yesterday') {
          h = 'yesterday';
        } else if (moment().diff(date, 'days') > 1 && moment().diff(date, 'days') <= 7 && headerDate != 'week') {
          h = 'week';
        } else if (moment().diff(date, 'days') > 7 && headerDate != 'past') {
          h = 'past';
        }

        if (h !== headerDate) {
          headerDate = h;
          $scope.purchases.splice(i++, 0, {
            'title': headerTitles[h],
            'type': 'header'
          });
        }
      }

      $scope.setFabButton('add', function () {
        $state.go('manager.addpurchase');
      });

      $scope.remove = function (id, index) {
        $mdBottomSheet.show({
          templateUrl: '/js/components/bottom-sheet/bottom-sheet-confirm-remove-purchase.html',
          controller: 'BottomSheetConfirmCtrl'
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
    }]);
