import express from 'express';
import session from 'express-session';
import cors from 'cors';
import passport from './components/auth.middleware.js';
import connectDB from './utils/db.js';
import config from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import scheduleRoutes from './app/api/schedules.js';
import userRoutes from './app/api/user.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
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

// Routes
app.use('/auth', authRoutes);
app.use(scheduleRoutes);
app.use(userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

