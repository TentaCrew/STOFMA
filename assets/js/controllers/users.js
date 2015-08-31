'use strict';

angular.module('stofmaApp.controllers')
    .controller('UserCtrl', ['$q', '$scope', 'usersData', '$state', 'Auth', 'UserService', function ($q, $scope, usersData, $state, Auth, UserService) {

      $scope.users = usersData;

      $scope.goProfileEditor = function (id) {
        $state.go('admin.profile', {id: id});
      };

      $scope.loadUsers = function () {
        UserService.getAll().then(function (users) {
          $scope.users = users.sort(function (u1, u2) {
            if (u1.getName() < u2.getName())
              return -1;
            else
              return 1;
          });
          for (var i = 0; i < $scope.users.length; i++) {
            $scope.users[i].credit = Number($scope.users[i].credit).toFixed(2);
          }
        });
      };

      $scope.loadUsers();

    }]);
