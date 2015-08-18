'use strict';

var request = require('supertest');
var agent;

/**
* Setting up some variables for the tests
* TODO : Set them to global
*/
{
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
  var product_01 = {
    id:         1,
    name:      'product_1',
    shortName: 'ps1',
    price:     0.50,
    urlImage:  '',
    minimum:   5,
    category:  'FOOD'
  };
  var product_02 = {
    id:         2,
    name:      'product_2',
    shortName: 'ps2',
    price:     0.50,
    urlImage:  '',
    minimum:   5,
    category:  'DRINK'
  };
  var product_03 = {
    id:         3,
    name:      'product_3',
    shortName: 'ps3',
    price:     0.90,
    urlImage:  '',
    minimum:   15,
    category:  'OTHER'
  };
  var product_04 = {
    id:         4,
    name:      'product_4',
    shortName: 'ps4',
    price:     0.10,
    urlImage:  '',
    minimum:   10,
    category:  'FOOD'
  };
}

describe('PurchaseController', function() {

  // Before: Instantiate an user agent
  before(function(done) {
    agent = request.agent(sails.hooks.http.app);
    done();
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
