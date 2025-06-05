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

## License

This project is created for educational purposes at UCLA.

## Team

Developed as part of the UCLA CS 35L course final project - a comprehensive solution for optimizing student course scheduling with advanced conflict detection including final exam overlap prevention.
