var request = require('supertest');
var agent;

describe('SaleController', function() {

  before(function(done) {
    agent = request.agent(sails.hooks.http.app);
    done();
  });

  var createdSale;
  describe('#add() as manager', function() {
    var manager;
    //log in (and sign up) as manager
    before(function(done){
      agent
       .post('/user')
       .send({
         firstname:  'manager',
         name:       'dupond',
         email:      'manager@sale.com',
         sex:        true,
         role:       'MANAGER',
         password:   'sale'
       })
       .end(function(err, m) {
         manager = m.body;
         done(err);
       });
    });
    //log out after the test
    after(function(done) {
       agent
        .put('/user/logout')
        .end(function(err, res) {
          done(err);
        });
    });
    //test
    it('should create two products and add them to a sale', function (done) {
      agent
       .post('/pair')
       .send({
         pairs: [
           {
             quantity: 2,
             product:  {
               name:      'prod_sale_2',
               shortName: 'ps2',
               price:     0.50,
               quantity:  20,
               urlImage:  '',
               minimum:   5,
               category:  'FOOD'
             }
           },
           {
             quantity: 1,
             product:  {
               name:      'prod_sale_1',
               shortName: 'ps1',
               price:     0.50,
               quantity:  25,
               urlImage:  '',
               minimum:   5,
               category:  'DRINK'
             }
           }
        ]
       })
       .end(function(err, pairsToAdd) {
         agent
          .post('/sale')
          .send({
            saleDate: '11/08/1993',
            customer: {
              firstname:  'lucie',
              name:       'customer',
              email:      'lucie@customer.fr',
              sex:        false,
              role:       'USER',
              password:   'catword'
            },
            manager:  manager.id,
            amount:   119.99,
            products: [
              pairsToAdd.body[0],
              pairsToAdd.body[1]
            ] //  pairs.body
          })
          .end(function(err2,sale) {
            agent
             .get('/sale/'+sale.body.id+'/pairs')
             .end(function(err3, pairs) {
               agent
                .get('/pair/'+pairs.body[0].id+'/product')
                .expect(200, function(errPairs, product0){
                  done();
                });
             });
          });
       });
     });
  });

  describe('#add() as user', function() {
    var manager;
    //log in (and sign up) as user
    before(function(done){
      agent
       .post('/user')
       .send({
         firstname:  'user_sale',
         name:       'dupond',
         email:      'user_sale@sale.com',
         sex:        true,
         role:       'USER',
         password:   'sale'
       })
       .end(function(err, m) {
         manager = m.body;
         done(err);
       });
    });
    //log out after the test
    after(function(done) {
       agent
        .put('/user/logout')
        .end(function(err, res) {
          done(err);
        });
    });
    //test
    it('should respond with a 401 status because only administrators and manager can add a sale', function (done) {
      agent
       .post('/pair')
       .send({
         pairs: [
           {
             quantity: 2,
             product:  {
               name:      'prod_sale_3',
               shortName: 'ps3',
               price:     0.75,
               quantity:  10,
               urlImage:  '',
               minimum:   5,
               category:  'FOOD'
             }
           }
        ]
       })
       .end(function(err, pairs) {
         agent
          .post('/sale')
          .send({
            saleDate: '11/08/2015',
            customer: {
              firstname:  'lucie',
              name:       'hmpl',
              email:      'lucie@customer.fr',
              sex:        false,
              role:       'USER',
              password:   'ilovecat'
            },
            manager:  manager.id,
            amount:   119.99,
            products: pairs.body
          })
          .expect(401, done);
       });
     });
  });

  // TODO: Need to fix SaleController:update and PairController:update
  /*describe('#update() as manager', function() {
    var manager;
    //log in as user
    before(function(done){
      agent
       .put('/user/login')
       .send({
         email:      'manager@sale.com',
         password:   'sale'
       })
       .end(function(err, m) {
         manager = m.body;
         done(err);
       });
    });
    //log out after the test
    after(function(done) {
       agent
        .put('/user/logout')
        .end(function(err, res) {
          done(err);
        });
    });
    //test
    it('should update the sale', function (done) {
      console.log(createdSale);
      agent
       .patch('/pair/' + createdSale.products)
       .send({
         pairs: [
           {
             quantity: 4,
             product:  {
               name:      'prod_sale_4',
               shortName: 'ps4',
               price:     0.75,
               quantity:  11,
               urlImage:  '',
               minimum:   5,
               category:  'DRINK'
             }
           }
        ]
       })
       .end(function(err, pairs) {
         agent
          .patch('/sale/' + createdSale)
          .send({
            saleDate: '11/08/2015',
            customer: {
              firstname:  'lucie',
              name:       'hmpl',
              email:      'lucie@customer.fr',
              sex:        false,
              role:       'USER',
              password:   'ilovecat'
            },
            manager:  manager.id,
            amount:   19.99//,
            //products: pairs.body
          })
          .expect(200, done);
       });
     });
  });*/

  describe('#delete() as user', function() {
    //log in (and sign up) as user
    before(function(done){
      agent
       .post('/user')
       .send({
         firstname:  'lucie',
         name:       'again',
         email:      'lucie@again.fr',
         sex:        false,
         role:       'USER',
         password:   'man'
       })
       .end(function(err, m) {
         manager = m.body;
         done(err);
       });
    });
    //log out after the test
    after(function(done) {
       agent
        .put('/user/logout')
        .end(function(err, res) {
          done(err);
        });
    });
    //test
    it('should respond with a 401 status because only administrators and manager can add a sale', function (done) {
      agent
       .delete('/sale/' + createdSale)
       .expect(401, done);
     });
  });

  describe('#delete() as manager', function() {
    //log in as manager
    before(function(done){
      agent
       .put('/user/login')
       .send({
         email:      'manager@sale.com',
         password:   'sale'
       })
       .end(function(err, m) {
         done(err);
       });
    });
    //log out after the test
    after(function(done) {
       agent
        .put('/user/logout')
        .end(function(err, res) {
          done(err);
        });
    });
    //test
    it('should delete the sale', function (done) {
      agent
       .delete('/sale/' + createdSale)
       .expect(200, done);
     });
  });

});
