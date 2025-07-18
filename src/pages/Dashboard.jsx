import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import Loader from "../components/Common/Loader";
import AnimatedAlert from "../components/Layout/AnimatedAlert";
import { ThemeContext } from "../context/ThemeContext";
import { FaUserCircle, FaClock, FaSignInAlt, FaSignOutAlt, FaQuestionCircle, FaFilter, FaDownload, FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { theme } = useContext(ThemeContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterFrom, setFilterFrom] = useState(null);
  const [filterTo, setFilterTo] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  // Helper to get today's date in yyyy-mm-dd
  const getToday = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError("");
      try {
        const today = getToday();
        const res = await api.get(`/attendance/date/all?from=${today}&to=${today}`);
        setAttendance(res.data);
      } catch (err) {
        setError(
          err?.response?.data?.message || err?.message || "Failed to fetch attendance"
        );
      }
      setLoading(false);
    };
    fetchAttendance();
  }, []);

  // Theme-aware text colors
  const textColor = theme === "dark" ? "#f1f1f1" : "#222";
  const subTextColor = theme === "dark" ? "#b0b0b0" : "#666";
  const cardBg = theme === "dark" ? "#23272b" : "#fff";
  const borderColor = theme === "dark" ? "#333" : "#e0e0e0";
  const badgeBg = theme === "dark" ? "#444" : "#444";

  return (
    <div className="container-fluid animate__animated animate__fadeIn position-relative" style={{ minHeight: "100vh", width: "100vw", maxWidth: "100%", background: 'var(--background)' }}>
      {/* Filter Icon */}
      <button
        className="btn btn-light filter-btn position-absolute"
        style={{ top: 24, right: 32, zIndex: 10, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        onClick={() => setShowFilter(true)}
        title="Filter Attendance"
      >
        <FaFilter size={20} />
      </button>
      {/* Filter Popup */}
      {showFilter && (
        <div className="filter-popup-overlay">
          <div className={`filter-popup ${theme === 'dark' ? 'filter-popup-dark' : 'filter-popup-light'}`}> 
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Filter Attendance</h5>
              <button className="btn-close" onClick={() => setShowFilter(false)}
                style={{ filter: theme === 'dark' ? 'invert(1)' : 'none', opacity: 0.8 }}
              ></button>
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control filter-user-search"
                placeholder="Search user..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                style={{ marginBottom: 8, borderRadius: 8, border: theme === 'dark' ? '1.5px solid #444' : '1.5px solid #e0e0e0', background: theme === 'dark' ? '#23272b' : '#fafbfc', color: theme === 'dark' ? '#fff' : '#222' }}
              />
            </div>
            <div className="mb-3">
              <label className="fw-semibold mb-2">Select User</label>
              <div className="user-list-scroll">
                {attendance
                  .filter(user => user.username.toLowerCase().includes(userSearch.toLowerCase()))
                  .map(user => (
                    <div
                      key={user._id}
                      className={`d-flex align-items-center mb-2 gap-2 filter-user-row${selectedUser === user._id ? ' filter-user-selected' : ''}`}
                      style={{
                        cursor: 'pointer',
                        background: selectedUser === user._id ? (theme === 'dark' ? '#2d3540' : '#eaf2ff') : 'transparent',
                        borderRadius: 8,
                        padding: '4px 6px',
                        transition: 'background 0.15s'
                      }}
                      onClick={() => setSelectedUser(user._id)}
                    >
                      <img src={user.profileImage} alt={user.username} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #ccc', background: '#eee' }} onError={e => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.username); }} />
                      <span style={{ fontWeight: 500 }}>{user.username}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="mb-3 row g-2 align-items-center">
              <div className="d-flex flex-row gap-3">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label className="fw-semibold mb-2" style={{ display: 'block' }}>From</label>
                  <DatePicker
                    selected={filterFrom}
                    onChange={date => setFilterFrom(date)}
                    selectsStart
                    startDate={filterFrom}
                    endDate={filterTo}
                    className="form-control filter-datepicker"
                    placeholderText="Start date"
                    calendarClassName={theme === 'dark' ? 'react-datepicker-dark' : ''}
                    popperClassName={theme === 'dark' ? 'react-datepicker-dark' : ''}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label className="fw-semibold mb-2" style={{ display: 'block' }}>To</label>
                  <DatePicker
                    selected={filterTo}
                    onChange={date => setFilterTo(date)}
                    selectsEnd
                    startDate={filterFrom}
                    endDate={filterTo}
                    minDate={filterFrom}
                    className="form-control filter-datepicker"
                    placeholderText="End date"
                    calendarClassName={theme === 'dark' ? 'react-datepicker-dark' : ''}
                    popperClassName={theme === 'dark' ? 'react-datepicker-dark' : ''}
                  />
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-2">
              <button className="btn btn-secondary" onClick={() => setShowFilter(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={async () => {
                setShowFilter(false);
                if (!selectedUser || !filterFrom || !filterTo) return;
                const fromStr = filterFrom.toISOString().slice(0, 10);
                const toStr = filterTo.toISOString().slice(0, 10);
                try {
                  const res = await api.get(`/attendance/date?userId=${selectedUser}&from=${fromStr}&to=${toStr}`);
                  const userObj = attendance.find(u => u._id === selectedUser);
                  navigate('/attendance-report', { state: { reportData: res.data, user: userObj, from: fromStr, to: toStr } });
                } catch {
                  alert('Failed to fetch attendance report.');
                }
              }}>Apply</button>
            </div>
          </div>
        </div>
      )}
      {loading && <Loader />}
      {error && <AnimatedAlert type="error" message={error} />}
      {!loading && !error && (
        <div className="attendance-cards-wrapper">
          {attendance.length === 0 && (
            <div className="text-center text-muted">No attendance data found for today.</div>
          )}
          {attendance.map((user) => {
            let checkIn = user.checkInTime;
            let checkOut = user.checkOutTime;
            let isUnknown = false;
            let isNotCheckedOut = false;
            if (!checkIn && !checkOut) {
              isUnknown = true;
            } else if (checkIn && !checkOut) {
              isNotCheckedOut = true;
            }
            return (
              <div
                key={user._id}
                className={`attendance-card-modern animate__animated animate__fadeIn ${theme === 'dark' ? 'attendance-card-dark' : 'attendance-card-light'}`}
                style={{
                  background: cardBg,
                  border: `1px solid ${borderColor}`,
                  color: textColor
                }}
              >
                {/* Profile and Name */}
                <div className="attendance-card-profile">
                  <img
                    src={user.profileImage}
                    alt={user.username}
                    className="attendance-profile-img"
                    onError={e => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.username); }}
                  />
                  <div className="attendance-card-userinfo">
                    <div className="attendance-card-username">{user.username}</div>
                    <span className="badge total-hours-modern-badge">
                      <FaClock style={{ marginRight: 6, fontSize: 14 }} />
                      {user.totalHoursWorked ? user.totalHoursWorked.toFixed(2) : "0.00"} hrs
                    </span>
                  </div>
                </div>
                {/* Attendance Details */}
                <div className="attendance-card-details">
                  <div className="attendance-detail-item">
                    <span className="attendance-detail-label">
                      <FaSignInAlt style={{ marginRight: 6, color: isUnknown ? '#ff7675' : '#00b894' }} />
                      Check-In
                    </span>
                    <span className={`attendance-detail-value`}>
                      {isUnknown ? (
                        <span className="attendance-status-badge unknown"><FaQuestionCircle style={{marginRight: 4}}/>Unknown</span>
                      ) : (
                        checkIn
                      )}
                    </span>
                  </div>
                  <div className="attendance-detail-item">
                    <span className="attendance-detail-label">
                      <FaSignOutAlt style={{ marginRight: 6, color: isNotCheckedOut ? '#fdcb6e' : (isUnknown ? '#b2bec3' : '#0984e3') }} />
                      Check-Out
                    </span>
                    <span className={`attendance-detail-value`}>
                      {isUnknown ? (
                        <span className="attendance-status-badge unknown"><FaQuestionCircle style={{marginRight: 4}}/>Unknown</span>
                      ) : isNotCheckedOut ? (
                        <span className="attendance-status-badge notout"><FaQuestionCircle style={{marginRight: 4}}/>Not Checked-Out</span>
                      ) : (
                        checkOut
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`
        .attendance-cards-wrapper {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          padding: 2rem 0 3rem 0;
        }
        @media (min-width: 1400px) {
          .attendance-cards-wrapper {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (min-width: 2000px) {
          .attendance-cards-wrapper {
            max-width: 2100px;
            grid-template-columns: 1fr 1fr 1fr;
          }
        }
        .attendance-card-modern {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          border-radius: 20px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
          padding: 0;
          transition: box-shadow 0.2s, transform 0.2s;
          min-height: 120px;
          width: 100%;
          background: var(--card-bg);
        }
        .attendance-card-modern:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        }
        .attendance-card-dark:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.45) !important;
        }
        .attendance-card-light:hover {
          box-shadow: 0 8px 32px rgba(200,200,200,0.45) !important;
        }
        .attendance-card-profile {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 120px;
          padding: 24px 18px 24px 24px;
        }
        .attendance-profile-img {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #8882;
          margin-bottom: 10px;
          background: #eee;
        }
        .attendance-card-userinfo {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .attendance-card-username {
          font-size: 1.15rem;
          font-weight: 600;
          color: ${textColor};
          margin-bottom: 4px;
          text-align: center;
          word-break: break-word;
        }
        .total-hours-modern-badge {
          background: ${badgeBg} !important;
          color: #fff !important;
          font-size: 0.98rem;
          font-weight: 500;
          border-radius: 12px;
          padding: 4px 14px;
          margin-top: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .attendance-card-details {
          flex: 1;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          gap: 32px;
        }
        .attendance-detail-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
        }
        .attendance-detail-label {
          font-size: 1rem;
          font-weight: 500;
          color: ${subTextColor};
          display: flex;
          align-items: center;
        }
        .attendance-detail-value {
          font-size: 1.08rem;
          font-weight: 600;
          color: ${textColor};
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .attendance-status-badge {
          font-size: 0.85rem;
          font-weight: 500;
          border-radius: 8px;
          padding: 2px 10px;
          margin-left: 8px;
          display: inline-flex;
          align-items: center;
        }
        .attendance-badge-unknown .attendance-status-badge.unknown {
          background: #ff7675;
          color: #fff;
        }
        .attendance-badge-notout .attendance-status-badge.notout {
          background: #fdcb6e;
          color: #222;
        }
        @media (max-width: 900px) {
          .attendance-cards-wrapper {
            max-width: 100vw;
            padding: 1.5rem 0.5rem 2rem 0.5rem;
          }
          .attendance-card-details {
            padding: 18px 12px;
            gap: 16px;
          }
        }
        @media (max-width: 600px) {
          .attendance-card-modern {
            flex-direction: column;
            align-items: stretch;
            min-height: 0;
            padding: 0;
          }
          .attendance-card-profile {
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            min-width: 0;
            padding: 18px 12px 8px 12px;
          }
          .attendance-card-userinfo {
            align-items: flex-start;
            margin-left: 14px;
          }
          .attendance-card-details {
            flex-direction: column;
            align-items: flex-start;
            padding: 10px 12px 18px 12px;
            gap: 10px;
          }
          .attendance-detail-item {
            width: 100%;
          }
        }
        html, body, #root {
          background: var(--background) !important;
          min-height: 100vh !important;
        }
        .filter-btn {
          background: #fff;
          border: 1.5px solid #e0e0e0;
          color: #222;
          transition: box-shadow 0.2s, background 0.2s;
        }
        .filter-btn:hover {
          background: #f4f4f4;
          box-shadow: 0 4px 16px rgba(44,62,80,0.10);
        }
        .filter-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.25);
          z-index: 4000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .filter-popup {
          min-width: 320px;
          max-width: 95vw;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(44,62,80,0.18);
          padding: 2rem 1.5rem 1.5rem 1.5rem;
          animation: fadeSlideIn 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .filter-popup-dark {
          background: #23272b !important;
          color: #fff !important;
        }
        .filter-popup-light {
          background: #fff !important;
          color: #222 !important;
        }
        .user-list-scroll {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 0.5rem 0.5rem 0.5rem 0.25rem;
          background: #fafbfc;
          margin-bottom: 1rem;
        }
        .filter-popup-dark .user-list-scroll {
          background: #23272b;
          border: 1px solid #444;
        }
        .filter-user-search {
          margin-bottom: 0.5rem;
          font-size: 1rem;
          padding: 0.5rem 1rem;
        }
        .filter-user-row {
          transition: background 0.15s, color 0.15s;
        }
        .filter-user-selected {
          font-weight: 600;
          color: #1976d2 !important;
          background: #eaf2ff !important;
        }
        .filter-popup-dark .filter-user-selected {
          color: #a4c2f4 !important;
          background: #2d3540 !important;
        }
        .filter-datepicker {
          border-radius: 8px;
          font-size: 1rem;
          padding: 0.5rem 1rem;
        }
        .react-datepicker-dark {
          background: #23272b !important;
          color: #fff !important;
          border: 1.5px solid #444 !important;
        }
        .react-datepicker__header {
          background: var(--primary) !important;
          color: #222 !important;
          border-bottom: 1px solid #e0e0e0 !important;
        }
        .filter-popup-dark .react-datepicker__header {
          background: var(--primary) !important;
          color: #222 !important;
          border-bottom: 1px solid #444 !important;
        }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
          background: #a4c2f4 !important;
          color: #222 !important;
        }
        .filter-popup-dark .react-datepicker__day--selected, .filter-popup-dark .react-datepicker__day--keyboard-selected {
          background: #a4c2f4 !important;
          color: #23272b !important;
        }
        /* Fix react-datepicker dark mode colors */
        .react-datepicker-dark,
        .filter-popup-dark .react-datepicker,
        .filter-popup-dark .react-datepicker__month-container {
          background: #23272b !important;
          color: #fff !important;
        }
        .filter-popup-dark .react-datepicker__header {
          background: #23272b !important;
          color: #fff !important;
          border-bottom: 1px solid #444 !important;
        }
        .filter-popup-dark .react-datepicker__current-month,
        .filter-popup-dark .react-datepicker__day-name,
        .filter-popup-dark .react-datepicker__day {
          color: #fff !important;
        }
        .filter-popup-dark .react-datepicker__day--selected,
        .filter-popup-dark .react-datepicker__day--keyboard-selected {
          background: #a4c2f4 !important;
          color: #23272b !important;
        }
        .filter-popup-dark .react-datepicker__day:hover {
          background: #444 !important;
          color: #fff !important;
        }
        .btn.btn-primary {
          color: #111 !important;
          background: var(--primary) !important;
          border: none;
        }
        .btn.btn-primary:active, .btn.btn-primary:focus, .btn.btn-primary:hover {
          color: #111 !important;
          background: #cbe2ff !important;
        }
        .filter-popup-dark .btn-close {
          filter: invert(1);
          opacity: 0.8;
        }
        .filter-popup-light .btn-close {
          filter: none;
          opacity: 0.8;
        }
        .attendance-report-section {
          margin: 2.5rem auto 0 auto;
          max-width: 900px;
          width: 100%;
        }
        .attendance-summary-card {
          border-radius: 16px;
          box-shadow: 0 2px 16px rgba(44,62,80,0.10);
          padding: 1.5rem 1.5rem 1rem 1.5rem;
          margin-bottom: 1.5rem;
          background: var(--card-bg);
          color: var(--text);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .summary-dark {
          background: #23272b !important;
          color: #fff !important;
        }
        .summary-light {
          background: #fff !important;
          color: #222 !important;
        }
        .attendance-logs-table-wrapper {
          border-radius: 14px;
          overflow-x: auto;
          background: var(--card-bg);
          box-shadow: 0 2px 16px rgba(44,62,80,0.10);
        }
        .attendance-logs-table th, .attendance-logs-table td {
          vertical-align: middle;
          text-align: center;
        }
        .attendance-logs-table th {
          font-weight: 700;
          font-size: 15px;
        }
        .attendance-logs-table tr {
          transition: background 0.15s;
        }
        .attendance-logs-table tr:hover {
          background: #eaf2ff;
        }
        .table-dark.attendance-logs-table tr:hover {
          background: #23272b !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
