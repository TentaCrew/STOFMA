'use strict';

angular.module('stofmaApp.controllers')
    .controller('RegisterCtrl', ['$scope', 'Auth', '$state', function ($scope, Auth, $state) {
      $scope.register = function ($event) {
        var form = $scope.registerUser,
            sex = form.userSex.$modelValue == 0,
            firstName = form.userFirstName.$modelValue,
            name = form.userName.$modelValue,
            email = form.userMail.$modelValue,
            password = form.userPassword.$modelValue,
            passwordVerif = form.userPasswordVerif.$modelValue,
            birthday = form.userBirthday.$modelValue,
            phoneNumber = form.userPhoneNumber.$modelValue;

        if (!angular.equals(password, passwordVerif)) {
          form.userPasswordVerif.$setValidity('equals', false);
        } else {
          form.userPasswordVerif.$setValidity('equals', true);
        }

        if (form.$valid) {
          phoneNumber = phoneNumber.replace(/ /, '');

          Auth.register({
            sex: sex,
            firstname: firstName,
            name: name,
            email: email,
            password: password,
            phoneNumber: phoneNumber,
            birthdate: birthday
          }).then(function (res) {
            $state.go('auth.home');
          }).catch(function (err) {
            switch (err.status) {
              case 400:
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
                break;
            }
          });
        }
      };
    }]);
