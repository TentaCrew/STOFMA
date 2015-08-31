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
    it('As a manager User, should create several', function (done) {
      Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsBefore){
        User.findOne(data.user_admin_01.id, function(err,user){
          //get the credit's user admin before the sale
          var oldCredit = user.credit;
          agent
          .post('/sale')
          .send({
            customerId: data.user_customer_02.id,
            typePayment: 'IN_CREDIT',
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
              typePayment: 'IN_CREDIT',
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
                typePayment: 'IN_CREDIT',
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

                  User.findOne(data.user_customer_02.id, function(err,userBefore2){
                    agent
                    .post('/sale')
                    .send({

                      // saleDate is optionnal
                      // manager is optionnal
                      customerId: data.user_customer_02.id,
                      typePayment: 'IN_CASH',
                      products: [
                        {product: data.product_04.id, quantity: 100},
                      ]
                    })
                    .end(function(err,res){
                      User.findOne(data.user_customer_02.id, function(err,userAfter2){
                        assert.equal(userBefore2.credit, userAfter2.credit, 'The credit shouldn\'t change because it is a payment in cash');
                        done();
                      });
                    });
                  });
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
            typePayment: 'IN_CREDIT',
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
        typePayment: 'IN_CREDIT',
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

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('As a manager User, can\'t update the created Sale because of the user doesn\'t have enough credit', function (done) {
      Product.find([{id: data.product_01.id}], function(err,productBefore){
        User.findOne(data.sale_01.customer, function(err,user){
          //get the credit's user before the sale
          var oldCredit = user.credit;
          agent
          .patch('/sale/' + data.sale_01.id)
          .send({
            typePayment: 'IN_CREDIT',
            products: [
              {product: data.product_01.id, quantity: 5000}
            ]
          })
          .expect(406)
          .end(function(){
            User.findOne(data.sale_01.customer, function(err,userAfter){
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

  describe('#update() as a manager User (1 / 4)', function() {

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
    it('As a manager User, update a created Sale (CREDIT -> CREDIT)', function (done) {
      Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsBefore){
        agent
        .patch('/sale/2')
        .send({
          typePayment: 'IN_CREDIT',
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

  describe('#update() as a manager User (test update of payment\'s way - 2 / 4)', function() {

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
    it('As a manager User, update a created Sale  (CREDIT -> CASH)', function (done) {
      Sale.findOne({id: data.sale_04.id}).populate('customer').populate('payment').exec(function(err,sale04Before){
        agent
        .patch('/sale/4')
        .send({
          typePayment: 'IN_CASH',
          products: [
            {product: data.product_03.id, quantity: 70}
          ]
        })
        .expect(200)
        .end(function(){
          Sale.findOne({id: data.sale_04.id}).populate('customer').populate('payment').exec(function(err,sale04After){
            assert.equal(sale04After.customer.credit,  sale04Before.customer.credit + sale04Before.totalPrice, 'Customer hasn\'t been reimbursed correctly.');
            assert.equal(sale04Before.payment.type, 'IN_CREDIT', 'The old payment type is not good.');
            assert.equal(sale04After.payment.type, 'IN_CASH', 'The new payment type is not good.');
            done();
          });
        });
      });
    });
  });

  describe('#update() as a manager User (test update of payment\'s way - 3 / 4)', function() {

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
    it('As a manager User, update a created Sale (CASH -> CASH)', function (done) {
      Sale.findOne({id: data.sale_05.id}).populate('customer').populate('payment').exec(function(err,sale05Before){
        agent
        .patch('/sale/5')
        .send({
          typePayment: 'IN_CASH',
          products: [
            {product: data.product_03.id, quantity: 90}
          ]
        })
        .expect(200)
        .end(function(){
          Sale.findOne({id: data.sale_05.id}).populate('customer').populate('payment').exec(function(err,sale05After){
            assert.equal(sale05After.customer.credit,  sale05Before.customer.credit, 'Customer\'s credit shouldn\'t change.');
            assert.equal(sale05After.payment.type, 'IN_CASH', 'The new payment type is not good.');
            done();
          });
        });
      });
    });
  });

  describe('#update() as a manager User (test update of payment\'s way - 4 / 4) with no enough credit', function() {

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

    //Credit his account
    before(function(done){
      agent
      .patch('/user/'+data.sale_06.customer+'/credit')
      .send({credit: 9})
      .end(done);
    });

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('As a manager User, update a created Sale (CASH -> CREDIT)', function (done) {
      Sale.findOne({id: data.sale_06.id}).populate('customer').populate('payment').exec(function(err,sale06Before){
        agent
        .patch('/sale/6')
        .send({
          typePayment: 'IN_CREDIT',
          products: [
            {product: data.product_03.id, quantity: 1}
          ]
        })
        .end(function(){
          Sale.findOne({id: data.sale_06.id}).populate('customer').populate('payment').exec(function(err,sale06After){
            assert.equal(sale06Before.customer.credit, sale06After.customer.credit, 'User\'s credit shouldn\'t change.');
            done();
          });
        });
      });
    });
  });

  describe('#update() as a manager User (test update of payment\'s way - 4 bis / 4)', function() {

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

    //Credit his account
    before(function(done){
      agent
      .patch('/user/'+data.sale_06.customer+'/credit')
      .send({credit: 20})
      .end(done);
    });

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('As a manager User, update a created Sale (CASH -> CREDIT)', function (done) {
      Sale.findOne({id: data.sale_06.id}).populate('customer').populate('payment').exec(function(err,sale06Before){
        agent
        .patch('/sale/6')
        .send({
          typePayment: 'IN_CREDIT',
          products: [
            {product: data.product_03.id, quantity: 1}
          ]
        })
        .end(function(){
          Sale.findOne({id: data.sale_06.id}).populate('customer').populate('payment').exec(function(err,sale06After){
            assert.equal(sale06Before.customer.credit - sale06After.totalPrice,  sale06After.customer.credit, 'New credit is not good.');
            assert.equal(sale06After.payment.type, 'IN_CREDIT', 'The new payment type is not good.');
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

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('As a regular User, can\'t delete a Sale', function (done) {
      agent
      .delete('/sale/' + data.sale_01.id)
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

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('As a manager User, delete a Sale', function (done) {
      Sale.findOne({id:data.sale_01.id},function(err,saleBefore){
        Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsBefore){
          User.findOne({id:data.sale_01.customer}, function(err,userBefore){
            //get the credit's user before the sale
            agent
            .delete('/sale/'+data.sale_01.id)
            .expect(200)
            .end(function(){
              User.findOne({id:data.sale_01.customer}, function(err,userAfter){
                assert.equal(userBefore.credit+saleBefore.totalPrice, userAfter.credit, 'The new credit is not good.');
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

});
