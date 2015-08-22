'use strict';

angular.module('stofmaApp.controllers')
  .controller('CreditCtrl', ['$q','$scope', '$state', 'usersData', 'Auth', 'UserService', 'SweetAlert', function ($q, $scope, $state, usersData, Auth, UserService, SweetAlert) {

    $scope.users = usersData;

    UserService.getCurrentSession().then(function (session) {
      UserService.get(session.id).then(function (user) {
        $scope.user = user;
      }, function (err) {
        $scope.user = null;
      });
    }, function (err) {
      $scope.user = null;
    });

    $scope.credit = function ($event) {
      var form = $scope.creditAccount,
          amount = form.amountToCredit.$modelValue,
          userId = form.selectedUser.$modelValue;

      UserService.get(userId).then(function (u) {
        var user = u;
        if (form.$valid) {
          Auth.credit(userId, {credit: amount})
          .then(function (res) {
            SweetAlert.swal({
              title: 'Le compte de '+user.firstname+' '+user.name+' a été crédité de '+amount+'€',
              text: 'Ancien solde : '+user.credit+'€\nNouveau solde : '+(user.credit+amount)+'€',
              type: 'success'
            }, function (ok) {
              if (ok) {
                $state.reload();
              }
            });
          }).catch(function (err) {
            SweetAlert.swal({
              title: 'Échec du crédit du compte',
              type: 'error'
            });
          });
        }
      });


    };

  }]);
