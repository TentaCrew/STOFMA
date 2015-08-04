angular.module('stofmaApp')
    .config(['$stateProvider', '$urlRouterProvider', 'AccessLevels', function ($stateProvider, $urlRouterProvider, AccessLevels) {

      var authenticated = ['$q', 'UserFactory', function ($q, UserFactory) {
        var defer = $q.defer();
        UserFactory.getCurrentSession()
            .then(function (session) {
              defer.resolve();
            }).catch(function(){
              defer.reject('Non connecté');
            });
        return defer.promise;
      }];

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
          .state('manager', {
            abstract: true,
            template: '<div ui-view />',
            data: {
              access: AccessLevels.manager
            },
            resolve : {
              authenticated : authenticated
            }
          })
          .state('manager.sell', {
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
                return productProvider.getProducts(true);
              }
            }
          })
          .state('manager.sales', {
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
          .state('manager.purchases', {
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
          })
          .state('user', {
            abstract: true,
            template: '<div ui-view />',
            data: {
              access: AccessLevels.user
            },
            resolve : {
              authenticated : authenticated
            }
          })
          .state('user.home', {
            url: '/home',
            controller: 'HomeCtrl',
            templateUrl: 'assets/templates/home.html',
            data: {
              name: 'Accueil',
              icon: 'home',
              weight: -10
            }
          })
          .state('user.products', {
            url: '/products',
            controller: 'ProductCtrl',
            templateUrl: 'assets/templates/products.html',
            data: {
              name: 'La cafet\'',
              icon: 'list'
            },
            resolve: {
              productsProvider: 'ProductFactory',

              productsData: function (productsProvider) {
                return productsProvider.getProducts(false);
              }
            }
          });

      $urlRouterProvider.otherwise('/login');
    }]);
