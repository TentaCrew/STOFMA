'use strict';

angular.module('stofmaApp.controllers')
    .controller('UserCtrl', ['$q', '$scope', 'usersData', '$state', 'Auth', 'UserService', function ($q, $scope, usersData, $state, Auth, UserService) {

      $scope.users = usersData.sort(function (u1, u2) {
        if (u1.getName(true) < u2.getName(true))
          return -1;
        else
          return 1;
      });

      $scope.goProfileEditor = function (id) {
        $state.go('admin.profile', {id: id});
      };

    }]);
