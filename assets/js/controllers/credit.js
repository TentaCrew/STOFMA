'use strict';

angular.module('stofmaApp.controllers')
    .controller('CreditCtrl', ['$q', '$scope', '$state', 'usersData', 'Auth', 'UserService', 'UserFactory', 'PaymentService', 'SweetAlert', '$mdToast', function ($q, $scope, $state, usersData, Auth, UserService, UserFactory, PaymentService, SweetAlert, $mdToast) {

      $scope.users = UserFactory.onlyRealUsers(usersData);
      $scope.payments = [];
      $scope.manager = null;
      PaymentService.getPaymentModes(true).then(function (pm) {
        $scope.paymentModes = pm;
      });

      UserService.getFromSession().then(function (manager) {
        $scope.manager = manager;
      }, function (err) {
        $scope.manager = null;
      });

      function loadPayments() {
        PaymentService.getAllCredit().then(function (payments) {
          $scope.payments = payments;
        });
      }

      function loadUsers() {
        UserService.getAll(false).then(function (users) {
          $scope.users = UserFactory.onlyRealUsers(users);
        });
      }

      loadPayments();

      $scope.payment = null;
      $scope.setPayment = function (paymentMode) {
        $scope.payment = paymentMode;
      };

      $scope.credit = function ($event) {
        var form = $scope.creditAccount,
            amount = parseFloat(form.amountToCredit.$modelValue),
            user = $scope.selectedUser;


        if ($scope.user === undefined) {
          $mdToast.show(
              $mdToast.simple()
                  .content('Veuillez sélectionner la personne à créditer.')
                  .position("bottom right")
                  .hideDelay(5000)
          );
          return;
        }

        if ($scope.payment === null) {
          $mdToast.show(
              $mdToast.simple()
                  .content('Veuillez sélectionner le moyen de paiement.')
                  .position("bottom right")
                  .hideDelay(5000)
          );
          return;
        } else if (isNaN(amount)) {
          $mdToast.show(
              $mdToast.simple()
                  .content('Veuillez renseigner un montant correct.')
                  .position("bottom right")
                  .hideDelay(5000)
          );
          return;

        }

        if (form.$valid) {
          Auth.credit(user.id, {
            credit: amount,
            typePayment: $scope.payment
          })
              .then(function (newCredit) {
                loadPayments();
                loadUsers();
                SweetAlert.swal({
                  title: 'Le compte de ' + user.firstname + ' ' + user.name + ' a été crédité de ' + Number(amount).toFixed(2) + '€',
                  text: 'Ancien solde : ' + Number(Number(newCredit) - Number(amount)).toFixed(2) + '€\nNouveau solde : ' + Number(newCredit).toFixed(2) + '€',
                  type: 'success'
                }, function (ok) {
                  if (ok) {
                    form.$setPristine();
                    form.$setUntouched();
                    $scope.payment = null;
                    $scope.searchUserText = '';
                    $scope.amountToCredit = '';
                  }
                });
              }).catch(function (err) {
                SweetAlert.swal({
                  title: 'Échec du crédit du compte',
                  type: 'error'
                });
              });
        }
      };

      // Auto-complete part

      $scope.getMatches = getMatches;
      $scope.searchUserText = '';

      function getMatches(query) {
        return query ? $scope.users.filter(function (u) {
          return angular.lowercase(u.getName()).indexOf(angular.lowercase(query)) >= 0;
        }) : $scope.users;
      }

      // End of Auto-complete part

    }]);
