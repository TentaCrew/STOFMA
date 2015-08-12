/**
 * Pair.js
 *
 * @description :: This model describes a Pair.
 */

module.exports = {

  attributes: {
    product: {
      model: 'Product',
      required: true
    },
    quantity: {
      type: 'INTEGER',
      required: true
    },
    unitPrice: {
      type: 'FLOAT',
      required: true
    },
    totalPrice: function() {
      return this.unitPrice * this.quantity;
    }

  },

  beforeValidate: function(values, cb) {
    var isPriceUpdated = values.product || values.quantity || values.unitPrice;
    if(!values.unitPrice && isPriceUpdated) {
      Product
      .findOne(values.product)
      .exec(function(err, foundProduct) {
        if(err) {
          cb(err);
        }
        else {
          values.unitPrice = foundProduct.price;
          cb();
        }
      });
    }
    else {
      cb();
    }
  }
};
