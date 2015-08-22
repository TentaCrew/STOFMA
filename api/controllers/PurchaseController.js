'use strict';

/**
 * PurchaseController
 *
 * @description :: Server-side logic for managing Purchases
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

    //create the pairs
    Pair.createPairs(req.param('products'),false)
    .then(function(pairs) {

      //create the Purchase
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
    Purchase.findOne(req.allParams()).populate('products').exec(function(err,purchase){

      async.parallel({

        //update stocks
        updateStocks: function(cb){
          Pair.deletePairs(purchase.products,false)
          .then(function(){
            cb();
          });
        },

        //delete purchase
        deletePurchase: function(cb){
          Purchase
          .destroy(req.allParams())
          .exec(function(err, deletedPurchase) {
            cb();
          });
        }
      },
      function(err, results) {
        return res.send(200,'Purchase deleted with success');
      });
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
        .sort('purchaseDate desc')
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
        .sort('purchaseDate desc')
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
   * @param req.param.purchaseId
   * @param res
   */
  update: function(req, res) {

    // TODO Verify parameters

    var updatedValues = {};
    if(req.param('managerId')) updatedValues.manager = req.param('managerId');
    if(req.param('purchaseDate'))
      updatedValues.purchaseDate = req.param('purchaseDate');
    else
      updatedValues.purchaseDate = new Date();

    Purchase.findOne(req.param('id')).populate('products').exec(function(err,purchaseToUpdate){
      //create the pairs
      Pair.createPairs(req.param('products'),false)
        .then(function(pairs) {

          //remove the old pairs
          Pair.deletePairs(purchaseToUpdate.products,false)
          .then(function(){

            //add the new pairs
            updatedValues.products = pairs;

            //update the purchase with the new values
            Purchase.update(req.param('id'), updatedValues, function (err, updatedPurchase) {
              return res.send(200, updatedPurchase);
            });
          });
        })
        .catch(res.negotiate);
    });
  }

};
