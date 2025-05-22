import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import user from '../models/user.js';

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/google/callback",
    passReqToCallback   : true
  },

  async function(request, accessToken, refreshToken, profile, done) {
    try {
      const existingUser = await user.findOne({ googleId: profile.id });

      if (existingUser) {
        // Optionally update info
        existingUser.name = profile.displayName;
        existingUser.email = profile.email;
        await existingUser.save();
        return done(null, existingUser);
      } else {
        const newUser = await user.create({
          googleId: profile.id,
          email: profile.email,
          name: profile.displayName,
        });
        return done(null, newUser);
      }
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser(function(user,done){
    done(null,user);
});

passport.deserializeUser(function(user,done){
    done(null,user);
});