'use strict';

angular.module('stofmaApp.services')
    .service('PurchaseService', ['$q', '$http', function ($q, $http) {
      this.getPurchases = getPurchases;

      function getPurchases() {
        var defer = $q.defer();

        defer.resolve([]);

        return defer.promise;
      }
    }]);

