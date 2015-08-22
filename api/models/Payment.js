'use strict';

/**
* Payment.js
*
* @description :: This model describes a Payment.
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
    }
  }
};
