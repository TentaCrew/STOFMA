angular.module('stofmaApp.components')
    .controller('BottomSheetConfirmCtrl', ['$scope', '$mdBottomSheet', function ($scope, $mdBottomSheet) {
      $scope.confirm = function (value) {
        $mdBottomSheet.hide({
          confirm: value
        });
      };
    }]);
