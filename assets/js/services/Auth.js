angular.module('stofmaApp.auth')
    .factory('Auth', ['$q', 'AccessLevels', 'UserService', function ($q, AccessLevels, UserService) {
      return {
        login: function (credentials) {
          var t = this,
              defer = $q.defer();
          UserService.login(credentials).then(function () {
            UserService.getCurrentSession().then(function(session){
              defer.resolve();
            });
          }).catch(function(){
            defer.reject(404);
          });
          return defer.promise;
        },
        logout: function () {
          var defer = $q.defer();
          UserService.logout().then(function(){
            defer.resolve();
          }, function(){
            defer.resolve();
          });
          return defer.promise;
        },
        register: function (formData) {
          var defer = $q.defer();
          UserService.register(formData).then(function(newUser){
            defer.resolve({
              newUser: newUser
            });
          }).catch(function(err){
            defer.reject(err);
          });

          return defer.promise;
        },
        update: function (userId, formData) {
          var defer = $q.defer();
          UserService.update(userId, formData).then(function(user){
            defer.resolve(user);
          }).catch(function(err){
            defer.reject(err);
          });

          return defer.promise;
        },
        credit: function (userId, formData) {
          var defer = $q.defer();
          UserService.credit(userId, formData).then(function(user){
            defer.resolve(user.credit);
          }).catch(function(err){
            defer.reject(err);
          });

          return defer.promise;
        },
        setRole: function (userId, formData) {
          var defer = $q.defer();

          UserService.setRole(userId, formData).then(function(user){
            defer.resolve(user);
          }).catch(function(status){
            defer.reject(status);
          });

          return defer.promise;
        }
      };
    }]);
