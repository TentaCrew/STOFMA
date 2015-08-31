'use strict';

angular.module('stofmaApp.controllers')

    .controller('SellCtrl', ['$scope', '$q', 'productsData', 'usersData', 'ProductService', 'ProductFactory', 'SaleService', '$mdBottomSheet', 'SweetAlert', 'PaymentService', 'PaymentFactory', '$mdToast', function ($scope, $q, productsData, usersData, ProductService, ProductFactory, SaleService, $mdBottomSheet, SweetAlert, PaymentService, PaymentFactory, $mdToast) {
      $scope.products = productsData;
      $scope.users = usersData;

      $scope.customer = null;
      $scope.sum = 0.0;

      $scope.refreshProduct = function () {
        ProductService.getProducts(true).then(function (data) {
          $scope.products = data;
        });
      };

      $scope.$watch('customer', function (v) {
        if (angular.isDefined(v) && v !== null) {
          $scope.levelPrice = ProductFactory.getLevelPrice(v.isMember);
        }
      });

      $scope.computeSum = function (sum) {
        $scope.sum = sum;
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

        $mdBottomSheet.show({
          templateUrl: '/js/components/bottom-sheet/bottom-sheet-confirm-selling.html',
          controller: 'BottomSheetConfirmSellCtrl',
          targetEvent: $event,
          locals: {
            productsToSell: products,
            sum: $scope.sum,
            guest: $scope.customer.id == -1
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
