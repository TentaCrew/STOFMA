angular.module('stofmaApp.components')
    .directive('productList', ['ProductFactory', function (ProductFactory) {
      return {
        restrict: 'A',
        scope: {
          categories: "=",
          products: "=",
          usage: "@"
        },
        controller: ['$scope', function ($scope) {
          $scope.sum = 0.0;
          $scope.isSellable = false;
          $scope.isSellingMode = false;
          $scope.isListingMode = false;

          $scope.selectProduct = function (id, c) {
            angular.forEach($scope.products, function (v, k) {
              if (v.id == id) {
                if (c == 0)
                  $scope.products[k].selected = 0;
                else
                  $scope.products[k].selected = v.selected + c > 0 ? (v.selected + c > v.quantity ? v.quantity : v.selected += c) : 0;
              }
            });
          };

          $scope.cancel = function () {
            $scope.$parent.refreshProduct();
          };

          $scope.$watch("usage", function (nv, ov) {
            $scope.isSellingMode = nv == 'selling';
            $scope.isListingMode = nv == 'listing';
          });

          $scope.$watch("products", function (nv, ov) {
            var sum = 0;

            angular.forEach($scope.products, function (v, k) {
              if (v.selected > 0) {
                sum += v.selected * v.price;
              }
            });
            $scope.sum = sum;
            $scope.isSellable = sum > 0;
          }, true);

          $scope.check = function ($event) {
            if ($scope.isSellable) {
              $scope.$parent.confirmSelling($event);
            }
          }
        }],
        link: function (scope, element, attrs) {
        },
        templateUrl: '/js/components/product-list/product-list.html'
      };
    }]);

