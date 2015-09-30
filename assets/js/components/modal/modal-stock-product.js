angular.module('stofmaApp.components')
    .controller('DialogStockProductController', ['$scope', '$mdDialog', 'title', 'product', function ($scope, $mdDialog, title, product) {
      $scope.title = title;

      if (product) {
        $scope.quantity = product.quantity;
      }

      $scope.submit = function () {
        var form = $scope.stockProduct,
            quantity = parseInt(form.amountStock.$modelValue);

        if (isNaN(quantity) || quantity < 0)
          form.amountStock.$setValidity('notanumber', false);
        else
          form.amountStock.$setValidity('notanumber', true);

        if (form.$valid) {
          $mdDialog.hide({
            quantity: quantity
          });
        }
      };

      $scope.cancel = function () {
        $mdDialog.cancel();
      };
    }]);
