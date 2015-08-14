angular.module('stofmaApp')
    .config(['$stateProvider', '$urlRouterProvider', 'AccessLevels', function ($stateProvider, $urlRouterProvider, AccessLevels) {

      var authenticated = ['$q', 'UserService', function ($q, UserService) {
        var defer = $q.defer();
        UserService.getCurrentSession()
            .then(function (session) {
              defer.resolve(session);
            }).catch(function () {
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
          .state('user', {
            abstract: true,
            template: '<div ui-view />',
            data: {
              access: AccessLevels.user,
              name: 'Membre'
            },
            resolve: {
              authenticated: authenticated
            }
          })
          .state('user.home', {
            url: '/home',
            controller: 'HomeCtrl',
            templateUrl: 'assets/templates/home.html',
            data: {
              name: 'Accueil',
              icon: 'home',
              weight: 1
            }
          })
          .state('user.profile', {
            url: '/profile',
            controller: 'ProfileCtrl',
            templateUrl: 'assets/templates/profile.html',
            data: {
              name: 'Mon Compte',
              icon: 'person'
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
              productsProvider: 'ProductService',

              productsData: function (productsProvider) {
                return productsProvider.getProducts(false);
              }
            }
          })
          .state('user.settings', {
            url: '/settings',
            controller: 'SettingCtrl',
            templateUrl: 'assets/templates/settings.html',
            data: {
              name: 'Paramètres',
              icon: 'settings',
              weight: 20
            }
          })
          .state('manager', {
            abstract: true,
            template: '<div ui-view />',
            data: {
              access: AccessLevels.manager,
              name: 'Manager'
            },
            resolve: {
              authenticated: authenticated,

              isManager: ['$q', 'authenticated', function ($q, authenticated) {
                var defer = $q.defer();
                if (authenticated.isManager || authenticated.isAdmin)
                  defer.resolve();
                else
                  defer.reject();
                return defer.promise;
              }]
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
              productProvider: 'ProductService',

              productsData: function (productProvider) {
                return productProvider.getProducts(true);
              }
            }
          })
          .state('manager.credit', {
            url: '/credit',
            controller: 'CreditCtrl',
            templateUrl: 'assets/templates/credit.html',
            data: {
              name: 'Créditer un compte',
              icon: 'attach_money'
            },
            resolve: {
              userProvider: 'UserService',
              usersData: function (UserService) {
                return UserService.getAll();
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
              salesProvider: 'SaleService',
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
              purchasesProvider: 'PurchaseService',

              purchasesData: function (purchasesProvider) {
                return purchasesProvider.getPurchases();
              }
            }
          })
          .state('admin', {
            abstract: true,
            template: '<div ui-view />',
            data: {
              access: AccessLevels.admin,
              name: 'Administrateur'
            },
            resolve: {
              authenticated: authenticated,

              isAdmin: ['$q', 'authenticated', function ($q, authenticated) {
                var defer = $q.defer();
                if (authenticated.isAdmin)
                  defer.resolve();
                else
                  defer.reject();
                return defer.promise;
              }]
            }
          })
          .state('admin.stock', {
            url: '/stock',
            controller: 'ProductCtrl',
            templateUrl: 'assets/templates/products.html',
            data: {
              name: 'Les stocks',
              icon: 'layers'
            },
            resolve: {
              produtsProvider: 'ProductService',

              productsData: function (produtsProvider) {
                return produtsProvider.getProducts();
              }
            }
          });

      $urlRouterProvider.otherwise('/home');
    }]);
