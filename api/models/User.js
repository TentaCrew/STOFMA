'use strict';

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
      protected: true,
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
    },
    role: {
      type: 'STRING',
      in: ['USER','MANAGER','ADMINISTRATOR'],
      defaultsTo: 'USER'
    },
    credit: {
      type: 'FLOAT',
      defaultsTo: 0
    },
    isMember: {
      type: 'BOOLEAN',
      defaultsTo: false
    }

  },

  beforeCreate: function (values, cb) {
    // Encrypting password
    values.password = sha1(values.password);
    
    // First name in capital
    values.firstname = String(values.firstname).charAt(0).toUpperCase() + String(values.firstname).slice(1).toLowerCase();
    
    // Name in uppercase
    values.name = String(values.name).toUpperCase();
    
    // Removing white spaces from the phone number
    if(values.phoneNumber) {
      values.phoneNumber = values.phoneNumber.replace(/ /g,'')
    }
    cb();
  },

  beforeUpdate: function (values, cb) {
    User.findOne(values.id, function(err,oldUser){
      // Encrypting password
      if(oldUser && oldUser.password !== values.password) {
        if(values.password) {
          values.password = sha1(values.password);
        }
      }
      // Removing white spaces from the phone number
      if(values.phoneNumber) {
        values.phoneNumber = values.phoneNumber.replace(/ /g,'')
      }
      cb();
    });
  }
};
