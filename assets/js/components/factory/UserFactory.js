'use strict';

angular.module('stofmaApp.factory.user', [])
  .factory('UserFactory', ['$q', '$http', function ($q, $http) {
    var factory = {
      getCurrentSession: getCurrentSessionFn
    };

    function getCurrentSessionFn() {
      var defer = $q.defer();

      defer.resolve([
        {
          saleinfo: {
            id : 2,
            total: 5,
            products: [
              {
                id: 1,
                name: 'Coca Cola',
                quantity: 1
              },
              {
                id: 2,
                name: 'Fanta',
                quantity: 1
              },
              {
                id: 3,
                name: 'Fanta',
                quantity: 1
              }
            ]
          },
          seller: {
            avatar: 'http://placehold.it/50x50',
            name: 'Michel'
          },
          buyer: {
            avatar: 'http://placehold.it/50x50',
            name: 'Corentin'
          }
        },
        {
          saleinfo: {
            id : 3,
            total: 6,
            products: [
              {
                id: 1,
                name: 'Coca Cola',
                quantity: 1
              },
              {
                id: 2,
                name: 'Fanta',
                quantity: 1
              },
              {
                id: 3,
                name: 'Fanta',
                quantity: 4
              }
            ]
          },
          seller: {
            avatar: 'http://placehold.it/50x50',
            name: 'Michel'
          },
          buyer: {
            avatar: 'http://placehold.it/50x50',
            name: 'Corentin'
          }
        },
        {
          saleinfo: {
            id : 4,
            total: 5,
            products: [
              {
                id: 1,
                name: 'Coca Cola',
                quantity: 1
              },
              {
                id: 2,
                name: 'Fanta',
                quantity: 1
              },
              {
                id: 3,
                name: 'Fanta',
                quantity: 1
              }
            ]
          },
          seller: {
            avatar: 'http://placehold.it/50x50',
            name: 'Michel'
          },
          buyer: {
            avatar: 'http://placehold.it/50x50',
            name: 'Corentin'
          }
        }
      ]);

      return defer.promise;
    }

    return factory;
  }]);