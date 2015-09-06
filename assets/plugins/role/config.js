'use strict';

angular.module('stofmaApp')
    .config(['$stateProvider', '$urlRouterProvider', 'AccessLevels', function ($stateProvider, $urlRouterProvider, AccessLevels) {

      $stateProvider
      .state('admin.role', {
        url: '/role',
        controller: 'RoleCtrl',
        templateUrl: 'plugins/role/templates/role.html',
        data: {
          name: 'Gérer les rôles',
          icon: 'group'
        },
        resolve: {
          userProvider: 'UserService',
          usersData: function (userProvider) {
            return userProvider.getAll();
          }
        }
      });
}]);
