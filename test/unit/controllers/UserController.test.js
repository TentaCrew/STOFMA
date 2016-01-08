'use strict';

var data = require('../../datatest.js');
var assert = require('assert');
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
        id:          data.user_customer_04.id,
        firstname:   data.user_customer_04.firstname,
        name:        data.user_customer_04.name,
        email:       data.user_customer_04.email,
        sex:         data.user_customer_04.sex,
        password:    data.user_customer_04.password,
        credit:      data.user_customer_04.credit,  //won't be considered
        role:        data.user_customer_04.role     //won't be considered
      })
      .expect(200)
      .end(function(err, res){
        User.findOne({id: data.user_customer_04.id}, function(err,user){
          assert.equal(user.credit, 0, 'The initial account should be equal to 0');
          assert.equal(user.role, 'USER', 'Before a sign up, the role should be USER');
          done();
        });
      });
    });
  });

  describe('#logout()', function() {
    //login as manager before test
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email: data.user_manager_01.email,
        password: data.user_manager_01.password
      })
      .end(done);
    });
    //test
    it('should log out an user', function (done) {
      agent
      .put('/user/logout')
      .expect(200, done)
    });
  });

  describe('#signup() as manager', function() {
    //login as manager before test
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email: data.user_manager_01.email,
        password: data.user_manager_01.password
      })
      .end(done);
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
    it('should create an user by a manager and not login it', function (done) {
      agent
      .post('/user')
      .send({
        id:          data.user_customer_06.id,
        firstname:   data.user_customer_06.firstname,
        name:        data.user_customer_06.name,
        email:       data.user_customer_06.email,
        sex:         data.user_customer_06.sex,
        password:    data.user_customer_06.password,
        credit:      data.user_customer_06.credit,  //won't be considered
        role:        data.user_customer_06.role     //won't be considered
      })
      .expect(200)
      .end(function(err, res){
        User.findOne({id: data.user_customer_06.id}, function(err,user){
          assert.equal(user.credit, 0, 'The initial account should be equal to 0');
          assert.equal(user.role, 'USER', 'Before a sign up, the role should be USER');

          agent
          .get('/session')
          .expect(200)
          .end(function (err, res) {
            assert.equal(res.body.id, data.user_manager_01.id, 'The id from session must be the id of manager.');

            done();
          });
        });
      });
    });
  });

  describe('#login()', function() {
    it('should respond with a 404 status because credentials are invalid', function (done) {
      agent
      .put('/user/login')
      .send({
        email: data.user_customer_03.email,
        password: 'wrongpwd'
      })
      .expect(404, done)
    });
  });

  describe('#login()', function() {
    it('should log in an user', function (done) {
      agent
      .put('/user/login')
      .send({
        email: data.user_customer_03.email,
        password: data.user_customer_03.password,
      })
      .expect(200, done);
    });
  });

  describe('#login()', function() {
    //log out after the test
    after(function(done) {
      agent
      .put('/user/logout')
      .end(function(err, res) {
        done(err);
      });
    });
    //test
    it('should respond with a 401 status because user is already logged in', function (done) {
      agent
      .put('/user/login')
      .send({
        email: data.user_customer_03.email,
        password: data.user_customer_03.password,
      })
      .expect(401, done);
    });
  });

  describe('#delete() as manager', function() {
    //sign up as manager before test and login
    before(function(done) {
      agent
      .post('/user')
      .send({
        id:         data.user_manager_02.id,
        firstname:  data.user_manager_02.firstname,
        name:       data.user_manager_02.name,
        email:      data.user_manager_02.email,
        sex:        data.user_manager_02.sex,
        role:       data.user_manager_02.role,
        password:   data.user_manager_02.password
      })
      .end(function(){
        agent
          .put('/user/login')
          .send({
            email: data.user_manager_02.email,
            password: data.user_manager_02.password
          })
          .end(function(err, res) {
            done(err);
          });
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
    it('should respond with a 401 status because only administrators can delete an user', function (done) {
      agent
      .delete('/user/'+data.user_customer_03.id)
      .send()
      .expect(401, done);
    });
  });

  describe('#update() as manager', function() {
    //sign up as manager before test
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email: data.user_manager_02.email,
        password: data.user_manager_02.password
      })
      .end(done);
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
    it('should respond with a 401 status because only administrators can update other users', function (done) {
      agent
      .patch('/user/'+data.user_customer_03.id)
      .send({
        name:     'newfoo',
        credit:   100,
        password: 'pass'
      })
      .expect(401, done);
    });
  });

  describe('#update() as user', function() {
    //sign up as user before test
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email: data.user_customer_03.email,
        password: data.user_customer_03.password
      })
      .end(done);
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
    it('should respond with a 401 status because only administrators can delete an user', function (done) {
      agent
      .patch('/user/'+data.user_customer_01.id)
      .send({
        name:     'managernotupdated',
        password: 'passup'
      })
      .expect(401, done);
    });
  });

  describe('#update() as user (update himself)', function() {
    //sign up as user before test
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email: data.user_customer_03.email,
        password: data.user_customer_03.password
      })
      .end(done);
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
    it('should update the account of the current user', function (done) {
      agent
      .patch('/user/'+data.user_customer_03.id)
      .send({
        name:     'mynewname',
        credit:   1000,     //will be ignored
        password: 'passup'
      })
      .expect(200, done);
    });
  });

  describe('#update() as user with credit and role parameters (update himself)', function() {
    //sign up as user before test
    var creditBefore;
    var roleBefore;
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email: data.user_customer_02.email,
        password: data.user_customer_02.password
      })
      .end(function(){
        User.findOne({id:data.user_customer_02.id}, function(err,user){
          creditBefore = user.credit;
          roleBefore = user.role;
          done();
        });
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
    it('should respond with a 200 status but no change the credit account', function (done) {
      agent
      .patch('/user/'+data.user_customer_02.id)
      .send({
        credit: 9999,   //will be ignored
        role: 'MANAGER'
      })
      .expect(200)
      .end(function(){
        User.findOne({id:data.user_customer_02.id}, function(err,userAfter){
          assert.equal(creditBefore, userAfter.credit, 'Should be the same as before the request.')
          assert.equal(roleBefore, userAfter.role, 'Should be the same as before the request.')
          done();
        });
      });
    });
  });

  describe('#update() as admin', function() {
    //sign in as administrator before test
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email: data.user_admin_01.email,
        password: data.user_admin_01.password
      })
      .end(done);
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
    it('should update the manager', function (done) {
      agent
      .patch('/user/'+data.user_customer_03.id)
      .send({
        name:     'John',
        password: 'helloworld'
      })
      .expect(200, done);
    });
  });

  describe('#delete() as admin', function() {
    //sign in as administrator before test
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email: data.user_admin_01.email,
        password: data.user_admin_01.password
      })
      .end(done);
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
    it('should delete the user', function (done) {
      agent
      .delete('/user/'+data.user_customer_03.id)
      .send()
      .expect(200, done);
    });
  });

  describe('#credit() as admin', function() {
    //sign up as administrator before test
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email: data.user_admin_01.email,
        password: data.user_admin_01.password
      })
      .end(done);
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
    it('should increase the credit\'s user', function (done) {
      User.findOne({id:data.user_customer_02.id}, function(err,userBefore){
        agent
        .patch('/user/'+data.user_customer_02.id+'/credit')
        .send({credit: 10, typePayment: 'IN_CASH'})
        .expect(200)
        .end(function(){
          User.findOne({id:data.user_customer_02.id}, function(err,userAfter){
            assert.equal(userBefore.credit + 10, userAfter.credit, 'New credit is wrong.');
            done();
          });
        });
      });
    });
  });

  describe('#credit() as user Manager', function() {
    //sign up as manager before test
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email:      data.user_manager_01.email,
        password:   data.user_manager_01.password
      })
      .end(done);
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
    it('should increase the credit\'s user', function (done) {
      User.findOne({id:data.user_customer_02.id}, function(err,userBefore){
        agent
        .patch('/user/'+data.user_customer_02.id+'/credit')
        .send({credit: 20, typePayment: 'IN_CASH'})
        .expect(200)
        .end(function(){
          User.findOne({id:data.user_customer_02.id}, function(err,userAfter){
            assert.equal(userBefore.credit + 20, userAfter.credit, 'New credit is wrong.');
            done();
          });
        });
      });
    });
  });

  describe('#credit() as regular User', function() {
    //sign up as administrator before test
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email:      data.user_customer_01.email,
        password:   data.user_customer_01.password
      })
      .end(done);
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
    it('shouldn\'t increase the credit\'s user because a regular user hasn\'t the right', function (done) {
      User.findOne({id:data.user_customer_02.id}, function(err,userBefore){
        agent
        .patch('/user/'+data.user_customer_02.id+'/credit')
        .send({credit: 1000, typePayment: 'IN_CASH'})
        .expect(401)
        .end(function(){
          User.findOne({id:data.user_customer_02.id}, function(err,userAfter){
            assert.equal(userBefore.credit, userAfter.credit, 'New credit is wrong.');
            //done();
            agent.get('/sale').end(done);
          });
        });
      });
    });
  });

  /**
  * Get as a manager user
  */
  describe('#get() as a manager User', function() {

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
      .end(done);
    });

    // Test
    it('As a manager user, should get all users', function (done) {
      agent
      .get('/user')
      .expect(200)
      .end(function(err, users){
        User.count().exec(function(err, nbUsers){
          assert.equal(nbUsers, users.body.length, 'A manager user should get all users.');
          done();
        });
      });
    });
  });

  /**
  * Get as a regular user
  */
  describe('#get() as a regular User', function() {

    // Before: Log in as a regular User
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: data.user_customer_05.email,
        password: data.user_customer_05.password
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
    it('As a regular user, should get only his own attributes', function (done) {
      agent
      .get('/user')
      .expect(200)
      .end(function(err, users){
        assert.equal(1, users.body.length, 'A regular user shouldn\'t get the other users.');
        done();
      });
    });
  });

});
