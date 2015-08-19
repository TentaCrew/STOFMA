"use strict";

/**
 * PairController
 *
 * @description :: Server-side logic for managing Pairs
 */

module.exports = {
  add: function (req, res) {
    // Creating new Pairs
    var pairs = [];
    Pair.create(req.param('pairs'), function (err, pairs) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        return res.send(200, pairs);
      }
    });
  },

  getProduct: function (req, res) {
    Pair.findOne(req.allParams()).populate('product').exec(function(err, pair) {
      if (err) {
        return res.negociate(err);
      }
      return res.send(pair.product);
    });
  },

  delete: function (req, res) {
    // Deleting a Pair
    Pair.destroy({id: req.param('id')}, function(err, pair) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        return res.send(200);
      }
    });
  },
  get: function(req, res) {
    if(req.session.lazy) {
      Pair.find(req.allParams())
      .populateAll()
      .exec(function(err,pairs) {
        if (err) {
          return res.negociate(err);
        }
        return res.send(pairs);
      })
    }
    else {
      Pair.find(req.allParams())
      .exec(function(err,pairs) {
        if (err) {
          return res.negociate(err);
        }
        return res.send(pairs);
      })
    }
  },



};
