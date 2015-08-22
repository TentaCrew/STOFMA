'use strict';

angular.module('stofmaApp.controllers')
  .controller('ProfileCtrl', ['$q','$scope', 'userData', '$state', 'Auth', 'UserService', 'SweetAlert', function ($q, $scope, userData, $state, Auth, UserService, SweetAlert) {

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
        UserService.getCurrentSession().then(function (session) {
          Auth.update(session.id,{
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
        });
      }
    };

  }]);
