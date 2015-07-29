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
    }, function (err, newSale) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        return res.send(200, newSale);
      }
    });
  },

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
  },

  getPairs: function (req, res) {
   Sale.findOne(req.allParams()).populate('products').exec(function(err, sale) {
     if (err) {
       return res.negociate(err);
     }
     return res.send(sale.products);
   });
 }
};
