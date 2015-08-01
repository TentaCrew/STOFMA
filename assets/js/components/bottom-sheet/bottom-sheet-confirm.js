angular.module('stofmaApp.components')
  .controller('BottomSheetConfirmCtrl', ['$scope', '$mdBottomSheet', function ($scope, $mdBottomSheet) {
    $scope.confirm = function () {
      $mdBottomSheet.hide(true);
    };

    $scope.cancel = function () {
      $mdBottomSheet.hide(false);
    };
  }]);

