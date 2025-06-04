import express from 'express';
import passport from '../components/auth.middleware.js';
import { login, logout, googleCallback } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

router.post('/login', login);
router.post('/logout', logout);

export default router; 