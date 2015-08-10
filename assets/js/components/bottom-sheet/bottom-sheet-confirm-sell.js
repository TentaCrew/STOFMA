angular.module('stofmaApp.components')
    .controller('BottomSheetConfirmSellCtrl', ['$scope', '$mdBottomSheet', 'usersData', 'UserService', 'productsToSell', 'sum', function ($scope, $mdBottomSheet, usersData, UserService, productsToSell, sum) {
      $scope.users = usersData;

      $scope.sum = sum;
      $scope.productsOnSale = productsToSell;

      $scope.isConfirmable = function () {
        return $scope.confirmSale.invitedUser.$modelValue === true || $scope.confirmSale.selectedUser.$modelValue != undefined
      };

      $scope.confirm = function () {
        if ($scope.isConfirmable()) {
          var su = $scope.confirmSale.invitedUser.$modelValue ? -1 : $scope.confirmSale.selectedUser.$modelValue;
          var user = {
            id: -1,
            getName: function () {
              return 'l\'invité';
            }
          };
          if (su >= 0) {
            UserService.get(su).then(function (u) {
              user = u;
              $mdBottomSheet.hide({
                ok: true,
                user: user
              });
            });
          } else {
            $mdBottomSheet.hide({
              ok: true,
              user: user
            });
          }

        }
      };

      $scope.cancel = function () {
        $mdBottomSheet.hide({
          ok: false
        });
      };
    }]);

