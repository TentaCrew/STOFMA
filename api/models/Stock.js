/**
* Stock.js
*
* @description :: This model describes a Stock.
*/

module.exports = {

  attributes: {
    product: {
      model: 'Product',
      required: true
    },
    quantity: { //number of products in stock
      type: 'INTEGER',
      required: true
    }
  }
};
