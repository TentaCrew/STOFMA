var Sails = require('sails');
var data = require('./datatest.js');

before(function(done) {
  Sails.lift({
    environment: 'test'
  }, function(){
      async.parallel({
        createUsers: function(cb){
          User.create([data.user_admin_01,data.user_manager_01,data.user_customer_01,data.user_customer_02,data.user_customer_03,data.user_customer_05], cb);
        },

        createPayment: function(cb){
          Payment.create([data.payment_01, data.payment_02, data.payment_03, data.payment_04, data.payment_05, data.payment_06, data.payment_07, data.payment_11,
                          data.payment_12, data.payment_13, data.payment_credit_user_admin_01, data.payment_credit_user_manager_01,
                          data.payment_credit_user_customer_01, data.payment_credit_user_customer_02], cb);
        },
      },

      function(err, results) {
        async.parallel({

        createProducts: function(cb){
          Product.create([data.product_01,data.product_02,data.product_03,data.product_04,data.product_05,data.product_06,data.product_07,data.product_09], function(){
            Pair.create([data.purchasePair_01,data.purchasePair_02,data.purchasePair_03,data.purchasePair_04,data.purchasePair_05,data.purchasePair_06,
                         data.salePair_11,data.salePair_12,data.salePair_13,data.salePair_14,data.salePair_15,data.salePair_16,data.salePair_17,
                         data.salePair_18,data.salePair_19,data.salePair_20,data.salePair_21], function(err,pairs){
              async.parallel({
                createPurchases: function(callback){
                  Purchase.create([data.purchase_01,data.purchase_02,data.purchase_03], callback);
                },
                createSales: function(callback){
                  //callback();
                  Sale.create([data.sale_01,data.sale_02,data.sale_03,data.sale_04,data.sale_05,data.sale_06,data.sale_07], function(err,sales){
                    //update the credit of the users who paid with IN_CREDIT only
                    User.findOne({id: data.sale_01.customer}, function(err, user_s01){
                      user_s01.credit = Number(user_s01.credit) - Number(sales[0].totalPrice);
                      user_s01.save(function(){
                        User.findOne({id: data.sale_02.customer}, function(err, user_s02){
                          user_s02.credit = Number(user_s02.credit) - Number(sales[1].totalPrice);
                          user_s02.save(function(){
                            User.findOne({id: data.sale_03.customer}, function(err, user_s03){
                              user_s03.credit = Number(user_s03.credit) - Number(sales[2].totalPrice);
                              user_s03.save(function(){
                                User.findOne({id: data.sale_04.customer}, function(err, user_s04){
                                  user_s04.credit = Number(user_s04.credit) - Number(sales[3].totalPrice);
                                  user_s04.save(function(){
                                    callback();
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
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
});

after(function(done) {
  Sails.lower(done);
});
