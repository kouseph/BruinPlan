import express from 'express';

const router = express.Router();

// Middleware to ensure the user is authenticated
const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Not authenticated' });
};

// GET: Return the logged-in user's info
router.get('/api/user', ensureAuth, (req, res) => {
  res.json({
    googleId: req.user.googleId,
    name: req.user.name,
    email: req.user.email,
    schedules: req.user.schedules || [],
  });
});

export default router;
