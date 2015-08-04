angular.module('stofmaApp.controllers')
    .controller('NavCtrl', ['$scope', 'Auth', 'UserFactory', '$mdBottomSheet', '$mdSidenav', '$state', 'AccessLevels', function ($scope, Auth, UserFactory, $mdBottomSheetr, $mdSidenav, $state, AccessLevels) {
      var that = this;
      $scope.isCollapsed = true;
      $scope.auth = Auth;

      $scope.isUser = false;
      $scope.isAnonymous = false;
      $scope.isManager = false;
      $scope.isAdmin = false;

      $scope.allPages = $state.get().filter(function (s) {
        return s.abstract == undefined || s.abstract == false;
      }).sort(function(p1, p2){
        var wp1 = angular.isDefined(p1.data.weight) ? p1.data.weight : 0,
            wp2 = angular.isDefined(p2.data.weight) ? p2.data.weight : 0;
        console.log(wp1, wp2);
        return wp1 > wp2;
      });

      $scope.$parent.$watch('user', function (nv) {
        var role = nv === null || angular.isUndefined(nv) ? null : nv.role.toLowerCase();
        $scope.isAnonymous = role === null;
        $scope.isAdmin = role == AccessLevels.admin;
        $scope.isManager = $scope.isAdmin ? true : role == AccessLevels.manager; // Admin can be manager
        $scope.isUser = $scope.isAdmin ? true : role == AccessLevels.user; // Admin is user too

        refreshMenu();
      });

      function refreshMenu(){
        $scope.pages = $scope.allPages.filter(function (s) {
          if($scope.isAnonymous && s.data.access == AccessLevels.anon)
            return true;
          if ($scope.isUser && s.data.access == AccessLevels.user)
            return true;
          else if ($scope.isManager && s.data.access == AccessLevels.manager)
            return true;
          else if ($scope.isAdmin && s.data.access == AccessLevels.admin)
            return true;
          return false;
        });
      }

      $scope.logout = function () {
        Auth.logout().then(function () {
          $state.go('anon.login');
        });
      };
    }]);
