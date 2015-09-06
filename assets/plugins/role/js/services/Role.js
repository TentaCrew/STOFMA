'use strict';

angular.module('stofmaApp.services')
    .service('RoleService', ['$q', '$http', function ($q, $http) {

      this.setRole = setRole;

      function setRole(userId, formData) {
        var defer = $q.defer();

        $http.patch('/user/' + userId + '/role', formData).success(function (result) {
          defer.resolve(result);
        }).error(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }
    }]);
