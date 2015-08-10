angular.module('stofmaApp.controllers')
    .controller('NavCtrl', ['$rootScope', '$scope', 'Auth', '$mdBottomSheet', '$mdSidenav', '$state', 'AccessLevels', function ($rootScope, $scope, Auth, $mdBottomSheetr, $mdSidenav, $state, AccessLevels) {
      var that = this;
      $scope.isCollapsed = true;
      $scope.auth = Auth;

      $scope.role = null;
      $scope.isUser = false;
      $scope.isAnonymous = false;
      $scope.isManager = false;
      $scope.isAdmin = false;

      $scope.allPages = angular.copy($state.get()).filter(function (s) {
        return angular.isDefined(s.data) && angular.isDefined(s.data.name);
      }).map(function (o) {
        o.isHeader = angular.isDefined(o.abstract) && o.abstract;
        return o;
      });

      $scope.$parent.$watch('user', function (nv) {
        $scope.role = nv === null || angular.isUndefined(nv) ? null : nv.role.toLowerCase();
        $scope.isAnonymous = $scope.role === null;
        $scope.isAdmin = $scope.role == AccessLevels.admin;
        $scope.isManager = $scope.isAdmin ? true : $scope.role == AccessLevels.manager; // Admin can be manager
        $scope.isUser = $scope.isManager ? true : $scope.role == AccessLevels.user; // Manager is user too

        refreshMenu();
      });

      function haveAccess(s) {
        if ($scope.isAnonymous && s.data.access == AccessLevels.anon)
          return true;

        if ($scope.isUser && s.data.access == AccessLevels.user)
          return true;
        else if ($scope.isManager && s.data.access == AccessLevels.manager)
          return true;
        else if ($scope.isAdmin && s.data.access == AccessLevels.admin)
          return true;

        return false;
      }

      function refreshMenu() {
        $scope.pages = $scope.allPages.filter(function (s) {
          return haveAccess(s);
        });
      }

      $scope.logout = function () {
        $scope.isAnonymous = true;
        Auth.logout().then(function () {
          $state.go('anon.login');
        });
      };
    }]);
