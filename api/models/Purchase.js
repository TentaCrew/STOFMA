'use strict';

/**
 * Purchase.js
 *
 * @description :: This model describes a Purchase.
 */

module.exports = {

  attributes: {
    purchaseDate: {
      type: 'DATE',
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
    }
  },

  beforeUpdate: function(values, cb) {
    if(values.products) {
      Pair
        .destroy({purchase: values.id})
        .exec(cb);
    }
    else {
      cb();
    }
  }
};
