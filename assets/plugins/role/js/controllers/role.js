'use strict';

angular.module('stofmaApp.controllers')
  .controller('RoleCtrl', ['$q','$scope', '$state', 'usersData', 'Auth', 'UserService', 'RoleService', 'UserFactory', 'SweetAlert', function ($q, $scope, $state, usersData, Auth, UserService, RoleService, UserFactory, SweetAlert) {

    $scope.allUsers = UserFactory.onlyRealUsers(usersData);

    $scope.loadData = function(){
      $scope.simpleUsers = [];
      $scope.managerUsers = [];
      for(var i = 0 ; i < $scope.allUsers.length ; i++){
        var user = $scope.allUsers[i];
        if(user.role === 'USER'){
          $scope.simpleUsers.push(user);
        }
        else if(user.role === 'MANAGER'){
          $scope.managerUsers.push(user);
        }
      }
    };

    $scope.loadData();

    UserService.getCurrentSession().then(function (session) {
      UserService.get(session.id).then(function (user) {
        $scope.user = user;
      }, function (err) {
        $scope.user = null;
      });
    }, function (err) {
      $scope.user = null;
    });

    $scope.addManager = function ($event) {
      var form = $scope.addManagerForm,
          userId = form.selectedUser.$modelValue;

      UserService.get(userId).then(function (user) {
        if (form.$valid) {
          RoleService.setRole(userId, {role: 'MANAGER'})
          .then(function (res) {
            SweetAlert.swal({
              title: user.firstname+' '+user.name+' est désormais manager !',
              type: 'success'
            }, function (ok) {
              if (ok) {
                $scope.loadData();
                $state.reload();
              }
            });
          }).catch(function (err) {
            SweetAlert.swal({
              title: 'Échec de l\'ajout à la liste des managers.',
              type: 'error'
            });
          });
        }
      });
    };

    $scope.removeManager = function (userId) {
      UserService.get(userId).then(function (user) {
        RoleService.setRole(userId, {role: 'USER'})
        .then(function (res) {
          SweetAlert.swal({
            title: user.firstname+' '+user.name+' n\'est plus manager !',
            type: 'success'
          }, function (ok) {
            if (ok) {
              $scope.loadData();
              $state.reload();
            }
          });
        }).catch(function (err) {
          SweetAlert.swal({
            title: 'Échec du retrait de la liste des managers.',
            type: 'error'
          });
        });
      });
    };

  }]);
