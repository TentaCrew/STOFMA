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
    
  }
};
