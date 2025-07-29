import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { FaMoon, FaSun, FaBars } from "react-icons/fa";
import "../../App.css";

const Header = ({ pageName, onToggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="header-component">
      {/* Mobile Menu Toggle */}
      <div className="mobile-menu-toggle">
        <button
          className="btn btn-link"
          onClick={onToggleSidebar}
          style={{
            fontSize: 20,
            color: theme === "dark" ? "#fff" : "#111",
            background: "none",
            border: "none",
            padding: "8px"
          }}
          title="Toggle Menu"
        >
          <FaBars />
        </button>
      </div>

      {/* Page Title */}
      <div className="page-title">
        <h1 className="page-name">{pageName}</h1>
      </div>

      {/* User Controls */}
      <div className="user-controls">
        <button
          className="btn btn-link theme-toggle"
          onClick={toggleTheme}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
        
        <div className="user-info">
          <span className="username">{user?.username}</span>
          <img
            src={user?.profileImage || "/user-fallback.png"}
            alt="Profile"
            className="profile-image"
            onError={e => e.target.src = "/user-fallback.png"}
          />
        </div>
      </div>

      <style>{`
        .header-component {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: var(--primary);
          border-bottom: 1px solid rgba(0,0,0,0.1);
          min-height: 64px;
          flex-shrink: 0;
          z-index: 1000;
        }

        .mobile-menu-toggle {
          display: none;
        }

        .page-title {
          flex: 1;
          text-align: center;
          min-width: 0;
        }

        .page-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111;
          margin: 0;
          letter-spacing: 0.5px;
          word-break: break-word;
          line-height: 1.2;
        }

        .user-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 0;
        }

        .theme-toggle {
          font-size: 1.25rem;
          color: #111;
          background: none;
          border: none;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .theme-toggle:hover {
          background: rgba(255,255,255,0.2);
          transform: scale(1.1);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }

        .username {
          font-weight: 600;
          font-size: 0.9rem;
          color: #111;
          word-break: break-word;
          display: none;
        }

        .profile-image {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #111;
          background: #fff;
        }

        /* Tablet Styles */
        @media (min-width: 768px) {
          .header-component {
            padding: 1rem 1.5rem;
          }

          .page-name {
            font-size: 1.5rem;
          }

          .username {
            display: block;
          }

          .user-controls {
            gap: 1.5rem;
          }
        }

        /* Desktop Styles */
        @media (min-width: 1024px) {
          .header-component {
            padding: 1rem 2rem;
          }

          .page-name {
            font-size: 1.75rem;
          }
        }

        /* Mobile Styles */
        @media (max-width: 767px) {
          .mobile-menu-toggle {
            display: block;
          }

          .page-title {
            flex: 1;
            text-align: center;
            padding: 0 0.5rem;
          }

          .page-name {
            font-size: 1.1rem;
          }

          .user-controls {
            gap: 0.5rem;
          }

          .theme-toggle {
            font-size: 1.1rem;
            padding: 6px;
          }

          .profile-image {
            width: 36px;
            height: 36px;
          }
        }

        /* Small Mobile Styles */
        @media (max-width: 480px) {
          .header-component {
            padding: 0.5rem 0.75rem;
            min-height: 56px;
          }

          .page-name {
            font-size: 1rem;
          }

          .profile-image {
            width: 32px;
            height: 32px;
          }

          .theme-toggle {
            font-size: 1rem;
            padding: 4px;
          }
        }

        /* Dark mode adjustments */
        [data-theme="dark"] .header-component {
          border-bottom-color: rgba(255,255,255,0.1);
        }

        [data-theme="dark"] .theme-toggle {
          color: #fff;
        }

        [data-theme="dark"] .theme-toggle:hover {
          background: rgba(255,255,255,0.1);
        }

        [data-theme="dark"] .username {
          color: #fff;
        }

        [data-theme="dark"] .profile-image {
          border-color: #fff;
        }
      `}</style>
    </header>
  );
};

export default Header;
