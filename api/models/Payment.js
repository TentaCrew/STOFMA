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
    name: {
      type: 'STRING',
      required: true
    },
    customer: {
      model: 'User'
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
           'IN_TRANSFER',     //> is for users who pay smthg by a bank transfer
           'OUT_CASH',        //> is when the association pay smthg with cash
           'OUT_CHECK',       //> is when the association pay smthg with a check
           'OUT_TRANSFER',    //> is when the association pay smthg by a bank transfer
           'OUT_CARD',        //> is when the association pay smthg with a credit card
           'OTHER'],
       required: true
    },
    creditMode: {
      type: 'BOOLEAN',
      defaultsTo: false
    }
  },

  beforeValidate: function(values, next) {

    if(values.amount){
      values.amount = Number(values.amount).toFixed(2);
    }

    switch (values.type) {
      case 'IN_CREDIT' :
        values.name = 'Solde';
        break;
      case 'IN_CASH' :
        values.name = 'Espèces';
        break;
      case 'IN_CHECK' :
        values.name = 'Chèque';
        break;
      case 'IN_TRANSFER' :
        values.name = 'Virement';
        break;
      case 'OUT_CASH' :
        values.name = 'Espèces';
        break;
      case 'OUT_CHECK' :
        values.name = 'Chèque';
        break;
      case 'OUT_TRANSFER' :
        values.name = 'Virement';
        break;
      case 'OUT_CARD' :
        values.name = 'Carte bancaire';
        break;
      case 'OTHER' :
        values.name = 'Autre';
        break;
      default:
        values.name = 'Autre';
    }
    next();
  }
};
