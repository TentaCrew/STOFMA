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
    associatedSale: {
      model: 'Sale'
    },
    associatedPurchase: {
      model: 'Purchase'
    }
  }

};
