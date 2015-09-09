'use strict';

angular.module('stofmaApp.controllers')
    .controller('RegisterCtrl', ['$scope', 'Auth', '$state', '$mdDialog', '$mdDatePicker', function ($scope, Auth, $state, $mdDialog, $mdDatePicker) {

      $scope.register = function ($event) {
        var form = $scope.registerUser,
            sex = form.userSex.$modelValue === 0,
            firstName = form.userFirstName.$modelValue,
            name = form.userName.$modelValue,
            email = form.userMail.$modelValue,
            emailVerif = form.userMailVerif.$modelValue,
            password = form.userPassword.$modelValue,
            passwordVerif = form.userPasswordVerif.$modelValue,
            birthday = form.userBirthday.$modelValue,
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
            phoneNumber: phoneNumber,
            birthdate: moment(birthday).local()
          }).then(function (userLogin) {
            $scope.setCurrentUser(userLogin);
            $state.go('user.home');
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

      var tempo = null;
      $scope.showPicker = function (ev) {
        console.log(moment().diff(moment(tempo), 'seconds'));
        if (tempo == null || moment().diff(moment(tempo), 'seconds') >= 2) {
          tempo = new Date();
          if (!$scope.userBirthday)
            $scope.userBirthday = moment().subtract(24, 'years').toDate(); // Go 24 years before

          $mdDatePicker(ev, $scope.userBirthday).then(function (selectedDate) {
            $scope.userBirthday = selectedDate;
            tempo = new Date();
          });
        }
      }
    }]);
