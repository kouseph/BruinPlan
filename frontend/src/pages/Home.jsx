// src/pages/Home.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../app.css';

export default function Home() {
  const navigate = useNavigate();

  function onClickLogin() {
    navigate('/login');
  }

  return (
    <div className="container">
      {/* “BruinPlan” title now links to "/" */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 className="title">BruinPlan</h1>
      </Link>

      {/* LOG IN button */}
      <button className="login-button" onClick={onClickLogin}>
        LOG IN
      </button>

      <div className="input-group">
        <input type="text" placeholder="Enter Subject Area" />
        <input type="text" placeholder="Enter Class Title" />
      </div>

      <div className="selected-classes">
        <h2>Selected Classes</h2>
        <table>
          <tbody>
            {[...Array(4)].map((_, idx) => (
              <tr key={idx}>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* “PLAN” button links to "/homesched" */}
      <Link to="/homesched" style={{ textDecoration: 'none' }}>
        <button className="plan-button">PLAN</button>
      </Link>
    </div>
  );
}
