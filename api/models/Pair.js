'use strict';

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
    Product
    .findOne(values.product)
    .exec(function(err, foundProduct) {
      if(foundProduct) {
        if(!values.unitPrice || values.unitPrice == -1)
          values.unitPrice = foundProduct.price;
      }
      cb();
    });
  },

  /**
  * Creates Pairs
  * @param pairs {Array} Array of productId-quantity pairs defined as follows [{productId: <Number>, quantity: <Number>}, ...]
  * @param saleMode {bool} true = sale , false = purchase
  */
  createPairs: function(pairs,saleMode) {

    var deferred = q.defer();
    var createdPairs = [];

    async.each(pairs, function(pair, cb) {

      var productId = pair.productId || pair.product;
      var quantity = pair.quantity;

      Pair.create({
        product: productId,
        quantity: quantity,
        unitPrice: pair.unitPrice || -1
      }, function(err, newPair) {
        if(err) {
          cb(err);
        }
        else {
          createdPairs.push(newPair);
          Product.findOne(newPair.product, function(err,product){
            if(saleMode){
                product.quantity -= newPair.quantity;
            }
            else {
              product.quantity += newPair.quantity;
            }
            product.save(cb);
          });
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
  },

  /**
  * Deletes pair
  * @param pairs {Array} Array of productId-quantity pairs defined as follows [{productId: <Number>, quantity: <Number>}, ...]
  * @param saleMode {bool} true = sale , false = purchase
  */
  deletePairs: function(pairs,saleMode) {

    var deferred = q.defer();

    async.each(pairs, function(p, cb) {

      Pair.findOne(p.id, function(err,pair){
        Product.findOne(pair.product, function(err,product){
          if(saleMode){
            product.quantity += pair.quantity;
          }
          else {
            product.quantity -= pair.quantity;
          }
          product.save(cb);
        });
      });

    }, function(err) {
      if(err) {
        deferred.reject(err);
      }
      else {
        var pairIds = pairs.map(function(pair){return pair.id;});
        Pair.destroy(pairIds, function(err,deletedPairs){
          deferred.resolve(deletedPairs);
        });
      }
    });

    return deferred.promise;
  }
};
