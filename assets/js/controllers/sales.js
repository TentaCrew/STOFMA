'use strict';

angular.module('stofmaApp.sales', [
  'stofmaApp.factory.sale',
  'stofmaApp.bottomsheetconfirm'
])

  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('sales', {
      url: '/sales',
      views: {
        'main-content': {
          controller: 'SalesCtrl',
          templateUrl: 'assets/templates/sales.html'
        }
      },
      data: {
        name: 'Les ventes'
      },
      resolve: {
        salesProvider: 'SaleFactory',

        salesData: function (salesProvider) {
          return salesProvider.getSales();
        }
      }
    })
  }])

  .controller('SalesCtrl', ['$scope', 'salesData', 'SaleFactory', '$mdBottomSheet', '$mdToast', function ($scope, salesData, SaleFactory, $mdBottomSheet, $mdToast) {
    $scope.sales = salesData;

    $scope.toastPosition = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };

    $scope.remove = function (id) {
      $mdBottomSheet.show({
        templateUrl: '/js/components/bottom-sheet/bottom-sheet-confirm-remove-sale.html',
        controller: 'BottomSheetConfirmCtrl'
      }).then(function (done) {
        if (done) {
          SaleFactory.deleteSale(id).then(function(){

            $mdToast.show(
              $mdToast.simple()
                .content('Vente supprimée.')
                .position("bottom right")
                .hideDelay(3000)
            );
          }).catch(function(err){
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