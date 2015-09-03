'use strict';

angular.module('stofmaApp.services')
    .service('PaymentService', ['$q', '$http', 'PaymentFactory', function ($q, $http, PaymentFactory) {
      var that = this;
      this.payments = [];

      this.paymentModes = [{
        'id': 'IN_CASH',
        'name': 'Liquide'
      }, {
        'id': 'IN_CREDIT',
        'name': 'Crédit'
      }, {
        'id': 'IN_TRANSFER',
        'name': 'Virement'
      }, {
        'id': 'IN_CHECK',
        'name': 'Chèque'
      },{
        'id': 'OUT_CASH',
        'name': 'Liquide'
      }, {
        'id': 'OUT_CREDIT',
        'name': 'Crédit'
      }, {
        'id': 'OUT_TRANSFER',
        'name': 'Virement'
      }, {
        'id': 'OUT_CHECK',
        'name': 'Chèque'
      }, {
        'id': 'OUT_CARD',
        'name': 'Carte bancaire'
      }];

      this.getAll = getAll;
      this.getAllCredit = getAllCredit;
      this.get = get;
      this.getPaymentModes = getPaymentModes;
      this.doPayment = doPayment;

      function getAll() {
        var defer = $q.defer();
        $http.get('/payment').success(function (data) {
          that.payments = data.map(PaymentFactory.remap);
          defer.resolve(that.payments);
        }).error(function (err) {
          defer.reject(err.status);
        });

        return defer.promise;
      }

      function getAllCredit() {
        var defer = $q.defer();
        $http.get('/payment?creditMode=true').success(function (data) {
          that.payments = data.map(PaymentFactory.remap);
          defer.resolve(that.payments);
        }).error(function (err) {
          defer.reject(err.status);
        });

        return defer.promise;
      }

      function get(type) {
        var defer = $q.defer();

        var results = [];

        getAll().then(function (pmtData) {
          for (var i = 0; i < pmtData.length; i++) {
            var d = pmtData[i];
            if (d.type == type) {
              results.push(d);
            }
          }
          defer.resolve(results);
        }).catch(function (err) {
          defer.reject(err);
        });

        return defer.promise;
      }

      function doPayment(customer, type, amount) {
        var defer = $q.defer();

        var isTypeCorrect = that.paymentModes.filter(function (p) {
              return p.id == type;
            }).length == 1;

        if (isTypeCorrect) {
          $http.post('/payment', {
            customerId: customer,
            type: type,
            amount: amount
          }).success(function (data) {
            defer.resolve(data);
          }).error(function (err) {
            defer.reject(err);
          });
        } else {
          defer.reject();
        }

        return defer.promise;
      }

      function getPaymentModes(guest, direction) {
        if(angular.isUndefined(direction))
            direction = 'IN';
        else
            direction = direction.toUpperCase();
          
        var defer = $q.defer();

        defer.resolve(that.paymentModes
          .filter(function (pm) {
            return pm.id.split('_')[0].trim() === direction;
          })
          .filter(function (pm) {
            if ((direction == 'IN' && guest === true && pm.id.toLowerCase().indexOf('credit') >= 0) 
                || direction == 'OUT' && pm.id.toLowerCase().indexOf('credit') >= 0)
              return false;
            else
              return true;
        }));

        return defer.promise;
      }
    }])
    .factory('PaymentFactory', function () {
      return {
        remap: function (o) {
          o.getPayment = function () {
            return o.manager.name + ' ' + o.customer.name + ' ' + o.amount;
          };
          return o;
        },
        isCredit: function (o) {
          var i = o.id;
          if (angular.isUndefined(i))
            i = o;
          return i.indexOf('CREDIT') >= 0;
        }
      }
    });
