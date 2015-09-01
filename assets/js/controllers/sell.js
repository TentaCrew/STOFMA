'use strict';

angular.module('stofmaApp.controllers')

    .controller('SellCtrl', ['$scope', '$q', 'productsData', 'usersData', 'ProductService', 'ProductFactory', 'SaleService', '$mdBottomSheet', 'SweetAlert', 'PaymentService', 'PaymentFactory', '$mdToast', function ($scope, $q, productsData, usersData, ProductService, ProductFactory, SaleService, $mdBottomSheet, SweetAlert, PaymentService, PaymentFactory, $mdToast) {
      $scope.products = productsData;
      
      $scope.canBeGuest = false;
      $scope.users = usersData.filter(function(u){
        if(u.id == -1){
          $scope.canBeGuest = true;
          return false;
        } else {
          return true;
        }
      });

      $scope.customer = null;
      $scope.sum = 0.0;

      $scope.refreshProduct = function () {
        ProductService.getProducts(true).then(function (data) {
          $scope.products = data;
        });
      };
      
      // Auto-complete part
      
      $scope.getMatches = getMatches;
      $scope.searchUserText = '';
      
      function getMatches(query) {
        return query ? $scope.users.filter(function(u){
          return angular.lowercase(u.getName()).indexOf(angular.lowercase(query)) >= 0;
        }) : $scope.users;
      }
      
      // End of Auto-complete part

      $scope.$watch('customer', function () {
        updateLevelPrice();
      });

      $scope.$watch('guest', function () {
        updateLevelPrice();
      });
      
      function updateLevelPrice () {
        if (angular.isDefined($scope.guest) && $scope.guest === true) {
          $scope.levelPrice = ProductFactory.getLevelPrice(false);
        } else if (angular.isDefined($scope.customer) && $scope.customer !== null) {
          $scope.levelPrice = ProductFactory.getLevelPrice($scope.customer.isMember);
        }
      }

      $scope.computeSum = function (sum) {
        $scope.sum = sum;
      };

      $scope.confirmSelling = function ($event) {
        if ($scope.customer === null && !$scope.guest) {
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
            guest: $scope.guest === true
          }
        }).then(function (response) {
          if (response.confirm) {
            var customerId = $scope.guest ? -1 : $scope.customer.id,
              customerName = customerId == -1 ? 'votre invité' : $scope.customer.getName();
              
            SaleService.doSale(customerId, products, response.paymentMode).then(function (newSale) {
              SweetAlert.swal({
                title: 'Vente terminée pour ' + customerName + '!',
                type: 'success'
              }, function (ok) {
                if (ok) {
                  $scope.refreshProduct();
                  $scope.customer = undefined;
                  $scope.searchUserText = '';
                  $scope.guest = false;
                }
              });
            }).catch(function () {
              SweetAlert.swal({
                title: 'La vente n\'a pas réussi.',
                text: 'Merci de recréditer le solde de ' + customerName + '.',
                type: 'error'
              });
            })

          }
        });
      }
    }]);
