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
        sails.log.debug("Found user " + foundUser.email + ".");
        if(sha1(req.param('password')) == foundUser.password) {
          req.session.userId = foundUser.id;
          req.session.authenticated = true;
          req.session.role = foundUser.role;
          req.session.isAdmin = (foundUser.role === "ADMINISTRATOR");
          sails.log.debug(foundUser.email + " credentials are valid.");
          return res.send(200);
        }
        else {
          sails.log.debug(foundUser.email + " credentials are invalid.");
          return res.send(404);
        }
      }
    });
  },

  logout: function (req, res) {
    User.findOne(req.session.userId, function (err, foundUser) {
      if (err) {
        return res.negotiate(err);
      }
      // User does no longer exist
      else if (!foundUser) {
        sails.log.debug("User " + req.session.userId + " does no longer exist.");
      }
      // Login out
      sails.log.debug("User " + (foundUser?foundUser.email:req.session.userId) + " logged out.");
      req.session.userId = null;
      req.session.authenticated = null;
      return res.send(200);
    });
  },

  signup: function (req, res) {
    // Creating new User
    User.create({
      firstname: req.param('firstname'),
      name: req.param('name'),
      birthdate: req.param('birthdate'),
      sex: req.param('sex'),
      password: req.param('password'),
      email: req.param('email'),
      phoneNumber: req.param('phoneNumber'),
      role: req.param('role')
    }, function (err, newUser) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        req.session.userId = newUser.id;
        req.session.authenticated = true;
        sails.log.debug("User " + req.param('email') + " signed up and logged in.");
        return res.send(200);
      }
    });
  },

  update: function (req, res) {
    // only admin can update other users
    if(!req.session.isAdmin && req.session.userId != req.param('id')) {
      return res.send(401, 'You do not have sufficient privileges.');
    }

    // only admin can update his own role
    if(!req.session.isAdmin && req.param('role')) {
      return res.send(401, 'You do not have sufficient privileges.');
    }
    var id_ = req.param('id') ? req.param('id') : req.session.userId;
    // Updating an User
    User.update({id: id_}, req.allParams(), function(err, user) {
        if (err) {
          return res.negotiate(err);
        }
        else {
          return res.send(user);
        }
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

  getAll: function (req, res) {
    // Getting all users
    User.find(function(err, users) {
        if (err) {
          return res.negotiate(err);
        }
        else {
          return res.send(users);
        }
    });
  },

  get: function (req, res) {
    // Getting users from some parameters
    User.find(req.allParams(), function(err, user) {
        if (err) {
          return res.negotiate(err);
        }
        else {
          return res.send(user);
        }
    });
  }
};
