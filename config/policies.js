/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

  '*': false,

  'UserController': {
    '*':      false,
    'signup': 'unauthenticated',
    'login':  'unauthenticated',
    'logout': 'authenticated',
    'update': 'authenticated',
    'delete': 'isAdmin',
    'getAll': 'authenticated',
    'get':    'authenticated'
  },

  'ProductController': {
    '*':      false,
    'add':    'isManager',
    'update': 'isManager',
    'delete': 'isManager',
    'get':    'authenticated'
  },

  'PairController': {
    '*':          false,
    'add':        'isManager',
    'delete':     'isManager',
    'update':     'isManager',
    'getProduct': 'authenticated'
  },

  'PurchaseController': {
    '*':        false,
    'add':      'isManager',
    'get':      'isManager',
    'getPairs': 'authenticated'
  },

  'SessionController': {
    'get': true
  },

  'SaleController': {
    '*':        false,
    'add':      'isManager',
    'update':   'isManager',
    'delete':   'isManager',
    'get':      'authenticated',
    'getPairs': 'authenticated'
  }

};
