'use strict';

angular.module('stofmaApp.controllers')

    .controller('SalesCtrl', ['$scope', '$state', 'salesData', 'SaleService', 'UserService', '$mdBottomSheet', '$mdToast', 'isManager', function ($scope, $state, salesData, SaleService, UserService, $mdBottomSheet, $mdToast, isManager) {
      $scope.sales = salesData;
      $scope.isManager = isManager;

      // Possible header title : today, yesterday, week, past
      var headerDate = '',
          h = headerDate,
          headerTitles = {
            today: 'aujourd\'hui',
            yesterday: 'hier',
            thisWeek: 'cette semaine',
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

        var date = moment(sale.saleDate).startOf('day'),
            now = moment().startOf('day');

        if (now.isSame(date, 'day') && headerDate != 'today') {
          h = 'today';
        } else if (now.isSame(angular.copy(date).add(1, 'day')) && headerDate != 'yesterday') {
          h = 'yesterday';
        } else if (angular.copy(now).startOf('week').isSame(angular.copy(date).startOf('week')) && !now.isSame(angular.copy(date).add(1, 'day')) && headerDate != 'thisWeek') {
          h = 'thisWeek';
        } else if (angular.copy(now).startOf('week').subtract(1, 'week').isSame(angular.copy(date).startOf('week')) && headerDate != 'week') {
          h = 'week';
        } else if (now.diff(date, 'days') > 7 && headerDate != 'past') {
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

      $scope.remove = function (id, index) {
        $mdBottomSheet.show({
          templateUrl: 'assets/js/components/bottom-sheet/bottom-sheet-confirm-remove-sale.html',
          controller: 'BottomSheetConfirmCtrl',
          locals: {
            data: {}
          }
        }).then(function (response) {
          if (response.confirm) {
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
            });
          }
        });
      };

      $scope.amend = function (id) {
        $state.go('manager.editsale', {
          id: id
        });
      }
    }]);
