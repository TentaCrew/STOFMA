'use strict';

angular.module('stofmaApp.controllers')
    .controller('UserCtrl', ['$q', '$scope', 'usersData', '$state', 'UserFactory', 'UserService', 'SweetAlert', '$mdBottomSheet', '$mdToast', function ($q, $scope, usersData, $state, UserFactory, UserService, SweetAlert, $mdBottomSheet, $mdToast) {

      $scope.users = UserFactory.onlyRealUsers(usersData).sort(function (u1, u2) {
        if (u1.getName(true) < u2.getName(true))
          return -1;
        else
          return 1;
      });

      function goProfileEditor(id) {
        $state.go('admin.profile', {
          id: id
        });
      }

      $scope.action = function (id, index) {
        $scope.getCurrentUser().then(function (u) {
          if (u.isManager(true)) {
            UserService.get(id, true).then(function (user) {
              $mdBottomSheet.show({
                templateUrl: 'assets/js/components/bottom-sheet/bottom-sheet-action-user.html',
                controller: 'BottomSheetConfirmCtrl',
                locals: {
                  data: {
                    user: user,
                    manager : u
                  }
                }
              }).then(function (response) {
                switch (response.confirm) {
                  case 'edit':
                    goProfileEditor(id);
                    break;
                  case 'setMember':
                    UserService.setMember(user.id, !user.isMember).then(function (user) {
                      SweetAlert.swal({
                        title: user.getName() + ' est désormais ' + (user.isMember ? '' : 'non-') + 'membre.',
                        type: 'success'
                      });
                      $scope.users[index] = user;
                    });
                    break;
                  case 'delete':
                    $mdBottomSheet.show({
                      templateUrl: 'assets/js/components/bottom-sheet/bottom-sheet-confirm-remove-user.html',
                      controller: 'BottomSheetConfirmCtrl',
                      data: {}
                    }).then(function (response) {
                      if (response.confirm) {
                        UserService.disable(id, true).then(function () {
                          $scope.users.splice(index, 1);
                          $mdToast.show(
                              $mdToast.simple()
                                  .content('L\'utilisateur a été désactivé.')
                                  .position("bottom right")
                                  .hideDelay(3000)
                          ).catch(function () {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .content('L\'utilisateur n\'a pas été désactivé.')
                                        .position("bottom right")
                                        .hideDelay(5000)
                                );
                              });
                        });
                      }
                    });
                    break;
                }
              });
            });
          }
        });
      }
    }]);
