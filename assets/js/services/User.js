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
      this.disable = disable;
      this.credit = credit;
      this.setRole = setRole;
      this.setMember = setMember;

      function getCurrentSession() {
        var defer = $q.defer();

        $http.get('/session').success(function (data) {
          defer.resolve(UserFactory.remap(data));
        }).error(function (err) {
          defer.reject(false);
        });

        return defer.promise;
      }

      function getAll(withInactive) {
        var defer = $q.defer();
        $http.get('/user' + (withInactive ? '' : '?isActive=true')).success(function (data) {
          var users = data.map(UserFactory.remap);

          users = users.sort(function (u1, u2) {
            if (u1.getName(true) < u2.getName(true))
              return -1;
            else
              return 1;
          }).sort(function (u) {
            return !u.isActive;
          });
          defer.resolve(users);
        }).error(function (err) {
          defer.reject(err.status);
        });

        return defer.promise;
      }

      function get(id, uniq) {
        var defer = $q.defer();

        if (uniq) {
          $http.get('/user/' + id).success(function (userData) {
            defer.resolve(UserFactory.remap(userData[0]));
          }).error(function (err) {
            defer.reject(null);
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
          get(session.id, true).then(function (user) {
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
          defer.resolve(UserFactory.remap(result));
        }).error(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }

      function update(userId, formData) {
        var defer = $q.defer();

        $http.patch('/user/' + userId, formData).success(function (result) {
          defer.resolve(result);
        }).error(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }

      function disable(userId, disable) {
        var defer = $q.defer();

        $http.patch('/user/' + userId + '/active', {
          isActive: !disable
        }).success(function (result) {
          defer.resolve(result.map(UserFactory.remap)[0]);
        }).error(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }

      function credit(userId, formData) {
        var defer = $q.defer();

        $http.patch('/user/' + userId + '/credit', formData).success(function (user) {
          defer.resolve(UserFactory.remap(user[0]));
        }).error(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }

      function setRole(userId, formData) {
        var defer = $q.defer();

        $http.patch('/user/' + userId + '/role', formData).success(function (result) {
          defer.resolve(UserFactory.remap(result[0]));
        }).error(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }

      function setMember(userId, member) {
        var defer = $q.defer();

        $http.patch('/user/' + userId + '/member', {
          isMember: !!member
        }).success(function (user) {
          defer.resolve(UserFactory.remap(user[0]));
        }).error(function () {
          defer.reject();
        });

        return defer.promise;
      }
    }])
    .factory('UserFactory', ['AccessLevels', function (AccessLevels) {
      var guestUserId = -1;

      var that = {
        remap: function (o) {
          o.getName = function (nameFirst) {
            if (angular.isDefined(nameFirst))
              return o.name + ' ' + o.firstname;
            return o.firstname + ' ' + o.name;
          };
          o.isAdmin = function () {
            return o.role == AccessLevels.admin;
          };
          o.isManager = function (cascade) {
            return cascade ? o.role == AccessLevels.manager || o.role == AccessLevels.admin : o.role == AccessLevels.manager;
          };
          o.isSimpleUser = function (cascade) {
            return cascade ? o.role == AccessLevels.user || o.role == AccessLevels.manager || o.role == AccessLevels.admin : o.role == AccessLevels.user;
          };

          return o;
        },
        onlyRealUsers: function (arrUsers, callbackIfNotReal) {
          return arrUsers.filter(function (u) {
            var isReal = u.id != guestUserId;
            if (!isReal && callbackIfNotReal)
              callbackIfNotReal(u);

            return isReal;
          });
        },
        getGuestUserId: function () {
          return guestUserId;
        },
        filterByName: function (u1, u2) {
          if (angular.isUndefined(u1.getName) || angular.isUndefined(u2.getName)) {
            u1 = that.remap(u1);
            u2 = that.remap(u2);
          }

          if (u1.getName(true) < u2.getName(true))
            return -1;
          else
            return 1;
        }
      };

      return that;
    }]);
