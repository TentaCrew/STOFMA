'use strict';

angular.module('stofmaApp.controllers')

    .controller('SalesCtrl', ['$scope', 'salesData', 'SaleService', 'UserService', '$mdBottomSheet', '$mdToast', 'amMoment', '$filter', function ($scope, salesData, SaleService, UserService, $mdBottomSheet, $mdToast, amMoment, $filter) {
      $scope.sales = salesData;

      // Possible header title : today, yesterday, week, past
      var headerDate = '',
          h = headerDate,
          headerTitles = {
            today: 'aujourd\'hui',
            yesterday: 'hier',
            week: 'la semaine dernière',
            past: 'il y a plus d\'une semaine'
          };

      for (var i = 0; i < $scope.sales.length; i++) {
        var sale = $scope.sales[i];

        $scope.sales[i].pairs = [];
        angular.forEach(sale.products, function (pair) {
          $scope.sales[i].pairs.push({
            name: pair.product.name,
            quantity: pair.quantity,
            price: pair.quantity * pair.unitPrice
          });
        });

        var date = moment(sale.saleDate);

        if (moment().diff(date, 'days') == 0 && headerDate != 'today') {
          h = 'today';
        } else if (moment().diff(date, 'days') == 1 && headerDate != 'yesterday') {
          h = 'yesterday';
        } else if (moment().diff(date, 'days') > 1 && moment().diff(date, 'days') <= 7 && headerDate != 'week') {
          h = 'week';
        } else if (moment().diff(date, 'days') > 7 && headerDate != 'past') {
          h = 'past';
        }

        if (h !== headerDate) {
          headerDate = h;
          $scope.sales.splice(i++, 0, {
            'title': headerTitles[h],
            'type': 'header'
          });
        }
      }

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
