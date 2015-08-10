'use strict';

angular.module('stofmaApp.services')
    .service('SaleService', ['$q', '$http', 'SaleFactory', function ($q, $http, SaleFactory) {
      this.getSales = getSales;
      this.doSale = doSale;
      this.deleteSale = deleteSale;

      function getSales() {
        var defer = $q.defer();

        $http.post('/sale/search').success(function (data) {
          defer.resolve(data.map(SaleFactory.remap));
        }).error(function (err) {
          defer.reject([]);
        });

        return defer.promise;
      }

      function doSale(customerId, products) {
        var defer = $q.defer();
        // Remapping object.
        products = products.map(function (o) {
          var newo = {};
          newo.productId = o.id;
          newo.quantity = o.selected;
          return newo;
        });

        $http.post('/sale', {
          customerId: customerId,
          products: products
        }).success(function (data) {
          defer.resolve(true);
        }).error(function (err) {
          defer.reject(false);
        });
        return defer.promise;
      }

      function deleteSale(id) {
        var defer = $q.defer();
        $http.delete('/sale/' + id).success(function (data) {
          defer.resolve(true);
        }).error(function (err) {
          defer.reject(false);
        });
        return defer.promise;
      }
    }])
    .factory('SaleFactory', ['$q', 'amMoment', function ($q, amMoment) {
      return {
        remap: function (o) {
          if(angular.isDefined(o)){
            o.getDate = function () {
              return amMoment.amDateFormat(o.saleDate, 'LLLL')();
            };
          }
          return o;
        }
      }
    }]);
