import React from "react";
import "../../App.css";
import "animate.css";

const Loader = () => (
  <div className="loader-overlay d-flex align-items-center justify-content-center animate__animated animate__fadeIn" role="status" aria-live="polite">
    <div className="spinner-border text-primary" style={{ width: 60, height: 60 }} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

export default Loader;
