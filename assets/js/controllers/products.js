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
            templateUrl: '/js/components/bottom-sheet/bottom-sheet-confirm-'+(isEnable ? 'enable' : 'disable')+'-product.html',
            controller: 'BottomSheetConfirmCtrl'
        }).then(function (done) {
          if (done) {
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
          controller: DialogEditProductController,
          templateUrl: '/js/components/modal/edit-product.html',
          clickOutsideToClose: true,
          locals: {
            product: product,
            categories: ProductService.getCategories()
          }
        })
            .then(function (productForm) {
              ProductService.editProduct(product.id, productForm).then(function (newProduct) {
                $mdToast.show(
                    $mdToast.simple()
                        .content('Produit mise à jour.')
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

      function DialogEditProductController($scope, categories, product) {
        $scope.categories = categories;
        $scope.category = product.category;
        $scope.name = product.name;
        $scope.shortname = product.shortName;
        $scope.unitPrice = product.price;
        $scope.minimum = product.minimum;
        $scope.urlImage = product.urlImage;

        $scope.submit = function () {
          var form = $scope.editProduct,
              category = form.category.$modelValue,
              name = form.name.$modelValue,
              shortName = form.shortname.$modelValue,
              price = parseFloat(form.unitPrice.$modelValue),
              minimum = parseInt(form.minimum.$modelValue),
              urlImage = form.urlImage.$modelValue;

          if (isNaN(price) || price <= 0)
            form.unitPrice.$setValidity('notaprice', false);
          else
            form.unitPrice.$setValidity('notaprice', true);

          if (isNaN(minimum) || minimum <= 0)
            form.minimum.$setValidity('notanumber', false);
          else
            form.minimum.$setValidity('notanumber', true);

          if (form.$valid) {
            ProductService.editProduct(product.id, {
              category: category,
              name: name,
              shortName: shortName,
              price: price,
              minimum: minimum,
              urlImage: urlImage
            }).then(function (newProduct) {
              $mdDialog.hide(newProduct);
            }).catch(function (err) {
              // TODO Handle err.
            });
          }
        };

        $scope.cancel = function () {
          $mdDialog.cancel();
        };
      }
    }]);
