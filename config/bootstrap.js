/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  sails.on('lifted', function() {

    if('test' != sails.config.environment) {
      guestUser()
        .then(function (guestUser) {
          if (guestUser) {
            console.log("Guest user created.");
          }
        })
        .catch(function (err) {
          sails.log.error("Error while creating guest user:\n" + err);
        });

      defaultAdmin()
        .then(function (newAdmin) {
          if (newAdmin) {
            console.log("Default admin account:\n\temail: " + newAdmin.email + "\n\tpassword: " + newAdmin.password);
          }
        })
        .catch(function (err) {
          sails.log.error("Couldn't create default admin account:\n" + err);
        });
    }

    if('development' === sails.config.environment) {
      // TODO Inject fake data
    }

  });

  cb();
};
