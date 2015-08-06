'use strict';

angular.module('stofmaApp.controllers')
    .controller('LoginCtrl', ['$scope', 'Auth', '$state', '$mdDialog', function ($scope, Auth, $state, $mdDialog) {
      $scope.login = function ($event) {
        var form = $scope.loginUser,
            email = form.userMail.$modelValue,
            password = form.userPassword.$modelValue;

        if (form.$valid) {
          Auth.login({
            email: email,
            password: password
          }).then(function (res) {
            $scope.user = res;
            $state.go('user.home');
          }).catch(function (status) {
            switch (status) {
              case 404:
                var alert = $mdDialog.alert({
                  title: 'Authentification échouée',
                  content: 'L\'utilisateur est introuvable ou le mot de passe est incorrect',
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
      }
    }]);
