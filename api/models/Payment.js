'use strict';

/**
* Payment.js
*
* @description :: This model describes a Payment.
* A payment illustrate a real money operation (when money enter or get out the "cash register").
*/

module.exports = {

  attributes: {
    paymentDate: {
      type: 'DATE',
      required: true
    },
    customer: {
      model: 'User',
      required: true
    },
    manager: {
      model: 'User',
      required: true
    },
    amount: {
      type: 'FLOAT'
    },
    type: {
      type: 'STRING',
      in: ['IN_CREDIT',       //> is for users who give money to credit their account
           'IN_CASH',         //> is for users who pay smthg with cash
           'IN_CHECK',        //> is for users who pay smthg with a check
           'IN_TRANSFER',    //> is for users who pay smthg by a bank transfer
           'OUT_CASH',        //> is when the association pay smthg with cash
           'OUT_CHECK',       //> is when the association pay smthg with a check
           'OUT_TRANSFER',   //> is when the association pay smthg by a bank transfer
           'OUT_CARD',   //> is when the association pay smthg with a credit card
           'OTHER'],
      defaultsTo: 'OTHER'
    }
  }
};
