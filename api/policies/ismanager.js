/**
 * isManager
 *
 * @module      :: Policy
 * @description :: Simple policy to allow manager and administrator only
 *                 Assumes that your login action in one of your controllers sets `req.session.isManager = true;`
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if ( req.session.user && ('ADMINISTRATOR' === req.session.user.role || 'MANAGER' === req.session.user.role) ) {
    return next();
  }

  // User is not allowed
  return res.send(401, 'You do not have sufficient privileges.');
};
