'use strict';

angular.module('stofmaApp.services');

angular.module('stofmaApp.services')
    .service('ProductService', ['$q', '$http', function ($q, $http) {
      this.getProducts = getProducts;

      function getProducts(forSelling) {
        var defer = $q.defer();

        $http.post('/product/search').success(function (data) {
          var r = data;

          r = r.map(function (o) {
            o.isOut = function () {
              return o.quantity == 0;
            };
            return o;
          });

          if (forSelling) {
            // Fix the number of selected product to 0
            r = r.map(function (o) {
              o.selected = 0;
              return o;
            });
          }

          defer.resolve(r);
        }).error(function (err) {
          defer.reject();
        });

        return defer.promise;
      }
    }])
    .factory('ProductFactory', [function () {
      return {
        remapForApi: function (o) {
          var p = {};
          p.productId = o.id;
          p.quantity = o.quantity;
          return p;
        }
      }
    }]);

