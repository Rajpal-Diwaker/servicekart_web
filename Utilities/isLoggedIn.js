'use strict';

function isLoggedIn(req, res, next) {
	console.log(req.isAuthenticated(),"from login check1");
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(302).redirect('/');
}

module.exports = isLoggedIn;