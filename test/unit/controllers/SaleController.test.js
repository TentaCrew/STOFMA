'use strict';

var request = require('supertest');
var agent;

/**
* Setting up some variables for the tests
*/
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

  var user_customer_01 = {
    firstname:  'lucie',
    name:       'customer',
    email:      'lucie@customer.fr',
    sex:        false,
    role:       'USER',
    credit:     100,
    password:   'catword'
  };

  var user_customer_02 = {
    firstname:  'coco',
    name:       'rico',
    email:      'coco@ri.co',
    sex:        false,
    role:       'USER',
    credit:     10,
    password:   'rico'
  };

  var product_01 = {
    name:      'prod_sale_2',
    shortName: 'ps2',
    price:     0.50,
    urlImage:  '',
    minimum:   5,
    category:  'FOOD'
  };

  var product_02 = {
    name:      'prod_sale_1',
    shortName: 'ps1',
    price:     0.50,
    urlImage:  '',
    minimum:   5,
    category:  'DRINK'
  };

}

describe('SaleController', function() {

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

  // Before: Create a regular User
  before(function(done) {
    User
    .create(user_customer_02)
    .exec(function(err, newUser) {
      if(err) {
        done(err);
      }
      else {
        user_customer_02.id = newUser.id;
        done();
      }
    });
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
    it('As a manager User, should create a Sale with 2 Products', function (done) {
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
      .expect(200,done);
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
          {product: product_01.id, quantity: 2}
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
