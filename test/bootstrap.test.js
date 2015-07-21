var Sails = require('sails');

before(function(done) {
  Sails.lift({
    log: {
      level: 'error'
    }
  },
  done);
});

after(function(done) {
  Sails.lower(done);
});
