'use strict';

angular.module('stofmaApp.controllers')
    .controller('AccountStatementCtrl', ['$q', '$scope', '$state', '$stateParams', 'PaymentService', 'UserService', 'UserFactory', 'paymentsData', 'Auth', 'usersData', 'ProductService', 'SaleService', 'DateUtils', function ($q, $scope, $state, $stateParams, PaymentService, UserService, UserFactory, paymentsData, Auth, usersData, ProductService, SaleService, DateUtils) {
      $scope.setTabMenu([
        {
          id: 'balance-sheet',
          name: 'Balance'
        },
        {
          id: 'products-stats',
          name: 'Statistiques sur produits'
        }
      ], function (tab) {
        $scope.selectedTab = tab.id;
      });

      // BALANCE SHEET PAGE

      $scope.in_totalCash = 0;
      $scope.in_totalCheck = 0;
      $scope.in_totalTransfer = 0;
      $scope.in_totalFromCredit = 0;
      $scope.out_totalCash = 0;
      $scope.out_totalCheck = 0;
      $scope.out_totalTransfer = 0;
      $scope.out_totalCB = 0;
      $scope.totalCredited = 0;
      $scope.in_total = 0;
      $scope.out_total = 0;

      $scope.totalRemainingCredit = 0;
      var users = usersData;
      for (var i = 0; i < users.length; i++) {
        $scope.totalRemainingCredit = Number($scope.totalRemainingCredit) + Number(users[i].credit);
      }

      for (i = 0; i < paymentsData.length; i++) {
        var payment = paymentsData[i];

        if (payment.creditMode) {
          $scope.totalCredited = Number($scope.totalCredited) + Number(payment.amount);
        }

        switch (payment.type) {
          case 'IN_CREDIT' :
            $scope.in_totalFromCredit = Number($scope.in_totalFromCredit) + Number(payment.amount);
            break;
          case 'IN_CASH' :
            $scope.in_totalCash = Number($scope.in_totalCash) + Number(payment.amount);
            break;
          case 'IN_CHECK' :
            $scope.in_totalCheck = Number($scope.in_totalCheck) + Number(payment.amount);
            break;
          case 'IN_TRANSFER' :
            $scope.in_totalTransfer = Number($scope.in_totalTransfer) + Number(payment.amount);
            break;
          case 'OUT_CASH' :
            $scope.out_totalCash = Number($scope.out_totalCash) + Number(payment.amount);
            break;
          case 'OUT_CHECK' :
            $scope.out_totalCheck = Number($scope.out_totalCheck) + Number(payment.amount);
            break;
          case 'OUT_TRANSFER' :
            $scope.out_totalTransfer = Number($scope.out_totalTransfer) + Number(payment.amount);
            break;
          case 'OUT_CARD' :
            $scope.out_totalCB = Number($scope.out_totalCB) + Number(payment.amount);
            break;
        }


        $scope.in_totalFromCredit = Number($scope.in_totalFromCredit);
        $scope.in_totalCash = Number($scope.in_totalCash);
        $scope.in_totalCheck = Number($scope.in_totalCheck);
        $scope.in_totalTransfer = Number($scope.in_totalTransfer);
        $scope.out_totalCash = Number($scope.out_totalCash);
        $scope.out_totalCheck = Number($scope.out_totalCheck);
        $scope.out_totalTransfer = Number($scope.out_totalTransfer);
        $scope.out_totalCB = Number($scope.out_totalCB);

        $scope.in_total = Number($scope.in_totalCash) + Number($scope.in_totalCheck) + Number($scope.in_totalTransfer);
        $scope.out_total = Number($scope.out_totalCash) + Number($scope.out_totalCheck) + Number($scope.out_totalTransfer) + Number($scope.out_totalCB);

        $scope.totalRemainingCredit = Number($scope.totalRemainingCredit);
        $scope.totalCredited = Number($scope.totalCredited);
        $scope.in_total = Number($scope.in_total);
        $scope.out_total = Number($scope.out_total);
      }

      // LIST PRODUCTS SOLD PAGE

      ProductService.getProducts().then(function (products) {
        $scope.products = products;
      });

      // Auto-complete part

      $scope.getMatches = getMatches;
      $scope.searchProductText = '';

      $scope.maxDate = new Date();
      var beginDate, endDate;

      function getMatches(query) {
        return query ? $scope.products.filter(function (p) {
          return angular.lowercase(p.name).indexOf(angular.lowercase(query)) >= 0;
        }) : $scope.products;
      }

      // End of Auto-complete

      $scope.productStats = $scope.messageError = null;

      $scope.doStat = function (product) {
        if (angular.isUndefined(product) && angular.isDefined($scope.productSelected))
          product = $scope.productSelected;

        if (angular.isDefined(product) && product !== null) {
          $scope.productSelected = product;
          $scope.setLoading(true);
          computeStats(product.id).then(function (stats) {
            $scope.productStats = stats;
            $scope.setFabButton('clear', function () {
              $scope.doStat(null);
            });
          }).catch(function (msg) {
            $scope.messageError = msg;
          }).finally(function () {
            setTimeout(function () {
              $scope.setLoading(false);
            }, 0);
          });
        } else {
          $scope.productStats = null;
          $scope.messageError = null;
          $scope.searchProductText = '';
          $scope.setFabButton(false);
          $scope.setLoading(false);
        }
      };

      $scope.changeDateMin = function (date) {
        beginDate = date;
        $scope.doStat();
      };

      $scope.changeDateMax = function (date) {
        endDate = date;
        $scope.maxDate = date ? date : new Date();
        $scope.doStat();
      };

      function computeStats(productId) {
        var defer = $q.defer();

        SaleService.getSalesOfProduct(productId, beginDate, endDate).then(function (salesData) {
          if (salesData.length === 0) {
            defer.reject("Pas de vente pour ce produit.");
            return;
          }

          var users = [],
              price = {
                total: 0,
                list: [],
                getMean: function () {
                  return price.list.reduce(function (a, b) {
                        return a + b
                      }) / price.list.length;
                }
              },
              count = 0;


          DateUtils.setDateSubHeader(salesData, 'saleDate', function (s) {
            var c = s.customer,
                iU = users.map(function (u) {
                  return u.id;
                }).indexOf(c.id);
            if (c.id == -1) {
              iU = -1;
            }
            if (iU == -1) {
              c.count = s.product.quantity;
              users.push(c);
            } else {
              users[iU].count += s.product.quantity;
            }

            for (var i = 0; i < s.product.quantity; i++) {
              price.list.push(s.product.price);
              count++;
            }

            price.total += s.totalPrice;

            return s;
          }, function (sales) {
            users = users.map(UserFactory.remap).sort(function (u1, u2) {
              return u1.count > u2.count ? -1 : 1;
            });

            defer.resolve({
              users: users,
              sales: sales,
              price: {
                total: price.total,
                mean: price.getMean()
              },
              count: count
            });
          })();

        });

        return defer.promise;
      }

    }]);
