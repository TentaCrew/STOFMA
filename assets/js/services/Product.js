'use strict';

angular.module('stofmaApp.services');

angular.module('stofmaApp.services')
    .service('ProductService', ['$q', '$http', function ($q, $http) {
      this.getProducts = getProducts;
      this.getCategories = getCategories;
      this.createProduct = createProduct;
      this.setProductEnable = setProductEnable;
      this.editProduct = editProduct;

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

      function getCategories() {
        var defer = $q.defer();

        defer.resolve([
          {
            id: 'DRINK',
            name: 'Boissons'
          },
          {
            id: 'FOOD',
            name: 'Nourritures'
          },
          {
            id: 'OTHER',
            name: 'Autres'
          }
        ]);

        return defer.promise;
      }

      function createProduct(productForm) {
        var defer = $q.defer();
        $http.post('/product', productForm).success(function (np) {
          defer.resolve(np);
        }).error(function (err) {
          defer.reject();
        });
        return defer.promise;
      }

      function setProductEnable(id, isEnable) {
        var defer = $q.defer();
        $http.patch('/product/' + id, {isActive: isEnable}).success(function (data) {
          defer.resolve(true);
        }).error(function (err) {
          defer.reject(false);
        });
        return defer.promise;
      }

      function editProduct(id, productForm) {
        var defer = $q.defer();
        $http.patch('/product/' + id, productForm).success(function (np) {
          defer.resolve(np[0]);
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
