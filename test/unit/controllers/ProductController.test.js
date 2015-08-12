var request = require('supertest');
var agent;

describe('ProductController', function() {

  before(function(done) {
    agent = request.agent(sails.hooks.http.app);
    done();
  });

  describe('#add() as manager', function() {

    //sign up as manager before test
    before(function(done) {
      agent
      .post('/user')
      .send({
        firstname:  'man',
        name:       'ager',
        email:      'mana@ger.com',
        sex:        true,
        role:       'MANAGER',
        password:   'pwd'
      })
      .end(function(err, res) {
        done(err);
      });
    });

    //test
    it('should create a product', function (done) {
      agent
      .post('/product')
      .send({
        name:      'coca cola',
        shortName: 'COCA1',
        price:      0.50,
        urlImage:  '',
        minimum:   10,
        category:  'DRINK'
      })
      .expect(200, done)
    });
  });

  describe('#add() as manager but with a wrong category', function() {

    //test
    it('should respond with a 400 status because the category doesn\'t exist', function (done) {
      agent
      .post('/product')
      .send({
        name:      'black cat',
        shortName: 'meiko',
        price:      6000,
        urlImage:  '',
        minimum:   1,
        category:  'ANIMAL'
      })
      .expect(400, done)
    });
  });

  describe('#add() as manager but with an existant product', function() {

    //log out after the test
    after(function(done) {
      agent
      .put('/user/logout')
      .end(function(err, res) {
        done(err);
      });
    });

    it('should respond with a 400 status because the name is already used', function (done) {
      agent
      .post('/product')
      .send({
        name:      'coca cola',
        shortName: 'COCA2',
        price:      0.50,
        urlImage:  '',
        minimum:   5,
        category:  'DRINK'
      })
      .expect(400, done)
    });
  });

  describe('#add() as simple user', function() {

    //sign up as simple user before test
    before(function(done) {
      agent
      .post('/user')
      .send({
        firstname:  'simple',
        name:       'girl',
        email:      'simple@girl.com',
        sex:        false,
        role:       'USER',
        password:   'simple'
      })
      .end(function(err, res) {
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

});
