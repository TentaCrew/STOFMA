module.exports = function(session, user) {
  if (!user) {
    delete session.user;
  }
  else {
    session.user = new Object();
    session.user.id =        user.id;
    session.user.name =      user.name;
    session.user.firstname =  user.firstname;
    session.user.email =     user.email;
    session.user.role =      user.role;
    session.user.isAdmin =   "ADMINISTRATOR" === user.role;
    session.user.isManager = "MANAGER" === user.role || "ADMINISTRATOR" === user.role;

    session.lazy = true;
  }
};
