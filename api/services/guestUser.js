var q = require('q');
var generatePassword = require('password-generator');

var guestUser = {
  id: -1,
  firstname: 'guest',
  name: 'guest',
  email: 'guest@stofma.com',
  sex: true,
  role: 'USER',
  password: generatePassword(12, false)
};

module.exports = function() {
  var deferred = q.defer();

    User
      .findOne(-1)
      .exec(function(err, foundGuest) {
        if(err) {
          deferred.reject(err);
        }
        else {
          if(!foundGuest) {
            createGuest()
              .then(deferred.resolve)
              .catch(deferred.reject);
          }
          else {
            deferred.resolve();
          }
        }
      });

  return deferred.promise;
}

function createGuest() {
  var deferred = q.defer();
  User
    .create(guestUser)
    .exec(function(err, newUser) {
      if(err) {
        deferred.reject(err);
      }
      else {
        deferred.resolve(newUser);
      }
    });
  return deferred.promise;
}