'use strict';

angular.module('stofmaApp.controllers')
    .controller('ProductCtrl', ['$scope', 'productsData', 'categoriesData', 'ProductService', '$state', '$q', '$mdBottomSheet', '$mdToast', '$mdDialog', function ($scope, productsData, categoriesData, ProductService, $state, $q, $mdBottomSheet, $mdToast, $mdDialog) {
      $scope.products = productsData;
      $scope.categories = categoriesData;
      $scope.setFabButton('add', function () {
        $state.go('manager.products.add');
      });

      $scope.onSetEnable = function (id, isEnable) {
        var defer = $q.defer();

        $mdBottomSheet.show({
          templateUrl: 'assets/js/components/bottom-sheet/bottom-sheet-confirm-' + (isEnable ? 'enable' : 'disable') + '-product.html',
          controller: 'BottomSheetConfirmCtrl',
          locals: {
            data: {}
          }
        }).then(function (response) {
          if (response.confirm) {
            ProductService.setProductEnable(id, isEnable).then(function () {
              $mdToast.show(
                  $mdToast.simple()
                      .content('Produit ' + (isEnable ? 'réactivé' : 'désactivé'))
                      .position("bottom right")
                      .hideDelay(3000)
              );
              defer.resolve();
            }).catch(function (err) {
              $mdToast.show(
                  $mdToast.simple()
                      .content('Le produit n\'a pas été ' + (isEnable ? 'réactivé' : 'désactivé'))
                      .position("bottom right")
                      .hideDelay(5000)
              );
              defer.reject();
            })
          }
        });

        return defer.promise;
      };

      $scope.onEdit = function (product) {
        var defer = $q.defer();

        $mdDialog.show({
          controller: 'DialogProductController',
          templateUrl: 'assets/js/components/modal/modal-product.html',
          clickOutsideToClose: true,
          locals: {
            product: product,
            categories: ProductService.getCategories(),
            title: 'Modification du produit ' + product.name
          }
        })
            .then(function (productForm) {
              ProductService.editProduct(product.id, productForm).then(function (newProduct) {
                $mdToast.show(
                    $mdToast.simple()
                        .content('Produit mis à jour.')
                        .position("bottom right")
                        .hideDelay(3000)
                );
                defer.resolve(newProduct);
              }).catch(function (err) {
                $mdToast.show(
                    $mdToast.simple()
                        .content('Le produit n\'a pas été mis à jour.')
                        .position("bottom right")
                        .hideDelay(5000)
                );
                defer.reject();
              })
            }, function () {
              defer.reject();
            });

        return defer.promise;
      };
    }]);
