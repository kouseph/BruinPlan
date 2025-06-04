import passport from 'passport';
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import User from '../models/user.js';

dotenv.config();

// Initialize and configure passport with Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/google/callback",
    passReqToCallback: true
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        // Update existing user info
        existingUser.name = profile.displayName;
        existingUser.email = profile.email;
        await existingUser.save();
        return done(null, existingUser);
      } else {
        // Create new user
        const newUser = await User.create({
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

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Authentication middleware
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

export default passport; 