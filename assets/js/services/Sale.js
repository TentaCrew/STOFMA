'use strict';

angular.module('stofmaApp.services')
    .service('SaleService', ['$q', '$http', 'SaleFactory', 'ProductFactory', function ($q, $http, SaleFactory, ProductFactory) {
      this.getSales = getSales;
      this.doSale = doSale;
      this.deleteSale = deleteSale;

      function getSales() {
        var defer = $q.defer();

        $http.get('/sale').success(function (data) {
          defer.resolve(data.map(SaleFactory.remap));
        }).error(function (err) {
          defer.reject([]);
        });

        return defer.promise;
      }

      function doSale(customerId, products, type) {
        var defer = $q.defer();
        // Remapping objects.
        products = products.map(function (o) {
          var newo = {};
          newo.productId = o.id;
          newo.quantity = o.selected;
          return newo;
        });

        $http.post('/sale', {
          customerId: customerId,
          products: products,
          typePayment: type
        }).success(function (data) {
          defer.resolve(data);
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
