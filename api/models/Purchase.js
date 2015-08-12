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
    amount: {
      type: 'FLOAT',
      required: true
    },
    products: {
      collection: 'Pair',
      required: true
    }
  }

};
