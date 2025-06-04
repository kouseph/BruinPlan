// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  // Show "LOGIN REQUIRED" toast if navigated with showLoginRequired flag
  useEffect(() => {
    if (location.state && location.state.showLoginRequired) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleLoginClick = () => {
    navigate("/dashboard");
  };

  const handleGoogleClick = () => {
    window.location.href = "http://localhost:3000/google";
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        background: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Top-right toast notification */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#FFFFFF",
            border: "2px solid #c0392b",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            padding: "10px 16px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
          }}
        >
          {/* Left warning icon */}
          <span
            role="img"
            aria-label="Warning"
            style={{ fontSize: "24px", marginRight: "8px" }}
          >
            ⚠️
          </span>

          {/* Text */}
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#000000",
              whiteSpace: "nowrap",
            }}
          >
            LOGIN REQUIRED TO SAVE SCHEDULES
          </span>

          {/* Right warning icon */}
          <span
            role="img"
            aria-label="Warning"
            style={{ fontSize: "24px", marginLeft: "8px" }}
          >
            ⚠️
          </span>
        </div>
      )}

      <div style={{ textAlign: 'center', position: 'relative' }}>
        {/* "BruinPlan" title (top-left) linking to home */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1
            style={{
              color: '#F5B301',
              fontSize: '74px',
              fontWeight: 700,
              margin: '0 0 40px 0',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            BruinPlan
          </h1>
        </Link>

        {/* "Welcome back" heading */}
        <h2
          style={{
            fontSize: "32px",
            fontWeight: 400,
            color: "#000000",
            marginBottom: "20px",
          }}
        >
          Welcome back
        </h2>

        <div
          style={{
            width: "400px",
            background: "#FFFFFF",
            border: "1px solid #E9E2E2",
            borderRadius: "8px",
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            padding: "32px 24px",
          }}
        >
          {/* Continue with Google */}
          <button
            onClick={handleGoogleClick}
            style={{
              width: "100%",
              height: "48px",
              background: "#FFFFFF",
              border: "1px solid #4285F4",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginBottom: "24px",
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google logo"
              style={{ width: "20px", height: "20px", marginRight: "8px" }}
            />
            <span
              style={{
                color: "#4285F4",
                fontSize: "16px",
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Continue with Google
            </span>
          </button>

          {/* Separator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "0 -24px 24px",
            }}
          >
            <hr
              style={{
                flex: 1,
                border: "none",
                height: "1px",
                background: "#D1D1D1",
                margin: 0,
              }}
            />
            <span
              style={{
                margin: "0 12px",
                color: "#766B6B",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Or continue with username/email
            </span>
            <hr
              style={{
                flex: 1,
                border: "none",
                height: "1px",
                background: "#D1D1D1",
                margin: 0,
              }}
            />
          </div>

          {/* Username / Email Input */}
          <input
            type="text"
            placeholder="Username or email address"
            style={{
              width: "100%",
              height: "40px",
              marginBottom: "16px",
              padding: "0 12px",
              border: "1px solid #E9E2E2",
              borderRadius: "4px",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
              outline: "none",
            }}
          />

          {/* Password Input */}
          <input
            type="password"
            placeholder="Password"
            style={{
              width: "100%",
              height: "40px",
              marginBottom: "24px",
              padding: "0 12px",
              border: "1px solid #E9E2E2",
              borderRadius: "4px",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
              outline: "none",
            }}
          />

          {/* LOG IN button */}
          <button
            onClick={handleLoginClick}
            style={{
              width: "100%",
              height: "44px",
              background: "#487EC4",
              border: "none",
              borderRadius: "4px",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
              marginBottom: "16px",
            }}
          >
            LOG IN
          </button>

          {/* Register / Sign up link */}
          <div>
            <Link
              to="/register"
              style={{
                color: "#000000",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                textDecoration: "underline",
              }}
            >
              Register / Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
