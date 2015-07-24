/**
 * SaleController
 *
 * @description :: Server-side logic for managing Sales
 */

module.exports = {
  add: function (req, res) {
    // Creating new Sale
    Sale.create({
      saleDate: req.param('saleDate'),
      customer: req.param('customer'),
      manager:  req.param('manager'),
      amount:   req.param('amount'),
      products: req.param('products')
    })
    .then(function (newSale) {
      return Sale.find(newSale.id).populate('products');
    })
    .then(function (newSale) {
      res.json(newSale);
    });
  },

  // TODO: Need to fix PairController:update
  /*update: function (req, res) {
    // Updating a Sale
    Sale.update({id: req.param('id')}, req.allParams())
    .then(function (upSale) {
      return Sale.find(upSale.id).populate('products');
    })
    .then(function (upSale) {
      res.json(upSale);
    });
  },*/

  delete: function (req, res) {
    // Deleting a Sale
    Sale.destroy({id: req.param('id')}, function(err, sale) {
        if (err) {
          return res.negotiate(err);
        }
        else {
          return res.send(200);
        }
    });
  },

  get: function (req, res) {
    // Getting Sales from some parameters
    Sale.find(req.allParams(), function(err, sales) {
        if (err) {
          return res.negotiate(err);
        }
        else {
          return res.send(sales);
        }
    });
  }
};
