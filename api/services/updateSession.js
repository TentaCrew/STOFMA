module.exports = function(session, user) {
  if (!user) {
    delete session.user;
  }
  else {
    session.user = {
      id: user.id,
      name: user.name,
      firstnam: user.firstname,
      email: user.email,
      role: user.role
    }
  }
}
