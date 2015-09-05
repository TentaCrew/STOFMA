angular.module('stofmaApp.components')
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

          $scope.disable = function (id) {
            $scope.$parent.selectProduct(id, 0);
          };

          $scope.enable = function (id) {
            $scope.$parent.selectProduct(id, 2);
          };

          $scope.add = function (id) {
            $scope.$parent.selectProduct(id, 1);
          };

          $scope.edit = function (product) {
            $scope.$parent.edit(product);
          };
        }],
        link: function (scope, element, attrs) {
          element.addClass('product-list-line');
        },
        templateUrl: 'assets/js/components/product-list/product-line/product-line.html'
      };
    });
