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
    <div className="d-flex dashboard-bg min-vh-100" style={{ width: "100vw", overflowX: "hidden" }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: "100vh", minWidth: 0 }}>
        <div style={{ width: "100%", minWidth: 0, flexShrink: 0 }}>
          <Header pageName={pageName} />
        </div>
        <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, minHeight: 0, width: "100%", height: "100%", padding: 0, margin: 0 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout; 