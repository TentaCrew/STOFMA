'use strict';

angular.module('stofmaApp.services')
    .service('PurchaseService', ['$q', '$http', 'PurchaseFactory', function ($q, $http, PurchaseFactory) {
      this.getPurchases = getPurchases;
      this.doPurchase = doPurchase;
      this.deletePurchase = deletePurchase;

      function getPurchases() {
        var defer = $q.defer();

        $http.get('/purchase').success(function(data){
          defer.resolve(data);
        }).error(function(err){
          defer.reject(err);
        });

        return defer.promise;
      }

      function doPurchase(products) {
        var defer = $q.defer();
        products = products.map(PurchaseFactory.remapForApi);

        $http.post('/purchase', {
          products: products
        }).success(function(data){
          defer.resolve(data);
        }).error(function(err){
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

