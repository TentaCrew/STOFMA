'use strict';

angular.module('stofmaApp.controllers')
    .controller('ProductCtrl', ['$scope', 'productsData', 'categoriesData', 'ProductService', '$state', '$q', '$mdBottomSheet', '$mdToast', '$mdDialog', function ($scope, productsData, categoriesData, ProductService, $state, $q, $mdBottomSheet, $mdToast, $mdDialog) {
      $scope.products = productsData;

      ProductService.getProductsInStock().then(function (products) {
        $scope.productsStock = products;
      });
      $scope.categories = categoriesData;

      $scope.setIconToolbarButtons([{
        name: 'Ajouter un produit',
        icon: 'add',
        callback: function () {
          $state.go('manager.products.add');
        }
      }]);

      $scope.selectedTab = 'list-on-sale-product';

      $scope.setTabMenu([
        {
          id: 'list-on-sale-product',
          name: 'Produits de vente'
        },
        {
          id: 'list-stock-product',
          name: 'Produits stockés'
        }
      ], function (tab) {
        $scope.selectedTab = tab.id;
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
            title: 'Modification de ' + product.name
          }
        })
            .then(function (productForm) {
              ProductService.editProduct(product.id, productForm).then(function (newProduct) {
                if (product.forSale != newProduct.forSale) {
                  if (product.forSale) {
                    for (var i = 0; i < $scope.products.length; i++) {
                      if ($scope.products[i].id == newProduct.id) {
                        $scope.products.splice(i, 1);
                        break;
                      }
                    }
                    $scope.productsStock.push(newProduct);
                  } else {
                    for (var j = 0; j < $scope.productsStock.length; j++) {
                      if ($scope.productsStock[j].id == newProduct.id) {
                        $scope.productsStock.splice(j, 1);
                        break;
                      }
                    }
                    $scope.products.push(newProduct);
                  }
                  defer.resolve(null);
                } else {
                  defer.resolve(newProduct);
                }
                $mdToast.show(
                    $mdToast.simple()
                        .content('Produit mis à jour.')
                        .position("bottom right")
                        .hideDelay(3000)
                );
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

      $scope.onUpdateStock = function (product) {
        var defer = $q.defer();

        $mdDialog.show({
          controller: 'DialogStockProductController',
          templateUrl: 'assets/js/components/modal/modal-stock-product.html',
          clickOutsideToClose: true,
          locals: {
            product: product,
            title: 'Modification du stock'
          }
        })
            .then(function (newStock) {
              ProductService.editStock(product.id, newStock.quantity).then(function (newProduct) {
                defer.resolve(newProduct.quantity);
                $mdToast.show(
                    $mdToast.simple()
                        .content('Stock mis à jour (' + newProduct.quantity + ' unité' + (newProduct.quantity > 1 ? 's' : '') + ').')
                        .position("bottom right")
                        .hideDelay(3000)
                );
              }).catch(function () {
                $mdToast.show(
                    $mdToast.simple()
                        .content('Le stock n\'a pas été mis à jour.')
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
