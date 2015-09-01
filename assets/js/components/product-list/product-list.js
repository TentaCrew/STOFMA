angular.module('stofmaApp.components')
    .directive('productList', ['ProductService', 'ProductFactory', function (ProductService, ProductFactory) {
      return {
        restrict: 'A',
        scope: {
          products: "=",
          usage: "@",
          sellHandler: "=sell", // Must be an function.
          activateHandler: "=activate", // Must be an function returning a promise.
          editHandler: "=edit", // Must be an function returning a promise.
          getSum: '=',
          showSwitchPrice: '=',
          levelPrice: "="
        },
        controller: ['$scope', function ($scope) {
          $scope.sum = 0.0;
          $scope.isSellable = false;

          $scope.isSellingMode = false;
          $scope.isListingMode = false;
          $scope.isSelectingMode = false;
          $scope.tabSelected = 0;

          $scope.$watch('levelPrice', function (n) {
            if (angular.isDefined(n))
              computeSum();
          });
          

          $scope.$watch('showMemberPrice', function (n) {
            if (angular.isDefined(n)) {
              $scope.levelPrice = ProductFactory.getLevelPrice(n);
            }
          });

          ProductService.getCategories().then(function (cats) {
            $scope.categories = cats;
          });

          $scope.selectProduct = function (id, c) {
            angular.forEach($scope.products, function (v, k) {
              if (v.id == id) {
                if (c == 0) {
                  if ($scope.isSelectingMode) {
                    if (angular.isDefined($scope.activateHandler)) {
                      $scope.activateHandler(id, false).then(function () {
                        v.isActive = false;
                      })
                    } else {
                      v.isActive = false;
                    }
                  } else {
                    $scope.products[k].selected = 0;
                  }
                }
                else if (c == 2) {
                  if ($scope.isSelectingMode) {
                    if (angular.isDefined($scope.activateHandler)) {
                      $scope.activateHandler(id, true).then(function () {
                        v.isActive = true;
                      })
                    } else {
                      v.isActive = true;
                    }
                  } else {
                    $scope.products[k].selected = 0;
                  }
                }
                else {
                  $scope.products[k].selected = v.selected + c > 0 ? (v.selected + c > v.quantity ? v.quantity : v.selected += c) : 0;
                }
              }
            });
          };

          $scope.cancel = function () {
            $scope.$parent.refreshProduct();
          };

          $scope.edit = function (product) {
            if ($scope.canBeEdit) {
              $scope.editHandler(product).then(function (productEdited) {
                for (var i = 0; i < $scope.products.length; i++) {
                  if ($scope.products[i].id == product.id) {
                    $scope.products[i] = productEdited;
                    break;
                  }
                }
              });
            }
          };

          $scope.$watch("usage", function (nv, ov) {
            $scope.isSellingMode = nv == 'selling';
            $scope.isListingMode = nv == 'listing';
            $scope.isSelectingMode = nv == 'selecting';
          });

          $scope.$watch("editHandler", function (nv) {
            $scope.canBeEdit = angular.isDefined(nv) && angular.isFunction(nv);
          });

          $scope.$watch("products", function (nv, ov) {
            if ($scope.isSellingMode)
              computeSum();

            if (typeof $scope.$parent.setFabButton == 'function') {
              if ($scope.isSellable)
                $scope.$parent.setFabButton('done', $scope.check);
              else if ($scope.isSellingMode)
                $scope.$parent.setFabButton(false);
            }

            // Go to category on adding or removing (in selecting mode only)
            if ($scope.isSelectingMode && angular.isArray(nv) && angular.isArray(ov) && nv.length != ov.length) {
              var categoryToGo;
              if (nv.length > ov.length) {
                // Adding a product
                categoryToGo = nv.filter(function (i) {
                  return ov.map(function (e) {
                        return e.id;
                      }).indexOf(i.id) < 0;
                })[0].category;
              } else {
                // Removing a product
                categoryToGo = ov.filter(function (i) {
                  return nv.map(function (e) {
                        return e.id;
                      }).indexOf(i.id) < 0;
                })[0].category;
              }
              for (var i = 0; i < $scope.categories.length; i++) {
                if ($scope.categories[i].id == categoryToGo) {
                  $scope.tabSelected = i;
                  break;
                }
              }
            }
          }, true);

          $scope.check = function ($event) {
            if ($scope.isSellable) {
              $scope.sellHandler();
            }
          };

          function computeSum() {
            var sum = 0;

            angular.forEach($scope.products, function (v, k) {
              if (v.selected > 0) {
                sum += v.selected * v.getPrice($scope.levelPrice);
              }
            });
            $scope.sum = sum;

            if (angular.isFunction($scope.getSum))
              $scope.getSum(sum);

            $scope.isSellable = sum > 0;
          }
        }],
        link: function (scope, element, attrs) {
        },
        templateUrl: '/js/components/product-list/product-list.html'
      };
    }]);
