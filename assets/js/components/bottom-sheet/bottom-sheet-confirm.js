angular.module('stofmaApp.components')
    .controller('BottomSheetConfirmCtrl', ['$scope', '$mdBottomSheet', 'data', function ($scope, $mdBottomSheet, data) {
      if(data) {
        angular.forEach(data, function(v, k){
          $scope[k] = v;
        })
      }

      $scope.confirm = function (value) {
        $mdBottomSheet.hide({
          confirm: value
        });
      };
    }]);

