'use strict';

var data = require('../../datatest.js');
var assert = require('assert');
var request = require('supertest');
var agent;

describe('PaymentController', function() {

  before(function(done) {
    agent = request.agent(sails.hooks.http.app);
    done();
  });

  describe('#add() as manager with missing items', function() {

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
    it('shouldn\'t add a payment (one argument is missing)', function (done) {
      agent
      .post('/payment')
      .send({
        paymentDate : '2016-01-07T23:54:54.001Z',
        customer    : 99,
        name        : 'Liquide',
        manager     : 99,
        amount      : 0
      })
      .expect(400, done);
    });
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
    it('should add a payment', function (done) {
      agent
      .post('/payment')
      .send({
        paymentDate : '2016-01-07T23:54:54.001Z',
        customer    : 99,
        name        : 'Liquide',
        manager     : 99,
        amount      : 0,
        type        : 'IN_CASH'
      })
      .expect(200, done);
    });
  });
});
