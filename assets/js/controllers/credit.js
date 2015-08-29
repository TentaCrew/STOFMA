'use strict';

angular.module('stofmaApp.controllers')
    .controller('CreditCtrl', ['$q', '$scope', '$state', 'usersData', 'Auth', 'UserService', 'PaymentService', 'SweetAlert', function ($q, $scope, $state, usersData, Auth, UserService, PaymentService, SweetAlert) {

      $scope.users = usersData;
      $scope.payments = [];
      $scope.manager = null;

      UserService.getFromSession().then(function (manager) {
        $scope.manager = manager;
      }, function (err) {
        $scope.manager = null;
      });

      $scope.refreshPaymentsList = function (first) {
        PaymentService.get('IN_CREDIT').then(function (payments) {
          $scope.payments = payments;
        });
      };

      $scope.refreshPaymentsList();

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
                    title: 'Le compte de ' + user.firstname + ' ' + user.name + ' a été crédité de ' + Number(amount).toFixed(2) + '€',
                    text: 'Ancien solde : ' + Number(user.credit).toFixed(2) + '€\nNouveau solde : ' + Number(Number(user.credit) + Number(amount)).toFixed(2) + '€',
                    type: 'success'
                  }, function (ok) {
                    if (ok) {
                      $scope.refreshPaymentsList();
                      $scope.payments.push({paymentDate: new Date(), customer: user, manager: $scope.manager, amount: amount});
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
