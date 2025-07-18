import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button
      className="btn btn-outline-secondary ms-2"
      onClick={toggleTheme}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      <i className={`fa ${theme === "light" ? "fa-moon" : "fa-sun"}`}></i>
    </button>
  );
};

export default ThemeToggle;
