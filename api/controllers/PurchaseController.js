"use strict";

var q = require('q');

/**
 * PurchaseController
 *
 * @description :: Server-side logic for managing Purchases
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  
  /**
  * Constructs a new Purchase
  * @param req
  * @param req.param                                     {Object}    Match criteria
  * @param [req.param.purchaseDate = Current date]       {Date}      Date of the Purchase creation
  * @param [req.param.managerId = Current session's id]  {Number}    Id of the manager User
  * @param req.param.products                            {Array}     Array of productId-quantity pairs defined as follows [{productId: <Number>, quantity: <Number>}, ...]
  * @param res
  */
  add: function (req, res) {

    // TODO Verify parameters

    // 1st: Create the Pairs
    createPairs(req.param('products'))
    .then(function(pairs) {
      // 2d: Create the Purchase
      Purchase.create({
        purchaseDate: req.param('purchaseDate') || new Date(),
        manager:      req.param('managerId') || req.session.user.id,
        products:     pairs
      }, function (err, newPurchase) {
        if (err) {
          return res.negotiate(err);
        }
        else {
          return res.send(200, newPurchase);
        }
      });
    })
    .catch(res.negotiate);
  },

  /**
  * Delete Purchase
  * @param req
  * @param req.param {Object} Match criteria
  * @param res
  */
  delete: function (req, res) {
    Purchase
    .destroy(req.allParams())
    .exec(function(err, deletedPurchase) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        return res.send(200);
      }
    });
  },

  /**
    * Get Purchases
    * @note If the lazy mode is set to on (req.session.lazy), all associations are populated. This might result in heavy api calls.
    * @param req
    * @param req.param {Object} Waterline criteria
    * @param res
    */
    get: function (req, res) {
      if(req.session.lazy) { // Populate everything
        Purchase
        .find(req.allParams())
        .populate('manager')
        .populate('products')
        .exec(function(err, foundPurchases) {
          if (err) {
            return res.negotiate(err);
          }
          else {
            async.each(foundPurchases, function(purchase, next) {
              async.each(purchase.products, function(pair, next) {
                Product
                .findOne(pair.product)
                .exec(function(err, foundProduct) {
                  if(err) {
                    next(err);
                  }
                  else {
                    pair.product = foundProduct;
                    next();
                  }
                });
              }, next);
            }, function(err) {
              if(err) {
                res.negociate(err);
              }
              else {
                res.send(foundPurchases);
              }
            });
          }
        });
      }
      else { // Return the Purchases un-populated
        Purchase
        .find(req.allParams())
        .exec(function(err, foundPurchases) {
          if (err) {
            return res.negotiate(err);
          }
          else {
            return res.send(foundPurchases);
          }
        });
      }
    },

  /**
   * Update Purchase
   * @param req
   * @param req.param
   * @param req.param.saleId
   * @param res
   */
  update: function(req, res) {

    //TODO What if Pairs shouldn't be updated?

    var updateValues = {};
    if(req.param('purchaseDate')) updateValues.saleDate = req.param('purchaseDate');
    if(req.param('managerId')) updateValues.manager = req.param('managerId');

    createPairs(req.param('products'))
      .then(function(pairs) {
        updateValues.products = pairs;
        // 2d: Create the Sale
        Purchase.update(req.param('purchaseId'), updateValues, function (err, updatedPurchase) {
          if (err) {
            return res.negotiate(err);
          }
          else {
            return res.send(200, updatedPurchase);
          }
        });
      })
      .catch(res.negotiate);
  }

};

/**
* Creates Pairs
* @param pairs {Array} Array of productId-quantity pairs defined as follows [{productId: <Number>, quantity: <Number>}, ...]
*/
function createPairs(pairs) {

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
