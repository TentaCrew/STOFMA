'use strict';

angular.module('stofmaApp.controllers')
  .controller('ProfileCtrl', ['$q','$scope', '$state', 'Auth', 'UserService', 'SweetAlert', function ($q, $scope, $state, Auth, UserService, SweetAlert) {

    UserService.getCurrentSession().then(function (session) {
      UserService.get(session.id).then(function (user) {
        $scope.user = user;
      }, function (err) {
        $scope.user = null;
      });
    }, function (err) {
      $scope.user = null;
    });

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
        phoneNumber = phoneNumber.replace(/ /, '');

        Auth.update({
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
            title: 'Échec de la mise à jour du profile',
            type: 'error'
          });
        });
      }
    };

  }]);
