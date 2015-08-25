var Sails = require('sails');
var data = require('./datatest.js');

before(function(done) {
  Sails.lift({
    log: {
      level: 'error'
    },
    models: {
      connection: 'localDiskDb',
      migrate: 'drop'
    }
  }, function(){

    async.parallel({

      createUsers: function(cb){
        User.create([data.user_admin_01,data.user_manager_01,data.user_customer_01,data.user_customer_02,data.user_customer_03], cb);
      },

      createProducts: function(cb){
        Product.create([data.product_01,data.product_02,data.product_03,data.product_04,data.product_05,data.product_06,data.product_07], function(){
          Pair.create([data.purchasePair_01,data.purchasePair_02,data.purchasePair_03,data.purchasePair_04,data.purchasePair_05,data.purchasePair_06,
                       data.salePair_11,data.salePair_12,data.salePair_13,data.salePair_14,data.salePair_15,data.salePair_16], function(){
            async.parallel({
              createPurchases: function(callback){
                Purchase.create([data.purchase_01,data.purchase_02,data.purchase_03], callback);
              },
              createSales: function(callback){
                Sale.create([data.sale_01,data.sale_02,data.sale_03,data.sale_04], callback);
              }
            },
            function(err, results) {
              cb();
            });
          });
        });
      }
    },
    function(err, results) {
      done();
    });
  });
});

after(function(done) {
  Sails.lower(done);
});
