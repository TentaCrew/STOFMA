module.exports = function(session, user) {
  if (!user) {
    delete session.user;
  }
  else {
    session.user = {
      id:        user.id,
      name:      user.name,
      firstname:  user.firstname,
      email:     user.email,
      role:      user.role,
      isAdmin:   "ADMINISTRATOR" === user.role,
      isManager: "MANAGER" === user.role
    }
  }
};
