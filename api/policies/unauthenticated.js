/**
 * unauthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any unauthenticated user
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (null === req.session.authenticated || undefined === req.session.authenticated) {
    return next();
  }

  // User is not allowed
  return res.send(401, 'You are not permitted to perform this action.');
};
