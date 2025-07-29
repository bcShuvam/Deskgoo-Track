import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import "../../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import { FaCalendarCheck, FaClipboardList, FaMapMarkerAlt, FaUsers, FaShareAlt, FaBars, FaSignOutAlt, FaTimes } from "react-icons/fa";

const menuItems = [
  { key: "attendance", label: "Attendance Report", icon: <FaCalendarCheck /> },
  { key: "visitlog", label: "Visit Log Report", icon: <FaClipboardList /> },
  { key: "livelocation", label: "Live Location", icon: <FaMapMarkerAlt /> },
  { key: "users", label: "Users", icon: <FaUsers /> },
  { key: "referral", label: "Referral Report", icon: <FaShareAlt /> },
];

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const [showLogout, setShowLogout] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  
  // Determine if sidebar should be expanded (not collapsed OR hovered on desktop)
  const isExpanded = !collapsed || (!isMobile && isHovered);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle sidebar toggle
  const handleToggle = () => setCollapsed((prev) => !prev);

  // Handle navigation
  const handleNav = (key) => {
    console.log('Navigation clicked:', key); // Debug log
    setActiveTab(key);
    if (key === "users") {
      console.log('Navigating to /users');
      navigate("/users");
    }
    else if (key === "livelocation") {
      console.log('Navigating to /livelocation');
      navigate("/livelocation");
    }
    else if (key === "visitlog") {
      console.log('Navigating to /visitlog-report');
      navigate('/visitlog-report');
    }
    else if (key === "referral") {
      console.log('Navigating to /referral-report');
      navigate('/referral-report');
    }
    else {
      console.log('Navigating to /dashboard');
      navigate("/dashboard");
    }
    
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setCollapsed(true);
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && !collapsed && !event.target.closest('.sidebar')) {
        setCollapsed(true);
      }
    };

    if (isMobile && !collapsed) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, collapsed]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
        <div className="sidebar-overlay" onClick={() => setCollapsed(true)} />
      )}
      
      <aside 
        className={`sidebar ${collapsed ? 'collapsed' : 'expanded'} ${isMobile ? 'mobile' : 'desktop'}`}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="brand-section">
            {isExpanded && <h1 className="brand-title">Deskgoo Track</h1>}
          </div>
          <button
            className="toggle-button"
            onClick={handleToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <FaBars />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li key={item.key} className="nav-item">
                <button
                  className={`nav-link ${activeTab === item.key ? 'active' : ''}`}
                  onClick={() => handleNav(item.key)}
                  aria-label={item.label}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {isExpanded && <span className="nav-text">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="logout-button"
            onClick={() => setShowLogout(true)}
            aria-label="Logout"
          >
            <span className="nav-icon">
              <FaSignOutAlt />
            </span>
            {isExpanded && <span>Logout</span>}
          </button>
        </div>

        {/* Logout Modal */}
        {showLogout && (
          <div className="logout-modal-overlay" onClick={() => setShowLogout(false)}>
            <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
              <div className="logout-modal-header">
                <h3>Confirm Logout</h3>
              </div>
              <div className="logout-modal-body">
                <p>Are you sure you want to logout?</p>
              </div>
              <div className="logout-modal-footer">
                <button
                  className="logout-cancel-btn"
                  onClick={() => setShowLogout(false)}
                >
                  Cancel
                </button>
                <button
                  className="logout-confirm-btn"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      <style>{`
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          z-index: 998;
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          background: var(--sidebar-bg, #ffffff);
          border-right: 1px solid var(--border-color, #e5e7eb);
          height: 100vh;
          position: relative;
          z-index: 999;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Desktop Styles */
        .sidebar.desktop {
          width: 280px;
        }

        .sidebar.desktop.collapsed {
          width: 70px;
        }

        /* Desktop Hover Expansion */
        .sidebar.desktop.collapsed:hover {
          width: 280px;
        }

        /* Mobile Styles */
        .sidebar.mobile {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          transform: translateX(-100%);
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
        }

        .sidebar.mobile.expanded {
          transform: translateX(0);
        }

        /* Header */
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1rem;
          border-bottom: 1px solid var(--border-color, #e5e7eb);
          flex-shrink: 0;
          min-height: 70px;
        }

        .brand-section {
          flex: 1;
          overflow: hidden;
        }

        .brand-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #000000;
          margin: 0;
          letter-spacing: 0.025em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .toggle-button {
          width: 40px;
          height: 40px;
          border: none;
          background: var(--primary, #3b82f6);
          color: #000000;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1.1rem;
          flex-shrink: 0;
          z-index: 10;
          position: relative;
        }

        .toggle-button:hover {
          background: var(--primary-hover, #2563eb);
          color: #000000;
          transform: scale(1.05);
        }

        /* Navigation */
        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 1rem 0.5rem;
        }

        .nav-menu {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-item {
          width: 100%;
        }

        .nav-link {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          color: var(--text, #374151);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .nav-link:hover {
          background: var(--hover-bg, #f3f4f6);
          color: var(--primary, #3b82f6);
        }

        .nav-link.active {
          background: var(--primary, #3b82f6);
          color: #ffffff;
        }

        .nav-link.active:hover {
          background: var(--primary-hover, #2563eb);
        }

        .nav-icon {
          font-size: 1.1rem;
          min-width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Footer */
        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--border-color, #e5e7eb);
          flex-shrink: 0;
        }

        .logout-button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #dc2626;
          font-size: 0.95rem;
          font-weight: 500;
          min-height: 44px;
        }

        .logout-button:hover {
          background: rgba(220, 38, 38, 0.1);
          color: #b91c1c;
        }

        /* Logout Modal */
        .logout-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .logout-modal {
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 12px;
          width: 320px;
          max-width: 90vw;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .logout-modal-header {
          padding: 1.5rem 1.5rem 0.75rem 1.5rem;
          text-align: center;
        }

        .logout-modal-header h3 {
          margin: 0;
          color: var(--text, #374151);
          font-size: 1.25rem;
          font-weight: 600;
        }

        .logout-modal-body {
          padding: 0 1.5rem 1.5rem 1.5rem;
          text-align: center;
        }

        .logout-modal-body p {
          margin: 0;
          color: var(--text-secondary, #6b7280);
          font-size: 1rem;
          line-height: 1.5;
        }

        .logout-modal-footer {
          padding: 0 1.5rem 1.5rem 1.5rem;
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .logout-cancel-btn {
          padding: 0.75rem 1.5rem;
          background: #6b7280;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 80px;
        }

        .logout-cancel-btn:hover {
          background: #4b5563;
          transform: translateY(-1px);
        }

        .logout-confirm-btn {
          padding: 0.75rem 1.5rem;
          background: #dc2626;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 80px;
        }

        .logout-confirm-btn:hover {
          background: #b91c1c;
          transform: translateY(-1px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sidebar.mobile {
            width: 280px;
          }
          
          .logout-modal {
            width: 300px;
          }
        }

        @media (max-width: 480px) {
          .sidebar.mobile {
            width: 260px;
          }
          
          .brand-title {
            font-size: 1.1rem;
          }
          
          .sidebar-header {
            padding: 1rem 0.75rem;
            min-height: 60px;
          }
          
          .logout-modal {
            width: 280px;
          }
          
          .logout-modal-footer {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .logout-cancel-btn,
          .logout-confirm-btn {
            width: 100%;
          }
        }

        /* Dark mode */
        [data-theme="dark"] .sidebar {
          background: var(--sidebar-bg, #1f2937);
          border-right-color: var(--border-color, #374151);
        }

        [data-theme="dark"] .sidebar-header {
          border-bottom-color: var(--border-color, #374151);
        }

        [data-theme="dark"] .sidebar-footer {
          border-top-color: var(--border-color, #374151);
        }

        [data-theme="dark"] .brand-title {
          color: var(--primary, #60a5fa);
        }

        [data-theme="dark"] .nav-link {
          color: var(--text, #d1d5db);
        }

        [data-theme="dark"] .nav-link:hover {
          background: var(--hover-bg, #374151);
          color: var(--primary, #60a5fa);
        }

        [data-theme="dark"] .toggle-button {
          background: var(--primary, #60a5fa);
          color: #000000;
        }

        [data-theme="dark"] .toggle-button:hover {
          background: var(--primary-hover, #93c5fd);
          color: #000000;
        }

        [data-theme="dark"] .logout-modal {
          background: var(--card-bg, #1f2937);
          border-color: var(--border-color, #374151);
        }

        [data-theme="dark"] .logout-modal-header h3 {
          color: var(--text, #f9fafb);
        }

        [data-theme="dark"] .logout-modal-body p {
          color: var(--text-secondary, #9ca3af);
        }

        /* Scrollbar styling */
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: var(--scrollbar-color, #d1d5db);
          border-radius: 2px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-hover, #9ca3af);
        }

        [data-theme="dark"] .sidebar-nav::-webkit-scrollbar-thumb {
          background: var(--scrollbar-color, #4b5563);
        }

        [data-theme="dark"] .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-hover, #6b7280);
        }
      `}</style>
    </>
  );
};

export default Sidebar;
