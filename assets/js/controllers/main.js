'use strict';

angular.module('stofmaApp.controllers')
    .controller('MainCtrl', ['$scope', '$rootScope', '$state', '$q', '$mdBottomSheet', '$mdSidenav', 'UserFactory', function ($scope, $rootScope, $state, $q, $mdBottomSheet, $mdSidenav, UserFactory) {
      var that = this;
      $scope.pageTitle = "";

      $rootScope.$on("$stateChangeSuccess", function () {
        $scope.pageTitle = $state.current.data.name;
        if($mdSidenav('left').isOpen())
          that.toggleMenu();

        UserFactory.getCurrentSession().then(function (session) {
          if(!angular.equals(session, $scope.user))
            $scope.user = session;
        }, function(err){
          $scope.user = null;
        });
      });


      this.toggleMenu = function () {
        var pending = $mdBottomSheet.hide() || $q.when(true);

        pending.then(function () {
          $mdSidenav('left').toggle();
        });
      };
    }]);
