"use strict";

var q = require('q');

/**
 * StockController
 *
 * @description :: Server-side logic for managing Stocks
 */

module.exports = {

  get: function (req, res) {

    var productId = req.param('productId');
    var that = this;

    Stock.findOne({product: productId}).exec(function(err,stock){

      //get the stock if it exists, or calculate it
      if(stock){
        return res.send(200, stock);
      }
      else {
        that.localUpdate(productId)
        .then(function(s) {
          return res.send(200,s);
        });
      }
    });
  },

  update: function (req, res) {
    that.localUpdate(req.param('productId'))
    .then(function(stock) {
      return res.send(200,stock);
    });
  },

  updateAll: function() {
    var deferred = q.defer();
    var that = this;
    Product.find().exec(function(err,products){
      async.each(products, function(product, next) {
        that.localUpdate(product.id);
        next();
      });
    });
    deferred.resolve();
    return deferred.promise;
  },

  localUpdate: function(productId) {
    var deferred = q.defer();
    async.parallel({
      getNumberSold: function(callback){
        var numberSold= 0;
        Sale.find().populate('products').exec(function(err, sales){
          async.each(sales, function(sale, next) {
            async.each(sale.products, function(pair, next) {
              if(productId==pair.product){
                numberSold -= pair.quantity;
              }
              next();
            });
            next();
          });
          callback(null,numberSold);
        });
      },
      getNumberBought: function(callback){
        var numberBought= 0;
        Purchase.find().populate('products').exec(function(err, purchases){
          async.each(purchases, function(purchase, next) {
            async.each(purchase.products, function(pair, next) {
              if(productId==pair.product){
                numberBought += pair.quantity;
              }
              next();
            });
            next();
          });
          callback(null,numberBought);
        });
      }
    },
    function(err, results) {
      Stock.create({product: productId, quantity: results.getNumberSold+results.getNumberBought}, function(err,stock){
        deferred.resolve(stock);
      });
    });
    return deferred.promise;
  }
};
