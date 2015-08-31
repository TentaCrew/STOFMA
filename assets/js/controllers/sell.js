'use strict';

angular.module('stofmaApp.controllers')

    .controller('SellCtrl', ['$scope', '$q', 'productsData', 'usersData', 'ProductService', 'SaleService', '$mdBottomSheet', 'SweetAlert', 'PaymentService', 'PaymentFactory', '$mdToast', function ($scope, $q, productsData, usersData, ProductService, SaleService, $mdBottomSheet, SweetAlert, PaymentService, PaymentFactory, $mdToast) {
      $scope.products = productsData;
      $scope.users = usersData;

      $scope.customer = null;

      $scope.refreshProduct = function () {
        ProductService.getProducts(true).then(function (data) {
          $scope.products = data;
        });
      };

      $scope.confirmSelling = function ($event) {
        if ($scope.customer === null) {
          $mdToast.show(
              $mdToast.simple()
                  .content('Veuillez sélectionner la personne à servir.')
                  .position("bottom right")
                  .hideDelay(5000)
          );
          return;
        }

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
          }
        }).then(function (response) {
          if (response.confirm) {
            SaleService.doSale($scope.customer.id, products, response.paymentMode).then(function (newSale) {
              SweetAlert.swal({
                title: 'Vente terminée pour ' + $scope.customer.getName() + '!',
                type: 'success'
              }, function (ok) {
                if (ok) {
                  $scope.refreshProduct();
                  $scope.customer = null;
                }
              });
            }).catch(function () {
              SweetAlert.swal({
                title: 'La vente n\'a pas réussi.',
                text: 'Merci de recréditer votre solde.',
                type: 'error'
              });
            })

          }
        });
      }
    }]);
