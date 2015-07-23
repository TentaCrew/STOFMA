/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Simple policy to allow administrators only
 *                 Assumes that your login action in one of your controllers sets `req.session.isAdmin = true;`
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (true === req.session.isAdmin) {
    return next();
  }

  // User is not allowed
  return res.send(401, 'You do not have sufficient privileges.');
};
