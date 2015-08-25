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
            $scope.sum += v.price;
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
            $scope.productSelected.price = parseFloat($scope.totalprice);

            var amended = false;
            for (var i = 0; i < $scope.productsOnSale.length; i++) {
              if ($scope.productsOnSale[i].id == $scope.productSelected.id) {
                $scope.productsOnSale[i].quantity += $scope.number;
                $scope.productsOnSale[i].price += parseFloat($scope.totalprice);
                amended = true;
                break;
              }
            }
            if (!amended)
              $scope.productsOnSale.push($scope.productSelected);

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
