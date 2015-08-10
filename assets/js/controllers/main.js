'use strict';

angular.module('stofmaApp.controllers')
    .controller('MainCtrl', ['$scope', '$rootScope', '$state', '$q', '$mdBottomSheet', '$mdSidenav', 'UserService', function ($scope, $rootScope, $state, $q, $mdBottomSheet, $mdSidenav, UserService) {
      var that = this;
      $scope.pageTitle = "";

      $rootScope.$on("$stateChangeStart", function (event, toState) {
        $scope.pageTitle = toState.data.name;
        if ($mdSidenav('left').isOpen())
          that.toggleMenu();

        UserService.getCurrentSession().then(function (session) {
          if (!angular.equals(session, $scope.user))
            $scope.user = session;
        }, function (err) {
          $scope.user = null;
        });
      });

      $rootScope.$on("$stateChangeError", function (event, toState, d, fromState) {
        if(formState.data)
          $scope.pageTitle = fromState.data.name;
      });


      this.toggleMenu = function () {
        var pending = $mdBottomSheet.hide() || $q.when(true);

        pending.then(function () {
          $mdSidenav('left').toggle();
        });
      };
    }]);
