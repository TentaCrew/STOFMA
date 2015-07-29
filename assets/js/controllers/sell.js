'use strict';

angular.module('stofmaApp.sell', [
  'stofmaApp.factory.product',
  'stofmaApp.directive.productList',
  'stofmaApp.bottomsheetconfirm'
])

  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('sell', {
      url: '/sell',
      views: {
        'main-content': {
          controller: 'SellCtrl',
          templateUrl: 'assets/templates/sell.html'
        }
      },
      data: {
        name: 'Vendre un produit'
      },
      resolve: {
        productProvider: 'ProductFactory',

        productsData: function (productProvider) {
          return productProvider.getProducts();
        }
      }
    })
  }])

  .controller('SellCtrl', ['$scope', 'productsData', 'ProductFactory', '$mdBottomSheet', 'SweetAlert', function ($scope, productsData, ProductFactory, $mdBottomSheet, SweetAlert) {
    $scope.categories = productsData.categories;
    $scope.products = productsData.products;

    $scope.refreshProduct = function () {
      ProductFactory.getProducts().then(function (data) {
        $scope.products = data.products;
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

