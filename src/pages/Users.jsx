import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import UserList from "../components/Users/UserList";
import UserCreateDialog from "../components/Users/UserCreateDialog";
import Loader from "../components/Common/Loader";
import AnimatedAlert from "../components/Layout/AnimatedAlert";
import { ThemeContext } from "../context/ThemeContext";
import { FaUserPlus, FaSearch, FaFilter, FaUsers, FaEye, FaEdit, FaTrash, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars, FaRing, FaFlag, FaBuilding, FaIdBadge } from "react-icons/fa";
import "../App.css";
import "animate.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const { theme } = useContext(ThemeContext);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users");
      setUsers(res.data.users);
      setFilteredUsers(res.data.users);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term and filters
  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = selectedRole === "all" || user.role?.role === selectedRole;
      const matchesDepartment = selectedDepartment === "all" || user.department === selectedDepartment;
      
      return matchesSearch && matchesRole && matchesDepartment;
    });
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, selectedDepartment]);

  const handleUserCreated = () => {
    setShowCreate(false);
    setSuccessMsg("User created successfully!");
    fetchUsers();
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Get unique roles and departments for filters
  const uniqueRoles = [...new Set(users.map(user => user.role?.role).filter(Boolean))];
  const uniqueDepartments = [...new Set(users.map(user => user.department).filter(Boolean))];

  const textColor = theme === "dark" ? "#f1f1f1" : "#222";
  const subTextColor = theme === "dark" ? "#b0b0b0" : "#666";
  const cardBg = theme === "dark" ? "#23272b" : "#fff";
  const borderColor = theme === "dark" ? "#333" : "#e0e0e0";

  return (
    <div className="users-page-container animate__animated animate__fadeIn" style={{ minHeight: "100vh", background: 'var(--background)', padding: '1.5rem' }}>
      {/* Header Section */}
      <div className="users-header-section mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="users-header-icon-wrapper">
              <FaUsers size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h1 className="users-page-title mb-1" style={{ color: textColor, fontSize: '2rem', fontWeight: 700, letterSpacing: 1 }}>
                Users Management
              </h1>
              <p className="users-page-subtitle mb-0" style={{ color: subTextColor, fontSize: '1rem' }}>
                Manage your team members and their information
              </p>
            </div>
          </div>
          <button 
            className="btn btn-primary create-user-btn"
            onClick={() => setShowCreate(true)}
            style={{ 
              borderRadius: 12, 
              padding: '12px 24px', 
              fontSize: '1rem', 
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(164,194,244,0.25)',
              transition: 'all 0.3s ease'
            }}
          >
            <FaUserPlus size={18} className="me-2" />
            Create User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="users-stats-section mb-4">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="stats-card" style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h3 className="stats-number mb-1" style={{ color: textColor, fontSize: '2rem', fontWeight: 700 }}>{users.length}</h3>
                  <p className="stats-label mb-0" style={{ color: subTextColor, fontSize: '0.9rem' }}>Total Users</p>
                </div>
                <div className="stats-icon-wrapper" style={{ background: 'var(--primary)', borderRadius: 12, padding: '12px', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaUsers size={20} style={{ color: '#111' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="stats-card" style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h3 className="stats-number mb-1" style={{ color: textColor, fontSize: '2rem', fontWeight: 700 }}>{uniqueRoles.length}</h3>
                  <p className="stats-label mb-0" style={{ color: subTextColor, fontSize: '0.9rem' }}>Different Roles</p>
                </div>
                <div className="stats-icon-wrapper" style={{ background: 'var(--primary)', borderRadius: 12, padding: '12px', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaIdBadge size={20} style={{ color: '#111' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="stats-card" style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h3 className="stats-number mb-1" style={{ color: textColor, fontSize: '2rem', fontWeight: 700 }}>{uniqueDepartments.length}</h3>
                  <p className="stats-label mb-0" style={{ color: subTextColor, fontSize: '0.9rem' }}>Departments</p>
                </div>
                <div className="stats-icon-wrapper" style={{ background: 'var(--primary)', borderRadius: 12, padding: '12px', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaBuilding size={20} style={{ color: '#111' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="users-controls-section mb-4">
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <div className="search-container position-relative">
              <FaSearch size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: subTextColor, zIndex: 2 }} />
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: 48,
                  borderRadius: 12,
                  border: `1.5px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  fontSize: '1rem',
                  height: 52
                }}
              />
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="d-flex gap-2 flex-wrap">
              <select
                className="form-select filter-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  borderRadius: 12,
                  border: `1.5px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  fontSize: '1rem',
                  height: 52,
                  minWidth: 140
                }}
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <select
                className="form-select filter-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                style={{
                  borderRadius: 12,
                  border: `1.5px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  fontSize: '1rem',
                  height: 52,
                  minWidth: 140
                }}
              >
                <option value="all">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <div className="view-mode-toggle d-flex" style={{ borderRadius: 12, border: `1.5px solid ${borderColor}`, background: cardBg, overflow: 'hidden' }}>
                <button
                  className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setViewMode('grid')}
                  style={{ borderRadius: 0, border: 'none', padding: '12px 16px' }}
                >
                  <FaUsers size={16} />
                </button>
                <button
                  className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setViewMode('list')}
                  style={{ borderRadius: 0, border: 'none', padding: '12px 16px' }}
                >
                  <FaEye size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary mb-3">
        <p className="mb-0" style={{ color: subTextColor, fontSize: '0.9rem' }}>
          Showing <strong style={{ color: textColor }}>{filteredUsers.length}</strong> of <strong style={{ color: textColor }}>{users.length}</strong> users
        </p>
      </div>

      {/* Loading and Error States */}
      {loading && <Loader />}
      {error && <AnimatedAlert type="error" message={error} />}
      {successMsg && <AnimatedAlert type="success" message={successMsg} />}

      {/* Users List */}
      {!loading && !error && (
        <UserList 
          users={filteredUsers} 
          viewMode={viewMode}
          onUserUpdated={fetchUsers}
        />
      )}

      {/* Create User Dialog */}
      {showCreate && (
        <UserCreateDialog
          show={showCreate}
          onClose={() => setShowCreate(false)}
          onUserCreated={handleUserCreated}
        />
      )}

      {/* Responsive Styles */}
      <style>{`
        .users-page-container {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .users-header-icon-wrapper {
          background: rgba(164,194,244,0.1);
          border-radius: 16;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .create-user-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(164,194,244,0.35) !important;
        }
        
        .stats-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .stats-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
        }
        
        .search-input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(164,194,244,0.1) !important;
        }
        
        .filter-select:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(164,194,244,0.1) !important;
        }
        
        .view-mode-toggle .btn {
          transition: all 0.2s ease;
        }
        
        .view-mode-toggle .btn:hover {
          background: var(--primary) !important;
          color: #111 !important;
        }
        
        @media (max-width: 768px) {
          .users-page-container {
            padding: 1rem;
          }
          
          .users-page-title {
            font-size: 1.5rem !important;
          }
          
          .stats-card {
            padding: 1rem !important;
          }
          
          .stats-number {
            font-size: 1.5rem !important;
          }
          
          .create-user-btn {
            width: 100%;
            margin-top: 1rem;
          }
        }
        
        @media (max-width: 576px) {
          .users-header-section {
            text-align: center;
          }
          
          .users-header-icon-wrapper {
            margin: 0 auto 1rem auto;
          }
          
          .filter-select {
            min-width: 120px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Users;
