/**
 * SessionController
 *
 * @description :: Server-side logic for managing Sessions
 */

module.exports = {

  get: function (req, res) {
    // Getting session
    if(req.session && req.session.user)
      return res.send(200, req.session.user);
    else
      return res.send(404);
  },

  toggleLazy: function (req, res) {
    if(req.param('lazy')) {
      req.session.lazy = req.param('lazy');
    }
    else {
      req.session.lazy = !req.session.lazy;
    }
    return res.send(200);
  }
};
