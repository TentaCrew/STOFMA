angular.module('stofmaApp.directive.productList', ['stofmaApp.directive.productLine'])
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
            angular.forEach(v, function (vv, kk) {
              if (vv.id == id) {
                if (c == 0)
                  $scope.products[k][kk].selected = 0;
                else
                  $scope.products[k][kk].selected = vv.selected + c > 0 ? (vv.selected + c > vv.left ? vv.left : vv.selected += c) : 0;
              }
            });
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
            angular.forEach(v, function (vv, kk) {
              if (vv.selected > 0) {
                sum += vv.selected * vv.price;
              }
            });
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