'use strict';

angular.module('stofmaApp.services')
    .factory('UserFactory', ['$q', '$http', function ($q, $http) {
      var users = [];

      return {
        getCurrentSession: getCurrentSession,
        getAll: getAll,
        get: get,
        login: login,
        logout: logout,
        register: register,
        users: users
      };

      function getCurrentSession() {
        var defer = $q.defer();

        $http.get('/session').success(function (data) {
          defer.resolve(data);
        }).error(function (err) {
          defer.reject(false);
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
        }).catch(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }

      function login(credentials) {
        var defer = $q.defer();

        $http.put('/user/login', credentials).success(function (result) {
          defer.resolve(true);
        }).error(function (err, status) {
          if (status == 401)
            defer.resolve(true);
          else
            defer.reject();
        });

        return defer.promise;
      }

      function logout() {
        var defer = $q.defer();

        $http.put('/user/logout').success(function () {
          defer.resolve(true);
        }).error(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }

      function register(formData) {
        var defer = $q.defer();

        $http.post('/user', formData).success(function (result) {
          defer.resolve(formData);
        }).error(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }
    }])
;

