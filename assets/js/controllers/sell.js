'use strict';

angular.module('stofmaApp.controllers')

    .controller('SellCtrl', ['$scope', 'productsData', 'ProductFactory', '$mdBottomSheet', 'SweetAlert', function ($scope, productsData, ProductFactory, $mdBottomSheet, SweetAlert) {
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

      $scope.refreshProduct = function () {
        ProductFactory.getProducts().then(function (data) {
          $scope.products = data;
        });
      };

      $scope.confirmSelling = function ($event) {
        $mdBottomSheet.show({
          templateUrl: '/js/components/bottom-sheet/bottom-sheet-confirm-selling.html',
          controller: 'BottomSheetConfirmCtrl',
          targetEvent: $event
        }).then(function (done) {
          if (done) {
            SweetAlert.swal({
              title: 'Vente terminée !',
              type: 'success'
            }, function (ok) {
              if (ok) {
                $scope.refreshProduct();
              }
            });
          }
        });
      }
    }]);
