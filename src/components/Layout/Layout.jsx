import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet, useLocation } from "react-router-dom";
import "../../App.css";

const tabNames = {
  attendance: "Attendance Report",
  visitlog: "Visit Log Report",
  livelocation: "Live Location",
  users: "Users",
  referral: "Referral Report"
};

const Layout = () => {
  const [activeTab, setActiveTab] = useState("attendance");
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Set active tab based on route
  React.useEffect(() => {
    if (location.pathname.startsWith("/users")) setActiveTab("users");
    else if (location.pathname.startsWith("/livelocation")) setActiveTab("livelocation");
    else if (location.pathname.startsWith("/referral")) setActiveTab("referral");
    else if (location.pathname.startsWith("/visitlog")) setActiveTab("visitlog");
    else if (location.pathname.startsWith("/attendance")) setActiveTab("attendance");
  }, [location.pathname]);

  const pageName = tabNames[activeTab] || "Dashboard";

  return (
    <div className="layout-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="main-content">
        <Header pageName={pageName} onToggleSidebar={() => setCollapsed(!collapsed)} />
        <div className="content-area">
          <Outlet />
        </div>
      </div>

      <style>{`
        .layout-container {
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: var(--background);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          height: 100vh;
          overflow: hidden;
        }

        .content-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0;
          margin: 0;
          background: var(--background);
        }

        /* Responsive breakpoints */
        @media (max-width: 768px) {
          .layout-container {
            height: 100vh;
          }
          
          .main-content {
            height: 100vh;
          }
        }

        @media (max-width: 576px) {
          .layout-container {
            height: 100vh;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout; 