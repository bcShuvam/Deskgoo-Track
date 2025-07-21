import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import { ThemeContext } from "../context/ThemeContext";
import { useLocation, useNavigate } from "react-router-dom";
import { FaFilter, FaDownload, FaTimes, FaSearch } from "react-icons/fa";

const UserVisitLogDetails = () => {
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const users = state.users || [];
  const userId = state.userId;
  const [from, setFrom] = useState(state.from || new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(state.to || new Date().toISOString().slice(0, 10));
  const [user, setUser] = useState(users.find(u => u._id === userId) || null);
  const [visitLog, setVisitLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(userId);
  const [filterFrom, setFilterFrom] = useState(from);
  const [filterTo, setFilterTo] = useState(to);

  useEffect(() => {
    if (!userId || !from || !to || users.length === 0) {
      setError("Missing user or date range. Please return to the report page.");
      setLoading(false);
      return;
    }
    setUser(users.find(u => u._id === userId) || null); // Update user when userId or users changes
    const fetchLog = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/visitLogs?visitLogId=${userId}&from=${from}&to=${to}`);
        setVisitLog(res.data.visitLogs);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Failed to fetch user visit logs");
      }
      setLoading(false);
    };
    fetchLog();
  }, [userId, from, to, users]);

  // Download CSV
  const handleDownload = async () => {
    try {
      const res = await api.get(`/visitLogs/download?visitLogId=${userId}&from=${from}&to=${to}`, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${user.username}-visitlog-report-${from}-to-${to}.csv`); // Let browser use server's filename
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      alert('Failed to download report.');
    }
  };

  // Filter apply
  const handleApplyFilter = () => {
    setShowFilter(false);
    navigate('/visitlog-report/user', {
      state: { userId: selectedUserId, from: filterFrom, to: filterTo, users }
    });
  };

  if (error) {
    return <div style={{ padding: 32, color: '#e53935', fontWeight: 600, fontSize: 18 }}>{error}</div>;
  }

  return (
    <div style={{ padding: 24, background: theme === 'dark' ? '#181c20' : '#f7faff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, color: theme === 'dark' ? '#fff' : '#23272b', margin: 0 }}>
          {user ? user.username : "User Visit Log"} <span style={{ fontWeight: 400, fontSize: 16, color: theme === 'dark' ? '#a4c2f4' : '#1976d2' }}>({from} to {to})</span>
        </h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleDownload}
            style={{ background: theme === 'dark' ? '#23272b' : '#fff', border: '1.5px solid #a4c2f4', borderRadius: 8, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: theme === 'dark' ? '#a4c2f4' : '#1976d2', fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(44,62,80,0.06)' }}
          >
            <FaDownload style={{ fontSize: 18 }} /> Download
          </button>
          <button
            onClick={() => setShowFilter(true)}
            style={{ background: theme === 'dark' ? '#23272b' : '#fff', border: '1.5px solid #a4c2f4', borderRadius: 8, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: theme === 'dark' ? '#a4c2f4' : '#1976d2', fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(44,62,80,0.06)' }}
          >
            <FaFilter style={{ fontSize: 18 }} /> Filter
          </button>
        </div>
      </div>
      {/* Filter Popup */}
      {showFilter && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: theme === 'dark' ? '#23272b' : '#fff', borderRadius: 18, boxShadow: '0 8px 32px rgba(44,62,80,0.18)', minWidth: 340, maxWidth: 400, width: '98vw', color: theme === 'dark' ? '#fff' : '#23272b', position: 'relative', padding: '2.2rem 1.7rem 1.5rem 1.7rem' }}>
            <button onClick={() => setShowFilter(false)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', zIndex: 2 }}><FaTimes /></button>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Filter User Visit Logs</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <FaSearch style={{ color: theme === 'dark' ? '#a4c2f4' : '#1976d2', fontSize: 16 }} />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ borderRadius: 8, border: '1.5px solid #a4c2f4', padding: '8px 14px', background: theme === 'dark' ? '#181c20' : '#f7faff', color: theme === 'dark' ? '#fff' : '#23272b', width: '100%' }}
                />
              </div>
              <div style={{ maxHeight: 160, overflowY: 'auto', border: '1.5px solid #e0e0e0', borderRadius: 8, background: theme === 'dark' ? '#181c20' : '#f7faff' }}>
                {users.filter(u => u.username.toLowerCase().includes(search.toLowerCase())).map(u => (
                  <div
                    key={u._id}
                    onClick={() => setSelectedUserId(u._id)}
                    style={{ padding: '8px 12px', cursor: 'pointer', background: selectedUserId === u._id ? (theme === 'dark' ? '#2d3540' : '#eaf2ff') : 'transparent', color: selectedUserId === u._id ? (theme === 'dark' ? '#a4c2f4' : '#1976d2') : undefined, fontWeight: selectedUserId === u._id ? 700 : 500, borderRadius: 6, marginBottom: 2 }}
                  >
                    {u.username}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 18, marginBottom: 18, marginTop: 10 }}>
              <div>
                <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>From</label>
                <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} style={{ borderRadius: 8, border: '1.5px solid #a4c2f4', padding: '8px 14px', background: theme === 'dark' ? '#181c20' : '#f7faff', color: theme === 'dark' ? '#fff' : '#23272b' }} />
              </div>
              <div>
                <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>To</label>
                <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} style={{ borderRadius: 8, border: '1.5px solid #a4c2f4', padding: '8px 14px', background: theme === 'dark' ? '#181c20' : '#f7faff', color: theme === 'dark' ? '#fff' : '#23272b' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowFilter(false)} style={{ borderRadius: 8, padding: '8px 22px', fontSize: 16, background: '#eee', color: '#222', border: 'none', fontWeight: 500 }}>Cancel</button>
              <button onClick={handleApplyFilter} style={{ borderRadius: 8, padding: '8px 22px', fontSize: 16, background: theme === 'dark' ? '#a4c2f4' : '#1976d2', color: theme === 'dark' ? '#23272b' : '#fff', border: 'none', fontWeight: 600 }}>Apply</button>
            </div>
          </div>
        </div>
      )}
      {/* User Visit Log Table */}
      {loading && (
        <div style={{ marginTop: 60, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
          <div className="spinner" style={{ width: 48, height: 48, border: `4px solid ${theme === 'dark' ? '#a4c2f4' : '#1976d2'}`, borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 18 }} />
          <div style={{ color: theme === 'dark' ? '#a4c2f4' : '#1976d2', fontSize: 18 }}>Loading...</div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      {error && <div style={{ marginTop: 40, textAlign: 'center', color: '#e53935', fontSize: 18 }}>{error}</div>}
      {visitLog && (
        <div style={{ background: theme === 'dark' ? '#181c20' : '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(44,62,80,0.08)', padding: 0, overflowX: 'auto', marginTop: 18 }}>
          <div style={{ fontWeight: 600, fontSize: 18, margin: '18px 0 0 0', textAlign: 'center', color: theme === 'dark' ? '#fff' : '#23272b' }}>Total Visits: {visitLog.visitLogCounter ?? 0}</div>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 15, marginTop: 8, background: theme === 'dark' ? '#181c20' : '#fff' }}>
            <thead>
              <tr style={{ background: theme === 'dark' ? '#232b33' : '#e3eaf2', color: theme === 'dark' ? '#a4c2f4' : '#1a237e', fontWeight: 700 }}>
                <th style={{ padding: '8px 6px', textAlign: 'center', borderRight: `1.5px solid ${theme === 'dark' ? '#313843' : '#cfd8dc'}` }}>SN</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', borderRight: `1.5px solid ${theme === 'dark' ? '#313843' : '#cfd8dc'}` }}>POC Name</th>
                <th style={{ textAlign: 'center', borderRight: `1.5px solid ${theme === 'dark' ? '#313843' : '#cfd8dc'}` }}>Type</th>
                <th style={{ textAlign: 'center', borderRight: `1.5px solid ${theme === 'dark' ? '#313843' : '#cfd8dc'}` }}>Mobile Time</th>
                <th style={{ textAlign: 'center', borderRight: `1.5px solid ${theme === 'dark' ? '#313843' : '#cfd8dc'}` }}>Category</th>
                <th style={{ textAlign: 'center', borderRight: `1.5px solid ${theme === 'dark' ? '#313843' : '#cfd8dc'}` }}>Number</th>
                <th style={{ textAlign: 'left', borderRight: `1.5px solid ${theme === 'dark' ? '#313843' : '#cfd8dc'}` }}>Address</th>
                <th style={{ textAlign: 'center' }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {visitLog.visitLogs && visitLog.visitLogs.length > 0 ? visitLog.visitLogs.map((log, i) => (
                <tr key={log.logId || i} style={{
                  borderBottom: `1px solid ${theme === 'dark' ? '#232b33' : '#e3eaf2'}`,
                  background: theme === 'dark'
                    ? (i % 2 === 0 ? '#232b33' : '#181c20')
                    : (i % 2 === 0 ? '#f7faff' : '#e3eaf2'),
                  color: theme === 'dark' ? '#fff' : '#23272b',
                }}>
                  <td style={{ textAlign: 'center', fontWeight: 600, borderRight: `1.5px solid ${theme === 'dark' ? '#313843' : '#cfd8dc'}` }}>{i + 1}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, borderRight: `1.5px solid ${theme === 'dark' ? '#313843' : '#cfd8dc'}` }}>{log.pocName}</td>
                  <td style={{ textAlign: 'center', borderRight: `1.5px solid ${theme === 'dark' ? '#313843' : '#cfd8dc'}` }}>{log.visitType}</td>
                  <td style={{ textAlign: 'center', borderRight: `1.5px solid ${theme === 'dark' ? '#313843' : '#cfd8dc'}` }}>{log.mobileTime || ''}</td>
                  <td style={{ textAlign: 'center', borderRight: `1.5px solid ${theme === 'dark' ? '#313843' : '#cfd8dc'}` }}>{log.pocCategory || ''}</td>
                  <td style={{ textAlign: 'center', borderRight: `1.5px solid ${theme === 'dark' ? '#313843' : '#cfd8dc'}` }}>{log.pocNumber || ''}</td>
                  <td style={{ textAlign: 'left', borderRight: `1.5px solid ${theme === 'dark' ? '#313843' : '#cfd8dc'}` }}>{log.pocAddress}</td>
                  <td style={{ textAlign: 'center' }}>{log.remarks}</td>
                </tr>
              )) : (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: theme === 'dark' ? '#a4c2f4' : '#1976d2', padding: 18 }}>No visit logs found for this user in the selected range.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserVisitLogDetails; 