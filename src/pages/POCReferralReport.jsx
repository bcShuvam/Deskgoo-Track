import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { FiDownload, FiArrowLeft, FiUsers, FiSearch, FiFilter } from 'react-icons/fi';
import { ThemeContext } from '../context/ThemeContext';

const POCReferralReport = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const initialPoc = location.state?.poc;
  const filterType = location.state?.filterType || 'POC'; // Get filterType from navigation state

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // Default to 'All'
  const [data, setData] = useState({ total: 0, currentPage: 1, totalPages: 0, data: [] });

  // Client-side filtered data
  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    
    let filtered = data.data;
    
    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(ref => ref.approvalStatus === statusFilter);
    }
    
    return filtered;
  }, [data.data, statusFilter]);

  useEffect(() => {
    document.title = 'POC Referral Report';
  }, []);

  const fetchReferrals = async (page = 1, keyword = '', status = 'All') => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const params = { 
        page, 
        limit: 20, 
        keyword: keyword.trim() || undefined 
      };
      
      // Add status filter if not 'All' - try different parameter names
      if (status !== 'All') {
        params.approvalStatus = status;
        params.status = status;
      }
      
      const res = await api.get(`/patient-referral/by-poc-or-amb/${id}`, { params });
      setData(res.data || { total: 0, currentPage: 1, totalPages: 0, data: [] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load referrals');
      setData({ total: 0, currentPage: 1, totalPages: 0, data: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals(1, search, 'All'); // Always fetch all data, filter client-side
  }, [id]);

  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const timeout = setTimeout(() => fetchReferrals(1, value, 'All'), 400);
    return () => clearTimeout(timeout);
  };

  const onStatusFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    // No need to fetch again, client-side filtering will handle it
  };

  const handleDownload = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') {
        params.set('status', statusFilter);
      }
      if (search.trim()) {
        params.set('keyword', search.trim());
      }
      
      const res = await api.get(`/patient-referral/csv/by-poc-or-amb/${id}?${params.toString()}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const pocName = (initialPoc?.pocName || initialPoc?.ambName || 'POC').toString().replace(/\s+/g, '_');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Referral_Report_${pocName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download CSV');
    }
  };

  // Function to display mobileTime as is
  const formatDate = (mobileTime) => {
    if (!mobileTime) return 'N/A';
    return mobileTime;
  };

  // Function to get POC/Amb display value based on filterType
  const getPocAmbDisplay = (ref) => {
    if (filterType === 'POC') {
      return ref.userId?.username || 'N/A';
    } else if (filterType === 'Area' || filterType === 'User') {
      const pocName = ref.pocId?.pocName;
      const ambName = ref.ambId?.pocName;
      if (pocName && ambName) {
        return `${pocName} / ${ambName}`;
      } else if (pocName) {
        return pocName;
      } else if (ambName) {
        return ambName;
      }
      return 'N/A';
    }
    return ref.pocId?.pocName || ref.ambId?.pocName || 'N/A';
  };

  // Function to get Referred By display value based on filterType
  const getReferredByDisplay = (ref) => {
    if (filterType === 'POC') {
      return initialPoc?.pocName || initialPoc?.ambName || 'N/A';
    }
    return ref.userId?.username || 'N/A';
  };

  return (
    <div className="poc-referral-page">
      <div className="header-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>
        <h2 className="title">POC Referral Report</h2>
        <button className="download-btn" onClick={handleDownload}>
          <FiDownload /> Download
        </button>
      </div>

      <div className="poc-summary">
        <div className="summary-item"><span className="label">POC:</span><span className="value">{initialPoc?.pocName || initialPoc?.ambName || 'N/A'}</span></div>
        <div className="summary-item"><span className="label">Visits:</span><span className="value">{initialPoc?.visitCounter ?? 0}</span></div>
        <div className="summary-item"><span className="label">Referrals:</span><span className="value">{initialPoc?.referralCounter ?? 0}</span></div>
        <div className="summary-item"><span className="label">Filter Type:</span><span className="value">{filterType}</span></div>
      </div>

      <div className="filters-section">
        <div className="search-wrap">
          <FiSearch className="search-icon" />
          <input className="search-input" placeholder="Search referrals..." value={search} onChange={onSearchChange} />
        </div>
        
        <div className="status-filter-wrap">
          <FiFilter className="filter-icon" />
          <select 
            className="status-filter-select" 
            value={statusFilter} 
            onChange={onStatusFilterChange}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert-error">{error}</div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>SN</th>
                <th>Date</th>
                <th>Patient Name</th>
                <th>Age/Gender</th>
                <th>Diagnosis</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Referred By</th>
                <th>{filterType === 'POC' ? 'Username' : 'POC/Amb'}</th>
                <th>Remarks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(!filteredData || filteredData.length === 0) ? (
                <tr>
                  <td colSpan={10} className="no-data">
                    <div className="no-data-content">
                      <FiUsers className="no-data-icon" />
                      <p>No referrals found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((ref, idx) => (
                  <tr key={ref._id || idx}>
                    <td>{idx + 1}</td>
                    <td>{ref.createdAtBS}</td>
                    <td>{ref.fullName || 'N/A'}</td>
                    <td>{[ref.age ? `${ref.age}` : 'N/A', ref.gender || 'N/A'].join(' / ')}</td>
                    <td>{ref.provisionalDiagnosis || 'N/A'}</td>
                    <td>{ref.number || ref.email || 'N/A'}</td>
                    <td>{[ref.country, ref.region, ref.city].filter(Boolean).join(', ') || 'N/A'}</td>
                    <td>{getReferredByDisplay(ref)}</td>
                    <td>{getPocAmbDisplay(ref)}</td>
                    <td>{ref.remarks || 'N/A'}</td>
                    <td>{ref.approvalStatus || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .poc-referral-page { 
          padding: 2rem; 
          background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#000000'};
          min-height: 100vh;
        }
        .header-bar { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          gap: 1rem; 
          margin-bottom: 1rem; 
        }
        .title { 
          margin: 0; 
          font-weight: 700; 
          color: ${theme === 'dark' ? '#ffffff' : '#000000'};
        }
        .back-btn, .download-btn { 
          display: flex; 
          align-items: center; 
          gap: .5rem; 
          padding: 0.5rem 1rem;
          border: 1px solid ${theme === 'dark' ? '#374151' : '#d1d5db'};
          border-radius: 8px;
          background-color: ${theme === 'dark' ? '#374151' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#000000'};
          cursor: pointer;
          transition: all 0.2s;
        }
        .back-btn:hover, .download-btn:hover {
          background-color: ${theme === 'dark' ? '#4b5563' : '#f3f4f6'};
        }
        .poc-summary { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); 
          gap: .75rem; 
          margin-bottom: 1rem; 
        }
        .summary-item { 
          display: flex; 
          justify-content: space-between; 
          padding: .75rem 1rem; 
          border: 1px solid ${theme === 'dark' ? '#374151' : '#e2e8f0'}; 
          border-radius: 8px; 
          background-color: ${theme === 'dark' ? '#374151' : '#ffffff'};
        }
        .label { 
          color: ${theme === 'dark' ? '#9ca3af' : '#64748b'}; 
          font-weight: 600; 
        }
        .value { 
          color: ${theme === 'dark' ? '#ffffff' : '#334155'}; 
          font-weight: 700; 
        }
        .filters-section { 
          display: flex; 
          gap: 1rem; 
          margin-bottom: 1rem; 
          align-items: center; 
          flex-wrap: wrap; 
        }
        .search-wrap { 
          position: relative; 
          max-width: 480px; 
          flex: 1; 
          min-width: 300px; 
        }
        .search-icon { 
          position: absolute; 
          left: 12px; 
          top: 50%; 
          transform: translateY(-50%); 
          color: ${theme === 'dark' ? '#9ca3af' : '#94a3b8'}; 
        }
        .search-input { 
          width: 100%; 
          padding: .75rem .75rem .75rem 2.5rem; 
          border: 1px solid ${theme === 'dark' ? '#374151' : '#e2e8f0'}; 
          border-radius: 8px; 
          background-color: ${theme === 'dark' ? '#374151' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#000000'};
        }
        .search-input::placeholder {
          color: ${theme === 'dark' ? '#9ca3af' : '#94a3b8'};
        }
        .status-filter-wrap { 
          position: relative; 
          display: flex; 
          align-items: center; 
          gap: 0.5rem; 
        }
        .filter-icon { 
          color: ${theme === 'dark' ? '#9ca3af' : '#94a3b8'}; 
        }
        .status-filter-select { 
          padding: .75rem 1rem; 
          border: 1px solid ${theme === 'dark' ? '#374151' : '#e2e8f0'}; 
          border-radius: 8px; 
          background-color: ${theme === 'dark' ? '#374151' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#000000'};
          min-width: 150px; 
          cursor: pointer;
        }
        .status-filter-select option {
          background-color: ${theme === 'dark' ? '#374151' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#000000'};
        }
        .alert-error { 
          margin: 1rem 0; 
          color: #b91c1c; 
          font-weight: 600; 
        }
        .table-wrap { 
          background: ${theme === 'dark' ? '#374151' : '#fff'}; 
          border: 1px solid ${theme === 'dark' ? '#4b5563' : '#e2e8f0'}; 
          border-radius: 12px; 
          overflow: hidden; 
        }
        .data-table { 
          width: 100%; 
          border-collapse: collapse; 
        }
        .data-table th { 
          background: ${theme === 'dark' ? '#4b5563' : '#f7fafc'}; 
          padding: 1rem; 
          text-align: left; 
          color: ${theme === 'dark' ? '#ffffff' : '#000000'};
          border-bottom: 1px solid ${theme === 'dark' ? '#6b7280' : '#e5e7eb'};
        }
        .data-table td { 
          padding: 1rem; 
          border-top: 1px solid ${theme === 'dark' ? '#4b5563' : '#f1f5f9'}; 
          color: ${theme === 'dark' ? '#ffffff' : '#000000'};
        }
        .data-table tr:hover {
          background-color: ${theme === 'dark' ? '#4b5563' : '#f9fafb'};
        }
        .no-data { 
          text-align: center; 
          padding: 2rem 1rem; 
        }
        .no-data-content { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: .5rem; 
          color: ${theme === 'dark' ? '#9ca3af' : '#94a3b8'}; 
        }
        .loading {
          text-align: center;
          padding: 2rem;
          color: ${theme === 'dark' ? '#ffffff' : '#000000'};
        }
      `}</style>
    </div>
  );
};

export default POCReferralReport;


