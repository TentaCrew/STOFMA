angular.module('stofmaApp.components')
    .controller('BottomSheetConfirmSellCtrl', ['$scope', '$mdBottomSheet', 'productsToSell', 'sum', 'paymentMode', 'guest', 'PaymentService', function ($scope, $mdBottomSheet, productsToSell, sum, paymentMode, guest, PaymentService) {
      $scope.sum = sum;
      $scope.productsOnSale = productsToSell;
      PaymentService.getPaymentModes(guest).then(function (pm) {
        $scope.paymentModes = pm;
      });
      $scope.payment = paymentMode;

      $scope.isConfirmable = function () {
        return $scope.payment != null;
      };

      $scope.setPayment = function (paymentMode) {
        $scope.payment = paymentMode;
      };

      $scope.confirm = function () {
        if ($scope.isConfirmable()) {
          $mdBottomSheet.hide({
            confirm: true,
            paymentMode: $scope.payment
          });
        }
      };

      $scope.cancel = function () {
        $mdBottomSheet.hide({
          confirm: false
        });
      };
    }]);

