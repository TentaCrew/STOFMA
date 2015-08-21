'use strict';

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
        email: 'foo@bar.com',
        password: 'foobar'
      })
      .expect(401, done);
    });
  });

  describe('#delete() as manager', function() {
    //sign up as manager before test
    var idToDelete;
    before(function(done) {
      agent
      .post('/user')
      .send({
        firstname:  'the',
        name:       'manager',
        email:      'the@manager.com',
        sex:        true,
        role:       'MANAGER',
        password:   'pwd'
      })
      .end(function(err, res) {
        agent
        .post('/user/search')
        .send({
          email: 'foo@bar.com'
        })
        .end(function(err2, res2) {
          idToDelete = res2.body[0].id;
        });
        done(err);
      });
    });
    //test
    it('should respond with a 401 status because only administrators can delete an user', function (done) {
      agent
      .delete('/user/'+idToDelete)
      .send()
      .expect(401, done);
    });
  });

  describe('#update() as manager', function() {
    //is signed as manager since the last test
    var idToUpdate;
    before(function(done) {
      agent
      .post('/user/search')
      .send({
        email: 'foo@bar.com'
      })
      .end(function(err2, res2) {
        idToUpdate = res2.body[0].id;
      });
      done();
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
      .patch('/user/'+idToUpdate)
      .send({
        name:     'newfoo',
        password: 'pass'
      })
      .expect(401, done);
    });
  });

  describe('#update() as user', function() {
    //sign up as user before test
    var idToUpdate;
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email: 'foo@bar.com',
        password: 'foobar'
      })
      .end(function(err,res){
        agent
        .post('/user/search')
        .send({
          email: 'the@manager.com'
        })
        .end(function(err2, res2) {
          idToUpdate = res2.body[0].id;
        });
        done();
      });
    });
    //test
    it('should respond with a 401 status because only administrators can delete an user', function (done) {
      agent
      .patch('/user/'+idToUpdate)
      .send({
        name:     'managerupdated',
        password: 'passup'
      })
      .expect(401, done);
    });
  });

  describe('#update() as user (update himself)', function() {
    //is signed as user (foo@bar.com) since the last test
    var idToUpdate;
    before(function(done) {
      agent
      .post('/user/search')
      .send({
        email: 'foo@bar.com'
      })
      .end(function(err2, res2) {
        idToUpdate = res2.body[0].id;
        done();
      });
    });
    //test
    it('should update the account of the current user', function (done) {
      agent
      .patch('/user/'+idToUpdate)
      .send({
        name:     'mynewname',
        password: 'passup'
      })
      .expect(200, done);
    });
  });

  describe('#update() as user with credit parameter (update himself)', function() {
    //is signed as user (foo@bar.com) since the last test
    var idToUpdate;
    before(function(done) {
      agent
      .post('/user/search')
      .send({
        email: 'foo@bar.com'
      })
      .end(function(err2, res2) {
        idToUpdate = res2.body[0].id;
        done();
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
    it('should respond with a 401 status because only managers can update an user\'s credit', function (done) {
      agent
      .patch('/user/'+idToUpdate)
      .send({
        credit: 9999
      })
      .expect(401, done);
    });
  });

  describe('#update() as admin', function() {
    //sign up as administrator before test
    before(function(done) {
      agent
      .post('/user')
      .send({
        firstname:  'the',
        name:       'admin',
        email:      'the@admin.com',
        sex:        true,
        role:       'ADMINISTRATOR',
        password:   'pwd'
      })
      .end(function(err, res) {
        agent
        .post('/user/search')
        .send({
          email: 'the@manager.com'
        });
        done();
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
    it('should update the manager', function (done) {
      agent
      .patch('/user/3')
      .send({
        name:     'John',
        password: 'helloworld'
      })
      .expect(200, done);
    });
  });

  describe('#delete() as admin', function() {
    //sign up as administrator before test
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email:      'the@admin.com',
        password:   'pwd'
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
    it('should delete the manager', function (done) {
      agent
      .post('/user/search')
      .send({
        email: 'the@manager.com'
      })
      .end(function(err, userToDelete) {
        agent
        .delete('/user/'+userToDelete.body.id)
        .send()
        .expect(200, done);
      });
    });
  });

  describe('#credit() as admin', function() {
    //sign up as administrator before test
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email:      'the@admin.com',
        password:   'pwd'
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
      User.findOne({id:2}, function(err,userBefore){
        agent
        .patch('/user/2/credit')
        .send({credit: 10})
        .expect(200)
        .end(function(){
          User.findOne({id:2}, function(err,userAfter){
            assert.equal(userBefore.credit + 10, userAfter.credit, 'New credit is wrong.');
            done();
          });
        });
      });
    });
  });

  describe('#credit() as user Manager', function() {
    //sign up as administrator before test
    before(function(done) {
      agent
      .put('/user/login')
      .send({
        email:      'manager@pro.com',
        password:   'sale'
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
      User.findOne({id:2}, function(err,userBefore){
        agent
        .patch('/user/2/credit')
        .send({credit: 20})
        .expect(200)
        .end(function(){
          User.findOne({id:2}, function(err,userAfter){
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
        email:      'lucie@customer.fr',
        password:   'catword'
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
      User.findOne({id:2}, function(err,userBefore){
        agent
        .patch('/user/2/credit')
        .send({credit: 1000})
        .expect(401)
        .end(function(){
          User.findOne({id:2}, function(err,userAfter){
            assert.equal(userBefore.credit, userAfter.credit, 'New credit is wrong.');
            done();
          });
        });
      });
    });
  });

});
