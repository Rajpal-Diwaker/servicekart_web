 var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

 var passport = require('passport');
 passport.use(new GoogleStrategy({

         clientID: "581645001533-vd233d9g8sj455vbsnckd6c8pudr7djn.apps.googleusercontent.com",
         clientSecret: "Bu77m1-9OxN7dudY_47H7-GH",
         callbackURL: "www.worldcoindata.com",

     },
     function(token, refreshToken, profile, done) {

         // make the code asynchronous
         // User.findOne won't fire until we have all our data back from Google
         process.nextTick(function() {

             // try to find the user based on their google id
             User.findOne({ 'google.id': profile.id }, function(err, user) {
                 if (err)
                     return done(err);

                 if (user) {

                     // if a user is found, log them in
                     return done(null, user);
                 } else {
                     // if the user isnt in our database, create a new user
                     var newUser = new User();

                     // set all of the relevant information
                     newUser.google.id = profile.id;
                     newUser.google.token = token;
                     newUser.google.name = profile.displayName;
                     newUser.google.email = profile.emails[0].value; // pull the first email

                     // save the user
                     newUser.save(function(err) {
                         if (err)
                             throw err;
                         console.log(newUser)
                         return done(null, newUser);
                     });
                 }
             });
         });

     }));