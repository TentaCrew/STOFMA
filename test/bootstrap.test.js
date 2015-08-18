var Sails = require('sails');

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
        var user_manager_01 = {
          id:         1,
          firstname: 'manager',
          name:      'michel',
          email:     'manager@pro.com',
          sex:       true,
          role:      'MANAGER',
          credit:    100,
          password:  'sale'
        };
        var user_customer_01 = {
          id:         2,
          firstname:  'lucie',
          name:       'customer',
          email:      'lucie@customer.fr',
          sex:        false,
          role:       'USER',
          credit:     100,
          password:   'catword'
        };
        var user_customer_02 = {
          id:         3,
          firstname:  'coco',
          name:       'rico',
          email:      'coco@ri.co',
          sex:        false,
          role:       'USER',
          credit:     10,
          password:   'rico'
        };
        User.create([user_manager_01,user_customer_01,user_customer_02], cb);
      },
      createProducts: function(cb){
        var product_01 = {
          id:         1,
          name:      'product_1',
          shortName: 'p1',
          price:     0.50,
          urlImage:  '',
          minimum:   5,
          category:  'FOOD'
        };
        var product_02 = {
          id:         2,
          name:      'product_2',
          shortName: 'p2',
          price:     0.50,
          urlImage:  '',
          minimum:   5,
          category:  'DRINK'
        };
        var product_03 = {
          id:         3,
          name:      'product_3',
          shortName: 'p3',
          price:     0.90,
          urlImage:  '',
          minimum:   15,
          category:  'OTHER'
        };
        var product_04 = {
          id:         4,
          name:      'product_4',
          shortName: 'p4',
          price:     0.10,
          urlImage:  '',
          minimum:   10,
          category:  'FOOD'
        };
        Product.create([product_01,product_02,product_03,product_04], function(){
          //***** PAIRS CREATION *****//
          var purchasePair_01 = {
            id:       1,
            product:  1,
            quantity: 20
          };
          var purchasePair_02 = {
            id:       2,
            product:  2,
            quantity: 15
          };
          var purchasePair_03 = {
            id:       3,
            product:  3,
            quantity: 10
          };
          var purchasePair_04 = {
            id:       4,
            product:  2,
            quantity: 11
          };
          var purchasePair_05 = {
            id:       5,
            product:  3,
            quantity: 3
          };
          var purchasePair_06 = {
            id:       6,
            product:  4,
            quantity: 1
          };
          var salePair_11 = {
            id:       11,
            product:  3,
            quantity: 2
          };
          var salePair_12 = {
            id:       12,
            product:  2,
            quantity: 1
          };
          var salePair_13 = {
            id:       13,
            product:  3,
            quantity: 4
          };
          var salePair_14 = {
            id:       14,
            product:  4,
            quantity: 2
          };
          var salePair_15 = {
            id:       15,
            product:  1,
            quantity: 2
          };
          var salePair_16 = {
            id:       16,
            product:  4,
            quantity: 1
          };
          var salePair_17 = {
            id:       17,
            product:  1,
            quantity: 200
          };
          Pair.create([purchasePair_01,purchasePair_02,purchasePair_03,purchasePair_04,purchasePair_05,purchasePair_06,
                       salePair_11,salePair_12,salePair_13,salePair_14,salePair_15,salePair_16,salePair_17], function(){

            async.parallel({
              createPurchases: function(callback){
                var purchase_01 = {
                  id:           1,
                  manager:      1,
                  products:     [1,2,3],
                  purchaseDate: '2015-08-18T21:38:52.750Z'
                };
                var purchase_02 = {
                  id:           2,
                  manager:      1,
                  products:     [4,5],
                  purchaseDate: '2015-08-18T21:38:52.750Z'
                };
                var purchase_03 = {
                  id:           3,
                  manager:      1,
                  products:     [6],
                  purchaseDate: '2015-08-18T21:38:52.750Z'
                };
                Purchase.create([purchase_01,purchase_02,purchase_03], callback);
              },
              createSales: function(callback){
                var sale_01 = {
                  id:           1,
                  manager:      1,
                  customer:     1,
                  products:     [11,13],
                  saleDate:     '2015-08-18T21:38:52.750Z'
                };
                var sale_02 = {
                  id:           2,
                  manager:      1,
                  customer:     2,
                  products:     [14,15],
                  saleDate:     '2015-08-18T21:38:52.750Z'
                };
                var sale_03 = {
                  id:           3,
                  manager:      1,
                  customer:     2,
                  products:     [12],
                  saleDate:     '2015-08-18T21:38:52.750Z'
                };
                var sale_04 = {
                  id:           4,
                  manager:      1,
                  customer:     3,
                  products:     [16],
                  saleDate:     '2015-08-18T21:38:52.750Z'
                };
                Sale.create([sale_01,sale_02,sale_03,sale_04], callback);
              }
            },
            function(err, results) {
              sails.controllers.stock.updateAll()
              .then(function(){
                cb();
              });
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
