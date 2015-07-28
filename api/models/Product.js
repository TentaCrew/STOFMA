/**
* Product.js
*
* @description :: This model describes a Product.
*/

module.exports = {

  attributes: {
    name: {
      type: 'STRING',
      required: true,
      unique: true
    },
    shortName: {
      type: 'STRING',
      required: true,
      unique: true
    },
    price: {
      type: 'FLOAT',
      required: true
    },
    quantity: {
      type: 'INTEGER',
      required: true
    },
    urlImage: {
      type: 'STRING'
    },
    minimum: {  // Minimum threshold before restocking
      type: 'INTEGER'
    },
    category: {
      type: 'STRING',
      in: ['DRINK','FOOD','OTHER'],
      required: true
    },
    isActive: { // No longer follow for restocking
      type: 'BOOLEAN',
      defaultsTo: true
    }
  }
};
