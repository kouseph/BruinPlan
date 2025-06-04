// src/pages/Dashboard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const handlePlanClick = () => {
    navigate('/homesched', { state: { from: 'dashboard' } });
  };

  return (
    <div className="container">
      {/* "BruinPlan" title now links to "/" */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <h1 className="title">BruinPlan</h1>
      </Link>

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

      {/* "PLAN" button now uses onClick handler instead of Link */}
      <button className="plan-button" onClick={handlePlanClick}>
        PLAN
      </button>
    </div>
  );
}
