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
  * @param req.param.products                            {Array}     Array of productId-quantity pairs defined as follows [{productId: <Number>, quantity: <Number>}, ...]
  * @param res
  */
  add: function (req, res) {

    //need a unit price for each pair
    var products = req.param('products');
    for(var i=0;i<products.length;i++){
      if(typeof products[i].unitPrice === 'undefined'){
        return res.send(400, 'Unit price must be provided');
      }
    }

    //create the pairs
    Pair.createPairs(req.param('products'),false)
    .then(function(pairs) {

      //Create the Payment without amount (unknown at this moment)
      Payment.create({
        paymentDate : req.param('purchaseDate') || new Date(),
        customer    : req.param('customerId'),
        manager     : req.session.user.id,
        type        : req.param('typePayment')
      }, function (err, newPayment) {
        if (err) {
          return res.negotiate(err);
        }
        else {
          //create the Purchase
          Purchase.create({
            purchaseDate: req.param('purchaseDate') || new Date(),
            manager:      req.session.user.id,
            products:     pairs,
            payment:      newPayment
          }, function (err, newPurchase) {
            if (err) {
              return res.negotiate(err);
            }
            else {
              //update the amount of the Payment if the totalPrice of the Purchase
              newPayment.amount = Number(newPurchase.totalPrice);
              newPayment.save(function(){
                return res.send(200, newPurchase);
              });
            }
          });
        }
      });
    });
  },

  /**
  * Delete Purchase
  * @param req
  * @param req.param {Object} Match criteria
  * @param res
  */
  delete: function (req, res) {
    Purchase.findOne(req.allParams()).populate('products').populate('payment').exec(function(err,purchase){

      async.parallel({

        //update stocks
        updateStocks: function(cb){
          Pair.deletePairs(purchase.products,false)
          .then(function(){
            cb();
          });
        },
      },
      function(err, results) {
        //delete purchase
        Purchase
        .destroy(req.allParams())
        .exec(function(err, deletedPurchase) {
          Payment.destroy(purchase.payment.id, function(err,deletedPmt){
            return res.send(200,'Purchase deleted with success');
          });
        });
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
        .populate('payment')
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
    updatedValues.manager = req.session.user.id;
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

              //get the updated Purchase
              updatedPurchase = updatedPurchase[0];

              Payment.create({
                paymentDate : req.param('purchaseDate') || new Date(),
                manager     : req.session.user.id,
                type        : req.param('typePayment')
              }, function (err, newPayment) {
                Payment.destroy(purchaseToUpdate.payment, function(err,p){
                  newPayment.amount = updatedPurchase.totalPrice;
                  updatedPurchase.payment = newPayment;
                  updatedPurchase.save(function(){
                    newPayment.save(function(){
                      return res.send(200, updatedPurchase);
                    });
                  });
                });
              });
            });
          });
        })
        .catch(res.negotiate);
    });
  }

};
