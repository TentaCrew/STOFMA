'use strict';

angular.module('stofmaApp.services')
    .factory('SaleFactory', ['$q', '$http', function ($q, $http) {
      var factory = {
        getSales: getSalesFn,
        deleteSale: deleteSaleFn
      };

      function getSalesFn() {
        var defer = $q.defer();

        $http.post('/sale/search').success(function (data) {
          defer.resolve(data);
        }).error(function (err) {
          defer.reject([]);
        });

        return defer.promise;
      }

      function deleteSaleFn(id) {
        var defer = $q.defer();
        $http.delete('/sale/' + id).success(function (data) {
          defer.resolve(true);
        }).error(function (err) {
          defer.reject(false);
        });
        return defer.promise;
      }

      return factory;
    }]);

