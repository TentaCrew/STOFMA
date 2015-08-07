'use strict';

angular.module('stofmaApp.services').factory('SaleFactory', ['$q', '$http', function ($q, $http) {
  return {
    getSales: getSales,
    doSale: doSale,
    deleteSale: deleteSale
  };

  function getSales() {
    var defer = $q.defer();

    $http.post('/sale/search').success(function (data) {
      defer.resolve(data);
    }).error(function (err) {
      defer.reject([]);
    });

    return defer.promise;
  }

  function doSale(idCustomer, products) {
    var defer = $q.defer();
    products = products.map(function (o) {
      var no = {};
      no.productId = o.id;
      no.quantity = o.selected;
      return no;
    });

    $http.post('/sale', {
      customer: idCustomer,
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
}]);
