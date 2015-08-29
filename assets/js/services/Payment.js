'use strict';

angular.module('stofmaApp.services')
    .service('PaymentService', ['$q', '$http', 'PaymentFactory', function ($q, $http, PaymentFactory) {
      var that = this;

      this.getAll = getAll;
      this.get = get;

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
    }])
    .factory('PaymentFactory', function(){
      return {
        remap : function(o){
          o.getPayment = function(){
            return o.manager.name + ' ' + o.customer.name + ' ' + o.amount;
          };
          return o;
        }
      }
    });
