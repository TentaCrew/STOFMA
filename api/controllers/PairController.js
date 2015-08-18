"use strict";

var q = require('q');

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

  /**
  * Creates Pairs
  * @param pairs {Array} Array of productId-quantity pairs defined as follows [{productId: <Number>, quantity: <Number>}, ...]
  */
  createPairs: function(pairs) {

    var deferred = q.defer();
    var createdPairs = [];

    async.each(pairs, function(pair, cb) {

      var productId = pair.productId || pair.product;
      var quantity = pair.quantity;

      Pair.create({
        product: productId,
        quantity: quantity
      }, function(err, newPair) {
        if(err) {
          cb(err);
        }
        else {
          createdPairs.push(newPair);
          cb();
        }
      })

    }, function(err) {
      if(err) {
        deferred.reject(err);
      }
      else {
        deferred.resolve(createdPairs);
      }
    });

    return deferred.promise;
  }

};
