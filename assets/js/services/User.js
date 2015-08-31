'use strict';

angular.module('stofmaApp.services')
    .service('UserService', ['$q', '$http', 'UserFactory', function ($q, $http, UserFactory) {
      var that = this;
      this.users = [];

      this.getCurrentSession = getCurrentSession;
      this.getAll = getAll;
      this.get = get;
      this.getFromSession = getFromSession;
      this.login = login;
      this.logout = logout;
      this.register = register;
      this.update = update;
      this.credit = credit;
      this.setRole = setRole;

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
        $http.get('/user').success(function (data) {
          defer.resolve(data.map(UserFactory.remap).sort(function(a, b){
            if (a.name > b.name)
              return 1;
            else
              return -1;
          }));
        }).error(function (err) {
          defer.reject(err.status);
        });

        return defer.promise;
      }

      function get(id) {
        var defer = $q.defer();

        if(id == -1){
          defer.resolve({
            getName: function(){
              return 'invité';
            }
          });
        } else {
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
        }

        return defer.promise;
      }

      function getFromSession() {
        var defer = $q.defer();

        getCurrentSession().then(function (session) {
          get(session.id).then(function (user) {
            defer.resolve(user);
          }, function (err) {
            defer.reject(null);
          });
        }, function (err) {
          defer.reject(null);
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
          defer.resolve(result);
        }).error(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }

      function update(userId, formData) {
        var defer = $q.defer();

        $http.patch('/user/'+userId, formData).success(function (result) {
          defer.resolve(result);
        }).error(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }

      function credit(userId, formData) {
        var defer = $q.defer();

        $http.patch('/user/'+userId+'/credit', formData).success(function (result) {
          defer.resolve(result);
        }).error(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }

      function setRole(userId, formData) {
        var defer = $q.defer();

        $http.patch('/user/'+userId+'/role', formData).success(function (result) {
          defer.resolve(result);
        }).error(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }
    }])
    .factory('UserFactory', function(){
      return {
        remap : function(o){
          o.getName = function(){
            return o.firstname + ' ' + o.name;
          };
          return o;
        }
      }
    });
