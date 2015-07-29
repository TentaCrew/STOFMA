'use strict';

angular.module('stofmaApp.main', [
  'stofmaApp.factory.user'
])

  .controller('MainCtrl', ['$scope', '$rootScope', '$state', '$q', '$mdBottomSheet', '$mdSidenav', 'UserFactory', function ($scope, $rootScope, $state, $q, $mdBottomSheet, $mdSidenav, UserFactory) {
    $scope.pageTitle = "";

    $rootScope.$on("$stateChangeSuccess", function () {
      $scope.pageTitle = $state.current.data.name;
    });

    this.toggleMenu = function () {
      var pending = $mdBottomSheet.hide() || $q.when(true);

      pending.then(function () {
        $mdSidenav('left').toggle();
      });
    };
  }]);

