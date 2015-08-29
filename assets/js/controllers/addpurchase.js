'use strict';

angular.module('stofmaApp.controllers')
    .controller('AddPurchaseCtrl', ['$scope', '$state', 'productsData', 'PurchaseService', 'ProductFactory', 'SweetAlert', '$timeout', function ($scope, $state, productsData, PurchaseService, ProductFactory, SweetAlert, $timeout) {
      $scope.availableProducts = productsData;
      $scope.productsOnSale = [];
      $scope.listingDisplayMode = true;

      $scope.$watch('productSelected', function (n, o) {
        if (!angular.equals(n, o) && angular.isDefined(n) && n !== null) {
          // Focus the number input
          $timeout(function(){
            document.querySelector('#numberProduct').focus();
          }, 500);
        }
      });

      $scope.$watch('productsOnSale', function (n, o) {
        $scope.sum = 0;
        if (angular.isArray(n)) {
          angular.forEach(n, function (v) {
            $scope.sum += v.price * v.quantity;
          });
        }
      }, true);

      var regexpHaveComa = new RegExp(/,/);
      $scope.addProduct = function () {
        if (regexpHaveComa.test($scope.totalprice))
          $scope.totalprice = $scope.totalprice.replace(regexpHaveComa, '.');

        if ($scope.selectProduct.$valid) {
          if ($scope.productSelected !== null) {
            $scope.productSelected.quantity = $scope.number;
            $scope.productSelected.price = parseFloat($scope.totalprice) / $scope.number;

            var productIsPresent = false;
            for (var i = 0; i < $scope.productsOnSale.length; i++) {
              if ($scope.productsOnSale[i].id == $scope.productSelected.id) {
                if($scope.productsOnSale[i].price != $scope.productSelected.price){
                  // Different price : creating of an other product with the new price
                  $scope.productsOnSale.push(angular.copy($scope.productSelected));
                } else {
                  // Product added's price equals to present product
                  $scope.productsOnSale[i].quantity += $scope.productSelected.quantity;
                }
                productIsPresent = true;
                break;
              }
            }
            if (!productIsPresent)
              $scope.productsOnSale.push(angular.copy($scope.productSelected));

            $scope.productSelected = null;
            $scope.totalprice = '';
            $scope.number = '';
          }
        }
      };

      $scope.addPurchase = function () {
        var products = $scope.productsOnSale.filter(function (o) {
          return o.quantity > 0;
        });

        PurchaseService.doPurchase(products).then(function () {
          SweetAlert.swal({
            title: 'Achat enregistré',
            type: 'success'
          }, function (ok) {
            if (ok) {
              $state.go('manager.purchases');
            }
          });
        }).catch(function () {
          SweetAlert.swal({
            title: 'L\'achat n\'a pas été enregistré.',
            text: 'Une erreur s\'est produite.',
            type: 'error'
          });
        });
      };

      $scope.remove = function (index) {
        $scope.productsOnSale.splice(index, 1);
      };

      $scope.$watch('listingDisplayMode', function (v) {
        if($scope.availableProducts.length == 0 && false)
          return;

        if (v === true) {
          $scope.setFabButton('view_week', function () {
            $scope.listingDisplayMode = !$scope.listingDisplayMode;
          });
        } else if (v === false) {
          $scope.setFabButton('list', function () {
            $scope.listingDisplayMode = !$scope.listingDisplayMode;
          });
        }
      });
    }]);
