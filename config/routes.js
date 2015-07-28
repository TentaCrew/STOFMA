/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  'GET /': {
    view: 'homepage'
  },

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  *  If a request to a URL doesn't match any of the custom routes above, it  *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

/**
 * Routes about users
 */

  // Create user
  'POST /user': {
    controller: 'UserController',
    action: 'signup'
  },
  // Update current user
  'PATCH /user': {
    controller: 'UserController',
    action: 'update'
  },
  // Update user
  'PATCH /user/:id': {
    controller: 'UserController',
    action: 'update'
  },
  // Log in user
  'PUT /user/login': {
    controller: 'UserController',
    action: 'login'
  },
  // Log out user
  'PUT /user/logout': {
    controller: 'UserController',
    action: 'logout'
  },
  // Delete user
  'DELETE /user/:id' :{
    controller: 'UserController',
    action: 'delete'
  },
  // Get all users
  'GET /user': {
    controller: 'UserController',
    action: 'getAll'
  },
  // Get one user
  'GET /user/:id': {
    controller: 'UserController',
    action: 'get'
  },
  // Get some users
  'POST /user/search': {
    controller: 'UserController',
    action: 'get'
  },

  /**
   * Routes about products
   */

   // Add product
   'POST /product': {
     controller: 'ProductController',
     action: 'add'
   },
   // Update product
   'PATCH /product/:id': {
     controller: 'ProductController',
     action: 'update'
   },
   // Delete product
   'DELETE /product/:id' :{
     controller: 'ProductController',
     action: 'delete'
   },
   // Get one product
   'GET /product/:id': {
     controller: 'ProductController',
     action: 'get'
   },
   // Get some products
   'POST /product/search': {
     controller: 'ProductController',
     action: 'get'
   },

   /**
    * Routes about products
    */

    // Add pair
    'POST /pair': {
      controller: 'PairController',
      action: 'add'
    },
    // Update pair
    'PATCH /pair/:id': {
      controller: 'PairController',
      action: 'update'
    },

    /**
     * Routes about sales
     */

     // Add sale
     'POST /sale': {
       controller: 'SaleController',
       action: 'add'
     },
     // Update sale
     'PATCH /sale/:id': {
       controller: 'SaleController',
       action: 'update'
     },
     // Delete sale
     'DELETE /sale/:id': {
       controller: 'SaleController',
       action: 'delete'
     },
     // Get some sales
     'POST /sale/search': {
       controller: 'SaleController',
       action: 'get'
     },
     // Get all sales
     'GET /sale/': {
       controller: 'SaleController',
       action: 'get'
     },
     // Get one sale by id
     'GET /sale/:id': {
       controller: 'SaleController',
       action: 'get'
     },
     // Get one sale's pairs
     'GET /sale/:id/pairs': {
       controller: 'SaleController',
       action: 'getPairs'
     }

};
