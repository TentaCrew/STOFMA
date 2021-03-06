'use strict';

angular.module('stofmaApp.services')
    .service('PurchaseService', ['$q', '$http', 'PurchaseFactory', '$mdMedia', function ($q, $http, PurchaseFactory, $mdMedia) {
      this.getPurchases = getPurchases;
      this.getPurchase = getPurchase;
      this.doPurchase = doPurchase;
      this.editPurchase = editPurchase;
      this.deletePurchase = deletePurchase;

      var purchasesStep = 10,
          currentPage,
          startPage = 1;

      if ($mdMedia('gt-sm'))
        purchasesStep = 30;

      function getPurchases(page, noFilter, withReject) {
        if(angular.isUndefined(withReject))
          withReject = false;
        
        if (angular.isUndefined(page))
          currentPage = startPage;
        else if (page === false)
          currentPage += 1;
        else
          currentPage = page;

        var defer = $q.defer(),
            filter = noFilter ? '' : '?page=' + currentPage + '&limit=' + purchasesStep;
        $http.get('/purchase' + filter).success(function (purchases) {
          if (!noFilter && purchases.length == 0) {
            currentPage -= 1;
            if(withReject)
              defer.reject()
            else
              defer.resolve([]);
          }

          defer.resolve(purchases);
        }).error(function (err) {
          currentPage -= 1;
          if(withReject)
            defer.reject()
          else
            defer.resolve([]);
        });

        return defer.promise;
      }

      function getPurchase(id, uniq) {
        var defer = $q.defer();

        if (!uniq) {
          getPurchases().then(function (ps) {
            defer.resolve(ps.filter(function (p) {
              return p.id == id;
            })[0]);
          })
        } else {
          $http.get('/purchase/' + id).success(function (purchases) {
            defer.resolve(purchases[0]);
          }).error(function (err) {
            defer.reject(err);
          });
        }

        return defer.promise;
      }

      function doPurchase(products, paymentMode) {
        var defer = $q.defer();
        products = products.map(PurchaseFactory.remapForApi);

        $http.post('/purchase', {
          products: products,
          typePayment: paymentMode
        }).success(function (data) {
          defer.resolve(data);
        }).error(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }

      function deletePurchase(id) {
        var defer = $q.defer();
        $http.delete('/purchase/' + id).success(function (data) {
          defer.resolve(true);
        }).error(function (err) {
          defer.reject(false);
        });
        return defer.promise;
      }

      function editPurchase(id, products, paymentMode) {
        var defer = $q.defer();

        products = products.map(PurchaseFactory.remapForApi);

        $http.patch('/purchase/' + id, {
          products: products,
          typePayment: paymentMode
        }).success(function (purchaseUpdated) {
          defer.resolve(purchaseUpdated);
        }).error(function (err) {
          defer.reject();
        });
        return defer.promise;
      }
    }])
    .factory('PurchaseFactory', [function () {
      return {
        remapForApi: function (o) {
          var p = {};
          p.productId = o.id;
          p.quantity = o.quantity;
          p.unitPrice = o.price;
          return p;
        }
      }
    }]);

