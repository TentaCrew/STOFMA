'use strict';

angular.module('stofmaApp.services')
    .factory('SaleFactory', ['$q', '$http', function ($q, $http) {
      return {
        getSales: getSales,
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

