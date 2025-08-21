import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { FiDownload, FiArrowLeft, FiUsers, FiSearch } from 'react-icons/fi';

const POCReferralReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const initialPoc = location.state?.poc;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [data, setData] = useState({ total: 0, currentPage: 1, totalPages: 0, data: [] });

  useEffect(() => {
    document.title = 'POC Referral Report';
  }, []);

  const fetchReferrals = async (page = 1, keyword = '') => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/patient-referral/by-poc-or-amb/${id}`, { params: { page, limit: 20, keyword: keyword.trim() || undefined } });
      setData(res.data || { total: 0, currentPage: 1, totalPages: 0, data: [] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load referrals');
      setData({ total: 0, currentPage: 1, totalPages: 0, data: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals(1);
  }, [id]);

  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const timeout = setTimeout(() => fetchReferrals(1, value), 400);
    return () => clearTimeout(timeout);
  };

  const handleDownload = async () => {
    try {
      const res = await api.get(`/patient-referral/csv/by-poc-or-amb/${id}`, { responseType: 'blob' });
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
      </div>

      <div className="search-wrap">
        <FiSearch className="search-icon" />
        <input className="search-input" placeholder="Search referrals..." value={search} onChange={onSearchChange} />
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
                <th>Full Name</th>
                <th>Age/Gender</th>
                <th>Diagnosis</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Referred By</th>
                <th>POC/Amb</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(!data?.data || data.data.length === 0) ? (
                <tr>
                  <td colSpan={9} className="no-data">
                    <div className="no-data-content">
                      <FiUsers className="no-data-icon" />
                      <p>No referrals found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.data.map((ref, idx) => (
                  <tr key={ref._id || idx}>
                    <td>{idx + 1}</td>
                    <td>{ref.fullName || 'N/A'}</td>
                    <td>{[ref.age ? `${ref.age}` : 'N/A', ref.gender || 'N/A'].join(' / ')}</td>
                    <td>{ref.provisionalDiagnosis || 'N/A'}</td>
                    <td>{ref.number || ref.email || 'N/A'}</td>
                    <td>{[ref.country, ref.region, ref.city].filter(Boolean).join(', ') || 'N/A'}</td>
                    <td>{ref.userId?.username || 'N/A'}</td>
                    <td>{ref.pocId?.pocName || ref.ambId?.pocName || 'N/A'}</td>
                    <td>{ref.approvalStatus || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .poc-referral-page { padding: 2rem; }
        .header-bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
        .title { margin: 0; font-weight: 700; }
        .back-btn, .download-btn { display: flex; align-items: center; gap: .5rem; }
        .poc-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: .75rem; margin-bottom: 1rem; }
        .summary-item { display: flex; justify-content: space-between; padding: .75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; }
        .label { color: #64748b; font-weight: 600; }
        .value { color: #334155; font-weight: 700; }
        .search-wrap { position: relative; margin-bottom: 1rem; max-width: 480px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-input { width: 100%; padding: .75rem .75rem .75rem 2.5rem; border: 1px solid #e2e8f0; border-radius: 8px; }
        .alert-error { margin: 1rem 0; color: #b91c1c; font-weight: 600; }
        .table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { background: #f7fafc; padding: 1rem; text-align: left; }
        .data-table td { padding: 1rem; border-top: 1px solid #f1f5f9; }
        .no-data { text-align: center; padding: 2rem 1rem; }
        .no-data-content { display: flex; flex-direction: column; align-items: center; gap: .5rem; color: #94a3b8; }
      `}</style>
    </div>
  );
};

export default POCReferralReport;


