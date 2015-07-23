var sha1 = require('sha1');

/**
* User.js
*
* @description :: This model describes an User.
*/

module.exports = {

  attributes: {

    firstname: {
      type: 'STRING',
      required: true
    },
    name: {
      type: 'STRING',
      required: true
    },
    birthdate: {
      type: 'DATE'
    },
    sex: {
      type: 'BOOLEAN', // True for male
      required: true
    },
    password: {
      type: 'STRING',
      required: true
    },
    email: {
      type: 'EMAIL',
      required: true,
      unique: true
    },
    phoneNumber: {
      type: 'STRING',
      size: '12'
    }

  },

  beforeCreate: function (values, cb) {
    // Encrypting password
    values.password = sha1(values.password);

    // Removing white spaces from the phone number
    if(values.phoneNumber) {
      values.phoneNumber = values.phoneNumber.replace(/ /g,'')
    }
    cb();
  },

  beforeUpdate: function (values, cb) {
    // Encrypting password
    if(values.password) {
      values.password = sha1(values.password);
    }

    // Removing white spaces from the phone number
    if(values.phoneNumber) {
      values.phoneNumber = values.phoneNumber.replace(/ /g,'')
    }
    cb();
  }
};
