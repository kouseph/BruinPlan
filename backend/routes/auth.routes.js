import express from 'express';
import passport from '../components/auth.middleware.js';
import { login, logout, googleCallback } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/google',
  passport.authenticate('google', { 
    scope: [
      'email', 
      'profile',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    accessType: 'offline',
    prompt: 'consent'  // Force consent screen to get refresh token
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

router.post('/login', login);
router.post('/logout', logout);

export default router; 