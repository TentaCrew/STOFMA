'use strict';

angular.module('stofmaApp.services')
    .service('SaleService', ['$q', '$http', 'UserService', 'UserFactory', 'SaleFactory', '$mdMedia', function ($q, $http, UserService, UserFactory, SaleFactory, $mdMedia) {
      this.getSales = getSales;
      this.getSale = getSale;
      this.getSalesOfProduct = getSalesOfProduct;
      this.getOwnSales = getOwnSales;
      this.doSale = doSale;
      this.editSale = editSale;
      this.deleteSale = deleteSale;

      var salesStep = 10,
          currentPage,
          startPage = 1;

      if ($mdMedia('gt-sm'))
        salesStep = 30;

      function getSales(page, noFilter) {
        if (angular.isUndefined(page))
          currentPage = startPage;
        else if (page === false)
          currentPage += 1;
        else
          currentPage = page;

        var defer = $q.defer(),
            filter = noFilter ? '' : '?page=' + currentPage + '&limit=' + salesStep;

        $http.get('/sale' + filter).success(function (sales) {
          if (!noFilter && sales.length == 0) {
            currentPage -= 1;
            defer.reject();
          }

          defer.resolve(sales.map(SaleFactory.remap));
        }).error(function (err) {
          currentPage -= 1;
          defer.reject([]);
        });

        return defer.promise;
      }

      function getSale(id, uniq) {
        var defer = $q.defer();

        if (!uniq) {
          getSales(null, true).then(function (ss) {
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

      function getSalesOfProduct(productId) {
        var defer = $q.defer();

        getSales(null, true).then(function (sales) {
          var r = sales.filter(function (s) {
            return s.products.map(function (p) {
                  return p.product.id
                }).indexOf(productId) >= 0;
          }).map(function (s) {
            s.products = s.products.filter(function (p) {
              return p.product.id == productId;
            })[0];
            s.product = s.products.product;
            s.product.quantity = s.products.quantity;
            s.product.price = s.products.unitPrice;
            s.totalPrice = s.product.quantity * s.product.price;
            delete s.products;
            return s;
          });
          defer.resolve(r);
        });

        return defer.promise;
      }

      function getOwnSales(page, noFilter) {
        if (angular.isUndefined(page))
          currentPage = startPage;
        else if (page === false)
          currentPage += 1;
        else
          currentPage = page;

        var defer = $q.defer(),
            filter = noFilter ? '' : '&page=' + currentPage + '&limit=' + salesStep;

        UserService.getCurrentSession().then(function (session) {
          $http.get('/sale?customer=' + session.id + filter).success(function (sales) {
            if (!noFilter && sales.length == 0) {
              currentPage -= 1;
              defer.reject();
            }

            defer.resolve(sales.map(SaleFactory.remap));
          }).error(function (err) {
            currentPage -= 1;
            defer.reject([]);
          });
        });

        return defer.promise;
      }

      function doSale(customerId, products, type, commentSale) {
        var defer = $q.defer();
        // Remapping objects.
        products = products.map(function (o) {
          return {
            productId: o.id,
            quantity: o.selected
          };
        });

        $http.post('/sale', {
          customerId: customerId,
          products: products,
          typePayment: type,
          commentSale: commentSale
        }).success(function (data) {
          if (customerId != UserFactory.getGuestUserId()) {
            UserService.get(data.customer, true).then(function (u) {
              data.customer = u;
              defer.resolve(data);
            }).catch(function () {
              defer.reject(500);
            });
          } else {
            defer.resolve(data);
          }
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
        }).error(function (err, status) {
          defer.reject(status);
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
    .factory('SaleFactory', ['$q', '$filter', 'UserFactory', function ($q, $filter, UserFactory) {
      return {
        remap: function (o) {
          if (angular.isDefined(o)) {
            o.getDate = function () {
              return $filter('amDateFormat')(o.saleDate, 'LLLL');
            };
            o.customer = UserFactory.remap(o.customer);
            if (o.customer.id == UserFactory.getGuestUserId() && o.commentSale) {
              o.customer.name = o.commentSale;
              o.customer.firstname = '';
              o.customer.email = 'Invité(e)';
            }
          }
          return o;
        }
      }
    }]);
