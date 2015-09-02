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
            },
            resolve: {
              userProvider: 'UserService',
              updateHimSelf: function () {
                return true;
              },

              userData: function (userProvider) {
                return userProvider.getFromSession();
              }
            }
          })
          .state('user.sales', {
            url: '/history',
            controller: 'SalesCtrl',
            templateUrl: 'assets/templates/sales.html',
            data: {
              name: 'Mes achats',
              icon: 'shopping_cart'
            },
            resolve: {
              salesProvider: 'SaleService',
              isManager: function () {
                return false;
              },
              salesData: function (salesProvider) {
                return salesProvider.getOwnSales();
              }
            }
          })
          .state('user.products', {
            url: '/stall',
            controller: 'StallProductCtrl',
            templateUrl: 'assets/templates/stallproducts.html',
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
              },
              usersProvider: 'UserService',

              usersData: function (usersProvider) {
                return usersProvider.getAll();
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
              isManager: function () {
                return true;
              },

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
          .state('manager.users', {
            url: '/users',
            controller: 'UserCtrl',
            templateUrl: 'assets/templates/users.html',
            data: {
              name: 'Utilisateurs',
              icon: 'face'
            },
            resolve: {
              usersProvider: 'UserService',

              usersData: function (usersProvider) {
                return usersProvider.getAll();
              }
            }
          })
          .state('manager.credit', {
            url: '/credit',
            controller: 'CreditCtrl',
            templateUrl: 'assets/templates/credit.html',
            data: {
              name: 'Paiements et soldes',
              icon: 'attach_money'
            },
            resolve: {
              userProvider: 'UserService',
              usersData: function (userProvider) {
                return userProvider.getAll();
              }
            }
          })
          .state('manager.products', {
            url: '/products',
            controller: 'ProductCtrl',
            templateUrl: 'assets/templates/products.html',
            data: {
              name: 'Les produits',
              icon: 'layers'
            },
            resolve: {
              productsProvider: 'ProductService',

              productsData: function (productsProvider) {
                return productsProvider.getProducts();
              },

              categoriesData: function (productsProvider) {
                return productsProvider.getCategories();
              }
            }
          })
          .state('manager.products.add', {
            url: '/add',
            controller: 'AddProductCtrl',
            templateUrl: 'assets/templates/products.add.html',
            data: {
              name: 'Ajout d\'un produit',
              hidden: true
            }
          })
          .state('manager.addpurchase', {
            url: '/purchase/add',
            controller: 'AddPurchaseCtrl',
            templateUrl: 'assets/templates/purchases.add.html',
            data: {
              name: 'Ajout d\'un achat',
              hidden: true
            },
            resolve: {
              productsProvider: 'ProductService',

              productsData: function (productsProvider) {
                return productsProvider.getProducts();
              }
            }
          })
          .state('manager.accountStatement', {
            url: '/add',
            controller: 'AccountStatementCtrl',
            templateUrl: 'assets/templates/accountStatement.html',
            data: {
              name: 'Bilan financier',
              icon: 'equalizer'
            },
            resolve: {
              paymentsProvider: 'PaymentService',

              paymentsData: function (paymentsProvider) {
                return paymentsProvider.getAll();
              },
              usersProvider: 'UserService',

              usersData: function (usersProvider) {
                return usersProvider.getAll();
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
          .state('admin.profile', {
            url: '/profile/:id',
            controller: 'ProfileCtrl',
            templateUrl: 'assets/templates/profile.html',
            data: {
              name: 'Édition du profil',
              hidden: true
            },
            resolve: {
              userProvider: 'UserService',
              updateHimSelf: function () {
                return false;
              },

              userData: function (userProvider, $stateParams) {
                return userProvider.get($stateParams.id);
              }
            }
          })
          .state('admin.role', {
            url: '/role',
            controller: 'RoleCtrl',
            templateUrl: 'assets/templates/role.html',
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

      $urlRouterProvider.otherwise('/home');
    }]);
