'use strict';

angular.module('stofmaApp.controllers')
    .controller('ProfileCtrl', ['$q', '$scope', 'updateHimSelf', 'userData', '$state', 'Auth', 'UserService', 'SweetAlert', function ($q, $scope, updateHimSelf, userData, $state, Auth, UserService, SweetAlert) {

      $scope.user = userData;
      $scope.updateHimSelf = updateHimSelf;

      $scope.update = function ($event) {
        var form = $scope.updateUser,
            email = form.userMail.$modelValue,
            password = form.userPassword.$modelValue,
            passwordVerif = form.userPasswordVerif.$modelValue,
            phoneNumber = form.userPhoneNumber.$modelValue;

        if (!angular.equals(password, passwordVerif)) {
          form.userPasswordVerif.$setValidity('equals', false);
        } else {
          form.userPasswordVerif.$setValidity('equals', true);
        }

        if (form.$valid) {
          phoneNumber = ('' + phoneNumber).replace(/ /, '');
          UserService.get($scope.user.id).then(function (user) {
            Auth.update(user.id, {
              email: email,
              password: password,
              phoneNumber: phoneNumber
            }).then(function (res) {
              SweetAlert.swal({
                title: 'Mise à jour effecutée avec succès',
                type: 'success'
              });
            }).catch(function (err) {
              SweetAlert.swal({
                title: 'Échec de la mise à jour du profil',
                type: 'error'
              });
            });
          });
        }
      };

      $scope.cancel = function () {
        $state.go('manager.users');
      }

    }]);
