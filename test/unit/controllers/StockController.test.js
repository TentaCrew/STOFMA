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
