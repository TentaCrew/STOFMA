var request = require('supertest');
var agent;

describe('UsersController', function() {

  before(function(done) {
    agent = request.agent(sails.hooks.http.app);
    done();
  });

  describe('#logout()', function() {
    it('should respond with a 401 status because nobody is logged in', function (done) {
      agent
      .put('/user/logout')
      .expect(401, done)
    });
  });

  describe('#signup()', function() {
    it('should create and log in an user', function (done) {
      agent
      .post('/user')
      .send({
        firstname: 'foo',
        name: 'bar',
        email: 'foo@bar.com',
        sex: true,
        password: 'foobar',
        birthdate: '01/01/1991',
        phoneNumber: '+33 3 10 10 10'
      })
      .expect(200, done)
    });
  });

  describe('#logout()', function() {
    it('should log out an user', function (done) {
      agent
      .put('/user/logout')
      .expect(200, done)
    });
  });

  describe('#login()', function() {
    it('should respond with a 404 status because credentials are invalid', function (done) {
      agent
      .put('/user/login')
      .send({
        email: 'bar@foo.com',
        password: 'barfoo'
      })
      .expect(404, done)
    });
  });

  describe('#login()', function() {
    it('should log in an user', function (done) {
      agent
      .put('/user/login')
      .send({
        email: 'foo@bar.com',
        password: 'foobar'
      })
      .expect(200, done);
    });
  });

  describe('#login()', function() {
    it('should respond with a 401 status because user is already logged in', function (done) {
      agent
      .put('/user/login')
      .send({
        email: 'foo@bar.com',
        password: 'foobar'
      })
      .expect(401, done);
    });
  });
});
