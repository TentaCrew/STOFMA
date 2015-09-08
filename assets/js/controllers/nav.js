angular.module('stofmaApp.controllers')
    .controller('NavCtrl', ['$rootScope', '$scope', 'Auth', '$mdSidenav', '$state', 'AccessLevels', function ($rootScope, $scope, Auth, $mdSidenav, $state, AccessLevels) {
      var that = this;
      $scope.isCollapsed = true;
      $scope.auth = Auth;

      $scope.role = null;
      $scope.isUser = false;

      $scope.allPages = angular.copy($state.get()).filter(function (s) {
        return angular.isDefined(s.data) && angular.isDefined(s.data.name) && s.data.name.length > 0
            && (angular.isUndefined(s.data.hidden) || !s.data.hidden);
      }).map(function (o) {
        o.isHeader = angular.isDefined(o.abstract) && o.abstract;
        return o;
      });

      $scope.getCurrentUser(function (user) {
        $scope.isUser = !(user === null);

        refreshMenu(user);
      });

      function refreshMenu(user) {
        $scope.pages = $scope.allPages.filter(function (s) {
          return haveAccess(user, s);
        });
      }

      function haveAccess(user, s) {
        var cascadeLevel = true;
        if (s.data && s.data.noCascadeRole)
          cascadeLevel = false;

        if (user === null) // If not authenticated, only access to anonymous pages
          return s.data.access == AccessLevels.anon;

        return (user.isSimpleUser(cascadeLevel) && s.data.access == AccessLevels.user)
            || (user.isManager(cascadeLevel) && s.data.access == AccessLevels.manager)
            || (user.isAdmin() && s.data.access == AccessLevels.admin);
      }

      $scope.logout = function () {
        Auth.logout().then(function () {
          $scope.setCurrentUser(null);
          $state.go('anon.login');
        });
      };
    }]);
