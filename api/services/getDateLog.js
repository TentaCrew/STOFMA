'use strict';

module.exports = function() {
  var date = new Date(),
      str = "";
  
  str += date.toUTCString();
  
  str += " - ";
  
  return str;
}


