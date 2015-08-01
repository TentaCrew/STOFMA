'use strict';

angular.module('stofmaApp.services')
    .factory('UserFactory', ['$q', '$http', function ($q, $http) {
      var factory = {
        getCurrentSession: getCurrentSessionFn
      };

      function getCurrentSessionFn() {
        var defer = $q.defer();
        return defer.promise;
      }

      return factory;
    }]);

