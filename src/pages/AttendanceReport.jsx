import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import Loader from "../components/Common/Loader";
import AnimatedAlert from "../components/Layout/AnimatedAlert";
import { FaUserCircle, FaClock, FaSignInAlt, FaSignOutAlt, FaQuestionCircle, FaFilter, FaDownload, FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
// No need to use api for download, just use the base URL

// Set your backend base URL here
const BACKEND_BASE_URL = 'http://202.51.3.49:8002/api';
function downloadFile(url) {
  window.location.href = BACKEND_BASE_URL + url;
}

// function useQuery() {
//   return new URLSearchParams(useLocation().search);
// }

const AttendanceReport = () => {
  const { theme } = useContext(ThemeContext);
  // const query = useQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state;
  const [showFilter, setShowFilter] = useState(false);
  const [attendance, setAttendance] = useState([]); // For user list in filter
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(navState?.user?._id || null);
  const selectedUserObj = Array.isArray(attendance) ? attendance.find(u => u._id === selectedUser) : null;
  const [filterFrom, setFilterFrom] = useState(navState?.from ? new Date(navState.from) : null);
  const [filterTo, setFilterTo] = useState(navState?.to ? new Date(navState.to) : null);
  const [reportData, setReportData] = useState(navState?.reportData || null);
  const [reportUser] = useState(navState?.user || null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  // const [downloading, setDownloading] = useState(false);

  // Fetch all users for filter
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await axios.get("/attendance/date/all?from=2025-07-17&to=2025-07-17");
        setAttendance(Array.isArray(res.data) ? res.data : []);
      } catch {
        setAttendance([]);
      }
    }
    fetchUsers();
  }, []);

  // Fetch report data when params change
  useEffect(() => {
    if (reportData) return;
    async function fetchReport() {
      if (!selectedUser || !filterFrom || !filterTo) return;
      setReportLoading(true);
      setReportError("");
      setReportData(null);
      try {
        const fromStr = filterFrom.toISOString().slice(0, 10);
        const toStr = filterTo.toISOString().slice(0, 10);
        const res = await axios.get(`/attendance/date?userId=${selectedUser}&from=${fromStr}&to=${toStr}`);
        setReportData(res.data);
      } catch (error) {
        setReportError(error?.response?.data?.message || error?.message || "Failed to fetch attendance report");
      }
      setReportLoading(false);
    }
    fetchReport();
    // eslint-disable-next-line
  }, [selectedUser, filterFrom, filterTo, reportData]);

  // Handle filter apply
  const handleApplyFilter = () => {
    if (!selectedUser || !filterFrom || !filterTo) return;
    const fromStr = filterFrom.toISOString().slice(0, 10);
    const toStr = filterTo.toISOString().slice(0, 10);
    navigate(`/attendance-report?userId=${selectedUser}&from=${fromStr}&to=${toStr}`);
    setShowFilter(false);
  };

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
                value={selectedUserObj ? selectedUserObj.username : userSearch}
                onChange={e => {
                  setUserSearch(e.target.value);
                  setSelectedUser(null);
                }}
                style={{ marginBottom: 8, borderRadius: 8, border: theme === 'dark' ? '1.5px solid #444' : '1.5px solid #e0e0e0', background: theme === 'dark' ? '#23272b' : '#fafbfc', color: theme === 'dark' ? '#fff' : '#222' }}
                readOnly={!!selectedUserObj}
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
            <div className="mb-3 d-flex flex-row gap-3">
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
            <div className="d-flex justify-content-end gap-2 mt-2">
              <button className="btn btn-secondary" onClick={() => setShowFilter(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleApplyFilter} disabled={!selectedUser || !filterFrom || !filterTo}>Apply</button>
            </div>
          </div>
        </div>
      )}
      {/* Attendance Report Section */}
      {reportLoading && (
        <div className="d-flex justify-content-center align-items-center my-5">
          <Loader /> <span className="ms-3">Loading attendance report...</span>
        </div>
      )}
      {reportError && (
        <AnimatedAlert type="error" message={reportError} />
      )}
      {reportData && reportUser && (
        <div className="attendance-report-section animate__animated animate__fadeIn">
          {/* Summary Card */}
          <div className={`attendance-summary-card ${theme === 'dark' ? 'summary-dark' : 'summary-light'}`}> 
            <div className="d-flex align-items-center gap-3 mb-2">
              <img src={reportUser.profileImage} alt={reportUser.username} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #a4c2f4', background: '#eee' }} onError={e => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(reportUser.username); }} />
              <div>
                <div className="fw-bold" style={{ fontSize: 18 }}>{reportUser.username}</div>
                <div className="d-flex align-items-center gap-2" style={{ fontSize: 14, color: theme === 'dark' ? '#a4c2f4' : '#1976d2' }}>
                  <FaCalendarAlt />
                  {filterFrom?.toLocaleDateString()} - {filterTo?.toLocaleDateString()}
                </div>
              </div>
              <button
                className="btn btn-primary ms-auto d-flex align-items-center gap-2"
                style={{ fontWeight: 600, color: '#111', background: 'var(--primary)', border: 'none', fontSize: 15 }}
                // disabled={downloading}
                onClick={() => {
                  const fromStr = filterFrom.toISOString().slice(0, 10);
                  const toStr = filterTo.toISOString().slice(0, 10);
                  // Build the download URL (use your API base if needed)
                  const url = `/attendance/download?userId=${reportUser._id}&from=${fromStr}&to=${toStr}`;
                  downloadFile(url);
                }}
              >
                <FaDownload /> {/* Downloading... */}
              </button>
            </div>
            <div className="d-flex align-items-center gap-3 mt-2">
              <span className="badge bg-secondary" style={{ fontSize: 15, color: '#fff', background: '#444' }}>
                <FaClock style={{ marginRight: 6 }} />
                Total: {reportData.totalHours?.toFixed(2) || '0.00'} hrs
              </span>
              <span className="badge bg-info" style={{ fontSize: 15, color: '#111', background: '#a4c2f4' }}>
                {reportData.totalTime || '00:00:00'}
              </span>
            </div>
          </div>
          {/* Attendance Logs Table */}
          <div className="attendance-logs-table-wrapper mt-4">
            <table className={`table table-hover table-bordered align-middle attendance-logs-table ${theme === 'dark' ? 'table-dark' : ''}`} style={{ borderRadius: 14, overflow: 'hidden', fontSize: 15 }}>
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th><FaSignInAlt /> Check-In</th>
                  <th><FaSignOutAlt /> Check-Out</th>
                  <th><FaClock /> Hours</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(reportData.attendance?.attendanceLogs) && reportData.attendance.attendanceLogs.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-muted">No attendance logs found for this range.</td></tr>
                )}
                {Array.isArray(reportData.attendance?.attendanceLogs) && reportData.attendance.attendanceLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{log.checkIn?.split(' ')[1] || '-'}</td>
                    <td style={{ color: '#00b894', fontWeight: 500 }}>{log.checkIn || '-'}</td>
                    <td style={{ color: '#d63031', fontWeight: 500 }}>{log.checkOut || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{log.totalHour?.toFixed(2) || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!reportData && <div className="text-center text-muted mt-5">No attendance report data available. Please use the filter to select a user and date range.</div>}
      <style>{`
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
        .filter-popup-dark .btn-close {
          filter: invert(1);
          opacity: 0.8;
        }
        .filter-popup-light .btn-close {
          filter: none;
          opacity: 0.8;
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

export default AttendanceReport; 