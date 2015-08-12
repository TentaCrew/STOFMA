'use strict';

var request = require('supertest');
var agent;

/**
* Setting up some variables for the tests
*/
{
  var user_manager_01 = {
    firstname: 'manager',
    name: 'dupond',
    email: 'manager@purchase.com',
    sex: true,
    role: 'MANAGER',
    password: 'purchase'
  };

  var user_customer_01 = {
    firstname:  'lucie',
    name:       'customer',
    email:      'lucie@purchase.fr',
    sex:        false,
    role:       'USER',
    password:   'catword'
  };

  var product_01 = {
    name: 'prod_purchase_1',
    shortName: 'pp1',
    price: 0.50,
    urlImage: '',
    minimum: 5,
    category: 'FOOD'
  };

  var product_02 = {
    name: 'prod_purchase_2',
    shortName: 'pp2',
    price: 0.50,
    urlImage: '',
    minimum: 5,
    category: 'DRINK'
  };

}

describe('PurchaseController', function() {

  // Before: Instantiate an user agent
  before(function(done) {
    agent = request.agent(sails.hooks.http.app);
    done();
  });

  // Before: Create some products
  before(function(done) {
    async.parallel([
      function(cb) {
        Product
        .create(product_01)
        .exec(function(err, newProduct) {
          if(err) {
            cb(err);
          }
          else {
            product_01.id = newProduct.id;
            cb();
          }
        });
      },
      function(cb) {
        Product
        .create(product_02)
        .exec(function(err, newProduct) {
          if(err) {
            cb(err);
          }
          else {
            product_02.id = newProduct.id;
            cb();
          }
        });
      }
    ], function(err) {
      done(err);
    })
  });

  // Before: Create a manager User
  before(function(done) {
    User
    .create(user_manager_01)
    .exec(function(err, newUser) {
      if(err) {
        done(err);
      }
      else {
        user_manager_01.id = newUser.id;
        done();
      }
    });
  });

  // Before: Create a regular User
  before(function(done) {
    User
    .create(user_customer_01)
    .exec(function(err, newUser) {
      if(err) {
        done(err);
      }
      else {
        user_customer_01.id = newUser.id;
        done();
      }
    });
  });

  /**
  * Add a Purchase as a manager User
  */
  describe('#add() as a manager User', function() {

    // Before: Log in as a manager User
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: user_manager_01.email,
        password: user_manager_01.password
      })
      .expect(200)
      .end(done);
    });

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .expect(200)
      .end(done);
    });

    // Test
    it('As a manager User, should create a Purchase with 2 Products', function (done) {
      agent
      .post('/purchase')
      .send({
        // purchaseDate is optionnal
        // manager is optionnal
        products: [
          {product: product_01.id, quantity: 100},
          {product: product_02.id, quantity: 75},
          {product: product_01.id, quantity: 50},
          {product: product_02.id, quantity: 15},
          {product: product_02.id, quantity: 75}
        ]
      })
      .end(function(err, res) {
        done(err);
      });
    });
  });


  /**
  * Add as a regular user
  */
  describe('#add() as a regular User', function() {

    // Before: Log in as a regular user
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: user_customer_01.email,
        password: user_customer_01.password
      })
      .end(done);
    });

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('As a regular user, can\'t create a Purchase', function (done) {
      agent
      .post('/purchase')
      .send({
        // purchaseDate is optionnal
        // manager is optionnal
        products: [
          {product: product_01.id, quantity: 1},
          {product: product_02.id, quantity: 12}
        ]
      })
      .expect(401)
      .end(done);
    });
  });

  describe('#update() as a manager User', function() {

    // Before: Log in as a manager User
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: user_manager_01.email,
        password: user_manager_01.password
      })
      .end(done);
    });

    // Before: Get a created Purchase's Id
    var purchaseId;
    before(function(done) {
      Purchase
      .find()
      .limit(1)
      .exec(function(err, foundPurchases) {
        if(err) {
          done(err);
        }
        else {
          purchaseId = foundPurchases[0].id;
          done();
        }
      });
    });

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('As a manager User, update a created Purchase', function (done) {
      agent
      .patch('/purchase/' + purchaseId)
      .send({
        products: [
          {product: product_01.id, quantity: 10}
        ]
      })
      .expect(200)
      .end(done);
      // TODO Should also check the new values
    });
  });

  describe('#delete() as a regular User', function() {

    // Before: Log in as a regular User
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: user_customer_01.email,
        password: user_customer_01.password
      })
      .end(done);
    });

    // Before: Get a created Purchase's Id
    var purchaseId;
    before(function(done) {
      Purchase
      .find()
      .limit(1)
      .exec(function(err, foundPurchases) {
        if(err) {
          done(err);
        }
        else {
          purchaseId = foundPurchases[0].id;
          done();
        }
      });
    });

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('As a regular User, can\'t delete a Purchase', function (done) {
      agent
      .delete('/purchase/' + purchaseId)
      .expect(401, done);
    });
  });


  describe('#delete() as a manger User', function() {

    // Before: Log in as a regular User
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: user_manager_01.email,
        password: user_manager_01.password
      })
      .end(done);
    });

    // Before: Get a created Purchase's Id
    var purchaseId;
    before(function(done) {
      Purchase
      .find()
      .limit(1)
      .exec(function(err, foundPurchases) {
        if(err) {
          done(err);
        }
        else {
          purchaseId = foundPurchases[0].id;
          done();
        }
      });
    });

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('As a manager User, delete a Purchase', function (done) {
      agent
      .delete('/purchase/' + purchaseId)
      .expect(200)
      .end(done);
    });
  });

});
