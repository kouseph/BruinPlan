import React from 'react';
import ReactDOM from 'react-dom/client';
<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Import all pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Schedules from './pages/Schedules.jsx';
import HomeSched from './pages/HomeSched.jsx';
import Selected from './pages/Selected.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      {/* 1) Home page */}
      <Route path="/" element={<Home />} />

      {/* 2) Login page */}
      <Route path="/login" element={<Login />} />

      {/* 3) Register page */}
      <Route path="/register" element={<Register />} />

      {/* 4) Dashboard page */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* 5) Profile page */}
      <Route path="/profile" element={<Profile />} />

      {/* 6) Schedules page */}
      <Route path="/schedules" element={<Schedules />} />

      {/* 7) HomeSched page ← NEW route */}
      <Route path="/homesched" element={<HomeSched />} />

      {/* 8) Catch‐all: redirect anything else to "/" */}
      <Route path="*" element={<Navigate to="/" replace />} />

      <Route path="/selected" element={<Selected />} />
    </Routes>
  </BrowserRouter>
);
=======
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
>>>>>>> origin/main
