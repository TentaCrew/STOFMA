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
}

describe('SaleController', function() {

  // Before: Instantiate an user agent
  before(function(done) {
    agent = request.agent(sails.hooks.http.app);
    done();
  });

  /**
  * Add a Sale as a manager User
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
    it('As a manager User, should create 2 Sales with 2 and 3 Pair of Products', function (done) {
      agent
      .post('/sale')
      .send({
        // saleDate is optionnal
        // manager is optionnal
        customerId: user_customer_01.id,
        products: [
          {product: product_01.id, quantity: 1},
          {product: product_02.id, quantity: 12}
        ]
      })
      .expect(200, function(){
        agent
        .post('/sale')
        .send({
          // saleDate is optionnal
          // manager is optionnal
          customerId: user_customer_02.id,
          products: [
            {product: product_01.id, quantity: 2},
            {product: product_02.id, quantity: 5},
            {product: product_03.id, quantity: 1},
            {product: product_04.id, quantity: 1}
          ]
        })
        .end(function(){
          agent
          .post('/sale')
          .send({
            // saleDate is optionnal
            // manager is optionnal
            customerId: user_customer_02.id,
            products: [
              {product: product_03.id, quantity: 2},
              {product: product_01.id, quantity: 4},
              {product: product_04.id, quantity: 1}
            ]
          })
          .end(done);
        });
      });
    });
  });

  describe('#add() as a manager User with not enough credit', function() {

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

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('Shouldn\'t add the new Sale because of the user doesn\'t have enough credit', function (done) {
      agent
      .post('/sale')
      .send({
        // saleDate is optionnal
        // manager is optionnal
        customerId: user_customer_01.id,
        products: [
          {product: product_01.id, quantity: 100},
          {product: product_02.id, quantity: 1200}
        ]
      })
      .expect(406)
      .end(done);
      // TODO Should also check the new values
    });
  });

  /**
  * Add as a regular user
  */
  describe('#add() as a regular User', function() {

    // Before: Log in as a manager User
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: user_customer_02.email,
        password: user_customer_02.password
      })
      .expect(200)
      .end(done);
    });

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('As a regular user, can\'t create a Sale', function (done) {
      agent
      .post('/sale')
      .send({
        // saleDate is optionnal
        // manager is optionnal
        customerId: user_customer_01.id,
        products: [
          {product: product_01.id, quantity: 1},
          {product: product_02.id, quantity: 12}
        ]
      })
      .expect(401)
      .end(done);
    });
  });

  describe('#update() as a manager User with not enough credit', function() {

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

    // Before: Get a created Sale's Id
    var saleId;
    before(function(done) {
      Sale
      .find()
      .limit(1)
      .exec(function(err, foundSales) {
        if(err) {
          done(err);
        }
        else {
          saleId = foundSales[0].id;
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
    it('As a manager User, can\'t update the created Sale because of the user doesn\'t have enough credit', function (done) {
      agent
      .patch('/sale/' + saleId)
      .send({
        products: [
          {product: product_01.id, quantity: 5000}
        ]
      })
      .expect(406)
      .end(done);
      // TODO Should also check the new values
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

    // Before: Get a created Sale's Id
    var saleId;
    before(function(done) {
      Sale
      .find()
      .limit(1)
      .exec(function(err, foundSales) {
        if(err) {
          done(err);
        }
        else {
          saleId = foundSales[0].id;
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
    it('As a manager User, update a created Sale', function (done) {
      agent
      .patch('/sale/' + saleId)
      .send({
        products: [
          {product: product_03.id, quantity: 9}
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
        email: user_customer_02.email,
        password: user_customer_02.password
      })
      .end(done);
    });

    // Before: Get a created Sale's Id
    var saleId;
    before(function(done) {
      Sale
      .find()
      .limit(1)
      .exec(function(err, foundSales) {
        if(err) {
          done(err);
        }
        else {
          saleId = foundSales[0].id;
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
    it('As a regular User, can\'t delete a Sale', function (done) {
      agent
      .delete('/sale/' + saleId)
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

    // Before: Get a created Sale's Id
    var saleId;
    before(function(done) {
      Sale
      .find()
      .limit(1)
      .exec(function(err, foundSales) {
        if(err) {
          done(err);
        }
        else {
          saleId = foundSales[0].id;
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
    it('As a manager User, delete a Sale', function (done) {
      agent
      .delete('/sale/' + saleId)
      .expect(200)
      .end(done);
    });
  });

});
