'use strict';

/**
 * ProductController
 *
 * @description :: Server-side logic for managing Products
 */

module.exports = {

  add: function (req, res) {
    // Creating new Product
    Product.create({
      name:         req.param('name'),
      shortName:    req.param('shortName'),
      price:        req.param('price'),
      memberPrice:  req.param('memberPrice'),
      quantity:     req.param('quantity'),
      urlImage:     req.param('urlImage'),
      minimum:      req.param('minimum'),
      category:     req.param('category'),
      isActive:     req.param('isActive')
    }, function (err, newProduct) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        sails.log.debug("Product " + req.param('name') + " added in category " + req.param('category'));
        return res.send(200, newProduct);
      }
    });
  },

  update: function (req, res) {
    // Updating a Product
    Product.update({id: req.param('id')}, req.allParams(), function(err, product) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        return res.send(product);
      }
    });
  },

  delete: function (req, res) {
    // Deleting a Product
    Product.destroy({id: req.param('id')}, function(err, product) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        return res.send(200);
      }
    });
  },

  get: function (req, res) {
    // Getting Product from some parameters
    Product.find(req.allParams(), function(err, product) {
      if (err) {
        return res.negotiate(err);
      }
      else {
        return res.send(product);
      }
    });
  }

};
