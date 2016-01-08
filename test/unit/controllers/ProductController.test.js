'use strict';

var data = require('../../datatest.js');
var assert = require('assert');
var request = require('supertest');
var agent;

describe('ProductController', function() {

  before(function(done) {
    agent = request.agent(sails.hooks.http.app);
    done();
  });

  describe('#add() as manager', function() {

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

    //test
    it('should create a product', function (done) {
      agent
      .post('/product')
      .send({
        id:        data.product_08.id,
        name:      data.product_08.name,
        shortName: data.product_08.shortName,
        quantity:  data.product_08.quantity,
        price:     data.product_08.price,
        urlImage:  data.product_08.urlImage,
        minimum:   data.product_08.minimum,
        category:  data.product_08.category
      })
      .expect(200, done)
    });
  });

  describe('#add() as manager but with a wrong category', function() {

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

    //test
    it('should respond with a 400 status because the category doesn\'t exist', function (done) {
      agent
      .post('/product')
      .send({
        name:      'black cat',
        shortName: 'meiko',
        price:      6000,
        quantity:  1,
        urlImage:  '',
        minimum:   1,
        category:  'ANIMAL'
      })
      .expect(400, done)
    });
  });

  describe('#add() as manager but with an existant product', function() {

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

    it('should respond with a 400 status because the name is already used', function (done) {
      agent
      .post('/product')
      .send({
        name:      data.product_02.name,
        shortName: data.product_02.shortName,
        quantity:  data.product_02.quantity,
        price:     data.product_02.price,
        urlImage:  data.product_02.urlImage,
        minimum:   data.product_02.minimum,
        category:  data.product_02.category
      })
      .expect(400, done)
    });
  });

  describe('#add() as simple user', function() {

    // Before: Log in as a manager User
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: data.user_customer_03.email,
        password: data.user_customer_03.password
      })
      .end(done);
    })

    //log out after the test
    after(function(done) {
      agent
      .put('/user/logout')
      .end(function(err, res) {
        done(err);
      });
    });

    //test
    it('should respond with a 401 status because the user has no sufficient privileges', function (done) {
      agent
      .post('/product')
      .send({
        name:      'kinder bueno',
        shortName: 'bueno',
        price:      0.80,
        urlImage:  '',
        minimum:   15,
        category:  'FOOD'
      })
      .expect(401, done)
    });
  });

  describe('#update() as manager', function() {

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

    it('should update the prices of product with 11 (not member) and 0 (member)', function (done) {
      agent
      .patch('/product/'+data.product_09.id)
      .send({
        price: 11,
        memberPrice: 0
      })
      .expect(200)
      .end(function(err,res){
        assert.equal(res.body[0].price, 11, 'The price hasn\'t changed.');
        assert.equal(res.body[0].memberPrice, 0, 'The member price hasn\'t changed.');
        done();
      });
    });

    it('should update the prices of product with 0 (not member) and 0 (member)', function (done) {
      agent
      .patch('/product/'+data.product_09.id)
      .send({
        price: 0,
        memberPrice: 0
      })
      .expect(200)
      .end(function(err,res){
        assert.equal(res.body[0].price, 0, 'The price hasn\'t changed.');
        assert.equal(res.body[0].memberPrice, 0, 'The member price hasn\'t changed.');
        done();
      });
    });

    it('should update the prices of product with 1 (not member) and 3 (member)', function (done) {
      agent
      .patch('/product/'+data.product_09.id)
      .send({
        price: 1,
        memberPrice: 3
      })
      .expect(200)
      .end(function(err,res){
        assert.equal(res.body[0].price, 1, 'The price hasn\'t changed.');
        assert.equal(res.body[0].memberPrice, 3, 'The member price hasn\'t changed.');
        done();
      });
    });

    it('should NOT update an not existing product', function (done) {
      agent
      .patch('/product/meiko0912')
      .send({
        price: 1,
        memberPrice: 3
      })
      .expect(404, done);
    });
  });

  describe('#get() as manager', function() {

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

    it('should get a product', function (done) {
      agent
      .get('/product/'+data.product_09.id)
      .expect(200, done);
    });

    it('should NOT get an not existing product', function (done) {
      agent
      .get('/product/meiko0912')
      .expect(404, done);
    });
  });

  describe('#delete() as manager', function() {

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

    it('should delete a product', function (done) {
      agent
      .delete('/product/'+data.product_09.id)
      .send({
        price: 1,
        memberPrice: 3
      })
      .expect(200, done);
    });

    it('should NOT delete an not existing product', function (done) {
      agent
      .delete('/product/meiko0912')
      .send({
        price: 1,
        memberPrice: 3
      })
      .expect(404, done);
    });
  });

  describe('handling member prices', function() {

    it('should automatically set the memberPrice to the price when not provided', function(done) {

      Product
        .create({
          name:       'Fake product',
          shortName:  'Fke Prdct',
          price:      1.0,
          urlImage:   '',
          minimum:    0,
          category:   'OTHER'
        })
        .exec(function(err, newProduct) {
          if(err) {
            done(err);
          }
          else if(newProduct.price !== newProduct.memberPrice) {
            done(new Error("memberPrice not equal to price"));
          }
          else {
            done();
          }
        })

    });

    it('should not automatically set the memberPrice to the price since when provided', function(done) {

      Product
        .create({
          name:       'Fake product2',
          shortName:  'Fke Prdct2',
          price:      1.0,
          memberPrice: 2.0,
          urlImage:   '',
          minimum:    0,
          category:   'OTHER'
        })
        .exec(function(err, newProduct) {
          if(err) {
            done(err);
          }
          else if(newProduct.price === newProduct.memberPrice) {
            done(new Error("memberPrice equal to price"));
          }
          else {
            done();
          }
        })

    });

  });

});
