'use strict';

var request = require('supertest');
var agent;

{
  var user_manager_01 = {
    firstname: 'manager',
    name:      'michel',
    email:     'manager@sale.com',
    sex:       true,
    role:      'MANAGER',
    credit:    100,
    password:  'sale'
  };

  var product_04 = {
    name:      'prod_sale_4',
    shortName: 'ps4',
    price:     0.10,
    urlImage:  '',
    minimum:   10,
    category:  'FOOD'
  };
}

describe('StockController', function() {

  // Before: Instantiate an user agent
  before(function(done) {
    agent = request.agent(sails.hooks.http.app);
    done();
  });

  describe('#get the stock (not loaded yet) for a product', function() {

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
    var productId;
    before(function(done) {
      Product
      .find(product_04)
      .limit(1)
      .exec(function(err, foundProduct) {
        if(err) {
          done(err);
        }
        else {
          productId = foundProduct[0].id;
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
    it('Should return the quantity of items', function (done) {
      agent
      .get('/stock/'+productId)
      .expect(200)
      .end(function(err, res){
        done();
      });
    });
  });

  describe('#get the stock for a product', function() {

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
    var productId;
    before(function(done) {
      Product
      .find(product_04)
      .limit(1)
      .exec(function(err, foundProduct) {
        if(err) {
          done(err);
        }
        else {
          productId = foundProduct[0].id;
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
    it('Should return the quantity of items', function (done) {
      agent
      .get('/stock/'+productId)
      .expect(200)
      .end(function(err, res){
        done();
      });
    });
  });

});
