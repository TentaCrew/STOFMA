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
            .destroy({sale: values.id})
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
      },
    ], cb);
  }

};

function computeTotalPrice(sale, cb) {
  var totalPrice = 0;
  async.each(sale.products, function (pair, cb) {
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
      sale.totalPrice = totalPrice;
      cb();
    }
  });
}
