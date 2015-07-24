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
      via: 'associatedSale',
      required: true
    },
    amount: {
      type: 'FLOAT',
      required: true
    }
  }

};
