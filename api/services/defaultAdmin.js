var q = require('q');
var generatePassword = require('password-generator');

var adminUser = {
  firstname: 'admin',
  name: 'admin',
  email: 'admin@stofma.com',
  sex: true,
  role: 'ADMINISTRATOR',
  password: generatePassword(12, false)
};

module.exports = function(force) {
  var deferred = q.defer();
  if(force) {
    createAdmin()
      .then(deferred.resolve)
      .catch(deferred.reject);
  }
  else {
    User
      .findOne({role: "ADMINISTRATOR"})
      .exec(function(err, foundAdmin) {
        if(err) {
          deferred.reject(err);
        }
        else {
          if(!foundAdmin) {
            createAdmin()
              .then(deferred.resolve)
              .catch(deferred.reject);
          }
          else {
            deferred.resolve();
          }
        }
      });
  }
  return deferred.promise;
}

function createAdmin() {
  var deferred = q.defer();
  User
    .create(adminUser)
    .exec(function(err, newAdmin) {
      if(err) {
        deferred.reject(err);
      }
      else {
        deferred.resolve({
          email: adminUser.email,
          password: adminUser.password
        });
      }
    });
  return deferred.promise;
}