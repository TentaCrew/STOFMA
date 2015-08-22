'use strict';

angular.module('stofmaApp.controllers')
  .controller('RoleCtrl', ['$q','$scope', '$state', 'usersData', 'Auth', 'UserService', 'SweetAlert', function ($q, $scope, $state, usersData, Auth, UserService, SweetAlert) {

    $scope.allUsers = usersData;

    $scope.loadData = function(){
      $scope.simpleUsers = new Array();
      $scope.managerUsers = new Array();
      for(var i = 0 ; i < $scope.allUsers.length ; i++){
        if($scope.allUsers[i].role === 'USER'){
          $scope.simpleUsers.push($scope.allUsers[i]);
        }
        else if($scope.allUsers[i].role === 'MANAGER'){
          $scope.managerUsers.push($scope.allUsers[i]);
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
          Auth.setRole(userId, {role: 'MANAGER'})
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
        Auth.setRole(userId, {role: 'USER'})
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
