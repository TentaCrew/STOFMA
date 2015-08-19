"use strict";

var q = require('q');

/**
 * Pair.js
 *
 * @description :: This model describes a Pair.
 */

module.exports = {

  attributes: {
    product: {
      model: 'Product',
      required: true
    },
    quantity: {
      type: 'INTEGER',
      required: true
    },
    unitPrice: {
      type: 'FLOAT',
      required: true
    },
    totalPrice: function() {
      return this.unitPrice * this.quantity;
    }

  },

  beforeValidate: function(values, cb) {
    var isPriceUpdated = values.product || values.quantity || values.unitPrice;
    if(!values.unitPrice && isPriceUpdated) {
      Product
      .findOne(values.product)
      .exec(function(err, foundProduct) {
        if(err) {
          cb(err);
        }
        else {
          values.unitPrice = foundProduct.price;
          cb();
        }
      });
    }
    else {
      cb();
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
