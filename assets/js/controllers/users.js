'use strict';

angular.module('stofmaApp.controllers')
  .controller('UserCtrl', ['$q','$scope', 'usersData', '$state', 'Auth', 'UserService', function ($q, $scope, usersData, $state, Auth, UserService) {

    $scope.users = usersData;

    $scope.goProfileEditor = function(id) {
      $state.go('admin.profile', {id: id});
    };

    $scope.loadUsers = function () {
      UserService.getAll().then(function(users){
        $scope.users = users;
        for(var i=0; i<$scope.users.length; i++){
          $scope.users[i].credit = Number($scope.users[i].credit).toFixed(2);
        }
      });
    };

    $scope.loadUsers();

  }]);
