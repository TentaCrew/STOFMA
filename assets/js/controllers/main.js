'use strict';

angular.module('stofmaApp.controllers')
    .controller('MainCtrl', ['$scope', '$rootScope', '$state', '$q', '$mdBottomSheet', '$mdSidenav', '$timeout', 'UserService', function ($scope, $rootScope, $state, $q, $mdBottomSheet, $mdSidenav, $timeout, UserService) {
      var that = this;
      $scope.pageTitle = "";

      $rootScope.$on("$stateChangeStart", function (event, toState) {
        $scope.pageTitle = toState.data.name;
        if ($mdSidenav('left').isOpen())
          that.toggleMenu();

        // TODO Improved this !
        UserService.getFromSession().then(function (user) {
          if (!angular.equals(user, $scope.user))
            $scope.setCurrentUser(user);
        }, function (err) {
          $scope.setCurrentUser(null);
        });

        $scope.setFabButton(false);
      });

      $scope.user = null;

      $scope.setCurrentUser = function (u) {
        $scope.user = u;
      };

      $scope.getCurrentUser = function (callbackChange) {
        var defer = $q.defer();
        $scope.$watch('user', function (u) {
          if (angular.isDefined(u)) {
            if(u !== null)
              defer.resolve($scope.user);
            if (angular.isFunction(callbackChange))
              callbackChange(u);
          }
        });

        if (angular.isDefined($scope.user) && $scope.user !== null)
          defer.resolve($scope.user);

        return defer.promise;
      };

      $rootScope.$on("$stateChangeError", function (event, toState, d, fromState) {
        if (fromState.data)
          $scope.pageTitle = fromState.data.name;
      });

      var timeoutAppLoaded = null;
      $scope.$on("$viewContentLoaded", function () {
        if (timeoutAppLoaded !== null)
          $timeout.cancel(timeoutAppLoaded);

        timeoutAppLoaded = $timeout(function () {
          $scope.appLoaded = true;
        }, 500);
      });

      this.toggleMenu = function () {
        var pending = $mdBottomSheet.hide() || $q.when(true);

        pending.then(function () {
          $mdSidenav('left').toggle();
        });
      };

      $scope.fabbutton = null;

      $scope.setFabButton = function (icon, onclickcb) {
        if (angular.isUndefined(icon) || icon === false)
          $scope.fabbutton = null;
        else {
          $scope.fabbutton = {
            icon: icon,
            handler: onclickcb
          }
        }
      }
    }])
;
