import express from 'express';
import session from 'express-session';
import cors from 'cors';
import passport from './components/auth.middleware.js';
import connectDB from './utils/db.js';
import config from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import scheduleRoutes from './routes/schedule.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3001', // Allow frontend origin
  credentials: true, // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Test route for root path
app.get('/', (req, res) => {
  res.json({ 
    message: 'BruinPlan API is running',
    endpoints: {
      auth: '/auth/google',
      user: '/api/user',
      courses: '/api/user/courses',
      schedules: '/api/schedules',
      optimize: '/api/schedule/optimize'
    }
  });
});

// Routes
app.use(authRoutes);
app.use(userRoutes);
app.use(scheduleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.url
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('- GET  /');
  console.log('- GET  /auth/google');
  console.log('- GET  /api/user');
  console.log('- POST /api/user/courses');
  console.log('- POST /api/schedule/optimize');
  console.log('- POST /api/schedules');
  console.log('- DELETE /api/schedules/:index');
});

