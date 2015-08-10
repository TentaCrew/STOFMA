'use strict';

angular.module('stofmaApp.controllers')

    .controller('SalesCtrl', ['$scope', 'salesData', 'SaleService', 'UserService', '$mdBottomSheet', '$mdToast', 'amMoment', '$filter', function ($scope, salesData, SaleService, UserService, $mdBottomSheet, $mdToast, amMoment, $filter) {
      $scope.sales = salesData;

      // Possible header title : day, week, past
      var headerDates = "",
          h = headerDates,
          headerTitles = {
            day: 'il y a un jour',
            week: 'il y a une semaine',
            past: 'il y a plus d\'une semaine'
          };

      angular.forEach($scope.sales, function (s, ks) {
        $scope.sales[ks].amount = 0;
        angular.forEach(s.products, function (p, kp) {
          $scope.sales[ks].amount += p.quantity * p.unitPrice;
        });

        var date = s.saleDate;
        if (moment(date).diff(moment(), 'days') == 0 && headerDates == '') {
          h = 'day';
        } else if (moment(date).diff(moment().weekday(-7)) <= 7 && headerDates != 'week') {
          h = 'week';
        } else if (headerDates = 'past') {
          h = 'past';
        }
        if (h !== headerDates) {
          headerDates = h;
          $scope.sales.splice(ks, 0, {
            'title': headerTitles[h],
            'type': 'header'
          });
        }
      });

      $scope.toastPosition = {
        bottom: false,
        top: true,
        left: false,
        right: true
      };

      $scope.remove = function (id, index) {
        $mdBottomSheet.show({
          templateUrl: '/js/components/bottom-sheet/bottom-sheet-confirm-remove-sale.html',
          controller: 'BottomSheetConfirmCtrl'
        }).then(function (done) {
          if (done) {
            SaleService.deleteSale(id).then(function () {
              $mdToast.show(
                  $mdToast.simple()
                      .content('Vente supprimée.')
                      .position("bottom right")
                      .hideDelay(3000)
              );
              $scope.sales.splice(index, 1);
            }).catch(function (err) {
              $mdToast.show(
                  $mdToast.simple()
                      .content('La vente n\'a pas été supprimée.')
                      .position("bottom right")
                      .hideDelay(5000)
              );
            })
          }
        });
      };
    }]);
