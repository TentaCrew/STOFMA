'use strict';

angular.module('stofmaApp.controllers')

    .controller('SellCtrl', ['$scope', 'productsData', 'ProductFactory', 'SaleFactory', '$mdBottomSheet', 'SweetAlert', function ($scope, productsData, ProductFactory, SaleFactory, $mdBottomSheet, SweetAlert) {
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
        ProductFactory.getProducts(true).then(function (data) {
          $scope.products = data;
        });
      };

      $scope.confirmSelling = function ($event) {
        var products = $scope.products.filter(function (o) {
          return o.selected > 0;
        });

        $mdBottomSheet.show({
          templateUrl: '/js/components/bottom-sheet/bottom-sheet-confirm-selling.html',
          controller: 'BottomSheetConfirmSellCtrl',
          targetEvent: $event,
          locals: {
            productsToSell: products
          },
          resolve: {
            userProvider: 'UserFactory',
            usersData: function (UserFactory) {
              return UserFactory.getAll();
            }
          }
        }).then(function (r) {
          if (r.ok) {
            SaleFactory.doSale(r.user.id, products).then(function () {
              SweetAlert.swal({
                title: 'Vente terminée pour ' + r.user.name + '!',
                type: 'success'
              }, function (ok) {
                if (ok) {
                  $scope.refreshProduct();
                }
              });
            }).catch(function () {
              SweetAlert.swal({
                title: 'La vente n\'a pas réussi.',
                type: 'fail'
              });
            })

          }
        });
      }
    }]);
