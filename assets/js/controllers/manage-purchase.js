'use strict';

angular.module('stofmaApp.controllers')
    .controller('ManagePurchaseCtrl', ['$scope', '$q', '$state', '$stateParams', 'productsData', 'PurchaseService', 'ProductFactory', 'SweetAlert', '$timeout', 'PaymentService', '$mdToast', 'ProductService', '$mdDialog', function ($scope, $q, $state, $stateParams, productsData, PurchaseService, ProductFactory, SweetAlert, $timeout, PaymentService, $mdToast, ProductService, $mdDialog) {
      $scope.availableProducts = productsData;
      $scope.productsOnSale = [];

      var modes = ['add', 'edit'];
      $scope.mode = modes[0];

      if (angular.isDefined($stateParams.id)) {
        // If it's an edit action
        $scope.mode = modes[1];

        $scope.editPurchaseId = $stateParams.id;

        PurchaseService.getPurchase($scope.editPurchaseId, true).then(function (p) {
          $scope.payment = p.payment.type;
          angular.forEach(p.products, function (v) {
            $scope.addProduct(v.product, v.quantity, v.unitPrice * v.quantity);
          })
        });
      }

      PaymentService.getPaymentModes(null, 'OUT').then(function (pm) {
        $scope.paymentModes = pm;
      });

      $scope.$watch('productSelected', function (n, o) {
        if (!angular.equals(n, o) && angular.isDefined(n) && n !== null) {
          // Focus the number input
          $timeout(function () {
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

      // Auto-complete part

      $scope.getMatches = getMatches;
      $scope.searchProductText = '';

      function getMatches(query) {
        return query ? $scope.availableProducts.filter(function (p) {
          return angular.lowercase(p.name).indexOf(angular.lowercase(query)) >= 0;
        }) : $scope.availableProducts;
      }

      // End of Auto-complete part

      var regexpHaveComa = new RegExp(/,/);
      $scope.addProduct = function (product, number, totalPrice) {
        var byArgs = product && angular.isDefined(number) && angular.isDefined(totalPrice);
        if (!product) {
          product = $scope.productSelected;
          number = $scope.number;
          totalPrice = $scope.totalprice;
        }

        if (regexpHaveComa.test(totalPrice))
          totalPrice = totalPrice.replace(regexpHaveComa, '.');

        if ($scope.selectProduct.$valid || byArgs) {
          if (product !== null && number > 0) {
            product.quantity = number;
            product.price = parseFloat(totalPrice) / number;

            var productIsPresent = false;
            for (var i = 0; i < $scope.productsOnSale.length; i++) {
              if ($scope.productsOnSale[i].id == product.id) {
                if ($scope.productsOnSale[i].price != product.price) {
                  // Different price : creating of an other product with the new price
                  $scope.productsOnSale.push(angular.copy(product));
                } else {
                  // Product added's price equals to present product
                  $scope.productsOnSale[i].quantity += product.quantity;
                }
                productIsPresent = true;
                break;
              }
            }
            if (!productIsPresent)
              $scope.productsOnSale.push(angular.copy(product));

            if (!byArgs) {
              $scope.productSelected = null;
              $scope.selectProduct.$setPristine();
              $scope.selectProduct.$setUntouched();
              $scope.searchProductText = '';
              $scope.totalprice = '';
              $scope.number = '';
            }
          }
        }
      };

      $scope.createProduct = function () {
        var defer = $q.defer();

        $mdDialog.show({
          controller: 'DialogProductController',
          templateUrl: 'assets/js/components/modal/modal-product.html',
          clickOutsideToClose: true,
          locals: {
            product: null,
            categories: ProductService.getCategories(),
            title: 'Création d\'un nouveau produit'
          }
        })
            .then(function (productForm) {
              ProductService.createProduct(productForm).then(function (newProduct) {
                defer.resolve(newProduct);
              }).catch(function (err) {
                $mdToast.show(
                    $mdToast.simple()
                        .content('Une erreur est survenue. Le produit n\'a pas été créé.')
                        .position("bottom right")
                        .hideDelay(5000)
                );
                defer.reject();
              })
            }, function () {
              defer.reject();
            });

        defer.promise.then(function (newProduct) {
          $scope.availableProducts.push(newProduct);

          $mdToast.show(
              $mdToast.simple()
                  .content('Produit créé et ajouté à la liste.')
                  .position("bottom right")
                  .hideDelay(3000)
          );
        });

      };

      $scope.payment = null;

      $scope.setPayment = function (paymentMode) {
        $scope.payment = paymentMode;
      };

      function isValid() {
        var valid = true;

        if ($scope.productsOnSale.length == 0) {
          $mdToast.show(
              $mdToast.simple()
                  .content('Aucun produit n\'a été ajouté à l\'achat')
                  .position("bottom right")
                  .hideDelay(5000)
          );
          valid = false;
        } else if ($scope.payment == null) {
          $mdToast.show(
              $mdToast.simple()
                  .content('Le moyen de paiement est à renseigner.')
                  .position("bottom right")
                  .hideDelay(5000)
          );
          valid = false;
        }

        return valid;
      }

      $scope.addPurchase = function () {
        if (!isValid()) return;

        var products = $scope.productsOnSale.filter(function (o) {
          return o.quantity > 0;
        });

        var methodSave = $scope.mode == modes[0] ?
            PurchaseService.doPurchase(products, $scope.payment)
            : PurchaseService.editPurchase($scope.editPurchaseId, products, $scope.payment);

        methodSave.then(function () {
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

      $scope.edit = function (index) {
        var productPurchase = $scope.productsOnSale[index];
        $scope.productSelected = productPurchase;
        $scope.number = productPurchase.quantity;
        $scope.totalprice = productPurchase.quantity * productPurchase.price;

        $scope.remove(index);
      };

      $scope.setFabButton('done', function () {
        $scope.addPurchase();
      });
    }]);
