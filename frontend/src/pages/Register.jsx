// src/pages/Register.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = () => {
    // registration logic…
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* “BruinPlan” title links to "/" */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1
          style={{
            position: 'absolute',
            top: '10px',
            left: '-480px',
            color: '#487EC4',
            fontSize: '72px',
            fontWeight: 700,
            margin: 0,
          }}
        >
          BruinPlan
        </h1>
      </Link>

      {/* Registration form */}
      <div style={{ textAlign: 'center', position: 'relative' }}>
        <h2
          style={{
            fontSize: '32px',
            fontWeight: 400,
            color: '#000000',
            marginBottom: '20px',
          }}
        >
          Create an account
        </h2>

        <div
          style={{
            width: '400px',
            background: '#FFFFFF',
            border: '1px solid #E9E2E2',
            borderRadius: '8px',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            padding: '32px 24px',
          }}
        >
          <input
            type="text"
            placeholder="Username"
            style={{
              width: '100%',
              height: '40px',
              marginBottom: '16px',
              padding: '0 12px',
              border: '1px solid #E9E2E2',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}
          />
          <input
            type="email"
            placeholder="Email"
            style={{
              width: '100%',
              height: '40px',
              marginBottom: '16px',
              padding: '0 12px',
              border: '1px solid #E9E2E2',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            style={{
              width: '100%',
              height: '40px',
              marginBottom: '24px',
              padding: '0 12px',
              border: '1px solid #E9E2E2',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}
          />

          <button
            onClick={handleRegister}
            style={{
              width: '100%',
              height: '44px',
              background: '#487EC4',
              border: 'none',
              borderRadius: '4px',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            SIGN UP
          </button>

          <div>
            <Link
              to="/login"
              style={{
                color: '#487EC4',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                textDecoration: 'underline',
              }}
            >
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
