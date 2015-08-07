angular.module('stofmaApp.components')
    .controller('BottomSheetConfirmSellCtrl', ['$scope', '$mdBottomSheet', 'usersData', 'UserFactory', 'productsToSell', function ($scope, $mdBottomSheet, usersData, UserFactory, productsToSell) {
      $scope.users = usersData;

      $scope.productsOnSale = productsToSell;

      $scope.isConfirmable = function(){
        return $scope.confirmSale.invitedUser.$modelValue === true || $scope.confirmSale.selectedUser.$modelValue != undefined
      };

      $scope.confirm = function () {
        if($scope.isConfirmable()){
          var su = $scope.confirmSale.invitedUser.$modelValue ? -1 : $scope.confirmSale.selectedUser.$modelValue;
          var user = {
            id : -1,
            name : 'l\'invité'
          };
          if(su >= 0){
            UserFactory.get(su).then(function(u){
              user.name = u.firstname + ' ' + u.name;
              user.id = u.id;

              $mdBottomSheet.hide({
                ok : true,
                user : user
              });
            });
          } else {
            $mdBottomSheet.hide({
              ok : true,
              user : user
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

