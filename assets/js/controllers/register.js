'use strict';

angular.module('stofmaApp.controllers')
    .controller('RegisterCtrl', ['$scope', 'isManager', 'Auth', '$state', '$mdDialog', '$mdToast', function ($scope, isManager, Auth, $state, $mdDialog, $mdToast) {

      $scope.registerByManager = isManager;

      $scope.register = function ($event) {
        var form = $scope.registerUser,
            sex = form.userSex.$modelValue === 0,
            firstName = form.userFirstName.$modelValue,
            name = form.userName.$modelValue,
            email = form.userMail.$modelValue,
            emailVerif = form.userMailVerif.$modelValue,
            password = form.userPassword.$modelValue,
            passwordVerif = form.userPasswordVerif.$modelValue,
            phoneNumber = form.userPhoneNumber.$modelValue;

        if (!angular.equals(email, emailVerif)) {
          form.userMail.$setValidity('equals', false);
          form.userMailVerif.$setValidity('equals', false);
        } else {
          form.userMail.$setValidity('equals', true);
          form.userMailVerif.$setValidity('equals', true);
        }

        if (!angular.equals(password, passwordVerif)) {
          form.userPasswordVerif.$setValidity('equals', false);
        } else {
          form.userPasswordVerif.$setValidity('equals', true);
        }

        if (form.$valid) {
          phoneNumber = ('' + phoneNumber).replace(/ /, '');

          Auth.register({
            sex: sex,
            firstname: firstName,
            name: name,
            email: email,
            password: password,
            phoneNumber: phoneNumber
          }).then(function (userLogin) {
            if (!isManager) {
              $scope.setCurrentUser(userLogin);
              $state.go('user.home');
            } else {
              $mdToast.show(
                  $mdToast.simple()
                      .content(userLogin.getName() + ' enregistré' + (sex ? '' : 'e') + ' avec succès.')
                      .position("bottom right")
                      .hideDelay(3000)
              );
              $state.go('manager.users');
            }
          }).catch(function (err) {
            switch (err.status) {
              case 400:
                if (angular.isDefined(err.invalidAttributes.email) && err.invalidAttributes.email[0].rule == 'unique') {
                  var alert = $mdDialog.alert({
                    title: 'Inscription échouée',
                    content: 'Utilisateur déjà existant !',
                    ok: 'Fermer',
                    targetEvent: $event
                  });
                  $mdDialog
                      .show(alert)
                      .finally(function () {
                        alert = undefined;
                      });
                }
                break;
            }
          });
        }
      };
    }]);
