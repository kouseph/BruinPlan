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
      console.log('Google OAuth callback received:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        profileId: profile.id
      });

      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        // Update existing user info and tokens
        existingUser.name = profile.displayName;
        existingUser.email = profile.email;
        existingUser.accessToken = accessToken;
        // Only update refresh token if we got a new one
        if (refreshToken) {
          existingUser.refreshToken = refreshToken;
        }
        await existingUser.save();
        console.log('Updated existing user:', {
          id: existingUser.id,
          hasAccessToken: !!existingUser.accessToken,
          hasRefreshToken: !!existingUser.refreshToken
        });
        return done(null, existingUser);
      } else {
        // Create new user with tokens
        const newUser = await User.create({
          googleId: profile.id,
          email: profile.email,
          name: profile.displayName,
          accessToken: accessToken,
          refreshToken: refreshToken
        });
        console.log('Created new user:', {
          id: newUser.id,
          hasAccessToken: !!newUser.accessToken,
          hasRefreshToken: !!newUser.refreshToken
        });
        return done(null, newUser);
      }
    } catch (err) {
      console.error('Auth Error:', err);
      return done(err, null);
    }
  }
));

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Authentication middleware
export const isAuthenticated = (req, res, next) => {
  console.log('Auth Check - Session:', req.session);
  console.log('Auth Check - User:', req.user);
  console.log('Auth Check - isAuthenticated:', req.isAuthenticated());
  
  if (req.isAuthenticated()) {
    console.log('User is authenticated, proceeding...');
    return next();
  }
  console.log('Authentication failed - no valid session');
  res.status(401).json({ message: 'Unauthorized - Please log in' });
};

export default passport; 