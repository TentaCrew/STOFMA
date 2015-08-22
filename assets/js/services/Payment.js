'use strict';

angular.module('stofmaApp.services')
    .service('PaymentService', ['$q', '$http', 'PaymentFactory', function ($q, $http, PaymentFactory) {
      var that = this;
      this.payments = [];

      this.getAll = getAll;

      function getAll() {
        var defer = $q.defer();
        if (that.payments.length == 0) {
          $http.get('/payment').success(function (data) {
            that.payments = data.map(PaymentFactory.remap);
            defer.resolve(that.payments);
          }).error(function (err) {
            defer.reject(err.status);
          });
        } else {
          defer.resolve(that.payments);
        }

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
