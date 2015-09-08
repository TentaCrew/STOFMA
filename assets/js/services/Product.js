'use strict';

angular.module('stofmaApp.services');

angular.module('stofmaApp.services')
    .service('ProductService', ['$q', '$http', 'ProductFactory', function ($q, $http, ProductFactory) {
      this.getProducts = getProducts;
      this.getCategories = getCategories;
      this.createProduct = createProduct;
      this.setProductEnable = setProductEnable;
      this.editProduct = editProduct;

      function getProducts(forSelling) {
        var defer = $q.defer();

        $http.get('/product').success(function (data) {
              var r = data;

              r = r.map(ProductFactory.remapProducts);

              if (forSelling) {
                // Fix the number of selected product to 0
                r = r.map(ProductFactory.remapForSelling);
                r = r.filter(function (p) {
                  return p.forSale;
                });
              }

              defer.resolve(r);
            }
        ).
            error(function (err) {
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
          np = [np].map(ProductFactory.remapProducts).map(ProductFactory.remapForSelling)[0];
          defer.resolve(np);
        }).error(function (err) {
          defer.reject();
        });
        return defer.promise;
      }

      function setProductEnable(id, isEnable) {
        var defer = $q.defer();
        $http.patch('/product/' + id, {
          isActive: isEnable
        }).success(function (data) {
          defer.resolve(true);
        }).error(function (err) {
          defer.reject(false);
        });
        return defer.promise;
      }

      function editProduct(id, productForm) {
        var defer = $q.defer();
        $http.patch('/product/' + id, productForm).success(function (np) {
          np = np.map(ProductFactory.remapProducts).map(ProductFactory.remapForSelling);
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
        },
        remapProducts: function (o) {
          o.isOut = function () {
            return o.quantity == 0;
          };
          o.getPrice = function (level) {
            if (level == 'member')
              return o.memberPrice;
            else
              return o.price;
          };
          return o;
        },
        remapForSelling: function (o) {
          o.selected = 0;
          return o;
        },
        getLevelPrice: function (isMember) {
          return isMember ? 'member' : 'notamember';
        }
      }
    }]);
