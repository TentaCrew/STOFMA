angular.module('stofmaApp.auth')
    .factory('Auth', ['$q', 'AccessLevels', 'UserFactory', function ($q, AccessLevels, UserFactory) {
      return {
        login: function (credentials) {
          var t = this,
              defer = $q.defer();
          UserFactory.login(credentials).then(function () {
            UserFactory.getCurrentSession().then(function(session){
              defer.resolve();
            });
          }).catch(function(){
            defer.reject(404);
          });
          return defer.promise;
        },
        logout: function () {
          var defer = $q.defer();
          UserFactory.logout().then(function(){
            defer.resolve();
          }, function(){
            defer.resolve();
          });
          return defer.promise;
        },
        register: function (formData) {
          var defer = $q.defer();
          UserFactory.register(formData).then(function(){
            UserFactory.getCurrentSession().then(function(session){
              defer.resolve();
            });
          });

          return defer.promise;
        }
      };
    }]);
