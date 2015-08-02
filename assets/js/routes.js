angular.module('stofmaApp')
    .config(['$stateProvider', '$urlRouterProvider', 'AccessLevels', function ($stateProvider, $urlRouterProvider, AccessLevels) {

      $stateProvider
          .state('anon', {
            abstract: true,
            template: '<ui-view/>',
            data: {
              access: AccessLevels.anon
            }
          })
          .state('anon.login', {
            url: '/login',
            controller: 'LoginCtrl',
            templateUrl: 'assets/templates/login.html',
            data: {
              name: 'Connexion'
            }
          })
          .state('anon.register', {
            url: '/register',
            controller: 'RegisterCtrl',
            templateUrl: 'assets/templates/register.html',
            data: {
              name: 'Inscription'
            }
          })
          .state('auth', {
            abstract: true,
            template: '<ui-view/>',
            data: {
              access: AccessLevels.seller
            }
          })
          .state('auth.home', {
            url: '/home',
            controller: 'HomeCtrl',
            templateUrl: 'assets/templates/home.html',
            data: {
              name: 'Accueil'
            }
          })
          .state('auth.sell', {
            url: '/sell',
            controller: 'SellCtrl',
            templateUrl: 'assets/templates/sell.html',
            data: {
              name: 'Vendre un produit'
            },
            resolve: {
              productProvider: 'ProductFactory',

              productsData: function (productProvider) {
                return productProvider.getProducts();
              }
            }
          })
          .state('auth.sales', {
            url: '/sales',
            controller: 'SalesCtrl',
            templateUrl: 'assets/templates/sales.html',
            data: {
              name: 'Les ventes'
            },
            resolve: {
              salesProvider: 'SaleFactory',
              AccessLevels: 'AccessLevels',

              salesData: function (salesProvider) {
                return salesProvider.getSales();
              }
            }
          });

      $urlRouterProvider.otherwise('/');
    }]);
