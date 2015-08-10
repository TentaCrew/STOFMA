'use strict';

angular.module('stofmaApp.controllers')

    .controller('SellCtrl', ['$scope', 'productsData', 'ProductService', 'SaleService', '$mdBottomSheet', 'SweetAlert', function ($scope, productsData, ProductService, SaleService, $mdBottomSheet, SweetAlert) {
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
        ProductService.getProducts(true).then(function (data) {
          $scope.products = data;
        });
      };

      $scope.confirmSelling = function ($event) {
        var products = $scope.products.filter(function (o) {
          return o.selected > 0;
        });

        var sum = 0;
        angular.forEach(products, function (p) {
          sum += p.selected * p.price;
        });

        $mdBottomSheet.show({
          templateUrl: '/js/components/bottom-sheet/bottom-sheet-confirm-selling.html',
          controller: 'BottomSheetConfirmSellCtrl',
          targetEvent: $event,
          locals: {
            productsToSell: products,
            sum: sum
          },
          resolve: {
            userProvider: 'UserService',
            usersData: function (UserService) {
              return UserService.getAll();
            }
          }
        }).then(function (r) {
          if (r.ok) {
            SaleService.doSale(r.user.id, products).then(function () {
              SweetAlert.swal({
                title: 'Vente terminée pour ' + r.user.getName() + '!',
                type: 'success'
              }, function (ok) {
                if (ok) {
                  $scope.refreshProduct();
                }
              });
            }).catch(function () {
              SweetAlert.swal({
                title: 'La vente n\'a pas réussi.',
                type: 'error'
              });
            })

          }
        });
      }
    }]);
