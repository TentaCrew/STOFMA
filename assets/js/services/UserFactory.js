'use strict';

angular.module('stofmaApp.services')
    .factory('UserFactory', ['$q', '$http', function ($q, $http) {
      var users = [];

      return {
        getCurrentSession: getCurrentSession,
        getAll: getAll,
        get: get,
        users: users
      };

      function getCurrentSession() {
        var defer = $q.defer();

        $http.get('/session').success(function (data) {
          defer.resolve(data);
        }).error(function (err) {
          defer.reject(err.status);
        });

        return defer.promise;
      }

      function getAll() {
        var defer = $q.defer();

        if (users.length == 0) {
          $http.post('/user/search').success(function (data) {
            users = data;
            defer.resolve(data);
          }).error(function (err) {
            defer.reject(err.status);
          });
        } else {
          defer.resolve(users);
        }

        return defer.promise;
      }

      function get(id) {
        var defer = $q.defer();

        getAll().then(function (usersData) {
          for (var i = 0; i < usersData.length; i++) {
            var d = usersData[i];
            if (d.id == id) {
              defer.resolve(d);
              break;
            }
          }
        }).catch(function(err){
          defer.reject(err);
        });

        return defer.promise;
      }
    }])
;

