/**
 * PurchaseController
 *
 * @description :: Server-side logic for managing Purchases
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  add: function (req, res) {
    // Creating new Purchase
    Purchase.create({
      purchaseDate: req.param('purchaseDate'),
      amount:       req.param('amount'),
      manager:      req.param('manager'),
      products:     req.param('products')
    }, function (err, newPurchase) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        sails.log.debug("Purchase of the "+purchaseDate+" added.");
        return res.send(200);
      }
    });
  },

  delete: function (req, res) {
    // Deleting a Purchase
    Purchase.destroy({id: req.param('id')}, function(err, purchase) {
        if (err) {
          return res.negotiate(err);
        }
        else {
          return res.send(200);
        }
    });
  },

  get: function (req, res) {
    // Getting Purchases from some parameters
    Purchase.find(req.allParams(), function(err, purchases) {
        if (err) {
          return res.negotiate(err);
        }
        else {
          return res.send(purchases);
        }
    });
  },

  getPairs: function (req, res) {
   Purchase.findOne(req.allParams()).populate('products').exec(function(err, purchase) {
     if (err) {
       return res.negociate(err);
     }
     return res.send(purchase.products);
   });
  }
};
