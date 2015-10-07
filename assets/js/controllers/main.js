'use strict';

angular.module('stofmaApp.controllers')
    .controller('MainCtrl', ['$scope', '$rootScope', 'version', '$state', '$q', '$mdBottomSheet', '$mdSidenav', '$timeout', 'UserService', '$mdMedia', function ($scope, $rootScope, version, $state, $q, $mdBottomSheet, $mdSidenav, $timeout, UserService, $mdMedia) {
      var that = this;
      $scope.pageTitle = "";

      $scope.loadingPage = false;
      var timeoutLoading;
      $scope.setLoading = function (loading, timeout) {
        $scope.loadingPage = loading;

        if (loading) {
          if (timeoutLoading) {
            $timeout.cancel(timeoutLoading);
          }

          timeoutLoading = $timeout(function () {
            $scope.loadingPage = false;
          }, timeout ? timeout : 4000);
        } else {
          if (timeoutLoading) {
            $timeout.cancel(timeoutLoading);
          }
        }
      };

      $rootScope.$on("$stateChangeStart", function (event, toState, data, fromState) {
        $scope.loadingPage = true;
        $scope.pageTitle = toState.data.name;
        if ($mdSidenav('left').isOpen())
          that.toggleMenu();

        UserService.getFromSession().then(function (user) {
          if (!angular.equals(user, $scope.user))
            $scope.setCurrentUser(user);
        }, function (err) {
          $scope.setCurrentUser(null);
        });

        if (angular.isUndefined(fromState) || !(fromState.name.indexOf(toState.name) >= 0 || toState.name.indexOf(fromState.name) >= 0)) {
          $scope.setFabButton(false);
          $scope.setTabMenu(false);
        }
        $scope.setIconToolbarButtons(false);
        $scope.setSearchIcon(false);
      });

      $scope.user = null;

      $scope.$mdMedia = $mdMedia;

      $scope.setCurrentUser = function (u) {
        $scope.user = u;
      };

      $scope.getCurrentUser = function (callbackChange) {
        var defer = $q.defer();
        $scope.$watch('user', function (u) {
          if (angular.isDefined(u)) {
            if (u !== null)
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

        $scope.loadingPage = false;
      });

      $rootScope.$on("$stateChangeSuccess", function (event, toState, d, fromState) {
        $scope.loadingPage = false;
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

      $scope.setFabButton = function (icon, onclickcb, topposition) {
        if (angular.isUndefined(icon) || icon === false)
          $scope.fabbutton = null;
        else {
          $scope.fabbutton = {
            icon: icon,
            top: topposition ? topposition : 'top',
            handler: onclickcb
          }
        }
      };

      $scope.tabmenu = null;

      $scope.setTabMenu = function (tabs, ontabchangeFn, defaultTab) {
        if (angular.isUndefined(tabs) || tabs === false)
          $scope.tabmenu = null;
        else {
          $scope.tabmenu = {
            current: undefined,
            ontabchange: function (tab, forceSelected) {
              if (angular.isDefined(forceSelected) && forceSelected >= 0) {
                $scope.tabmenu.selected = forceSelected;
              } else {
                if (angular.equals($scope.tabmenu.current, tab))
                  return;
                $scope.tabmenu.current = tab;
                ontabchangeFn(tab);
              }
            },
            tabs: tabs
          };
          $scope.$watch('tabmenu.selected', function (n, o) {
            if (angular.isDefined(n) && n >= 0 && n !== o) {
              $scope.tabmenu.ontabchange($scope.tabmenu.tabs[n]);
            }
          });
          if (defaultTab) {
            var index = $scope.tabmenu.tabs.map(function (t) {
              return t.id;
            }).indexOf(defaultTab);
            $scope.tabmenu.ontabchange($scope.tabmenu.tabs[index], index);
          }
        }
      };

      $scope.searchIcon = null;

      $scope.setSearchIcon = function (enable, title, onSearch) {
        if (angular.isUndefined(enable) || enable === false) {
          $scope.searchIcon = false;
          $scope.onSearch = null;
        } else {
          $scope.searchIcon = function (enable) {
            if (angular.isDefined(enable) && !enable) {
              $scope.onSearch(null);
              $scope.onSearch = null;
            } else {
              $scope.onSearch = onSearch;
              $scope.searchLabel = title;
              $timeout(function () {
                angular.element(document.querySelector('#searchToolbar input')).focus();
              });
            }
          }
        }
      };

      $scope.iconToolbarButtons = [];

      $scope.setIconToolbarButtons = function (buttonsOrName, iconOrClear, callback, clear) {
        if (angular.isUndefined(buttonsOrName) || buttonsOrName === false) {
          $scope.iconToolbarButtons = [];
        } else {
          if (angular.isArray(buttonsOrName)) {
            if (iconOrClear === true)
              $scope.iconToolbarButtons = [];
            angular.forEach(buttonsOrName, function (btn) {
              addToolbarButton(btn.name, btn.icon, btn.callback);
            })
          } else {
            if (clear === true)
              $scope.iconToolbarButtons = [];

            addToolbarButton(buttonsOrName, iconOrClear, callback);
          }
        }
      };

      function addToolbarButton(name, icon, callback) {
        $scope.iconToolbarButtons.unshift({
          icon: icon,
          name: name,
          onclick: callback
        })
      }

      $scope.getVersion = function () {
        return version;
      };

      $scope.getYear = function () {
        return moment().get('year');
      };
    }])
;
