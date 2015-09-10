'use strict';

angular.module('stofmaApp.controllers')
    .controller('UserCtrl', ['$q', '$scope', 'usersData', '$state', 'UserFactory', 'UserService', 'SweetAlert', '$mdBottomSheet', '$mdToast', function ($q, $scope, usersData, $state, UserFactory, UserService, SweetAlert, $mdBottomSheet, $mdToast) {

      var cacheUser = $scope.users = UserFactory.onlyRealUsers(usersData);

      function goProfileEditor(id) {
        $state.go('admin.profile', {
          id: id
        });
      }

      $scope.setSearchIcon(true,
          function (search) {
            if (search == null || search == '') {
              $scope.users = cacheUser;
              $scope.searchUser = '';
            } else {
              $scope.searchUser = search;
              $scope.users = $scope.users.filter(function (u) {
                return u.getName().toLowerCase().indexOf(search.toLowerCase()) >= 0;
              });
            }
          });

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
                    manager: u
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
                      cacheUser = angular.copy($scope.users);
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
