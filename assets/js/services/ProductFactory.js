'use strict';

angular.module('stofmaApp.services');

angular.module('stofmaApp.services')
    .factory('ProductFactory', ['$q', '$http', function ($q, $http) {
      var factory = {
        getProducts: getProductsFn
      };

      function getProductsFn() {
        var defer = $q.defer();

        $http.post('/product/search').success(function (data) {
          defer.resolve(data);
        }).error(function (err) {
          defer.reject();
        });

        return defer.promise;
      }

      return factory;
    }]);

