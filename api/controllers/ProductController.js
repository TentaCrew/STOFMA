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
      isActive:     req.param('isActive'),
      forSale:      req.param('forSale')
    }, function (err, newProduct) {
      if (err) {
        sails.log.debug(getDateLog() + "Error during product addition");
        return res.negotiate(err);
      }
      else {
        sails.log.debug(getDateLog() + "Product " + req.param('name') + " added in category " + req.param('category'));
        return res.send(200, newProduct);
      }
    });
  },

  update: function (req, res) {
    // Updating a Product
    Product.update({id: req.param('id')}, req.allParams(), function(err, product) {
      if (product.length == 0){
        return res.notFound();
      }
      else {
        sails.log.debug(getDateLog() + "Product " + product[0].name + " has been update by "
                        + req.session.user.firstname + " " + req.session.user.name);
        return res.send(product);
      }
    });
  },

  delete: function (req, res) {
    // Deleting a Product
    Product.destroy({id: req.param('id')}, function(err, product) {
      if (product.length == 0) {
        return res.notFound();
      }
      else {
        sails.log.debug("Product " + product[0].name + " has been removed by "
                        + req.session.user.firstname + " " + req.session.user.name);
        return res.ok();
      }
    });
  },

  get: function (req, res) {
    // Getting Product from some parameters
    Product.find(req.allParams())
    .sort('id asc')
    .exec(function(err, products) {
      if (products.length == 0) {
        return res.notFound();
      }
      else {
        return res.send(products);
      }
    });
  }

};
