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
    memberSale: {       //this attribute is needed to find the price according the user's status
      type: 'BOOLEAN'
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
        if(!values.unitPrice || values.unitPrice == -1) {
          if(values.memberSale === true){
            values.unitPrice = foundProduct.memberPrice;
          }
          else{
            values.unitPrice = foundProduct.price;
          }
        }
      }
      cb();
    });
  },

  /**
  * Creates Pairs
  * @param pairs {Array} Array of productId-quantity pairs defined as follows [{productId: <Number>, quantity: <Number>}, ...]
  * @param saleMode {bool} true = sale , false = purchase
  * @param memberSale {Boolean} Needed to know the price for a specific user
  */
  createPairs: function(pairs, saleMode, memberSale) {

    var deferred = q.defer();
    var createdPairs = [];

    async.each(pairs, function(pair, cb) {

      var productId = pair.productId || pair.product;
      var quantity = pair.quantity;

      Pair.create({
        product: productId,
        quantity: quantity,
        unitPrice: pair.unitPrice || -1,
        memberSale: memberSale
      }, function(err, newPair) {
        if(err) {
          cb(err);
        }
        else {
          createdPairs.push(newPair);
          Product.findOne(newPair.product, function(err,product){
            if(saleMode){
                product.quantity -= Number(newPair.quantity);
            }
            else {
              product.quantity += Number(newPair.quantity);
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
            product.quantity += Number(pair.quantity);
          }
          else {
            product.quantity -= Number(pair.quantity);
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
