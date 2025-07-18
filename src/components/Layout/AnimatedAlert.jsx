import React, { useEffect, useRef } from "react";
import "./AnimatedAlert.css";

const AnimatedAlert = ({ type, message }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.focus();
  }, [message]);
  return (
    <div
      ref={ref}
      className={`animated-alert alert alert-${type === "success" ? "success" : "danger"} fade show`}
      role="alert"
      tabIndex="-1"
      aria-live="assertive"
    >
      {message}
    </div>
  );
};

export default AnimatedAlert;
