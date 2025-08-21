import React, { useEffect, useMemo, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Loader from "../components/Common/Loader";
import AnimatedAlert from "../components/Layout/AnimatedAlert";
import { ThemeContext } from "../context/ThemeContext";
import { FiFilter, FiSearch, FiDownload, FiRefreshCw, FiUser, FiMapPin, FiUsers, FiEye, FiPhone, FiCreditCard, FiHome, FiTrendingUp, FiUserCheck, FiActivity } from "react-icons/fi";
import { debounce } from "lodash";

const FILTER_TYPES = [
  { value: "POC", label: "POC", icon: <FiUser /> },
  { value: "Area", label: "Area", icon: <FiMapPin /> },
  { value: "User", label: "User", icon: <FiUsers /> }
];
const COUNTRIES = ["Nepal", "India"];

// Enhanced SearchableSelect with profile images
const SearchableSelect = ({ label, value, onChange, options, placeholder = "Search...", disabled = false, showImages = false }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return options.filter(opt => opt.label.toLowerCase().includes(lower));
  }, [options, query]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="searchable-select-container">
      <label className="form-label fw-semibold mb-2">{label}</label>
      <div className="position-relative">
        <div 
          className="form-control d-flex align-items-center justify-content-between cursor-pointer"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          {selectedOption ? (
            <div className="d-flex align-items-center gap-2">
              {showImages && selectedOption.image && (
                <img 
                  src={selectedOption.image} 
                  alt={selectedOption.label}
                  className="rounded-circle"
                  style={{ width: 24, height: 24, objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedOption.label)}&size=24`;
                  }}
                />
              )}
              <span>{selectedOption.label}</span>
            </div>
          ) : (
            <span className="text-muted">{placeholder}</span>
          )}
          <span className="text-muted">{isOpen ? '▲' : '▼'}</span>
        </div>
        
        {isOpen && !disabled && (
          <div className="searchable-select-dropdown">
            <div className="search-input-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="options-list">
              {filtered.length === 0 ? (
                <div className="no-results">No results found</div>
              ) : (
                filtered.map(opt => (
                  <div
                    key={opt.value}
                    className={`option-item ${value === opt.value ? 'selected' : ''}`}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setQuery("");
                    }}
                  >
                    {showImages && opt.image && (
                      <img 
                        src={opt.image} 
                        alt={opt.label}
                        className="rounded-circle me-2"
                        style={{ width: 24, height: 24, objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(opt.label)}&size=24`;
                        }}
                      />
                    )}
                    <span>{opt.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom Pagination Component with customizable page size
const Pagination = ({ currentPage, totalPages, onPageChange, totalCount, pageSize, onPageSizeChange }) => {
  const [customPageSize, setCustomPageSize] = useState(pageSize);
  
  const handleCustomPageSize = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 1000) {
      setCustomPageSize(value);
      onPageSizeChange(value);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries</span>
      </div>
      
      <div className="pagination-controls">
        <div className="page-size-control">
          <label className="form-label mb-1">Page Size:</label>
          <input
            type="number"
            className="form-control form-control-sm"
            value={customPageSize}
            onChange={handleCustomPageSize}
            min="1"
            max="1000"
            style={{ width: 80 }}
          />
        </div>
        
        <div className="page-navigation">
          <button
            className="btn btn-outline-primary btn-sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </button>
          
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              className={`btn btn-sm ${page === currentPage ? 'btn-primary' : page === '...' ? 'btn-outline-secondary disabled' : 'btn-outline-primary'}`}
              disabled={page === '...'}
              onClick={() => page !== '...' && onPageChange(page)}
            >
              {page}
            </button>
          ))}
          
          <button
            className="btn btn-outline-primary btn-sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const POCReport = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("POC");
  
  // Function to handle filter type change and clear search
  const handleFilterTypeChange = (newFilterType) => {
    setFilterType(newFilterType);
    setPocSearch(""); // Clear search when filter type changes
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [country, setCountry] = useState("Nepal");
  const [regionsData, setRegionsData] = useState([]);
  const [region, setRegion] = useState(null);
  const [city, setCity] = useState(null);
  const [regionEnabled, setRegionEnabled] = useState(false);
  const [cityEnabled, setCityEnabled] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [report, setReport] = useState({ totalCount: 0, currentPage: 1, totalPages: 0, data: [] });
  const [pocSearch, setPocSearch] = useState("");
  

  // Debounced search function for real-time API calls
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      // Search works for all filter types
      fetchReport(1, searchTerm);
    }, 500),
    [filterType]
  );

  // Handle search input change with real-time API calls
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setPocSearch(value);
    debouncedSearch(value);
  };

  // Load users for User filterType
  useEffect(() => {
    if (filterType === 'User') {
      const loadUsers = async () => {
        try {
          const res = await api.get('/users');
          const list = (res.data?.users || []).map(u => ({ 
            value: u._id, 
            label: u.username, 
            image: u.profileImage 
          }));
          setUsers(list);
        } catch {
          setUsers([]);
        }
      };
      loadUsers();
    }
  }, [filterType]);

  // Load regions data
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const file = country === "Nepal" ? "/district.json" : "/states.json";
        const res = await fetch(file);
        const data = await res.json();
        setRegionsData(data);
        setRegion(null);
        setCity(null);
      } catch {
        setRegionsData([]);
      }
    };
    loadRegions();
  }, [country, filterType]);

  const regionOptions = useMemo(() => 
    regionsData.map(r => ({ value: r.region, label: r.region })), 
    [regionsData]
  );
  
  const cityOptions = useMemo(() => {
    const found = regionsData.find(r => r.region === region);
    return found ? found.cities.map(c => ({ value: c, label: c })) : [];
  }, [regionsData, region]);

  const userOptions = useMemo(() => 
    users.map(u => ({ value: u.value, label: u.label, image: u.image })), 
    [users]
  );

  const fetchReport = async (targetPage = page, searchKeyword = pocSearch) => {
    const params = buildQueryParams(targetPage, searchKeyword);
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/poc-report?${params.toString()}`);
      setReport(res.data);
      setPage(targetPage);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch POC report");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (row) => {
    const candidateId = row?.pocId || row?._id || row?.ambId;
    const idParam = typeof candidateId === 'object' && candidateId?._id ? candidateId._id : candidateId;
    if (!idParam) return;
    navigate(`/poc-referral-report/${idParam}`, { state: { poc: row } });
  };

  

  const buildQueryParams = (targetPage = page, searchKeyword = pocSearch) => {
    const params = new URLSearchParams();
    params.set('filterType', filterType);
    params.set('page', String(targetPage));
    params.set('limit', String(limit));
    
    // Add keyword parameter for all filter types
    if (searchKeyword.trim()) {
      params.set('keyword', searchKeyword.trim());
    }
    
    if (filterType === 'Area') {
      params.set('country', country);
      if (regionEnabled && region) params.set('region', region);
      if (cityEnabled && city) params.set('city', city);
    }
    
    if (filterType === 'User' && selectedUserId) {
      params.set('createdById', selectedUserId);
    }
    
    return params;
  };

  const handleDownload = async () => {
    try {
      const params = buildQueryParams(page, pocSearch);
      const res = await api.get(`/poc-report/csv?${params.toString()}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      
      // Build dynamic filename
      let filename = 'POC-Report';
      if (filterType === 'POC') {
        filename += `-${filterType}`;
      } else if (filterType === 'Area') {
        filename += `-${country}`;
        if (regionEnabled && region) filename += `-${region}`;
        if (cityEnabled && city) filename += `-${city}`;
      } else if (filterType === 'User' && selectedUserId) {
        const user = users.find(u => u.value === selectedUserId);
        filename += `-${user?.label || 'User'}`;
      }
      // Add search keyword to filename for all filter types
      if (pocSearch.trim()) filename += `-${pocSearch.trim()}`;
      filename = filename.replace(/\s+/g, '_');
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download CSV");
    }
  };

  useEffect(() => {
    fetchReport(1);
  }, [filterType, country, region, city, regionEnabled, cityEnabled, selectedUserId, limit]);

  

  return (
    <div className="poc-report-container">
      {/* Top Actions */}
      <div className="d-flex justify-content-between align-items-center p-3 mb-3">
        <h2 className="mb-0"></h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={() => fetchReport(1)}>
            <FiRefreshCw /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <FiDownload /> Download CSV
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <FiFilter className="filter-icon" />
          <span>Filter Options</span>
        </div>
        
        <div className="filter-content">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Filter Type</label>
              <div className="filter-type-buttons">
                {FILTER_TYPES.map(ft => (
                  <button
                    key={ft.value}
                    className={`filter-type-btn ${filterType === ft.value ? 'active' : ''}`}
                    onClick={() => handleFilterTypeChange(ft.value)}
                  >
                    {ft.icon} {ft.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Search</label>
              <div className="search-container">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={
                    filterType === 'POC' ? "Search by name, number, category, specialization..." :
                    filterType === 'Area' ? "Search by country, region, city..." :
                    "Search by user..."
                  }
                  value={pocSearch}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {filterType === 'Area' && (
              <>
                <div className="col-12 col-md-3">
                  <label className="filter-label">Country</label>
                  <select 
                    className="form-select" 
                    value={country} 
                    onChange={e => setCountry(e.target.value)}
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div className="col-12 col-md-3">
                  <div className="filter-toggle">
                    <label className="filter-label">Region</label>
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={regionEnabled} 
                        onChange={e => setRegionEnabled(e.target.checked)} 
                      />
                    </div>
                  </div>
                  <select 
                    className="form-select" 
                    value={region ?? ""} 
                    onChange={e => setRegion(e.target.value || null)} 
                    disabled={!regionEnabled}
                  >
                    <option value="">Select Region...</option>
                    {regionOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-12 col-md-3">
                  <div className="filter-toggle">
                    <label className="filter-label">City</label>
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={cityEnabled} 
                        onChange={e => setCityEnabled(e.target.checked)} 
                      />
                    </div>
                  </div>
                  <select 
                    className="form-select" 
                    value={city ?? ""} 
                    onChange={e => setCity(e.target.value || null)} 
                    disabled={!cityEnabled || !region}
                  >
                    <option value="">Select City...</option>
                    {cityOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {filterType === 'User' && (
              <div className="filter-group">
                <SearchableSelect
                  label="Select User"
                  value={selectedUserId}
                  onChange={setSelectedUserId}
                  options={userOptions}
                  placeholder="Search and select user..."
                  showImages={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-container">
          <AnimatedAlert type="error" message={error} />
        </div>
      )}

      {/* Loading State */}
      {loading && <Loader />}

      {/* Report Content */}
      {!loading && !error && (
        <div className="report-content">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">
                <FiUsers />
              </div>
              <div className="card-content">
                <h3>{report.totalCount}</h3>
                <p>Total POCs</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">
                <FiEye />
              </div>
              <div className="card-content">
                <h3>{report.data.reduce((sum, item) => sum + (item.visitCounter || 0), 0)}</h3>
                <p>Total Visits</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">
                <FiUserCheck />
              </div>
              <div className="card-content">
                <h3>{report.data.reduce((sum, item) => sum + (item.referralCounter || 0), 0)}</h3>
                <p>Total Referrals</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">
                <FiTrendingUp />
              </div>
              <div className="card-content">
                <h3>{report.data.length}</h3>
                <p>Current Page</p>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="data-table-container">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SN</th>
                    <th>POC Details</th>
                    <th>Contact Info</th>
                    <th>Professional Info</th>
                    <th>Address</th>
                    <th>Performance</th>
                    <th>Username</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="no-data">
                        <div className="no-data-content">
                          <FiUsers className="no-data-icon" />
                          <p>No POC records found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    report.data.map((row, idx) => (
                      <tr key={idx} className="data-row clickable-row" onClick={() => handleRowClick(row)}>
                        <td className="serial-number">
                          <span className="sn-badge">{(page - 1) * limit + idx + 1}</span>
                        </td>
                        <td className="poc-details">
                          <div className="poc-info">
                            <div className="poc-avatar">
                              <img 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(row.pocName || 'POC')}&size=40&background=random`}
                                alt={row.pocName}
                                className="avatar-img"
                              />
                            </div>
                            <div className="poc-text">
                              <h6 className="poc-name">{row.pocName || 'N/A'}</h6>
                              <p className="poc-age-gender">
                                {row.age ? `${row.age} years` : 'N/A'} • {row.gender || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="contact-info">
                          <div className="contact-item">
                            <FiPhone className="contact-icon" />
                            <span>{row.number || 'N/A'}</span>
                          </div>
                          {/* <div className="contact-item">
                            <FiCreditCard className="contact-icon" />
                            <span>{row.ambNumber || 'N/A'}</span>
                          </div> */}
                        </td>
                        <td className="professional-info">
                          <div className="prof-item">
                            <FiActivity className="prof-icon" />
                            <span>{row.category || 'N/A'}</span>
                          </div>
                          <div className="prof-item">
                            <FiUser className="prof-icon" />
                            <span>{row.specialization || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="location-info">
                          <div className="location-item">
                            <FiHome className="location-icon" />
                            <span>{row.address || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="performance-info">
                          <div className="performance-stats">
                            <div className="stat-item">
                              <span className="stat-label">Visits</span>
                              <span className="stat-value visits">{row.visitCounter || 0}</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Referrals</span>
                              <span className="stat-value referrals">{row.referralCounter || 0}</span>
                            </div>
                          </div>
                          {/* <div className={`performance-badge ${getStatusColor(row.visitCounter || 0, row.referralCounter || 0)}`}>
                            {row.visitCounter >= 10 && row.referralCounter >= 5 ? 'High Performer' :
                             row.visitCounter >= 5 && row.referralCounter >= 2 ? 'Active' : 'New'}
                          </div> */}
                        </td>
                        <td className="username-cell">
                          <div className="username-info">
                            <span className="username-text">{row.username || 'N/A'}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={report.currentPage}
            totalPages={report.totalPages}
            onPageChange={fetchReport}
            totalCount={report.totalCount}
            pageSize={limit}
            onPageSizeChange={setLimit}
          />
        </div>
      )}

      
      
      <style>{`
        .poc-report-container {
          min-height: 100vh;
          background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }



        .filter-section {
          background: ${theme === 'dark' ? '#2d3748' : '#ffffff'};
          border-radius: 12px;
          margin: 0 2rem 1.5rem 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        //   overflow: hidden;
        }

        .filter-header {
          background: ${theme === 'dark' ? '#4a5568' : '#f7fafc'};
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          border-bottom: 1px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'};
        }

        .filter-icon {
          color: #4299e1;
        }

        .filter-content {
          padding: 1.5rem;
        }

        .filter-row {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .filter-row:last-child {
          margin-bottom: 0;
        }

        .filter-group {
          flex: 1;
          min-width: 200px;
        }

        .filter-label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: ${theme === 'dark' ? '#e2e8f0' : '#4a5568'};
        }

        .filter-type-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-type-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'};
          background: ${theme === 'dark' ? '#2d3748' : '#ffffff'};
          color: ${theme === 'dark' ? '#e2e8f0' : '#4a5568'};
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .filter-type-btn:hover {
          background: ${theme === 'dark' ? '#4a5568' : '#f7fafc'};
        }

        .filter-type-btn.active {
          background: #4299e1;
          color: white;
          border-color: #4299e1;
        }

        .search-container {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'};
          border-radius: 8px;
          background: ${theme === 'dark' ? '#2d3748' : '#ffffff'};
          color: ${theme === 'dark' ? '#e2e8f0' : '#4a5568'};
          font-size: 0.875rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        .filter-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .form-check-input:checked {
          background-color: #4299e1;
          border-color: #4299e1;
        }

        .searchable-select-container {
          position: relative;
        }

        .searchable-select-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: ${theme === 'dark' ? '#2d3748' : '#ffffff'};
          border: 1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'};
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          max-height: 300px;
          overflow: hidden;
        }

        .search-input-container {
          position: relative;
          padding: 0.75rem;
          border-bottom: 1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'};
        }

        .search-input-container .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
        }

        .search-input-container input {
          padding-left: 2rem;
          border: none;
          background: transparent;
          width: 100%;
          color: ${theme === 'dark' ? '#e2e8f0' : '#4a5568'};
        }

        .search-input-container input:focus {
          outline: none;
        }

        .options-list {
          max-height: 250px;
        padding-bottom: 16px;
          overflow-y: auto;
        }

        .option-item {
          padding: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.2s;
        }

        .option-item:hover {
          background: ${theme === 'dark' ? '#4a5568' : '#f7fafc'};
        }

        .option-item.selected {
          background: #4299e1;
          color: white;
        }

        .no-results {
          padding: 0.75rem;
          text-align: center;
          color: #a0aec0;
          font-style: italic;
        }

        .error-container {
          margin: 0 2rem 1.5rem 2rem;
        }

        .report-content {
          margin: 0 2rem 2rem 2rem;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: ${theme === 'dark' ? '#2d3748' : '#ffffff'};
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }

        .summary-card:hover {
          transform: translateY(-2px);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4299e1, #3182ce);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
        }

        .card-content h3 {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: ${theme === 'dark' ? '#ffffff' : '#2d3748'};
        }

        .card-content p {
          margin: 0;
          color: ${theme === 'dark' ? '#a0aec0' : '#718096'};
          font-size: 0.875rem;
        }

        .data-table-container {
          background: ${theme === 'dark' ? '#2d3748' : '#ffffff'};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: ${theme === 'dark' ? '#4a5568' : '#f7fafc'};
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: ${theme === 'dark' ? '#e2e8f0' : '#4a5568'};
          border-bottom: 1px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'};
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid ${theme === 'dark' ? '#4a5568' : '#f7fafc'};
          vertical-align: middle;
        }

        .data-row:hover {
          background: ${theme === 'dark' ? '#4a5568' : '#f7fafc'};
        }
        .clickable-row { cursor: pointer; }

        

        .serial-number {
          width: 60px;
        }

        .sn-badge {
          display: inline-block;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #4299e1;
          color: white;
          text-align: center;
          line-height: 32px;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .poc-details {
          width: 200px;
        }

        .poc-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .poc-avatar {
          flex-shrink: 0;
        }

        .avatar-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .poc-name {
          margin: 0;
          font-weight: 600;
          color: ${theme === 'dark' ? '#ffffff' : '#2d3748'};
          font-size: 0.875rem;
        }

        .poc-age-gender {
          margin: 0;
          color: ${theme === 'dark' ? '#a0aec0' : '#718096'};
          font-size: 0.75rem;
        }

        .contact-info, .professional-info, .location-info {
          width: 150px;
        }

        .contact-item, .prof-item, .location-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }

        .contact-item:last-child, .prof-item:last-child, .location-item:last-child {
          margin-bottom: 0;
        }

        .contact-icon, .prof-icon, .location-icon {
          color: #4299e1;
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        .performance-info {
          width: 180px;
        }

        .performance-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-label {
          font-size: 0.75rem;
          color: ${theme === 'dark' ? '#a0aec0' : '#718096'};
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .stat-value.visits {
          color: #38a169;
        }

        .stat-value.referrals {
          color: #d69e2e;
        }

        .performance-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-align: center;
        }

        .performance-badge.success {
          background: #c6f6d5;
          color: #22543d;
        }

        .performance-badge.warning {
          background: #fef5e7;
          color: #744210;
        }

        .performance-badge.secondary {
          background: #e2e8f0;
          color: #4a5568;
        }

        .username-cell {
          width: 120px;
        }

        .username-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .username-text {
          font-weight: 500;
          color: ${theme === 'dark' ? '#e2e8f0' : '#4a5568'};
        }

        .no-data {
          text-align: center;
          padding: 3rem 1rem;
        }

        .no-data-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .no-data-icon {
          font-size: 3rem;
          color: #a0aec0;
        }

        .no-data-content p {
          margin: 0;
          color: #a0aec0;
          font-size: 1rem;
        }

        .pagination-container {
          background: ${theme === 'dark' ? '#2d3748' : '#ffffff'};
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .pagination-info {
          color: ${theme === 'dark' ? '#a0aec0' : '#718096'};
          font-size: 0.875rem;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .page-size-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .page-size-control label {
          margin: 0;
          font-size: 0.875rem;
          color: ${theme === 'dark' ? '#e2e8f0' : '#4a5568'};
        }

        .page-navigation {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .page-navigation .btn {
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .filter-row {
            flex-direction: column;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .pagination-container {
            flex-direction: column;
            text-align: center;
          }

          .pagination-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .data-table {
            font-size: 0.75rem;
          }

          .data-table th,
          .data-table td {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default POCReport;