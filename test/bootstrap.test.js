var Sails = require('sails');

before(function(done) {
  Sails.lift({
    log: {
      level: 'error'
    },
    models: {
      connection: 'localDiskDb',
      migrate: 'drop'
    }
  },
  done);
});

after(function(done) {
  Sails.lower(done);
});
