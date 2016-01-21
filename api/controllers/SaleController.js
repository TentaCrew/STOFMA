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
  * @param req.param.customerId                          {Number}    Id of the customer User
  * @param req.param.products                            {Array}     Array of productId-quantity pairs defined as follows [{productId: <Number>, quantity: <Number>}, ...]
  * @param res
  */
  add: function (req, res) {

    User.findOne({id:req.param('customerId')}, function(err, customer){

      //create the pairs
      Pair.createPairs(req.param('products'), true, customer.isMember).then(function(pairs) {

        var totalPrice = 0;
        for (var i = 0; i < pairs.length; i++) {
          totalPrice += Number(pairs[i].unitPrice * pairs[i].quantity);
        }

        //check the stock
        var stockOut = false;
        async.each(pairs, function(pair, cb) {
          Product.findOne(pair.product, function(err,product){
            if(Number(product.quantity) < 0) {    //the stock has already been updated in createPairs
              stockOut = true;
            }
            cb();
          });
        }, function(){

          if(stockOut === true){
            Pair.deletePairs(pairs,true)
            .then(function(){
              sails.log.debug("Not enough items");
              return res.send(407, "Not enough items");
            });
          }
          //check if he has enough credit
          else if(req.param('typePayment') == 'IN_CREDIT' && customer.credit < totalPrice) {
            //destroy the new pairs if he hasn't
            Pair.deletePairs(pairs,true)
            .then(function(){
              sails.log.debug("Not enough credit");
              return res.send(406, "You don't have enough credit.");
            });
          }
          else {

            //Create the Payment without amount (unknown at this moment)
            Payment.create({
              paymentDate : req.param('saleDate') || new Date(),
              customer    : req.param('customerId'),
              manager     : req.session.user.id,
              type        : req.param('typePayment')
            }, function (err, newPayment) {
              if (err) {
                sails.log.debug(getDateLog() + "Payment not created");
                return res.send(400,'Payment not created.');
              }
              else {

                //create the Sale
                Sale.create({
                  saleDate: req.param('saleDate') || new Date(),
                  customer: req.param('customerId'),
                  manager:  req.session.user.id,
                  products: pairs,
                  totalPrice: totalPrice,
                  commentSale: req.param('commentSale'),
                  payment: newPayment
                }, function (err, newSale) {

                  if (err) {
                    return res.negotiate(err);
                  }
                  else {

                    //update the amount of the Payment if the totalPrice of the Sale
                    newPayment.amount = Number(newSale.totalPrice);
                    newPayment.save(function(){
                      var s = [];
                      for(var i = 0; i < pairs.length; i++){
                        s.push(pairs[i].quantity + "x " + pairs[i].product + " (" + pairs[i].unitPrice + "€/u)");
                      }
                      //update the user's credit
                      if(req.param('typePayment') === 'IN_CREDIT'){
                        customer.credit -= Number(newSale.totalPrice);
                        customer.save(function(){
                          sails.log.debug(getDateLog() + "Sale added by credit with success : " + s.join(', '));
                          return res.send(200, newSale);
                        });
                      }
                      else{
                        customer.save(function(){
                          sails.log.debug(getDateLog() + "Sale added with success : " + s.join(', '));
                          return res.send(200, newSale);
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      });
    });
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
          else {
            cb();
          }
        }
      },
      function(err, results) {
        Sale
        .destroy(req.allParams())
        .exec(function(err, deletedSale) {
          //delete related payment
          Payment.destroy(sale.payment.id, function(err,deletedPmt){
            if(err){
              sails.log.debug(getDateLog() + "Payment not deleted");
              return res.send(400,'Payment not deleted.');
            }
            else {
              sails.log.debug(getDateLog() + "Sale deleted with success");
              return res.send(200,'Sale deleted with success');
            }
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

    // restrict regular users to their own sales only
    if(!req.session.user.isManager){
      req.allParams().customer = req.session.user.id;
    }

    var page  = req.param('page')  || 0;
    var limit = req.param('limit') || 999999999;
    var saleDateRange = {
      min: false,
      max: false
    };

    var fetchCriterias = req.allParams();

    if (req.param('saleDateMin')) {
      var dmin = new Date(req.param('saleDateMin'));
      dmin.setHours(0, 0); // Set hours to midnight.
      saleDateRange.min = dmin;
      fetchCriterias['saleDate'] = {};
      fetchCriterias['saleDate']['>='] = saleDateRange.min;
      delete req.allParams().saleDateMin;
    }

    if (req.param('saleDateMax')) {
      var dmax = new Date(req.param('saleDateMax'));
      dmax.setHours(23, 59); // Set hours to midnight.
      saleDateRange.max = dmax;
      fetchCriterias['saleDate'] = fetchCriterias['saleDate'] ? fetchCriterias['saleDate'] : {};
      fetchCriterias['saleDate']['<='] = saleDateRange.max;
      delete req.allParams().saleDateMax;
    }

    delete req.allParams().page;
    delete req.allParams().limit;

    if(req.session.lazy) { // Populate everything
      Sale.find(fetchCriterias)
          .populate('manager')
          .populate('customer')
          .populate('products')
          .populate('payment')
          .paginate({page: page, limit: limit})
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

    var updatedValues = {};
    if(req.param('customerId')) updatedValues.customer = req.param('customerId');
    updatedValues.manager =  req.session.user.id;
    if(req.param('saleDate'))
      updatedValues.saleDate = req.param('saleDate');

    //get the sale to update
    Sale.findOne(req.param('id')).populate('products').populate('payment').exec(function(err,saleToUpdate){

      //get the customer
      User.findOne({id:req.param('customerId') || saleToUpdate.customer }, function(err, customer){

        //create the pairs
        Pair.createPairs(req.param('products'),true, customer.isMember).then(function(pairs) {

          //get his credit
          var totalPrice = 0;
          for (var i = 0; i < pairs.length; i++) {
            totalPrice += Number(pairs[i].unitPrice * pairs[i].quantity);
          }

          //check the stock
          var stockOut = false;
          async.each(pairs, function(pair, cb) {
            Product.findOne(pair.product, function(err,product){
              var previousQuantity = 0;   // previous quantity of product bought in the sale to update
              for (var i = 0; i < saleToUpdate.products.length; i++) {
                if(saleToUpdate.products[i].product == pair.product){
                    previousQuantity += saleToUpdate.products[i].quantity;
                }
              }
              if(Number(product.quantity)+previousQuantity < 0) {    //the stock has already been updated in createPairs
                stockOut = true;
              }
              cb();
            });
          }, function(){

            if(stockOut === true){
              Pair.deletePairs(pairs,true)
              .then(function(){
                sails.log.debug("Not enough items");
                return res.send(407, "Not enough items");
              });
            }
            //check if he has enough credit
            else if (req.param('typePayment') === 'IN_CREDIT' &&
            ((saleToUpdate.payment.type === 'IN_CREDIT' && Number(customer.credit) + Number(saleToUpdate.totalPrice) < Number(totalPrice)) ||
             (saleToUpdate.payment.type !== 'IN_CREDIT' && Number(customer.credit) < Number(totalPrice)))) {

              //destroy the new pairs if he hasn't
              Pair.deletePairs(pairs,true)
              .then(function(){
                sails.log.debug("Not enough credit");
                return res.send(406, "You don't have enough credit.");
              });
            }
            else {

              //remove the old pairs
              Pair.deletePairs(saleToUpdate.products,true)
              .then(function(){

                //add the new pairs
                updatedValues.products = pairs;

                //add the new totalPrice
                updatedValues.totalPrice = totalPrice;

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
                    manager     : req.session.user.id,
                    type        : req.param('typePayment') || saleToUpdate.payment.type
                  }, function (err, newPayment) {
                    if(err){
                      sails.log.debug("Payment not created (update)");
                      return res.send(400, 'Payment not created.');
                    }
                    else {
                      Payment.destroy(saleToUpdate.payment, function(err,p){
                        if(err){
                          sails.log.debug("Payment not deleted (update)");
                          return res.send(400,'Payment not deleted.');
                        }
                        else {
                          newPayment.amount = updatedSale.totalPrice;
                          updatedSale.payment = newPayment;
                          updatedSale.save(function(){
                            newPayment.save(function(){
                              customer.save(function(){
                                var s = [];
                                for(var i = 0; i < pairs.length; i++){
                                  s.push(pairs[i].quantity + "x " + pairs[i].product + " (" + pairs[i].unitPrice + "€/u)");
                                }
                                sails.log.debug("Sale updated : "+ s.join(', '));
                                return res.send(200, updatedSale);
                              });
                            });
                          });
                        }
                      });
                    }
                  });
                });
              });
            }
          });
        });
      });
    });
  }

};
