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
    totalPrice: function() {
      var totalPrice;
      async.each(this.products, function (pair, cb) {
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
          // TODO Throw error
          return err;
        }
        else {
          return totalPrice;
        }
      });
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
