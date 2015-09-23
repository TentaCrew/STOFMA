'use strict';

/**
 * Sale.js
 *
 * @description :: This model describes a Sale.
 */

module.exports = {

  attributes: {
    saleDate: {
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
    products: {
      collection: 'Pair',
      required: true
    },
    totalPrice: {
      type: 'FLOAT'
    },
    payment:{
      model: 'Payment'
    },
    commentSale:{
      type: 'STRING'
    }
  },

  beforeUpdate: function(values, cb) {
    if(values.products) {
      Pair
        .destroy({sale: values.id})
        .exec(cb);
    }
    else {
      cb();
    }
  }

};
