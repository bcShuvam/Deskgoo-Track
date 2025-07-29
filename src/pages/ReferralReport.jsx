import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaSearch, FaUser, FaCalendarAlt, FaChartLine, FaUsers, FaClock, FaMapMarkerAlt, FaDownload } from 'react-icons/fa';
import api from '../api.js';
import BikramSambat from "bikram-sambat-js";

const ReferralReport = () => {
  const navigate = useNavigate();
  
  // Nepali months array
  const NEPALI_MONTHS = [
    'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];

  // Get current BS year
  const getCurrentBSYear = () => {
    const todayAD = new Date().toISOString().slice(0, 10);
    const todayBS = new BikramSambat(todayAD, 'AD').toBS();
    return Number(todayBS.split('-')[0]);
  };

  // Get current BS month
  const getCurrentBSMonth = () => {
    const todayAD = new Date().toISOString().slice(0, 10);
    const todayBS = new BikramSambat(todayAD, 'AD').toBS();
    return Number(todayBS.split('-')[1]);
  };

  // Get current BS day
  const getCurrentBSDay = () => {
    const todayAD = new Date().toISOString().slice(0, 10);
    const todayBS = new BikramSambat(todayAD, 'AD').toBS();
    return Number(todayBS.split('-')[2]);
  };

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState({
    year: 2082,
    month: getCurrentBSMonth()
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  // BS to AD date conversion
  const convertBSToAD = (bsYear, bsMonth) => {
    try {
      // Create BS date string in YYYY-MM-DD format
      const bsStartDate = `${bsYear}-${bsMonth.toString().padStart(2, '0')}-01`;
      const bsEndDate = `${bsYear}-${bsMonth.toString().padStart(2, '0')}-32`; // Will be adjusted by the library
      
      // Convert BS to AD
      const startDateAD = new BikramSambat(bsStartDate, 'BS').toAD();
      const endDateAD = new BikramSambat(bsEndDate, 'BS').toAD();
      
      return {
        from: startDateAD.split('T')[0],
        to: endDateAD.split('T')[0]
      };
    } catch (error) {
      console.error('Error converting BS to AD:', error);
      // Fallback to current date
      const today = new Date().toISOString().split('T')[0];
      return {
        from: today,
        to: today
      };
    }
  };

  // Fetch referral report data
  const fetchReferralReport = async (fromDate, toDate) => {
    setLoading(true);
    try {
      const response = await api.get(`/patient-referral/referral-report/by-users?from=${fromDate}&to=${toDate}`);
      setReportData(response.data);
      setFilteredData(response.data.data);
    } catch (error) {
      console.error('Error fetching referral report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize with current month
  useEffect(() => {
    const { from, to } = convertBSToAD(selectedDate.year, selectedDate.month);
    fetchReferralReport(from, to);
  }, []);

  // Handle date change
  const handleDateChange = (field, value) => {
    const newDate = { ...selectedDate, [field]: value };
    setSelectedDate(newDate);
    
    const { from, to } = convertBSToAD(newDate.year, newDate.month);
    fetchReferralReport(from, to);
  };

  // Handle download
  const handleDownload = async () => {
    try {
      const { from, to } = convertBSToAD(selectedDate.year, selectedDate.month);
      const response = await api.get(`/patient-referral/referral-report/by-users/download?from=${from}&to=${to}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `referral-report-${selectedDate.year}-${NEPALI_MONTHS[selectedDate.month - 1]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  // Handle search
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    if (!reportData) return;

    if (searchValue.trim() === '') {
      setFilteredData(reportData.data);
    } else {
      const filtered = reportData.data.filter(user =>
        user.username.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  // Handle filter apply
  const handleFilterApply = () => {
    if (selectedUser) {
      const { from, to } = convertBSToAD(selectedDate.year, selectedDate.month);
      // Navigate to detail page with user data
      navigate('/referral-report-detail', { 
        state: { 
          user: selectedUser, 
          dateRange: { from, to },
          selectedDate,
          allUsers: reportData.data
        } 
      });
    }
    setShowFilter(false);
  };

  // Handle filter cancel
  const handleFilterCancel = () => {
    setSelectedUser(null);
    setShowFilter(false);
  };

  // BS Year options (current year - 5 to current year + 5)
  const currentYear = getCurrentBSYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // BS Month options
  const monthOptions = NEPALI_MONTHS.map((month, index) => ({
    value: index + 1,
    label: month
  }));

  return (
    <div className="referral-report-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <div className="page-title-section">
              <h1 className="page-title">Referral Report</h1>
              <div className="title-underline"></div>
            </div>
            <div className="date-selection">
              <div className="current-date">
                <span className="date-label">Current BS Date:</span>
                <span className="date-value">
                  {NEPALI_MONTHS[getCurrentBSMonth() - 1]} {getCurrentBSDay()}, {getCurrentBSYear()}
                </span>
              </div>
              <div className="date-controls">
                <div className="date-input-group">
                  <label>Year (BS):</label>
                  <select
                    value={selectedDate.year}
                    onChange={(e) => handleDateChange('year', parseInt(e.target.value))}
                    className="date-select"
                  >
                    {Array.from({ length: getCurrentBSYear() - 2081 }, (_, i) => 2082 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="date-input-group">
                  <label>Month (BS):</label>
                  <select
                    value={selectedDate.month}
                    onChange={(e) => handleDateChange('month', parseInt(e.target.value))}
                    className="date-select"
                  >
                    {NEPALI_MONTHS.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="download-button"
            onClick={handleDownload}
            title="Download Report"
          >
            <FaDownload />
            <span>Download</span>
          </button>
          <button
            className="filter-button"
            onClick={() => setShowFilter(true)}
            title="Open Filters"
          >
            <FaFilter />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {reportData && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{reportData.totalReferralCount}</h3>
              <p className="stat-label">Total Referrals</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{reportData.averageReferralPerDay.toFixed(2)}</h3>
              <p className="stat-label">Avg. Per Day</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaUser />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{reportData.averageReferralPerUser.toFixed(2)}</h3>
              <p className="stat-label">Avg. Per User</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{reportData.data.length}</h3>
              <p className="stat-label">Active Users</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Grid */}
      <div className="users-section">
        <div className="section-header">
          <h2 className="section-title">User Performance</h2>
          <p className="section-subtitle">Individual referral statistics for each user</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading referral data...</p>
          </div>
        ) : (
          <div className="users-grid">
            {filteredData.map((user) => (
              <div key={user.userId} className="user-card">
                <div className="user-header">
                  <div className="user-avatar">
                    <img
                      src={user.profileImage || '/user-fallback.png'}
                      alt={user.username}
                      onError={(e) => e.target.src = '/user-fallback.png'}
                    />
                  </div>
                  <div className="user-info">
                    <h3 className="user-name">{user.username}</h3>
                    <p className="user-status">
                      {user.mobileTime ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                
                <div className="user-stats">
                  <div className="stat-item">
                    <span className="stat-number">{user.totalReferral}</span>
                    <span className="stat-text">Total Referrals</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{user.averageReferralPerDay.toFixed(2)}</span>
                    <span className="stat-text">Per Day</span>
                  </div>
                </div>
                
                {user.mobileTime && (
                  <div className="last-activity">
                    <FaClock />
                    <span>Last active: {user.mobileTime}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Popup */}
      {showFilter && (
        <div className="filter-overlay" onClick={() => setShowFilter(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Filter Options</h3>
              <button
                className="close-button"
                onClick={() => setShowFilter(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {/* Search */}
              <div className="filter-section">
                <label className="filter-label">Search Users</label>
                <div className="search-input">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Date Selection */}
              <div className="filter-section">
                <label className="filter-label">Select Month</label>
                <div className="date-inputs">
                  <div className="date-input">
                    <label>Year (BS)</label>
                    <select
                      value={selectedDate.year}
                      onChange={(e) => handleDateChange('year', parseInt(e.target.value))}
                    >
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="date-input">
                    <label>Month (BS)</label>
                    <select
                      value={selectedDate.month}
                      onChange={(e) => handleDateChange('month', parseInt(e.target.value))}
                    >
                      {monthOptions.map(month => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* User List */}
              <div className="filter-section">
                <label className="filter-label">All Users ({filteredData.length})</label>
                <div className="users-list">
                  {filteredData.map((user) => (
                    <div 
                      key={user.userId} 
                      className={`user-item ${selectedUser?.userId === user.userId ? 'selected' : ''}`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <img
                        src={user.profileImage || '/user-fallback.png'}
                        alt={user.username}
                        onError={(e) => e.target.src = '/user-fallback.png'}
                      />
                      <div className="user-details">
                        <span className="user-name">{user.username}</span>
                        <span className="user-referrals">{user.totalReferral} referrals</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="filter-actions">
                <button
                  className="cancel-button"
                  onClick={handleFilterCancel}
                >
                  Cancel
                </button>
                <button
                  className="apply-button"
                  onClick={handleFilterApply}
                  disabled={!selectedUser}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .referral-report-page {
          padding: 2rem;
          min-height: 100vh;
          background: var(--background);
          color: var(--text);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          flex: 1;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .page-title-section {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .page-title {
          font-size: 2.25rem;
          font-weight: 800;
          margin: 0;
          color: #000000;
        }

        .title-underline {
          width: 60px;
          height: 4px;
          background: linear-gradient(135deg, var(--primary) 0%, #667eea 100%);
          border-radius: 2px;
          margin-top: 0.5rem;
        }

        .date-selection {
          margin-top: 1rem;
        }

        .current-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .date-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .date-value {
          font-size: 1rem;
          color: var(--primary);
          font-weight: 600;
        }

        .date-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .date-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .date-input-group label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .date-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--background);
          color: var(--text);
          font-size: 0.9rem;
          min-width: 120px;
          cursor: pointer;
        }

        .date-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .download-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .download-button:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .filter-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-button:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          color: var(--text);
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .users-section {
          margin-top: 2rem;
        }

        .section-header {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: var(--text);
        }

        .section-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .user-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .user-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid var(--primary);
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: var(--text);
        }

        .user-status {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .user-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 1rem;
          background: var(--background);
          border-radius: 8px;
        }

        .stat-number {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 0.25rem;
        }

        .stat-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .last-activity {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Filter Modal */
        .filter-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .filter-modal {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text);
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: var(--background);
          color: var(--text);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .filter-section {
          margin-bottom: 2rem;
        }

        .filter-label {
          display: block;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 0.75rem;
        }

        .search-input {
          position: relative;
        }

        .search-input svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .search-input input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--background);
          color: var(--text);
          font-size: 0.95rem;
        }

        .search-input input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .date-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .date-input label {
          display: block;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .date-input select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--background);
          color: var(--text);
          font-size: 0.95rem;
        }

        .date-input select:focus {
          outline: none;
          border-color: var(--primary);
        }

        .users-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }

        .user-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          transition: background 0.2s ease;
        }

        .user-item:last-child {
          border-bottom: none;
        }

        .user-item:hover {
          background: var(--background);
        }

        .user-item img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .user-details .user-name {
          font-weight: 500;
          color: var(--text);
          margin-bottom: 0.25rem;
        }

                 .user-details .user-referrals {
           font-size: 0.85rem;
           color: var(--text-secondary);
         }

         .user-item.selected {
           background: var(--primary);
           color: white;
         }

         .user-item.selected .user-name {
           color: white;
         }

         .user-item.selected .user-referrals {
           color: rgba(255, 255, 255, 0.8);
         }

         .filter-actions {
           display: flex;
           gap: 1rem;
           justify-content: flex-end;
           padding-top: 1rem;
           border-top: 1px solid var(--border-color);
         }

         .cancel-button {
           padding: 0.75rem 1.5rem;
           background: #6b7280;
           color: white;
           border: none;
           border-radius: 8px;
           font-size: 0.95rem;
           font-weight: 500;
           cursor: pointer;
           transition: all 0.2s ease;
         }

         .cancel-button:hover {
           background: #4b5563;
           transform: translateY(-1px);
         }

         .apply-button {
           padding: 0.75rem 1.5rem;
           background: var(--primary);
           color: white;
           border: none;
           border-radius: 8px;
           font-size: 0.95rem;
           font-weight: 500;
           cursor: pointer;
           transition: all 0.2s ease;
         }

         .apply-button:hover:not(:disabled) {
           background: #2563eb;
           transform: translateY(-1px);
         }

         .apply-button:disabled {
           background: #9ca3af;
           cursor: not-allowed;
           transform: none;
         }

        /* Responsive Design */
        @media (max-width: 768px) {
          .referral-report-page {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
            padding: 1rem;
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .download-button,
          .filter-button {
            flex: 1;
            justify-content: center;
          }

          .page-title {
            font-size: 1.75rem;
          }

          .date-controls {
            flex-direction: column;
            gap: 0.75rem;
          }

          .date-input-group {
            width: 100%;
          }

          .date-select {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }

          .users-grid {
            grid-template-columns: 1fr;
          }

          .filter-modal {
            width: 95%;
            margin: 1rem;
          }

          .date-inputs {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.5rem;
          }

          .stat-card {
            padding: 1rem;
          }

          .user-card {
            padding: 1rem;
          }

          .user-stats {
            grid-template-columns: 1fr;
          }
        }

        /* Dark mode adjustments */
        [data-theme="dark"] .filter-modal {
          background: var(--card-bg);
          border-color: var(--border-color);
        }

        [data-theme="dark"] .search-input input,
        [data-theme="dark"] .date-input select {
          background: var(--background);
          color: var(--text);
          border-color: var(--border-color);
        }

        [data-theme="dark"] .users-list {
          border-color: var(--border-color);
        }

        [data-theme="dark"] .user-item {
          border-bottom-color: var(--border-color);
        }
      `}</style>
    </div>
  );
};

export default ReferralReport; 