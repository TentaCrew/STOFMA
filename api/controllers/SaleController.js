'use strict';

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

    //create the pairs
    Pair.createPairs(req.param('products'), true)
    .then(function(pairs) {

      //get the customer
      User.findOne(req.param('customerId'), function(err, customer){

        //get his credit
        var totalPrice = 0;
        for (var i = 0; i < pairs.length; i++) {
          totalPrice += Number(pairs[i].unitPrice * pairs[i].quantity);
        }

        //check if he has enough credit
        if(req.param('typePayment') == 'IN_CREDIT' && customer.credit < totalPrice) {
          //destroy the new pairs if he hasn't
          Pair.deletePairs(pairs,true)
          .then(function(){
            return res.send(406, "You don't have enough credit.");
          });
        }
        else {

          //Create the Payment without amount (unknown at this moment)
          Payment.create({
            paymentDate : req.param('saleDate') || new Date(),
            customer    : req.param('customerId'),
            manager     : req.param('managerId') || req.session.user.id,
            type        : req.param('typePayment')
          }, function (err, newPayment) {
            if (err) {
              return res.negotiate(err);
            }
            else {

              //create the Sale
              Sale.create({
                saleDate: req.param('saleDate') || new Date(),
                customer: req.param('customerId'),
                manager:  req.param('managerId') || req.session.user.id,
                products: pairs,
                payment: newPayment
              }, function (err, newSale) {

                if (err) {
                  return res.negotiate(err);
                }
                else {

                  //update the amount of the Payment if the totalPrice of the Sale
                  newPayment.amount = Number(newSale.totalPrice);
                  newPayment.save(function(){

                    //update the user's credit
                    if(req.param('typePayment') === 'IN_CREDIT'){
                      customer.credit -= Number(newSale.totalPrice);
                      customer.save(function(){
                        return res.send(200, newSale);
                      });
                    }
                    else{
                      return res.send(200, newSale);
                    }
                  });
                }
              });
            }
          });
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


    Sale.findOne(req.allParams()).populate('products').populate('payment').exec(function(err,sale){

      async.parallel({

        //update stocks
        updateStocks: function(cb){
          Pair.deletePairs(sale.products,true)
          .then(function(){
            cb();
          });
        },

        //reimburse user if he used his credit's account to pay
        recreditUser: function(cb){
          if(sale.payment.type === 'IN_CREDIT'){
            User.findOne(sale.customer, function(err,customer){
              customer.credit += Number(sale.totalPrice);
              customer.save(function(){
                cb();
              });
            });
          }
        },
      },
      function(err, results) {
        Sale
        .destroy(req.allParams())
        .exec(function(err, deletedSale) {
          //delete related payment
          Payment.destroy(sale.payment.id, function(err,deletedPmt){
            return res.send(200,'Sale deleted with success');
          });
        });
      });
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
      .populate('payment')
      .sort('saleDate desc')
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
      .sort('saleDate desc')
      .exec(function(err, foundSales) {
        if (err) {
          return res.negotiate(err);
        }
        else {
          return res.send(foundSales);
        }
      });
    }
  },

  /**
   * Update Sale
   * @param req
   * @param req.param
   * @param req.param.saleId
   * @param res
   */
  update: function(req, res) {

    // TODO Verify parameters

    var updatedValues = {};
    if(req.param('customerId')) updatedValues.customer = req.param('customerId');
    if(req.param('managerId')) updatedValues.manager = req.param('managerId');
    if(req.param('saleDate'))
      updatedValues.saleDate = req.param('saleDate');
    else
      updatedValues.saleDate = new Date();

    //create the pairs
    Pair.createPairs(req.param('products'),true)
      .then(function(pairs) {

        //get the sale to update
        Sale.findOne(req.param('id')).populate('products').populate('payment').exec(function(err,saleToUpdate){

          //get the customer
          User.findOne(saleToUpdate.customer, function(err, customer){

            //get his credit
            var totalPrice = 0;
            for (var i = 0; i < pairs.length; i++) {
              totalPrice += Number(pairs[i].unitPrice * pairs[i].quantity);
            }

            //check if he has enough credit
            if (req.param('typePayment') === 'IN_CREDIT' &&
            ((saleToUpdate.payment.type === 'IN_CREDIT' && Number(customer.credit) + Number(saleToUpdate.totalPrice) < Number(totalPrice)) ||
             (saleToUpdate.payment.type !== 'IN_CREDIT' && Number(customer.credit) < Number(totalPrice)))) {

              //destroy the new pairs if he hasn't
              console.log('heellllloo');
              Pair.deletePairs(pairs,true)
              .then(function(){
                return res.send(406, "You don't have enough credit.");
              });
            }
            else {

              //remove the old pairs
              Pair.deletePairs(saleToUpdate.products,true)
              .then(function(){

                //add the new pairs
                updatedValues.products = pairs;

                //update the sale with the new values
                Sale.update(saleToUpdate.id, updatedValues, function (err, updatedSale) {

                  //get the updated sale
                  updatedSale = updatedSale[0];

                  //update the user's credit and the payment
                  if(saleToUpdate.payment.type === 'IN_CREDIT' && req.param('typePayment') === 'IN_CREDIT'){
                    customer.credit = Number(customer.credit) + Number(saleToUpdate.totalPrice) - Number(updatedSale.totalPrice);
                  }
                  else if(saleToUpdate.payment.type === 'IN_CREDIT' && req.param('typePayment') !== 'IN_CREDIT'){
                    customer.credit = Number(customer.credit) + Number(saleToUpdate.totalPrice);
                  }
                  else if(saleToUpdate.payment.type !== 'IN_CREDIT' && req.param('typePayment') === 'IN_CREDIT'){
                    customer.credit = Number(customer.credit) - Number(updatedSale.totalPrice);
                  }

                  Payment.create({
                    paymentDate : req.param('saleDate') || new Date(),
                    customer    : updatedSale.customer,
                    manager     : updatedSale.manager,
                    type        : req.param('typePayment')
                  }, function (err, newPayment) {
                    Payment.destroy(saleToUpdate.payment, function(err,p){
                      updatedSale.payment = newPayment;
                      updatedSale.save(function(){
                        customer.save(function(){
                          return res.send(200, updatedSale);
                        });
                      });
                    });
                  });
                });
              });
            }
          });
        });
      })
      .catch(res.negotiate);
  }

};
