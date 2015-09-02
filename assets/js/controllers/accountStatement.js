'use strict';

angular.module('stofmaApp.controllers')
  .controller('AccountStatementCtrl', ['$q','$scope', '$state', 'PaymentService', 'UserService', 'paymentsData', 'Auth', 'usersData', function ($q, $scope, $state, PaymentService, UserService, paymentsData, Auth, usersData) {

    $scope.in_totalCash       = 0;
    $scope.in_totalCheck      = 0;
    $scope.in_totalTransfer   = 0;
    $scope.in_totalFromCredit = 0;
    $scope.out_totalCash      = 0;
    $scope.out_totalCheck     = 0;
    $scope.out_totalTransfer  = 0;
    $scope.out_totalCB        = 0;
    $scope.totalCredited      = 0;
    $scope.in_total           = 0;
    $scope.out_total          = 0;

    $scope.totalRemainingCredit = 0;
    var users = usersData;
    for (var i = 0; i < users.length; i++){
      $scope.totalRemainingCredit = Number($scope.totalRemainingCredit) + Number(users[i].credit);
    }

    for (var i = 0; i < paymentsData.length; i++) {
      var payment = paymentsData[i];

      if(payment.creditMode){
        $scope.totalCredited = Number($scope.totalCredited) + Number(payment.amount);
      }

      switch (payment.type) {
        case 'IN_CREDIT' :
          $scope.in_totalFromCredit = Number($scope.in_totalFromCredit) + Number(payment.amount);
          break;
        case 'IN_CASH' :
          $scope.in_totalCash = Number($scope.in_totalCash) + Number(payment.amount);
          break;
        case 'IN_CHECK' :
          $scope.in_totalCheck = Number($scope.in_totalCheck) + Number(payment.amount);
          break;
        case 'IN_TRANSFER' :
          $scope.in_totalTransfer = Number($scope.in_totalTransfer) + Number(payment.amount);
          break;
        case 'OUT_CASH' :
          $scope.out_totalCash = Number($scope.out_totalCash) + Number(payment.amount);
          break;
        case 'OUT_CHECK' :
          $scope.out_totalCheck = Number($scope.out_totalCheck) + Number(payment.amount);
          break;
        case 'OUT_TRANSFER' :
          $scope.out_totalTransfer = Number($scope.out_totalTransfer) + Number(payment.amount);
          break;
        case 'OUT_CARD' :
          $scope.out_totalCB = Number($scope.out_totalCB) + Number(payment.amount);
          break;
      }


      $scope.in_totalFromCredit = Number($scope.in_totalFromCredit).toFixed(2);
      $scope.in_totalCash = Number($scope.in_totalCash).toFixed(2);
      $scope.in_totalCheck = Number($scope.in_totalCheck).toFixed(2);
      $scope.in_totalTransfer = Number($scope.in_totalTransfer).toFixed(2);
      $scope.out_totalCash = Number($scope.out_totalCash).toFixed(2);
      $scope.out_totalCheck = Number($scope.out_totalCheck).toFixed(2);
      $scope.out_totalTransfer = Number($scope.out_totalTransfer).toFixed(2);
      $scope.out_totalCB = Number($scope.out_totalCB).toFixed(2);

      $scope.in_total = Number($scope.in_totalCash) + Number($scope.in_totalCheck) + Number($scope.in_totalTransfer)
      $scope.out_total = Number($scope.out_totalCash) + Number($scope.out_totalCheck) + Number($scope.out_totalTransfer) + Number($scope.out_totalCB);

      $scope.totalRemainingCredit = Number($scope.totalRemainingCredit).toFixed(2);
      $scope.totalCredited = Number($scope.totalCredited).toFixed(2);
      $scope.in_total = Number($scope.in_total).toFixed(2);
      $scope.out_total = Number($scope.out_total).toFixed(2);
    }

  }]);
