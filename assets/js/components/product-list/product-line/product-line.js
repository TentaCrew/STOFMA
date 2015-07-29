angular.module('stofmaApp.directive.productLine', [])
  .directive('productLine', function () {
    return {
      restrict: 'E',
      scope: {
        product: "="
      },
      controller: ['$scope', function ($scope) {
        $scope.remove = function (id) {
          $scope.$parent.selectProduct(id, -1);
        };

        $scope.clear = function (id) {
          $scope.$parent.selectProduct(id, 0);
        };

        $scope.add = function (id) {
          $scope.$parent.selectProduct(id, 1);
        };
      }],
      link: function (scope, element, attrs) {
        element.addClass('product-list-line');
      },
      templateUrl: '/js/components/product-list/product-line/product-line.html'
    };
  });

