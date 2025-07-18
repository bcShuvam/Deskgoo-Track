import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import "../../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import { FaCalendarCheck, FaClipboardList, FaMapMarkerAlt, FaUsers, FaShareAlt, FaBars, FaSignOutAlt } from "react-icons/fa";
import { useRef } from "react";

const menuItems = [
  { key: "attendance", label: "Attendance Report", icon: <FaCalendarCheck /> },
  { key: "visitlog", label: "Visit Log Report", icon: <FaClipboardList /> },
  { key: "livelocation", label: "Live Location", icon: <FaMapMarkerAlt /> },
  { key: "users", label: "Users", icon: <FaUsers /> },
  { key: "referral", label: "Referral Report", icon: <FaShareAlt /> },
];

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const [hovered, setHovered] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const alertRef = useRef(null);
  const [toggleHover, setToggleHover] = useState(false);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);
  const isOpen = !collapsed || hovered;

  // Handle sidebar toggle
  const handleToggle = () => setCollapsed((prev) => !prev);

  // Handle navigation
  const handleNav = (key) => {
    setActiveTab(key);
    if (key === "users") navigate("/users");
    else if (key === "livelocation") navigate("/livelocation");
    else navigate("/dashboard");
  };

  return (
    <div
      className={`sidebar d-flex flex-column align-items-center p-2 ${collapsed ? "collapsed" : "expanded"} animate__animated animate__fadeInLeft`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ minHeight: "100vh", transition: "width 0.3s", width: isOpen ? 260 : 64 }}
    >
      {/* Sidebar Header: FaBars toggle button on left, Deskgoo Track title on right, centered */}
      <div
        className="w-100 mb-4 d-flex sidebar-header position-relative"
        style={{
          minHeight: 56,
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1.5px solid #e0e0e0",
          padding: 0,
        }}
      >
        <div className="d-flex align-items-center justify-content-between w-100" style={{height: 56}}>
          {isOpen && (
            <span className="fw-bold fs-5" style={{ color: theme === "dark" ? "var(--primary)" : "#111", letterSpacing: 1 }}>
              Deskgoo Track
            </span>
          )}
          <button
            className="btn sidebar-toggle-btn"
            onClick={handleToggle}
            title={collapsed ? "Expand" : "Collapse"}
            style={{
              zIndex: 2,
              transition: "transform 0.2s, background 0.2s, color 0.2s, border-color 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 40,
              width: 40,
              border: "2px solid transparent", // Always have a border
              borderColor: toggleHover ? "#fff" : "transparent", // Change only the color
              borderRadius: 0,
              background: isOpen ? "var(--primary)" : "none",
              boxSizing: "border-box"
            }}
            onMouseEnter={() => setToggleHover(true)}
            onMouseLeave={() => setToggleHover(false)}
          >
            <FaBars
              style={{
                fontSize: 22,
                color: toggleHover ? "#fff" : theme === "dark" ? "#fff" : "#111"
              }}
            />
          </button>
        </div>
        {/* Bottom border/line for perfect alignment with body header */}
        <div style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 0,
          borderBottom: "1.5px solid #e0e0e0",
        }} />
      </div>
      <ul className="nav flex-column w-100">
        {menuItems.map(item => (
          <li
            key={item.key}
            className="nav-item mb-2"
            style={{ width: "100%" }}
          >
            <SidebarTabButton
              isOpen={isOpen}
              isActive={activeTab === item.key}
              theme={theme}
              icon={item.icon}
              label={item.label}
              onClick={() => handleNav(item.key)}
            />
          </li>
        ))}
      </ul>
      {/* Divider at the bottom */}
      <div className="mt-auto w-100 d-flex flex-column align-items-center">
        <hr className="w-75 my-3" />
        <button
          className="btn btn-link text-danger mb-2"
          style={{ fontSize: 22, color: theme === "dark" ? "#fff" : undefined }}
          onClick={() => setShowLogout(true)}
          title="Logout"
        >
          <FaSignOutAlt />
        </button>
      </div>
      {/* Custom Confirm Alert Box (right bottom) */}
      {showLogout && (
        <div
          ref={alertRef}
          className={`custom-confirm-alert animate__animated animate__fadeIn ${theme === 'dark' ? 'custom-confirm-dark' : 'custom-confirm-light'} custom-confirm-center`}
        >
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Confirm Logout</div>
          <div style={{ fontSize: 15, marginBottom: 18, textAlign: 'center' }}>Are you sure you want to logout?</div>
          <div className="d-flex gap-2 w-100 justify-content-end">
            <button
              className="btn btn-secondary me-2"
              style={{ minWidth: 80 }}
              onClick={() => setShowLogout(false)}
            >Cancel</button>
            <button
              className="btn btn-danger"
              style={{ minWidth: 80 }}
              onClick={logout}
            >Logout</button>
          </div>
        </div>
      )}
      <style>{`
        .sidebar-toggle-btn {
          transition: transform 0.2s, background 0.2s, color 0.2s, border 0.2s;
          box-sizing: border-box;
        }
        .sidebar-toggle-btn:hover {
          background: var(--primary) !important;
          color: #fff !important;
          border-color: #fff !important;
          transform: scale(1.12);
        }
        .custom-confirm-alert {
          animation-duration: 0.25s;
          border-radius: 14px;
          box-shadow: 0 4px 24px rgba(44,62,80,0.12);
          font-family: inherit;
        }
        .custom-confirm-dark {
          background: #23272b !important;
          color: #fff !important;
          border: 1.5px solid #444 !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.7) !important;
        }
        .custom-confirm-light {
          background: #fff !important;
          color: #222 !important;
          border: 1.5px solid #e0e0e0 !important;
          box-shadow: 0 4px 24px rgba(44,62,80,0.12) !important;
        }
        .custom-confirm-center {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          right: auto !important;
          bottom: auto !important;
          z-index: 3000 !important;
        }
      `}</style>
    </div>
  );
};

function SidebarTabButton({ isOpen, isActive, theme, icon, label, onClick }) {
  const [hover, setHover] = useState(false);
  // Only apply hover effect if not active
  const color = isActive
    ? "#fff"
    : theme === "dark" && hover
    ? "#111"
    : theme === "dark"
    ? "#fff"
    : undefined;
  const bg = isActive
    ? "var(--primary)"
    : hover
    ? theme === "dark"
      ? "#d6eaff"
      : "#d6eaff"
    : undefined;
  return (
    <button
      className={`btn w-100 d-flex align-items-center sidebar-btn${isActive ? " active" : ""}`}
      onClick={onClick}
      style={{
        justifyContent: isOpen ? "flex-start" : "center",
        background: bg,
        color,
        transition: "background 0.2s, color 0.2s"
      }}
      onMouseEnter={() => {
        if (!isActive) setHover(true);
      }}
      onMouseLeave={() => {
        if (!isActive) setHover(false);
      }}
    >
      <span style={{ fontSize: 20, color }}>{icon}</span>
      {isOpen && <span className="ms-2" style={{ color }}>{label}</span>}
    </button>
  );
}

export default Sidebar;
