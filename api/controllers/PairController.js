/**
 * PairController
 *
 * @description :: Server-side logic for managing Pairs
 */

module.exports = {
  add: function (req, res) {
    // Creating new Pairs
    var pairs = [];
    Pair.create(req.param('pairs'), function (err, pairs) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        return res.send(200, pairs);
      }
    });
  }

  // TODO: Need to fix SaleController:update
  /*update: function (req, res) {
    // Updating a Sale
    Pair.update({id: req.param('id')}, req.allParams(), function(err, pair) {
        if (err) {
          return res.negotiate(err);
        }
        else {
          console.log(pair);
          return res.send(200, pair);
        }
    });
  }*/
};
