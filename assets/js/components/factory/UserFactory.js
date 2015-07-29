'use strict';

angular.module('stofmaApp.factory.user', [])
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

