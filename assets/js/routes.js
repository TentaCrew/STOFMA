angular.module('stofmaApp')
    .config(['$stateProvider', '$urlRouterProvider', 'AccessLevels', function ($stateProvider, $urlRouterProvider, AccessLevels) {

      $stateProvider
          .state('anon', {
            abstract: true,
            template: '<div ui-view />',
            data: {
              access: AccessLevels.anon
            }
          })
          .state('anon.login', {
            url: '/login',
            controller: 'LoginCtrl',
            templateUrl: 'assets/templates/login.html',
            data: {
              name: 'Connexion',
              icon: 'settings_ethernet'
            }
          })
          .state('anon.register', {
            url: '/register',
            controller: 'RegisterCtrl',
            templateUrl: 'assets/templates/register.html',
            data: {
              name: 'Inscription',
              icon: 'assignment_ind'
            }
          })
          .state('auth', {
            abstract: true,
            template: '<div ui-view />',
            data: {
              access: AccessLevels.seller
            }
          })
          .state('auth.home', {
            url: '/home',
            controller: 'HomeCtrl',
            templateUrl: 'assets/templates/home.html',
            data: {
              name: 'Accueil',
              icon: 'layers'
            }
          })
          .state('auth.sell', {
            url: '/sell',
            controller: 'SellCtrl',
            templateUrl: 'assets/templates/sell.html',
            data: {
              name: 'Vendre un produit',
              icon: 'add_shopping_cart'
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
              name: 'Les ventes',
              icon: 'shopping_cart'
            },
            resolve: {
              salesProvider: 'SaleFactory',
              AccessLevels: 'AccessLevels',

              salesData: function (salesProvider) {
                return salesProvider.getSales();
              }
            }
          })
          .state('auth.purchases', {
            url: '/purchases',
            controller: 'PurchaseCtrl',
            templateUrl: 'assets/templates/purchases.html',
            data: {
              name: 'Les achats',
              icon: 'list'
            },
            resolve: {
              purchasesProvider: 'PurchaseFactory',

              purchasesData: function (purchasesProvider) {
                return purchasesProvider.getPurchases();
              }
            }
          });

      $urlRouterProvider.otherwise('/');
    }]);
