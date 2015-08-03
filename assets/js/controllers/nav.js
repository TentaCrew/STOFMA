angular.module('stofmaApp.controllers')
    .controller('NavCtrl', ['$scope', 'Auth', 'CurrentUser', '$mdBottomSheet', '$mdSidenav', '$state', function ($scope, Auth, CurrentUser, $mdBottomSheetr, $mdSidenav, $state) {
      $scope.isCollapsed = true;
      $scope.auth = Auth;
      $scope.user = CurrentUser.user();

      $scope.pages = $state.get().filter(function (s) {
        return s.abstract == undefined || s.abstract == false;
      });

      $scope.logout = function () {
        Auth.logout().then(function () {
          $state.go('anon.login');
        });
      };
    }]);
