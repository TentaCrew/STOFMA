angular.module('stofmaApp.controllers')
    .controller('NavCtrl', ['$rootScope', '$scope', 'Auth', 'UserFactory', '$mdBottomSheet', '$mdSidenav', '$state', 'AccessLevels', function ($rootScope, $scope, Auth, UserFactory, $mdBottomSheetr, $mdSidenav, $state, AccessLevels) {
      var that = this;
      $scope.isCollapsed = true;
      $scope.auth = Auth;

      $scope.role = null;
      $scope.isUser = false;
      $scope.isAnonymous = false;
      $scope.isManager = false;
      $scope.isAdmin = false;

      $scope.allPages = $state.get().filter(function (s) {
        return s.abstract == undefined || s.abstract == false;
      }).sort(function (p1, p2) {
        var wp1 = angular.isDefined(p1.data.weight) ? p1.data.weight : 0,
            wp2 = angular.isDefined(p2.data.weight) ? p2.data.weight : 0;
        return wp1 > wp2;
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
        if(s.name.indexOf('login') >= 0 || s.name.indexOf('register') >= 0 || s.name.indexOf('home') >= 0)
          return true;

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

      $rootScope.$on('$stateChangeStart', function (event, toState) {
        if (!haveAccess(toState)) {
          event.preventDefault();
        }
      });

      $scope.logout = function () {
        $scope.isAnonymous = true;
        Auth.logout().then(function () {
          $state.go('anon.login');
        });
      };
    }]);
