'use strict';
let userDAO = require('../DAO/userDAO'),
    md5   = require('md5');
    // modules for passport...
let passport   = require('passport'),
    LocalStrategy  = require('passport-local').Strategy,
    bodyParser = require('body-parser');
    //session        = require('express-session');
var util = util = require('../Utilities/util');

// passport needs ability to serialize and unserialize users out of session
passport.serializeUser(function(user, done) {
  done(null, user.user_id);
});

passport.deserializeUser(function(id, done) {
      let criteria = {
        user_id : id
      }

  userDAO.getUsers(criteria, function(err, dbData) {
    if(err) {
      console.error('There was an error accessing the records of' +
      ' user with id: ' + id);
      return console.log(err.message);
    }
    return done(null, dbData[0]);
  })
});


// passport local strategy for local-signup
passport.use('local-signup', new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true
  },
  function(req, email, password, done) {
    process.nextTick(function() {
      userDAO.getUsers({email: email}, function(err, user) {
        if(err) {
          return errHandler(err);
          }
        if(user && user.length>0) {
          //console.log('user already exists');
          return done(null, false, {errMsg: 'email already exists'});
        }
        else {
            let token = util.generateToken();
            let customerData = {
                "first_name": req.body.name.split(' ')[0],
                "last_name": req.body.name.substr(req.body.name.indexOf(" ") + 1),
                "password": util.encryptData(req.body.password),
                "email": req.body.email,
                "token": token,
                "created_At": util.getMysqlDate(new Date().toISOString()),
                "status": 1,
                "user_type": 1
            }

            userDAO.createUser(customerData, function(err, user) {
              if(err) {
                console.log(err);
                return errHandler(err);
                }
              console.log('New user successfully created...',customerData.first_name);
              console.log('email',email);
              console.log(customerData);
              userDAO.getUsers({email: req.body.email}, function(err, dbData) {
                if(err) console.log(err);
                if(dbData.length==0){
                  return done(null, false, {errMsg: 'request failed. Please try again later.'});
                }
                console.log(dbData[0])
                return done(null, dbData[0]);
              })


            })
           /* newUser.first_name = req.body.name;
            newUser.email = email;
            newUser.password = util.encryptData(password);
            newUser.save(function(err) {
              if(err) {
                console.log(err);
                if(err.message == 'User validation failed') {
                  console.log(err.message);
                  return done(null, false, {errMsg: 'Please fill all fields'});
                }
                return errHandler(err);
                }
              console.log('New user successfully created...',newUser.username);
              console.log('email',email);
              console.log(newUser);
              return done(null, newUser);
            });*/
          }
      });
    });
}));




// passport local strategy for local-login, local refers to this app
passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
      let criteria = {
        email : email,
        user_type:1,
        status:1,
        password : util.encryptData(password)
      }
      console.log(criteria);
        userDAO.getUsers(criteria, function(err, dbData) {
            if(err) {
              console.log(err);
            }
            if(dbData.length==0) {
              return done(null, false, {errMsg: 'User does not exist, please' +
              ' <a class="errMsg" href="/signup">signup</a>'});
            }
            return done(null, dbData[0]);
        });

}));

 

module.exports = passport;
