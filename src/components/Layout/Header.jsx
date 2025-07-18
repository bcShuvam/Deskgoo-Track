import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { FaMoon, FaSun } from "react-icons/fa";
import "../../App.css";

const Header = ({ pageName }) => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header
      className="d-flex align-items-center justify-content-between px-2 py-2 shadow-sm"
      style={{
        marginLeft: "0px",
        width: "auto",
        zIndex: 1050,
        background: "var(--primary)",
        minWidth: 0,
        transition: "margin-left 0.3s, width 0.3s, background 0.3s"
      }}
    >
      {/* Left: Empty for spacing */}
      <div style={{ width: 120 }}></div>
      {/* Center: Page Name */}
      <div className="flex-grow-1 text-center" style={{ minWidth: 0 }}>
        <span className="fw-bold fs-5 mb-1" style={{ color: "#111", letterSpacing: 1, wordBreak: "break-word" }}>{pageName}</span>
      </div>
      {/* Right: Theme button, username, profile image horizontally */}
      <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
        <button
          className="btn btn-link"
          onClick={toggleTheme}
          style={{
            fontSize: 22,
            color: theme === "dark" ? "#111" : "#fff",
            background: "none"
          }}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
        <div className="fw-bold" style={{ fontSize: 16, color: "#111", wordBreak: "break-word", paddingRight: "1rem" }}>{user?.username}</div>
        <img
          src={user?.profileImage || "/user-fallback.png"}
          alt="Profile"
          className="rounded-circle"
          style={{ width: 40, height: 40, objectFit: "cover", border: "2px solid #111" }}
          onError={e => e.target.src = "/user-fallback.png"}
        />
      </div>
      <style>{``}</style>
    </header>
  );
};

export default Header;
