import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaFilter, FaDownload, FaSearch, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaHospital, FaAmbulance, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import api from '../api.js';
import BikramSambat from "bikram-sambat-js";

const ReferralReportDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, dateRange, selectedDate, allUsers } = location.state || {};

  // Set page title
  useEffect(() => {
    document.title = "Referral Report Detail";
  }, []);

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

  // Year options (2082 to current year)
  const yearOptions = Array.from({ length: getCurrentBSYear() - 2081 }, (_, i) => 2082 + i);

  // Month options
  const monthOptions = NEPALI_MONTHS.map((month, index) => ({
    value: index + 1,
    label: month
  }));

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedFilterUser, setSelectedFilterUser] = useState(null);
  const [selectedFilterDate, setSelectedFilterDate] = useState({
    year: selectedDate?.year || 2082,
    month: selectedDate?.month || getCurrentBSMonth()
  });
  const [noDataMessage, setNoDataMessage] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeReferral, setActiveReferral] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected'];

  // BS to AD date conversion
  const convertBSToAD = (bsYear, bsMonth) => {
    try {
      const bsStartDate = `${bsYear}-${bsMonth.toString().padStart(2, '0')}-01`;
      const bsEndDate = `${bsYear}-${bsMonth.toString().padStart(2, '0')}-32`;
      
      const startDateAD = new BikramSambat(bsStartDate, 'BS').toAD();
      const endDateAD = new BikramSambat(bsEndDate, 'BS').toAD();
      
      return {
        from: startDateAD.split('T')[0],
        to: endDateAD.split('T')[0]
      };
    } catch (error) {
      console.error('Error converting BS to AD:', error);
      const today = new Date().toISOString().split('T')[0];
      return { from: today, to: today };
    }
  };

  // Fetch referral details
  const fetchReferralDetails = async (page = 1) => {
    if (!user || !dateRange) return;
    
    setLoading(true);
    setNoDataMessage(''); // Clear any previous message
    try {
      const response = await api.get(`/patient-referral/by-user/${user.userId}?from=${dateRange.from}&to=${dateRange.to}&page=${page}&limit=20`);
      
      if (response.data.total === 0) {
        setNoDataMessage(`No referral data available for ${user.username} of ${NEPALI_MONTHS[selectedDate.month - 1]} ${selectedDate.year}`);
        setReferrals([]);
        setTotalPages(0);
        setTotalReferrals(0);
        setCurrentPage(1);
        setFilteredReferrals([]);
        return;
      }
      
      setReferrals(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalReferrals(response.data.total);
      setCurrentPage(response.data.currentPage);
      setFilteredReferrals(response.data.data);
    } catch (error) {
      console.error('Error fetching referral details:', error);
      setNoDataMessage('Error loading referral data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    try {
      const response = await api.get(`/patient-referral/csv/by-user/${user.userId}?from=${dateRange.from}&to=${dateRange.to}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `referral-detail-${user.username}-${selectedDate.year}-${NEPALI_MONTHS[selectedDate.month - 1]}.csv`);
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
    if (searchValue.trim() === '') {
      setFilteredReferrals(referrals);
    } else {
      const filtered = referrals.filter(referral =>
        referral.fullName.toLowerCase().includes(searchValue.toLowerCase()) ||
        referral.provisionalDiagnosis.toLowerCase().includes(searchValue.toLowerCase()) ||
        referral.city.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredReferrals(filtered);
    }
  };

  // Handle filter search
  const handleFilterSearch = (searchValue) => {
    if (!allUsers) return;

    if (searchValue.trim() === '') {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(user =>
        user.username.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  // Handle filter user selection
  const handleFilterUserSelect = (selectedUser) => {
    setSelectedFilterUser(selectedUser);
  };

  // Handle filter apply
  const handleFilterApply = () => {
    if (selectedFilterUser) {
      // Navigate to the selected user's detail page
      const { from, to } = convertBSToAD(selectedFilterDate.year, selectedFilterDate.month);
      navigate('/referral-report-detail', { 
        state: { 
          user: selectedFilterUser, 
          dateRange: { from, to },
          selectedDate: selectedFilterDate,
          allUsers
        } 
      });
    }
    setShowFilter(false);
  };

  // Handle filter date change
  const handleFilterDateChange = (field, value) => {
    setSelectedFilterDate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle filter cancel
  const handleFilterCancel = () => {
    setSelectedFilterUser(null);
    setSelectedFilterDate({
      year: selectedDate?.year || 2082,
      month: selectedDate?.month || getCurrentBSMonth()
    });
    setShowFilter(false);
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <FaCheckCircle className="text-green-500" />;
      case 'Rejected':
        return <FaTimesCircle className="text-red-500" />;
      case 'Pending':
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helpers for rendering entity objects (POC, Ambulance)
  const isEmptyValue = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    return false;
  };

  const formatKeyLabel = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  const formatValueLabel = (value) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return '';
    return String(value);
  };

  const shouldDisplayEntry = (key, value) => {
    const lowerKey = String(key).toLowerCase();
    if (lowerKey === 'id' || lowerKey === '_id') return false;
    // Hide raw ID-like primitives
    if (lowerKey.endsWith('id') && (typeof value === 'string' || typeof value === 'number')) return false;
    return !isEmptyValue(value);
  };

  const getDisplayEntries = (obj) => {
    if (!obj || typeof obj !== 'object') return [];
    return Object.entries(obj).filter(([k, v]) => shouldDisplayEntry(k, v));
  };

  const renderNestedObject = (obj, parentKeyPrefix = '') => {
    const entries = getDisplayEntries(obj);
    if (entries.length === 0) return null;
    return (
      <div className="nested-list">
        {entries.map(([childKey, childValue]) => (
          <div key={`${parentKeyPrefix}${childKey}`} className="sub-detail">
            <div className="sub-key">{formatKeyLabel(childKey)}</div>
            <div className="sub-value">
              {childValue && typeof childValue === 'object' && !Array.isArray(childValue)
                ? renderNestedObject(childValue, `${parentKeyPrefix}${childKey}.`)
                : formatValueLabel(childValue)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const openStatusModal = (referral) => {
    setActiveReferral(referral);
    setSelectedStatus(referral?.approvalStatus || 'Pending');
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setActiveReferral(null);
    setSelectedStatus('Pending');
    setIsStatusUpdating(false);
  };

  const applyStatusUpdate = async () => {
    if (!activeReferral) return;
    try {
      setIsStatusUpdating(true);
      const payload = [
        {
          referralId: activeReferral._id,
          approvalStatus: selectedStatus,
        },
      ];
      await api.patch(`/patient-referral/by-user/${user.userId}`, payload);
      // refresh list
      await fetchReferralDetails(currentPage);
      closeStatusModal();
    } catch (error) {
      console.error('Failed to update approval status', error);
      setIsStatusUpdating(false);
    }
  };

  // Initialize
  useEffect(() => {
    if (!user || !dateRange) {
      navigate('/referral-report');
      return;
    }
    fetchReferralDetails();
    // Initialize filtered users
    if (allUsers) {
      setFilteredUsers(allUsers);
    }
  }, [user, dateRange, allUsers]);

  if (!user || !dateRange) {
    return null;
  }

  return (
    <div className="referral-detail-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <div className="user-info-section">
              <div className="user-profile">
                <img
                  src={user.profileImage || '/user-fallback.png'}
                  alt={user.username}
                  className="user-avatar"
                  onError={(e) => e.target.src = '/user-fallback.png'}
                />
                <div className="user-details">
                  <h2 className="user-name">{user.username}</h2>
                  <p className="user-period">
                    {NEPALI_MONTHS[selectedDate.month - 1]} {selectedDate.year} • {totalReferrals} referrals
                  </p>
                </div>
              </div>
              <div className="current-date">
                <span className="date-label">Current BS Date:</span>
                <span className="date-value">
                  {NEPALI_MONTHS[getCurrentBSMonth() - 1]} {getCurrentBSDay()}, {getCurrentBSYear()}
                </span>
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

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search referrals by patient name, diagnosis, or location..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Referrals List */}
      <div className="referrals-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading referral details...</p>
          </div>
        ) : noDataMessage ? (
          <div className="no-data-container">
            <div className="no-data-icon">📋</div>
            <h3 className="no-data-title">Referral not found</h3>
            <p className="no-data-message">{noDataMessage}</p>
          </div>
        ) : (
          <div className="referrals-grid">
            {filteredReferrals.map((referral) => (
              <div key={referral._id} className={`referral-card ${referral.approvalStatus?.toLowerCase()}`}>
                <div className="referral-header">
                  <div className="patient-info">
                    <div className="patient-avatar">
                      <FaUser />
                    </div>
                    <div className="patient-details">
                      <h3 className="patient-name">{referral.fullName}</h3>
                      <p className="patient-meta">
                        {referral.age} years • {referral.gender} • {referral.bloodGroup}
                      </p>
                      <p className="patient-diagnosis chip">{referral.provisionalDiagnosis}</p>
                    </div>
                  </div>
                  <div className="status-badge" onClick={() => openStatusModal(referral)} role="button" title="Update status">
                    {getStatusIcon(referral.approvalStatus)}
                    <span className={`status-text ${referral.approvalStatus.toLowerCase()}`}>
                      {referral.approvalStatus}
                    </span>
                  </div>
                </div>

                <div className="referral-content">
                  <div className="contact-info">
                    <div className="contact-item">
                      <FaPhone />
                      <span>{referral.number}</span>
                    </div>
                    <div className="contact-item">
                      <FaMapMarkerAlt />
                      <span>{referral.city}, {referral.region}</span>
                    </div>
                  </div>

                  {referral.remarks && (
                    <div className="remarks">
                      <div className="remarks-label">Remarks</div>
                      <p className="remarks-text">{referral.remarks}</p>
                    </div>
                  )}

                  <div className="entity-sections">
                    {referral.pocId && getDisplayEntries(referral.pocId).length > 0 && (
                      <div className="entity-card">
                        <div className="entity-header">
                          <FaHospital />
                          <span>POC Details</span>
                        </div>
                        <div className="details-grid">
                          {getDisplayEntries(referral.pocId).map(([k, v]) => (
                            <div key={`poc-${k}`} className="detail-item">
                              <div className="detail-key">{formatKeyLabel(k)}</div>
                              <div className="detail-value">
                                {v && typeof v === 'object' && !Array.isArray(v)
                                  ? renderNestedObject(v, `poc-${k}.`)
                                  : formatValueLabel(v)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {referral.ambId && getDisplayEntries(referral.ambId).length > 0 && (
                      <div className="entity-card">
                        <div className="entity-header">
                          <FaAmbulance />
                          <span>Ambulance Details</span>
                        </div>
                        <div className="details-grid">
                          {getDisplayEntries(referral.ambId).map(([k, v]) => (
                            <div key={`amb-${k}`} className="detail-item">
                              <div className="detail-key">{formatKeyLabel(k)}</div>
                              <div className="detail-value">
                                {v && typeof v === 'object' && !Array.isArray(v)
                                  ? renderNestedObject(v, `amb-${k}.`)
                                  : formatValueLabel(v)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="referral-footer">
                    <div className="referral-date">
                      <FaClock />
                      <span>Created: {formatDate(referral.createdAt)}</span>
                    </div>
                    <div className="referral-location">
                      <FaMapMarkerAlt />
                      <span>Location: {referral.latitude}, {referral.longitude}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => fetchReferralDetails(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => fetchReferralDetails(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}

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
                    onChange={(e) => handleFilterSearch(e.target.value)}
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
                      value={selectedFilterDate.year}
                      onChange={(e) => handleFilterDateChange('year', parseInt(e.target.value))}
                    >
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="date-input">
                    <label>Month (BS)</label>
                    <select
                      value={selectedFilterDate.month}
                      onChange={(e) => handleFilterDateChange('month', parseInt(e.target.value))}
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
                <label className="filter-label">All Users ({filteredUsers.length})</label>
                <div className="users-list">
                  {filteredUsers.map((user) => (
                    <div 
                      key={user.userId} 
                      className={`user-item ${selectedFilterUser?.userId === user.userId ? 'selected' : ''}`}
                      onClick={() => handleFilterUserSelect(user)}
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
                  disabled={!selectedFilterUser}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Popup */}
      {showStatusModal && (
        <div className="filter-overlay" onClick={closeStatusModal}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Referral Status</h3>
              <button className="close-button" onClick={closeStatusModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="filter-section">
                <label className="filter-label">Approval Status</label>
                <select
                  className="status-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="status-actions">
                <button className="cancel-button" onClick={closeStatusModal} disabled={isStatusUpdating}>Cancel</button>
                <button className="apply-button" onClick={applyStatusUpdate} disabled={isStatusUpdating}>
                  {isStatusUpdating ? 'Updating...' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .referral-detail-page {
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

        .user-info-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--primary);
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          color: var(--text);
        }

        .user-period {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .current-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
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

        .search-section {
          margin-bottom: 2rem;
        }

        .search-container {
          position: relative;
          max-width: 600px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--card-bg);
          color: var(--text);
          font-size: 1rem;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .referrals-section {
          margin-bottom: 2rem;
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

        .no-data-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          margin: 2rem 0;
        }

        .no-data-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.6;
        }

        .no-data-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 0.5rem 0;
        }

        .no-data-message {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
          max-width: 500px;
          line-height: 1.5;
        }

        .referrals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .referral-card {
          position: relative;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1.25rem 1.25rem 1.25rem 1.25rem;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .referral-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(1200px 200px at -20% -20%, rgba(59,130,246,0.06), transparent 50%),
                      radial-gradient(800px 120px at 120% 120%, rgba(99,102,241,0.05), transparent 60%);
          pointer-events: none;
        }

        .referral-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        }

        .referral-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .patient-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .patient-avatar {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--primary), #8b5cf6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          box-shadow: inset 0 0 0 2px rgba(255,255,255,0.2);
        }

        .patient-details {
          flex: 1;
        }

        .patient-name {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          color: var(--text);
          letter-spacing: 0.2px;
        }

        .patient-meta {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0 0 0.25rem 0;
        }

        .patient-diagnosis {
          font-size: 0.85rem;
          color: var(--primary);
          font-weight: 600;
          margin: 0;
        }

        .chip {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.25);
          border-radius: 999px;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.2);
          cursor: pointer;
          user-select: none;
        }

        .status-badge:hover {
          border-color: var(--primary);
          background: rgba(59, 130, 246, 0.12);
        }

        .status-text {
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-text.approved {
          color: #059669;
        }

        .status-text.rejected {
          color: #dc2626;
        }

        .status-text.pending {
          color: #d97706;
        }

        .referral-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .remarks {
          padding: 0.85rem 1rem;
          background: var(--background);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .remarks-label {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .remarks-text {
          margin: 0;
          color: var(--text);
          line-height: 1.5;
        }

        .entity-sections {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .entity-card {
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--background);
          overflow: hidden;
        }

        .entity-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-color);
          font-weight: 600;
          color: var(--text);
        }

        .entity-header svg {
          color: var(--primary);
          opacity: 0.95;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem 1rem;
          padding: 0.85rem 1rem 1rem 1rem;
        }

        .detail-item {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 0.5rem;
          align-items: start;
        }

        .detail-key {
          font-size: 0.78rem;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .detail-value {
          font-size: 0.92rem;
          color: var(--text);
          word-break: break-word;
        }

        .nested-list {
          display: grid;
          grid-auto-rows: minmax(0, auto);
          gap: 0.25rem 0.5rem;
        }

        .sub-detail {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 0.5rem;
        }

        .sub-key {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .sub-value {
          font-size: 0.9rem;
          color: var(--text);
        }

        .referral-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .referral-date,
        .referral-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .pagination-button {
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

        .pagination-button:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .pagination-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .pagination-info {
          font-size: 0.95rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* Filter Popup Styles */
        .filter-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .filter-modal {
          background: var(--card-bg);
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .status-modal {
          background: var(--card-bg);
          border-radius: 12px;
          width: 90%;
          max-width: 420px;
          max-height: 70vh;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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
          background: var(--border-color);
          color: var(--text);
        }

        .modal-body {
          padding: 1.5rem;
          max-height: 60vh;
          overflow-y: auto;
        }

        .filter-section {
          margin-bottom: 1.5rem;
        }

        .filter-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 0.75rem;
        }

        .search-input {
          position: relative;
        }

        .search-input svg {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .search-input input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
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
           display: flex;
           gap: 1rem;
         }

         .date-input {
           flex: 1;
         }

         .date-input label {
           display: block;
           font-size: 0.85rem;
           font-weight: 500;
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
           cursor: pointer;
         }

         .date-input select:focus {
           outline: none;
           border-color: var(--primary);
           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
         }

        .status-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--background);
          color: var(--text);
          font-size: 0.95rem;
          cursor: pointer;
        }

        .status-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .status-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
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
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-item:last-child {
          border-bottom: none;
        }

        .user-item:hover {
          background: var(--background);
        }

        .user-item.selected {
          background: var(--primary);
          color: white;
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
          gap: 0.25rem;
        }

        .user-details .user-name {
          font-weight: 500;
          color: inherit;
        }

        .user-details .user-referrals {
          font-size: 0.85rem;
          color: var(--text-secondary);
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
          .referral-detail-page {
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

          .back-button,
          .download-button,
          .filter-button {
            flex: 1;
            justify-content: center;
          }

          .page-title {
            font-size: 1.75rem;
          }

          .referrals-grid {
            grid-template-columns: 1fr;
          }

          .referral-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .referral-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .pagination {
            flex-direction: column;
            gap: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .user-profile {
            flex-direction: column;
            text-align: center;
          }

          .patient-info {
            flex-direction: column;
            text-align: center;
          }

          .status-badge {
            align-self: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ReferralReportDetail; 