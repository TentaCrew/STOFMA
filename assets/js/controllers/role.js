'use strict';

angular.module('stofmaApp.controllers')
    .controller('RoleCtrl', ['$q', '$scope', '$state', 'usersData', 'Auth', 'UserService', 'UserFactory', 'SweetAlert', function ($q, $scope, $state, usersData, Auth, UserService, UserFactory, SweetAlert) {

      var users = UserFactory.onlyRealUsers(usersData);

      $scope.simpleUsers = users.filter(function (u) {
        return u.isSimpleUser();
      });

      $scope.managers = users.filter(function (u) {
        return u.isManager();
      });

      $scope.admins = users.filter(function (u) {
        return u.isAdmin();
      });

      UserService.getCurrentSession().then(function (session) {
        UserService.get(session.id).then(function (user) {
          $scope.user = user;
        }, function (err) {
          $scope.user = null;
        });
      }, function (err) {
        $scope.user = null;
      });

      $scope.addManager = function () {
        var user = $scope.selectedUser;

        if ($scope.addManagerForm.$valid) {
          Auth.setRole(user.id, {
            role: 'MANAGER'
          })
              .then(function (newUser) {
                SweetAlert.swal({
                  title: user.getName() + ' est désormais manager !',
                  type: 'success'
                }, function (ok) {
                  if (ok) {
                    for (var i = 0; i < $scope.simpleUsers.length; i++) {
                      if ($scope.simpleUsers[i].id == newUser.id) {
                        $scope.simpleUsers.splice(i, 1);
                        break;
                      }
                    }
                    $scope.managers.unshift(newUser);
                    $scope.selectedUser = undefined;
                    $scope.searchUserText = '';
                  }
                });
              }).catch(function (err) {
                SweetAlert.swal({
                  title: 'Échec de l\'ajout à la liste des managers.',
                  type: 'error'
                });
              });
        }
      };

      $scope.removeManager = function (userId, index) {
        Auth.setRole(userId, {
          role: 'USER'
        })
            .then(function (newUser) {
              SweetAlert.swal({
                title: newUser.getName() + ' n\'est plus manager !',
                type: 'success'
              }, function (ok) {
                if (ok) {
                  $scope.managers.splice(index, 1);
                  $scope.simpleUsers.unshift(newUser);
                }
              });
            }).catch(function (err) {
              SweetAlert.swal({
                title: 'Échec du retrait de la liste des managers.',
                type: 'error'
              });
            });
      };

      $scope.setAdmin = function (userId, index) {
        Auth.setRole(userId, {
          role: 'ADMINISTRATOR'
        })
            .then(function (newUser) {
              SweetAlert.swal({
                title: newUser.getName() + ' est désormais administrateur !',
                type: 'success'
              }, function (ok) {
                if (ok) {
                  $scope.managers.splice(index, 1);
                  $scope.admins.unshift(newUser);
                }
              });
            }).catch(function (err) {
              SweetAlert.swal({
                title: 'Échec du transfert du role Administrateur.',
                type: 'error'
              });
            });
      };

      $scope.setManager = function (userId, index) {
        Auth.setRole(userId, {
          role: 'MANAGER'
        })
            .then(function (newUser) {
              SweetAlert.swal({
                title: newUser.getName() + ' est désormais manager !',
                type: 'success'
              }, function (ok) {
                if (ok) {
                  $scope.admins.splice(index, 1);
                  $scope.managers.push(newUser);
                }
              });
            }).catch(function (status) {
              if(status == 403) {
                SweetAlert.swal({
                  title: 'L\'administrateur de l\'application ne peut pas devenir manager.',
                  type: 'error'
                });
              } else {
                SweetAlert.swal({
                  title: 'Échec du transfert du role Manager.',
                  type: 'error'
                });
              }
            });
      };


      // Auto-complete part

      $scope.getMatches = getMatches;
      $scope.searchUserText = '';

      function getMatches(query) {
        return query ? $scope.simpleUsers.filter(function (u) {
          return angular.lowercase(u.getName()).indexOf(angular.lowercase(query)) >= 0;
        }) : $scope.simpleUsers;
      }

      // End of Auto-complete part
    }]);
