'use strict';

/**
 * PaymentController
 *
 * @description :: Server-side logic for managing Payments
 */

module.exports = {
  add: function (req, res) {
    // Creating new Payment
    Payment.create({
      paymentDate : new Date(),
      customer    : req.param('customerId'),
      name        : req.param('name'),
      manager     : req.param('managerId') || req.session.user.id,
      amount      : req.param('amount'),
      type        : req.param('type')
    }, function (err, newPayment) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        return res.send(200, newPayment);
      }
    });
  },

  get: function (req, res) {
    // Getting Payment from some parameters
    Payment.find(req.allParams())
    .populate('customer')
    .populate('manager')
    .exec(function(err, payment) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        return res.send(payment);
      }
    });
  }

};
