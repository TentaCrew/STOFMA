'use strict';

angular.module('stofmaApp.services')
    .service('SaleService', ['$q', '$http', 'UserService', 'SaleFactory', 'ProductFactory', function ($q, $http, UserService, SaleFactory, ProductFactory) {
      this.getSales = getSales;
      this.getSale = getSale;
      this.getOwnSales = getOwnSales;
      this.doSale = doSale;
      this.editSale = editSale;
      this.deleteSale = deleteSale;

      function getSales() {
        var defer = $q.defer();

        $http.get('/sale').success(function (sales) {
          defer.resolve(sales.map(SaleFactory.remap));
        }).error(function (err) {
          defer.reject([]);
        });

        return defer.promise;
      }

      function getSale(id, uniq) {
        var defer = $q.defer();

        if (!uniq) {
          getSales().then(function (ss) {
            defer.resolve(ss.filter(function (s) {
              return s.id == id;
            })[0]);
          })
        } else {
          $http.get('/sale/' + id).success(function (sales) {
            defer.resolve(sales.map(SaleFactory.remap)[0]);
          }).error(function (err) {
            defer.reject(err);
          });
        }

        return defer.promise;
      }

      function getOwnSales() {
        var defer = $q.defer();

        UserService.getCurrentSession().then(function(session){
          $http.get('/sale?customer='+session.id).success(function (data) {
            defer.resolve(data.map(SaleFactory.remap));
          }).error(function (err) {
            defer.reject([]);
          });
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
        }).error(function (err, status) {
          defer.reject(status);
        });
        return defer.promise;
      }

      function editSale(saleId, customerId, products, type) {
        var defer = $q.defer();
        // Remapping objects.
        products = products.map(function (o) {
          var newo = {};
          newo.productId = o.id;
          newo.quantity = o.selected;
          return newo;
        });

        $http.patch('/sale/' + saleId, {
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
