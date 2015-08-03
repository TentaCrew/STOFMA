'use strict';

angular.module('stofmaApp.services')
    .factory('PurchaseFactory', ['$q', '$http', function ($q, $http) {
      return {
        getPurchases: getPurchases
      };

      function getPurchases() {
        var defer = $q.defer();

        defer.resolve([]);

        return defer.promise;
      }
    }]);

