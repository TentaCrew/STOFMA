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
        sails.log.debug("Unit price must be provided");
        return res.send(400, 'Unit price must be provided');
      }
    }

    //create the pairs
    Pair.createPairs(req.param('products'),false)
    .then(function(pairs) {

      var totalPrice = 0;
      for (var i = 0; i < pairs.length; i++) {
        totalPrice += Number(pairs[i].unitPrice * pairs[i].quantity);
      }

      //Create the Payment without amount (unknown at this moment)
      Payment.create({
        paymentDate : req.param('purchaseDate') || new Date(),
        customer    : req.param('customerId'),
        manager     : req.session.user.id,
        type        : req.param('typePayment')
      }, function (err, newPayment) {
        if (err) {
          sails.log.debug("Payment not created");
          return res.send(400,'Payment not created.');
        }
        else {
          //create the Purchase
          Purchase.create({
            purchaseDate: req.param('purchaseDate') || new Date(),
            manager:      req.session.user.id,
            products:     pairs,
            totalPrice:   totalPrice,
            payment:      newPayment
          }, function (err, newPurchase) {
            if (err) {
              sails.log.debug("Error during purchase addition");
              return res.negotiate(err);
            }
            else {
              //update the amount of the Payment if the totalPrice of the Purchase
              newPayment.amount = Number(newPurchase.totalPrice);
              newPayment.save(function(){
                sails.log.debug("Purchase created with success : " + newPurchase);
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
            if(err){
              sails.log.debug("Error during Payment deletion");
              return res.send(400,'Payment not deleted.');
            }
            else{
              sails.log.debug("Purchase deleted with success : "+deletedPurchase);
              return res.send(200,'Purchase deleted with success');
            }
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

      var page  = req.param('page')  || 0;
      var limit = req.param('limit') || 999999999;

      delete req.allParams().page;
      delete req.allParams().limit;

      if(req.session.lazy) { // Populate everything
        Purchase
        .find(req.allParams())
        .populate('manager')
        .populate('products')
        .populate('payment')
        .paginate({page: page, limit: limit})
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

    var updatedValues = {};
    updatedValues.manager = req.session.user.id;
    if(req.param('purchaseDate'))
      updatedValues.purchaseDate = req.param('purchaseDate');

    Purchase.findOne(req.param('id')).populate('products').populate('payment').exec(function(err,purchaseToUpdate){
      //create the pairs
      Pair.createPairs(req.param('products'),false)
        .then(function(pairs) {

          var totalPrice = 0;
          for (var i = 0; i < pairs.length; i++) {
            totalPrice += Number(pairs[i].unitPrice * pairs[i].quantity);
          }

          //remove the old pairs
          Pair.deletePairs(purchaseToUpdate.products,false)
          .then(function(){

            //add the new pairs
            updatedValues.products = pairs;
            updatedValues.totalPrice = totalPrice;

            //update the purchase with the new values
            Purchase.update(req.param('id'), updatedValues, function (err, updatedPurchase) {

              //get the updated Purchase
              updatedPurchase = updatedPurchase[0];

              Payment.create({
                paymentDate : req.param('purchaseDate') || new Date(),
                manager     : req.session.user.id,
                type        : req.param('typePayment') || purchaseToUpdate.payment.type
              }, function (err, newPayment) {
                if(err){
                  sails.log.debug("Error during purchase update (payment)");
                  return res.send(400,'Payment not created.');
                }
                else {
                  Payment.destroy(purchaseToUpdate.payment, function(err,p){
                    if(err){
                      sails.log.debug("Error during purchase update");
                      return res.send(400,'Payment not deleted.');
                    }
                    else{
                      newPayment.amount = updatedPurchase.totalPrice;
                      updatedPurchase.payment = newPayment;
                      updatedPurchase.save(function(){
                        newPayment.save(function(){
                          sails.log.debug("Purchase updated : "+updatedPurchase);
                          return res.send(200, updatedPurchase);
                        });
                      });
                    }
                  });
                }
              });
            });
          });
        })
        .catch(res.negotiate);
    });
  }

};
