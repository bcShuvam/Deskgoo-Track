import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "animate.css";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 animate__animated animate__fadeIn">
      <h1 className="display-1 mb-3">404</h1>
      <h2 className="mb-4">Page Not Found</h2>
      <button className="btn btn-primary" onClick={() => navigate("/auth")}>Go to Login</button>
    </div>
  );
};

export default NotFound; 