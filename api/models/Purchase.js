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

  beforeCreate: function(values, cb) {
    computeTotalPrice(values, cb);
  },

  beforeUpdate: function(values, cb) {
    async.parallel([
      function(cb) {
        if(values.products) {
          Pair
            .destroy({purchase: values.id})
            .exec(cb);
        }
        else {
          cb();
        }
      },
      function(cb) {
        if(values.products) {
          computeTotalPrice(values, cb);
        }
        else {
          cb();
        }
      }
    ], cb);
  }

};

function computeTotalPrice(purchase, cb) {
  var totalPrice = 0;
  async.each(purchase.products, function (pair, cb) {
    Pair
      .findOne(pair)
      .exec(function (err, foundPair) {
        if (err) {
          cb(err);
        }
        else {
          totalPrice += foundPair.totalPrice();
          cb();
        }
      });
  }, function (err) {
    if (err) {
      cb(err)
    }
    else {
      purchase.totalPrice = totalPrice;
      cb();
    }
  });
}
