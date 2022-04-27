const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth2').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const User = require('../models/googleuser');

const GOOGLE_CLIENT_ID= `${process.env.GOOGLE_ID}`;
const GOOGLE_CLIENT_SECRET = `${process.env.GOOGLE_SECRET}`;

module.exports = (passport) => {
  passport.use(new GoogleStrategy({   
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/google/callback",
    // passReqToCallback   : true
  },
    async (request, accessToken, refreshToken, profile, done) => {
      console.log(profile);
      const newUser = {
        googleId: profile.id,
        displayName: profile.displayName,
      }
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          done(null, user)
        } else {
          user = await User.create(newUser)
          done(null, user)
        }
      } catch (err) {
        if (!err.statusCode) {
            err.statuscode = 500;
        }
        console.log(err)
      }
      
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id); 
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
  });        

}


