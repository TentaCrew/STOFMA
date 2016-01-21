'use strict';

var sha1 = require('sha1');

/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 */

module.exports = {

  login: function (req, res) {
    User.findOne({
      email: req.param('email')
    }, function (err, foundUser) {
      if (err) {
        return res.negotiate(err);
      }
      else if (!foundUser) {
        sails.log.debug("No user matching " + req.param('email') + ".");
        return res.send(404);
      }
      else {
        var s = getDateLog() + "Found user " + foundUser.email + " and ";
        if(sha1(req.param('password')) == foundUser.password) {
          updateSession(req.session, foundUser);
          sails.log.debug(s + "credentials are valid.");
          return res.send(200, foundUser);
        }
        else {
          sails.log.debug(s + "credentials are invalid.");
          return res.send(404);
        }
      }
    });
  },

  logout: function (req, res) {
    User.findOne(req.session.user.id || -1, function (err, foundUser) {
      if (err) {
        return res.negotiate(err);
      }
      // User does no longer exist
      else if (!foundUser) {
        sails.log.debug("User " + req.session.user.id + " does no longer exist.");
      }
      // Login out
      sails.log.debug("User " + (foundUser?foundUser.email:req.session.user.id) + " logged out.");
      updateSession(req.session);
      return res.send(200);
    });
  },

  signup: function (req, res) {
    // Creating new User
    var user = {
      firstname:   req.param('firstname'),
      name:        req.param('name'),
      birthdate:   req.param('birthdate'),
      sex:         req.param('sex'),
      password:    req.param('password'),
      email:       req.param('email'),
      phoneNumber: req.param('phoneNumber')
    };
    if(req.param('id')) {
      user.id = req.param('id');
    }
    User.create(user, function (err, newUser) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        if(req.session.user && (req.session.user.isAdmin || req.session.user.isManager)){
          sails.log.debug(getDateLog() + "User " + req.param('email') + " has been register as " + newUser.role);
        } else {
          sails.log.debug(getDateLog() + "User " + req.param('email') + " signed up and logged in as " + newUser.role);
        }
        return res.send(200, newUser);
      }
    });
  },

  update: function (req, res) {

    var updateHimSelf = req.param('id') == req.session.user.id;

    // only managers and admins can update other users
    if(!req.session.user.isManager && !updateHimSelf) {
      sails.log.debug("You do not have sufficient privileges to update other users");
      return res.send(401, 'You do not have sufficient privileges to update other users.');
    }

    delete req.allParams().credit;    // to update credit, use the credit function
    delete req.allParams().role;      // to update role, use the setRole function
    delete req.allParams().isMember;  // to update status, use the setMember function
    delete req.allParams().isActive;  // to set an user active, use the setActive function

    if(updateHimSelf){
      delete req.allParams().name;
      delete req.allParams().firstname;
      delete req.allParams().birthdate;
      delete req.allParams().sex;
    }

    // Updating an User
    User.update({id: req.param('id')}, req.allParams(), function(err, user) {
      if (err) {
        sails.log.debug(getDateLog() + "Error during user update");
        return res.negotiate(err);
      }
      else {
        if(updateHimSelf){
          updateSession(req.session, user[0]);
        }
        sails.log.debug(getDateLog() + "User updated : " + user[0].firstname + " " + user[0].name);
        return res.send(user);
      }
    });
  },

  setRole: function(req, res) {

    User.findOne({id: req.param('id')}, function(err, user) {
      if(user.email == "admin@stofma.com")
        return res.send(403);

      User.update(user, {role: req.param('role')}, function(err,userUpdated){
        if (err) {
          sails.log.debug(getDateLog() + "Error during role attribution");
          return res.negotiate(err);
        }
        else {
          sails.log.debug(getDateLog() + "Role "+req.param('role')+" attributed to " + user.firstname + " " + user.name);
          return res.send(userUpdated);
        }
      });
    });
  },

  setMember: function(req, res) {

    User.findOne({id: req.param('id')}, function(err, user) {
      User.update(user, {isMember: req.param('isMember')}, function(err,userUpdated){
        if (err) {
          sails.log.debug(getDateLog() + "Error during attribution of the member status");
          return res.negotiate(err);
        }
        else {
          sails.log.debug(getDateLog() + user.firstname + " " + user.name + " is now a " + (userUpdated[0].isMember ? '' : 'non-') + "member");
          return res.send(userUpdated);
        }
      });
    });
  },

  setActive: function(req, res) {

    User.findOne({id: req.param('id')}, function(err, user) {
      User.update(user, {isActive: req.param('isActive')}, function(err,userUpdated){
        if (err) {
          sails.log.debug(getDateLog() + "Error during activation of a member");
          return res.negotiate(err);
        }
        else {
          sails.log.debug(getDateLog() + user.firstname + " " + user.name + " is now " + (userUpdated[0].isActive ? 'active' : 'disabled'));
          return res.send(userUpdated);
        }
      });
    });
  },

  credit: function(req,res) {

    User.findOne({id: req.param('id')}, function(err, user) {
      User.update(user, {credit: Number(user.credit)+Number(req.param('credit'))}, function(err,user){
        if (err) {
          return res.negotiate(err);
        }
        else {
          Payment.create({
            paymentDate : new Date(),
            customer    : req.param('id'),
            manager     : req.session.user.id,
            amount      : req.param('credit'),
            type        : req.param('typePayment'),
            creditMode  : true
          }, function (err, newPayment) {
            if (err) {
              sails.log.debug("Payment not created");
              return res.send(400, 'Payment not created.');
            }
            else {
              sails.log.debug("Payment created (credit)");
              return res.send(user);
            }
          });
        }
      });
    });
  },

  delete: function (req, res) {
    // Deleting an User
    User.destroy({id: req.param('id')}, function(err, user) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        return res.send(200);
      }
    });
  },

  get: function (req, res) {
    // restrict regular users to their own attributes
    if(!req.session.user.isManager){
      req.allParams().id = req.session.user.id;
    }

    // Getting users from some parameters
    User.find(req.allParams(), function(err, users) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        return res.send(200, users);
      }
    });
  }
};
