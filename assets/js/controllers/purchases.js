'use strict';

angular.module('stofmaApp.controllers')

    .controller('PurchaseCtrl', ['$scope', 'purchasesData', 'PurchaseService', function ($scope, purchasesData, PurchaseService) {
      $scope.purchases = purchasesData;

      // Possible header title : day, week, past
      var headerDates = "",
          h = headerDates,
          headerTitles = {
            day: 'il y a un jour',
            week: 'il y a une semaine',
            past: 'il y a plus d\'une semaine'
          };

      angular.forEach($scope.purchases, function (p, kp) {
        $scope.purchases[kp].amount = 0;
        angular.forEach(p.products, function (p, kp) {
          $scope.purchases[kp].amount += p.quantity * p.unitPrice;
        });

        var date = p.purchaseDate;
        if (moment(date).diff(moment(), 'days') == 0 && headerDates == '') {
          h = 'day';
        } else if (moment(date).diff(moment().weekday(-7)) <= 7 && headerDates != 'week') {
          h = 'week';
        } else if (headerDates = 'past') {
          h = 'past';
        }
        if (h !== headerDates) {
          headerDates = h;
          $scope.purchases.splice(kp, 0, {
            'title': headerTitles[h],
            'type': 'header'
          });
        }
      });
    }]);
