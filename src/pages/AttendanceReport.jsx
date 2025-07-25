import React, { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import Loader from "../components/Common/Loader";
import AnimatedAlert from "../components/Layout/AnimatedAlert";
import { FaUserCircle, FaClock, FaSignInAlt, FaSignOutAlt, FaQuestionCircle, FaFilter, FaDownload, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import BikramSambat from "bikram-sambat-js";
import axios from "axios";
import api from "../api";
import '@sajanm/nepali-date-picker/dist/nepali.datepicker.v5.0.4.min.js';
// import NepaliDate from 'nepali-date-converter
// No need to use api for download, just use the base URL

// Set your backend base URL here
const BACKEND_BASE_URL = 'http://202.51.3.49:8002/api';
function downloadFile(url) {
  window.location.href = BACKEND_BASE_URL + url;
}

// function useQuery() {
//   return new URLSearchParams(useLocation().search);
// }

const NEPALI_MONTHS = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];
const getCurrentBSYear = () => {
  const todayAD = new Date().toISOString().slice(0, 10);
  const todayBS = new BikramSambat(todayAD, 'AD').toBS();
  return Number(todayBS.split('-')[0]);
};

const AttendanceReport = () => {
  const { theme } = useContext(ThemeContext);
  // const query = useQuery();
  const location = useLocation();
  const navState = location.state;
  const [showFilter, setShowFilter] = useState(false);
  const [attendance, setAttendance] = useState(Array.isArray(navState?.userList) ? navState.userList : []); // For user list in filter
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(navState?.user?._id || null);
  const [filterFrom, setFilterFrom] = useState(navState?.fromBS || '');
  const [filterTo, setFilterTo] = useState(navState?.toBS || '');
  const [reportData, setReportData] = useState(navState?.reportData || null);
  const [reportUser, setReportUser] = useState(navState?.user || null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  // const [downloading, setDownloading] = useState(false);
  const [filterType, setFilterType] = useState('month'); // 'month' or 'custom'
  const [selectedNepaliYear, setSelectedNepaliYear] = useState(getCurrentBSYear());
  const [selectedNepaliMonth, setSelectedNepaliMonth] = useState(0);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Generate BS years from 2081 to current year
  const getBSYears = () => {
    const current = getCurrentBSYear();
    const years = [];
    for (let y = 2081; y <= current; y++) years.push(y);
    return years;
  };
  const NEPALI_YEARS = getBSYears();

  // Fetch all users for filter
  useEffect(() => {
    if (attendance.length > 0) return;
    async function fetchUsers() {
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const todayStr = `${yyyy}-${mm}-${dd}`;
        const res = await axios.get(`/attendance/date/all?from=${todayStr}&to=${todayStr}`);
        setAttendance(Array.isArray(res.data) ? res.data : []);
      } catch {
        setAttendance([]);
      }
    }
    fetchUsers();
  }, [attendance]);

  // Fetch report data when params change
  useEffect(() => {
    if (reportData) return;
    async function fetchReport() {
      if (!selectedUser || !filterFrom || !filterTo) return;
      setReportLoading(true);
      setReportError("");
      setReportData(null);
      try {
        const fromStr = new BikramSambat(filterFrom, 'BS').toAD();
        const toStr = new BikramSambat(filterTo, 'BS').toAD();
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
  const handleApplyFilter = async () => {
    if (!selectedUser || !filterFrom || !filterTo) return;
    setShowFilter(false);
    setReportLoading(true);
    setReportError("");
    setReportData(null);
    try {
      // Convert BS to AD for API call
      const fromStr = new BikramSambat(filterFrom, 'BS').toAD();
      const toStr = new BikramSambat(filterTo, 'BS').toAD();
      const todayD1 = new BikramSambat('2082-04-04', 'BS').toAD();
      const todayD2 = new BikramSambat('2082-04-05', 'BS').toAD();
      // let dates1 = new NepaliDate(20582, 4, 4).getAD();
      console.log(todayD1);
      console.log(todayD2);
      // console.log(dates1);
      // console.log(`/attendance/date?userId=${selectedUser}&from=${filterFrom}&to=${filterTo}`);
      // console.log(`/attendance/date?userId=${selectedUser}&from=${fromStr}&to=${toStr}`);
      const res = await api.get(`/attendance/date?userId=${selectedUser}&from=${fromStr}&to=${toStr}`);
      const user = Array.isArray(attendance) ? attendance.find(u => u._id === selectedUser) : null;
      setReportData(res.data);
      setReportUser(user);
    } catch (error) {
      setReportError(error?.response?.data?.message || error?.message || "Failed to fetch attendance report");
    }
    setReportLoading(false);
  };

  // Helper to format BS date as 'dd MMM, yyyy'
  function formatBS(bsDateStr) {
    const months = ["Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];
    if (typeof bsDateStr !== 'string' || !bsDateStr.includes('-')) return '';
    const [yyyy, mm, dd] = bsDateStr.split('-');
    return `${dd} ${months[parseInt(mm, 10) - 1]}, ${yyyy}`;
  }

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
          <div className={`filter-popup-modern ${theme === 'dark' ? 'filter-popup-dark' : 'filter-popup-light'}`}> 
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 fw-bold" style={{ letterSpacing: 1 }}>Filter Attendance</h5>
              <button className="btn-close" onClick={() => setShowFilter(false)}
                style={{ filter: theme === 'dark' ? 'invert(1)' : 'none', opacity: 0.8 }}
                aria-label="Close filter"
              ></button>
            </div>
            <div className="mb-3">
              <label className="fw-semibold mb-2 text-start w-100">Filter Type</label>
              <select
                className="form-select form-select-sm"
                value={filterType}
                onChange={e => {
                  setFilterType(e.target.value);
                  if (e.target.value === 'month') {
                    setSelectedNepaliYear(getCurrentBSYear());
                    setSelectedNepaliMonth(0);
                    // Set filterFrom/To for current month
                    const year = getCurrentBSYear();
                    const month = 1;
                    const fromBS = `${year}-${String(month).padStart(2, '0')}-01`;
                    let nextMonth = month + 1;
                    let nextYear = year;
                    if (nextMonth > 12) { nextMonth = 1; nextYear += 1; }
                    const firstOfNext = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
                    const lastDayAD = new BikramSambat(firstOfNext, 'BS').toAD();
                    const lastDay = new Date(lastDayAD);
                    lastDay.setDate(lastDay.getDate() - 1);
                    const lastBS = new BikramSambat(lastDay.toISOString().slice(0, 10), 'AD').toBS();
                    setFilterFrom(fromBS);
                    setFilterTo(lastBS);
                  } else {
                    setCustomFrom('');
                    setCustomTo('');
                    setFilterFrom('');
                    setFilterTo('');
                  }
                }}
              >
                <option value="month">Month</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="row g-3 align-items-start mb-3" style={{ minWidth: 400 }}>
              {/* Select User */}
              <div className="col-12 col-md-6">
                <label className="fw-semibold mb-2 text-start w-100">Select User</label>
                <input
                  type="text"
                  className="form-control filter-user-search"
                  placeholder="Search user..."
                  value={userSearch}
                  onChange={e => {
                    setUserSearch(e.target.value);
                    setSelectedUser(null);
                  }}
                  style={{ marginBottom: 8, borderRadius: 10, border: theme === 'dark' ? '1.5px solid #444' : '1.5px solid #e0e0e0', background: theme === 'dark' ? '#23272b' : '#f8fafc', color: theme === 'dark' ? '#fff' : '#222', fontSize: 16, padding: '10px 14px' }}
                />
                <div className="user-list-scroll-modern" style={{ width: '100%', minHeight: 120, maxHeight: 260 }}>
                  {attendance
                    .filter(user => user.username.toLowerCase().includes(userSearch.toLowerCase()))
                    .map(user => (
                      <div
                        key={user._id}
                        className={`d-flex align-items-center mb-2 gap-2 filter-user-row${selectedUser === user._id ? ' filter-user-selected' : ''}`}
                        style={{
                          cursor: 'pointer',
                          background: selectedUser === user._id ? (theme === 'dark' ? '#2d3540' : '#eaf2ff') : 'transparent',
                          borderRadius: 10,
                          padding: '7px 10px',
                          transition: 'background 0.15s',
                          fontSize: 16,
                          fontWeight: selectedUser === user._id ? 600 : 500,
                          boxShadow: selectedUser === user._id ? '0 2px 8px rgba(164,194,244,0.10)' : 'none',
                        }}
                        onClick={() => {
                          setSelectedUser(user._id);
                          setUserSearch(user.username);
                        }}
                      >
                        <img src={user.profileImage} alt={user.username} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #a4c2f4', background: '#eee' }} onError={e => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.username); }} />
                        <span style={{ fontWeight: 500 }}>{user.username}</span>
                      </div>
                    ))}
                </div>
              </div>
              {/* Month or Custom Date Selection */}
              <div className="col-12 col-md-6">
                {filterType === 'month' && (
                  <div className="d-flex flex-row gap-2 mb-2 align-items-end">
                    <div style={{ flex: 1 }}>
                      <label className="fw-semibold mb-1">Year (BS)</label>
                      <select
                        className="form-select"
                        value={selectedNepaliYear}
                        onChange={e => {
                          setSelectedNepaliYear(Number(e.target.value));
                          // Update filterFrom/To for new year/month
                          const year = Number(e.target.value);
                          const month = selectedNepaliMonth + 1;
                          const fromBS = `${year}-${String(month).padStart(2, '0')}-01`;
                          let nextMonth = month + 1;
                          let nextYear = year;
                          if (nextMonth > 12) { nextMonth = 1; nextYear += 1; }
                          const firstOfNext = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
                          const lastDayAD = new BikramSambat(firstOfNext, 'BS').toAD();
                          const lastDay = new Date(lastDayAD);
                          lastDay.setDate(lastDay.getDate() - 1);
                          const lastBS = new BikramSambat(lastDay.toISOString().slice(0, 10), 'AD').toBS();
                          setFilterFrom(fromBS);
                          setFilterTo(lastBS);
                        }}
                      >
                        {NEPALI_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="fw-semibold mb-1">Month</label>
                      <select
                        className="form-select"
                        value={selectedNepaliMonth}
                        onChange={e => {
                          setSelectedNepaliMonth(Number(e.target.value));
                          // Set filterFrom and filterTo for the selected year/month
                          const year = selectedNepaliYear;
                          const month = Number(e.target.value) + 1;
                          const fromBS = `${year}-${String(month).padStart(2, '0')}-01`;
                          let nextMonth = month + 1;
                          let nextYear = year;
                          if (nextMonth > 12) { nextMonth = 1; nextYear += 1; }
                          const firstOfNext = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
                          const lastDayAD = new BikramSambat(firstOfNext, 'BS').toAD();
                          const lastDay = new Date(lastDayAD);
                          lastDay.setDate(lastDay.getDate() - 1);
                          const lastBS = new BikramSambat(lastDay.toISOString().slice(0, 10), 'AD').toBS();
                          setFilterFrom(fromBS);
                          setFilterTo(lastBS);
                        }}
                      >
                        {NEPALI_MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                {filterType === 'custom' && (
                  <div className="mb-3 row g-2 align-items-center">
                    <div className="d-flex flex-row gap-3">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <label className="fw-semibold mb-2" style={{ display: 'block' }}>From</label>
                        <input
                          type="text"
                          className="form-control filter-datepicker"
                          value={customFrom}
                          onChange={e => setCustomFrom(e.target.value)}
                          placeholder="YYYY-MM-DD (BS)"
                          onBlur={e => {
                            // Convert BS to AD using BikramSambat
                            if (e.target.value) {
                              const ad = new BikramSambat(e.target.value, 'BS').toAD();
                              setFilterFrom(ad);
                            }
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <label className="fw-semibold mb-2" style={{ display: 'block' }}>To</label>
                        <input
                          type="text"
                          className="form-control filter-datepicker"
                          value={customTo}
                          onChange={e => setCustomTo(e.target.value)}
                          placeholder="YYYY-MM-DD (BS)"
                          onBlur={e => {
                            if (e.target.value) {
                              const ad = new BikramSambat(e.target.value, 'BS').toAD();
                              setFilterTo(ad);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-2">
              <button className="btn btn-secondary" onClick={() => setShowFilter(false)} style={{ borderRadius: 8, fontSize: 16, padding: '8px 22px' }}>Cancel</button>
              <button className="btn btn-primary" type="button" onClick={handleApplyFilter} disabled={!selectedUser || !filterFrom || !filterTo} style={{ borderRadius: 8, fontSize: 16, padding: '8px 22px', fontWeight: 600 }}>Apply</button>
            </div>
          </div>
          <style>{`
            .filter-popup-modern {
              min-width: 480px;
              max-width: 98vw;
              background: ${theme === 'dark' ? '#23272b' : '#fff'};
              border-radius: 18px;
              box-shadow: 0 8px 32px rgba(44,62,80,0.18);
              padding: 2.2rem 1.7rem 1.5rem 1.7rem;
              animation: fadeSlideIn 0.3s cubic-bezier(0.23, 1, 0.32, 1);
              color: ${theme === 'dark' ? '#fff' : '#222'};
            }
            .user-list-scroll-modern {
              max-height: 260px;
              overflow-y: auto;
              border: 1.5px solid ${theme === 'dark' ? '#444' : '#e0e0e0'};
              border-radius: 12px;
              padding: 0.5rem 0.5rem 0.5rem 0.25rem;
              background: ${theme === 'dark' ? '#23272b' : '#f8fafc'};
              margin-bottom: 1rem;
              width: 100%;
            }
            @media (max-width: 600px) {
              .filter-popup-modern {
                min-width: 98vw !important;
                max-width: 100vw !important;
                padding: 1.2rem !important;
              }
              .user-list-scroll-modern {
                max-height: 160px;
              }
            }
          `}</style>
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
                  {(filterFrom && filterTo)
                    ? `${formatBS(filterFrom)} - ${formatBS(filterTo)}`
                    : (navState?.fromBS && navState?.toBS
                        ? `${formatBS(navState.fromBS)} - ${formatBS(navState.toBS)}`
                        : '')}
                </div>
              </div>
              <button
                className="btn btn-primary ms-auto d-flex align-items-center gap-2"
                style={{ fontWeight: 600, color: '#111', background: 'var(--primary)', border: 'none', fontSize: 15 }}
                // disabled={downloading}
                onClick={() => {
                  const fromStr = new BikramSambat(filterFrom, 'BS').toAD();
                  const toStr = new BikramSambat(filterTo, 'BS').toAD();
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
                  <th><FaSignInAlt /> Check-In</th>
                  <th><FaSignOutAlt /> Check-Out</th>
                  <th><FaClock /> Hours</th>
                  <th colSpan={2} className="text-center"><FaMapMarkerAlt style={{ marginRight: 6, color: '#00b894' }} />Check-In Location</th>
                  <th colSpan={2} className="text-center"><FaMapMarkerAlt style={{ marginRight: 6, color: '#d63031' }} />Check-Out Location</th>
                </tr>
                <tr>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th style={{ minWidth: 90 }}>Latitude</th>
                  <th style={{ minWidth: 90 }}>Longitude</th>
                  <th style={{ minWidth: 90 }}>Latitude</th>
                  <th style={{ minWidth: 90 }}>Longitude</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(reportData.attendance?.attendanceLogs) && reportData.attendance.attendanceLogs.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted">No attendance logs found for this range.</td></tr>
                )}
                {Array.isArray(reportData.attendance?.attendanceLogs) && reportData.attendance.attendanceLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td style={{ color: '#00b894', fontWeight: 500 }}>
                      {log.checkIn
                        ? (() => {
                            // log.checkIn is expected as 'hh:mm:ss dd/MM/yyyy' (AD)
                            const [time, adDate] = log.checkIn.split(' ');
                            if (!adDate || !time) return log.checkIn;
                            try {
                              // Convert dd/MM/yyyy to yyyy-mm-dd for BikramSambat
                              const [dd, MM, yyyy] = adDate.split('/');
                              const adIso = `${yyyy}-${MM}-${dd}`;
                              const bsDate = new BikramSambat(adIso, 'AD').toBS();
                              // Format as dd-MM-yyyy
                              const [bsY, bsM, bsD] = bsDate.split('-');
                              return `${time} ${bsD}-${bsM}-${bsY}`;
                            } catch {
                              return log.checkIn;
                            }
                          })()
                        : '-'}
                    </td>
                    <td style={{ color: '#d63031', fontWeight: 500 }}>
                      {log.checkOut
                        ? (() => {
                            // log.checkOut is expected as 'hh:mm:ss dd/MM/yyyy' (AD)
                            const [time, adDate] = log.checkOut.split(' ');
                            if (!adDate || !time) return log.checkOut;
                            try {
                              // Convert dd/MM/yyyy to yyyy-mm-dd for BikramSambat
                              const [dd, MM, yyyy] = adDate.split('/');
                              const adIso = `${yyyy}-${MM}-${dd}`;
                              const bsDate = new BikramSambat(adIso, 'AD').toBS();
                              // Format as dd-MM-yyyy
                              const [bsY, bsM, bsD] = bsDate.split('-');
                              return `${time} ${bsD}-${bsM}-${bsY}`;
                            } catch {
                              return log.checkOut;
                            }
                          })()
                        : '-'}
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.totalHour?.toFixed(2) || '-'}</td>
                    <td style={{ fontWeight: 500 }}>{log.checkInLatitude ?? '-'}</td>
                    <td style={{ fontWeight: 500 }}>{log.checkInLongitude ?? '-'}</td>
                    <td style={{ fontWeight: 500 }}>{log.checkOutLatitude ?? '-'}</td>
                    <td style={{ fontWeight: 500 }}>{log.checkOutLongitude ?? '-'}</td>
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