# BruinPlan

**BruinPlan** is a smart course scheduling application designed specifically for UCLA students. It helps students find optimal class schedules by automatically detecting conflicts between lectures, discussions, and final exams while minimizing gaps between classes.

## Project Overview

BruinPlan streamlines the UCLA course planning process by:
- **Smart Conflict Detection**: Automatically identifies conflicts between lectures, discussions, and final exam times
- **Optimized Scheduling**: Generates schedules that minimize gaps between classes
- **User-Friendly Interface**: Intuitive course search and schedule visualization
- **Persistent Storage**: Save and manage multiple schedule options
- **Export Functionality**: Export schedules to calendar applications (.ics format)

## Tech Stack

### Frontend
- **React.js** with functional components and hooks
- **React Router** for navigation
- **CSS3** with custom styling and responsive design
- **Fetch API** for HTTP requests

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Passport.js** for Google OAuth authentication
- **Express Sessions** for session management
- **CORS** for cross-origin requests

### Authentication
- **Google OAuth 2.0** integration
- **Session-based authentication** with secure cookies

## Key Features

### Course Management
- **Course Search**: Search and filter UCLA courses
- **Course Selection**: Add/remove courses from your plan
- **Auto-Save**: Automatically saves selected courses for authenticated users

### Schedule Generation
- **Intelligent Algorithm**: Generates all possible valid schedule combinations
- **Conflict Detection**: 
  - Regular class time conflicts
  - Discussion section conflicts
  - **Final exam time conflicts**
- **Gap Optimization**: Minimizes time gaps between classes
- **Multiple Options**: Provides multiple valid schedule alternatives

### User Experience
- **Guest Mode**: Try the app without signing in
- **Authenticated Mode**: Full features with data persistence
- **Smart Navigation**: Redirects based on authentication status
- **Schedule Management**: Save, view, and delete multiple schedules

### Schedule Features
- **Visual Timeline**: Interactive weekly calendar view
- **Multi-Day Support**: Handles classes on multiple days (e.g., "Tuesday, Thursday")
- **Schedule Export**: Download schedules as .ics calendar files
- **Schedule Comparison**: View multiple schedule options side-by-side

## Local Setup Instructions

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Google OAuth credentials**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd BruinPlan
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Variables
Create a `.env` file in the `backend` directory:
```bash
# Database
MONGO_URI=mongodb://localhost:27017/bruinplan
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bruinplan

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Session Secret
SESSION_SECRET=your_secure_session_secret

# Server Configuration
PORT=3000
NODE_ENV=development
```

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

#### Start Backend Server
```bash
npm start
```
Backend will run on `http://localhost:3000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start Frontend Development Server
```bash
npm start
```
Frontend will run on `http://localhost:3001`

### 4. Database Setup

#### Local MongoDB
```bash
# Start MongoDB service
mongod

# Or using Homebrew on macOS
brew services start mongodb-community
```

#### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string and add to `MONGO_URI` in `.env`

## Project Structure

```
BruinPlan/
├── frontend/                 # React.js frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/           # Page components (Home, Dashboard, etc.)
│   │   └── App.js
│   └── package.json
├── backend/                 # Node.js/Express backend
│   ├── routes/              # API route handlers
│   ├── models/              # MongoDB schemas
│   ├── scripts/             # Schedule generation algorithm
│   │   └── findSchedule.js  # Core scheduling logic
│   ├── services/            # Business logic
│   ├── components/          # Auth middleware
│   └── index.js             # Server entry point
└── README.md
```

## Core Algorithm: Schedule Generation

The heart of BruinPlan is the `findSchedule.js` algorithm that:

### Conflict Detection
- **Time Parsing**: Converts time strings to numerical values for comparison
- **Day Handling**: Supports multi-day classes (e.g., "Monday, Wednesday, Friday")
- **Overlap Logic**: Detects time conflicts using mathematical interval comparison
- **Final Exam Conflicts**: **Unique feature** - checks for final exam scheduling conflicts

### Schedule Optimization
- **Backtracking Algorithm**: Generates all possible valid combinations
- **Gap Calculation**: Measures time gaps between classes each day
- **Optimization**: Selects schedules with minimal gaps
- **Multiple Solutions**: Returns several optimal schedule options

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `POST /logout` - Logout user

### User Management
- `GET /api/user` - Get user profile and saved data
- `POST /api/user/courses` - Save selected courses

### Schedule Management
- `POST /api/schedule/test` - Generate schedules (guest/authenticated)
- `POST /api/schedules` - Save schedule to user profile
- `DELETE /api/schedules/:index` - Delete saved schedule

### Course Data
- `GET /api/courses` - Search and filter courses

## Usage Guide

### For New Users (Guest Mode)
1. Visit the home page
2. Search and select courses
3. Click "PLAN" to generate schedules
4. View generated schedule options
5. Sign in to save schedules

### For Returning Users
1. Sign in with Google
2. Automatically redirected to Dashboard
3. Previous course selections are loaded
4. Generate and save multiple schedules
5. Manage schedules in Profile page

### Schedule Management
1. **View Schedules**: Visual calendar layout with color-coded events
2. **Export**: Download as .ics file for calendar apps
3. **Delete**: Remove unwanted schedules
4. **Create New**: Click "+ New Schedule" to create more options

## Authentication Flow

1. **Home Page Check**: Redirects authenticated users to Dashboard
2. **Navigation-Based State**: Determines login status from navigation source
3. **Session Management**: Secure session cookies with logout cleanup
4. **Guest Experience**: Full functionality without requiring login

## ⚡ Performance Features

- **Debounced Auto-Save**: Prevents excessive API calls when selecting courses
- **Optimized Algorithms**: Efficient schedule generation with early termination
- **Smart State Management**: Minimal re-renders and API calls
- **Responsive Design**: Works on desktop and mobile devices

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB is running
- Verify environment variables in `.env`
- Ensure Google OAuth credentials are correct

**Frontend can't connect to backend:**
- Verify backend is running on port 3000
- Check CORS configuration in backend
- Ensure fetch URLs use correct localhost:3000

**Authentication not working:**
- Verify Google OAuth redirect URI
- Check session secret is set
- Clear browser cookies and try again

**No schedules generated:**
- Check if courses have valid time/day information
- Verify final exam data exists for courses
- Check console for conflict detection logs

## License

This project is created for educational purposes at UCLA.

## Team

Developed as part of the UCLA CS 35L course final project - a comprehensive solution for optimizing student course scheduling with advanced conflict detection including final exam overlap prevention.