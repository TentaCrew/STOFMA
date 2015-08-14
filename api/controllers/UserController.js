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
          updateSession(req.session, foundUser);
          sails.log.debug(foundUser.email + " credentials are valid.");
          return res.send(200, foundUser);
        }
        else {
          sails.log.debug(foundUser.email + " credentials are invalid.");
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
    User.create({
      firstname:   req.param('firstname'),
      name:        req.param('name'),
      birthdate:   req.param('birthdate'),
      sex:         req.param('sex'),
      password:    req.param('password'),
      email:       req.param('email'),
      phoneNumber: req.param('phoneNumber'),
      role:        req.param('role'),
      credit:      req.param('credit')
    }, function (err, newUser) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        updateSession(req.session, newUser);
        sails.log.debug("User " + req.param('email') + " signed up and logged in as " + newUser.role);
        return res.send(200, newUser);
      }
    });
  },

  update: function (req, res) {

    var updateHimSelf = !req.param('id') || req.param('id') == req.session.user.id;

    // only admin can update other users
    if(!req.session.user.isAdmin && !updateHimSelf) {
      return res.send(401, 'You do not have sufficient privileges to update other users.');
    }

    // only admin can update user's role
    if(!req.session.user.isAdmin && req.param('role')) {
      return res.send(401, 'You do not have sufficient privileges to update user\'s role.');
    }

    var id_ = req.param('id') ? req.param('id') : req.session.user.id;

    // Updating an User
    User.update({id: id_}, req.allParams(), function(err, user) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        updateSession(req.session, user[0]);
        return res.send(user);
      }
    });
  },

  credit: function(req,res) {
    if(!req.session.user.isManager) {
      return res.send(401, 'You do not have sufficient privileges to credit user\'s account.');
    }

    User.update({id: req.param('id')}, req.allParams(), function(err, user) {
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
        return res.send(200, users);
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
        return res.send(200, user);
      }
    });
  }
};
