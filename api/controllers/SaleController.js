"use strict";

var q = require('q');

/**
 * SaleController
 *
 * @description :: Server-side logic for managing Sales
 */

module.exports = {

  /**
  * Constructs a new Sale
  * @param req
  * @param req.param                                     {Object}    Match criteria
  * @param [req.param.saleDate = Current date]           {Date}      Date of the Sale creation
  * @param [req.param.managerId = Current session's id]  {Number}    Id of the manager User
  * @param req.param.customerId                          {Number}    Id of the customer User
  * @param req.param.products                            {Array}     Array of productId-quantity pairs defined as follows [{productId: <Number>, quantity: <Number>}, ...]
  * @param res
  */
  add: function (req, res) {

    // TODO Verify parameters

    // 1st: Create the Pairs
    createPairs(req.param('products'))
    .then(function(pairs) {
      // 2d: Create the Sale
      Sale.create({
        saleDate: req.param('saleDate') || new Date(),
        customer: req.param('customerId'),
        manager:  req.param('managerId') || req.session.user.id,
        products: pairs
      }, function (err, newSale) {
        if (err) {
          return res.negotiate(err);
        }
        else {
          return res.send(200, newSale);
        }
      });
    })
    .catch(res.negotiate);
  },

  /**
  * Delete Sales
  * @param req
  * @param req.param {Object} Match criteria
  * @param res
  */
  delete: function (req, res) {
    Sale
    .destroy(req.allParams())
    .exec(function(err, deletedSale) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        return res.send(200);
      }
    });
  },

  /**
  * Get Sales
  * @note If the lazy mode is set to on (req.session.lazy), all associations are populated. This might result in heavy api calls.
  * @param req
  * @param req.param {Object} Waterline criteria
  * @param res
  */
  get: function (req, res) {

    if(req.session.lazy) { // Populate everything
      Sale
      .find(req.allParams())
      .populate('manager')
      .populate('customer')
      .populate('products')
      .exec(function(err, foundSales) {
        if (err) {
          return res.negotiate(err);
        }
        else {
          async.each(foundSales, function(sale, next) {
            async.each(sale.products, function(pair, next) {
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
              res.send(foundSales);
            }
          });
        }
      });
    }
    else { // Return the Sales un-populated
      Sale
      .find(req.allParams())
      .exec(function(err, foundSales) {
        if (err) {
          return res.negotiate(err);
        }
        else {
          return res.send(foundSales);
        }
      });
    }

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
