import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from './components/auth.middleware.js';
import session from 'express-session';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import scheduleRoutes from './routes/schedule.routes.js';
import classes from './routes/course.routes.js'
import calendarRoutes from './app/api/calendar/route.js';

dotenv.config();

const app = express();

// Configure CORS before other middleware
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/courses', classes)
app.use(calendarRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET  /');
  console.log('- GET  /auth/google');
  console.log('- GET  /api/user');
  console.log('- POST /api/user/courses');
  console.log('- POST /api/schedule/optimize');
  console.log('- POST /api/schedules');
  console.log('- DELETE /api/schedules/:index');
});

