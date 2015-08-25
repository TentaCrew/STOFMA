'use strict';

var data = require('../../datatest.js');
var assert = require('assert');
var request = require('supertest');
var agent;

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
        email: data.user_manager_01.email,
        password: data.user_manager_01.password
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
      Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsBefore){
        User.findOne(data.user_admin_01.id, function(err,user){
          //get the credit's user admin before the sale
          var oldCredit = user.credit;
          agent
          .post('/sale')
          .send({
            customerId: data.user_customer_02.id,
            products: [
              {product: data.product_01.id, quantity: 1},
              {product: data.product_02.id, quantity: 12}
            ]
          })
          .expect(200)
          .end(function(){
            agent
            .post('/sale')
            .send({
              customerId: data.user_admin_01.id,
              products: [
                {product: data.product_01.id, quantity: 2},
                {product: data.product_02.id, quantity: 5},
                {product: data.product_03.id, quantity: 1},
                //{product: data.product_03.id, quantity: 1},     //currently ignored because of concurrent access to the resource
                {product: data.product_04.id, quantity: 1}
              ]
            })
            .end(function(err,sale){
              User.findOne(data.user_admin_01.id, function(err,userAfter){
                assert.equal(oldCredit-sale.body.totalPrice, userAfter.credit, 'The new credit is not good.');
              });
              agent
              .post('/sale')
              .send({
                // saleDate is optionnal
                // manager is optionnal
                customerId: data.user_admin_01.id,
                products: [
                  {product: data.product_03.id, quantity: 2},
                  {product: data.product_01.id, quantity: 4},
                  {product: data.product_04.id, quantity: 1}
                ]
              })
              .end(function(){
                Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsAfter){
                  assert.equal(productsAfter[0].quantity,  productsBefore[0].quantity - 7,  'Wrong quantity of product_01');
                  assert.equal(productsAfter[1].quantity,  productsBefore[1].quantity - 17, 'Wrong quantity of product_02');
                  assert.equal(productsAfter[2].quantity,  productsBefore[2].quantity - 3,  'Wrong quantity of product_03');
                  assert.equal(productsAfter[3].quantity,  productsBefore[3].quantity - 2,  'Wrong quantity of product_04');
                  done();
                });
              });
            });
          });
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
        email: data.user_manager_01.email,
        password: data.user_manager_01.password
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
      Product.find([{id: data.product_01.id},{id: data.product_02.id}], function(err,productsBefore){
        User.findOne(data.user_customer_01.id, function(err,user){
          //get the credit's user before the sale
          var oldCredit = user.credit;
          agent
          .post('/sale')
          .send({
            // saleDate is optionnal
            // manager is optionnal
            customerId: data.user_customer_01.id,
            products: [
              {product: data.product_01.id, quantity: 100},
              {product: data.product_02.id, quantity: 1200}
            ]
          })
          .expect(406)
          .end(function(err,sale){
            User.findOne(data.user_customer_01.id, function(err,userAfter){
              assert.equal(oldCredit, userAfter.credit, 'Credit\'s user has changed, but it shouldn\'t.');
              Product.find([{id: data.product_01.id},{id: data.product_02.id}], function(err,productsAfter){
                assert.equal(productsAfter[0].quantity, productsBefore[0].quantity, 'Wrong quantity of product_01');
                assert.equal(productsAfter[1].quantity, productsBefore[1].quantity, 'Wrong quantity of product_02');
                done();
              });
            });
          });
        });
      });
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
        email: data.user_customer_02.email,
        password: data.user_customer_02.password
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
        customerId: data.user_customer_01.id,
        products: [
          {product: data.product_01.id, quantity: 1},
          {product: data.product_02.id, quantity: 12}
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
        email: data.user_manager_01.email,
        password: data.user_manager_01.password
      })
      .end(done);
    });

    // Before: Get a created Sale's Id
    var sale;
    before(function(done) {
      Sale
      .find()
      .limit(1)
      .exec(function(err, foundSales) {
        if(err) {
          done(err);
        }
        else {
          sale = foundSales[0];
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
      Product.find([{id: data.product_01.id}], function(err,productBefore){
        User.findOne(sale.customer, function(err,user){
          //get the credit's user before the sale
          var oldCredit = user.credit;
          agent
          .patch('/sale/' + sale.id)
          .send({
            products: [
              {product: data.product_01.id, quantity: 5000}
            ]
          })
          .expect(406)
          .end(function(){
            User.findOne(sale.customer, function(err,userAfter){
              assert.equal(oldCredit, userAfter.credit, 'Credit\'s user has changed, but it shouldn\'t.');
              Product.find([{id: data.product_01.id}], function(err,productAfter){
                assert.equal(productAfter[0].quantity, productBefore[0].quantity, 'Wrong quantity of product_01');
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('#update() as a manager User', function() {

    // Before: Log in as a manager User
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: data.user_manager_01.email,
        password: data.user_manager_01.password
      })
      .end(done);
    });

    // Before: Get a created Sale's Id
    var saleId;
    before(function(done) {
      Sale.findOne({id: 2}).exec(function(err, foundSales) {
        if(err) {
          done(err);
        }
        else {
          saleId = foundSales.id;
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
      Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsBefore){
        agent
        .patch('/sale/2')
        .send({
          products: [
            // remove {product: data.product_01.id, quantity: 2}
            {product: data.product_03.id, quantity: 9}
            // remove {product: data.product_04.id, quantity: 2}
          ]
        })
        .expect(200)
        .end(function(){
          Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsAfter){
            assert.equal(productsAfter[0].quantity,  productsBefore[0].quantity + 2,  'Wrong quantity of product_01');
            assert.equal(productsAfter[1].quantity,  productsBefore[1].quantity,      'Wrong quantity of product_02');
            assert.equal(productsAfter[2].quantity,  productsBefore[2].quantity - 9,  'Wrong quantity of product_03');
            assert.equal(productsAfter[3].quantity,  productsBefore[3].quantity + 2,  'Wrong quantity of product_04');
            done();
          });
        });
      });
    });
  });

  describe('#delete() as a regular User', function() {

    // Before: Log in as a regular User
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: data.user_customer_02.email,
        password: data.user_customer_02.password
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


  describe('#delete() as a manager User', function() {

    // Before: Log in as a regular User
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: data.user_manager_01.email,
        password: data.user_manager_01.password
      })
      .end(done);
    });

    // Before: Get a created Sale's Id
    var sale;
    before(function(done) {
      Sale.findOne({id: 1}).exec(function(err, foundSales) {
        if(err) {
          done(err);
        }
        else {
          sale = foundSales;
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
      Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsBefore){
        User.findOne(sale.customer, function(err,user){
          //get the credit's user before the sale
          var oldCredit = user.credit;
          agent
          .delete('/sale/1')
          .expect(200)
          .end(function(){
            User.findOne(sale.customer, function(err,userAfter){
              assert.equal(oldCredit+sale.totalPrice, userAfter.credit, 'The new credit is not good.');
              Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsAfter){
                assert.equal(productsAfter[0].quantity,  productsBefore[0].quantity,      'Wrong quantity of product_01');
                assert.equal(productsAfter[1].quantity,  productsBefore[1].quantity + 4,  'Wrong quantity of product_02');
                assert.equal(productsAfter[2].quantity,  productsBefore[2].quantity + 2,  'Wrong quantity of product_03');
                assert.equal(productsAfter[3].quantity,  productsBefore[3].quantity,      'Wrong quantity of product_04');
                done();
              });
            });
          });
        });
      });
    });
  });

});
