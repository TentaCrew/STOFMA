'use strict';

angular.module('stofmaApp.controllers')
    .controller('UserCtrl', ['$q', '$scope', 'usersData', '$state', 'UserFactory', function ($q, $scope, usersData, $state, UserFactory) {

      $scope.users = UserFactory.onlyRealUsers(usersData).sort(function (u1, u2) {
        if (u1.getName(true) < u2.getName(true))
          return -1;
        else
          return 1;
      });

      $scope.goProfileEditor = function (id) {
        $state.go('admin.profile', {id: id});
      };

    }]);
