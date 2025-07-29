import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars, FaRing, FaFlag, FaBuilding, FaIdBadge, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import "../../App.css";
import "animate.css";

const UserCard = ({ user, index }) => {
  const { theme } = useContext(ThemeContext);

  const textColor = theme === "dark" ? "#f1f1f1" : "#222";
  const subTextColor = theme === "dark" ? "#b0b0b0" : "#666";
  const cardBg = theme === "dark" ? "#23272b" : "#fff";
  const borderColor = theme === "dark" ? "#333" : "#e0e0e0";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    // TODO: Implement edit functionality
    console.log("Edit user:", user._id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    // TODO: Implement delete functionality
    console.log("Delete user:", user._id);
  };

  const handleView = (e) => {
    e.stopPropagation();
    // TODO: Implement view functionality
    console.log("View user:", user._id);
  };

  return (
    <div 
      className="user-card-modern animate__animated animate__fadeInUp"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: 20,
        padding: 0,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header with Profile Image and Actions */}
      <div className="user-card-header" style={{ 
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, var(--primary) 0%, #2d3540 100%)' 
          : 'linear-gradient(135deg, var(--primary) 0%, #cbe2ff 100%)',
        padding: '1.5rem 1.5rem 1rem 1.5rem',
        position: 'relative'
      }}>
        <div className="d-flex justify-content-between align-items-start">
          <div className="user-profile-section">
            <div className="user-avatar-wrapper">
              <img
                src={user.profileImage || "/user-fallback.png"}
                alt={user.username}
                className="user-avatar"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: theme === 'dark' ? '4px solid #2d3540' : '4px solid #fff',
                  boxShadow: theme === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
                  background: theme === 'dark' ? '#444' : '#eee'
                }}
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.username);
                }}
              />
            </div>
            <div className="user-basic-info mt-3">
              <h5 className="user-name mb-1" style={{ color: theme === 'dark' ? '#fff' : '#111', fontWeight: 700, fontSize: '1.2rem', textAlign: 'center' }}>
                {user.username}
              </h5>
              <div className="user-role mb-2" style={{ color: theme === 'dark' ? '#fff' : '#111', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>
                {user.role?.role || 'N/A'}
              </div>
              <div className="user-department" style={{ color: theme === 'dark' ? '#fff' : '#111', fontSize: '0.85rem', textAlign: 'center', opacity: 0.8 }}>
                {user.department} • {user.designation}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="user-actions d-flex gap-1">
            <button
              className="btn btn-sm action-btn"
              onClick={handleView}
              title="View Details"
              style={{ 
                borderRadius: 8, 
                padding: '6px 8px',
                background: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
                border: 'none',
                color: theme === 'dark' ? '#fff' : '#111'
              }}
            >
              <FaEye size={12} />
            </button>
            <button
              className="btn btn-sm action-btn"
              onClick={handleEdit}
              title="Edit User"
              style={{ 
                borderRadius: 8, 
                padding: '6px 8px',
                background: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
                border: 'none',
                color: theme === 'dark' ? '#fff' : '#111'
              }}
            >
              <FaEdit size={12} />
            </button>
            <button
              className="btn btn-sm action-btn"
              onClick={handleDelete}
              title="Delete User"
              style={{ 
                borderRadius: 8, 
                padding: '6px 8px',
                background: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
                border: 'none',
                color: '#dc3545'
              }}
            >
              <FaTrash size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="user-card-content" style={{ padding: '1.5rem' }}>
        <div className="user-info-grid">
          {/* Contact Information */}
          <div className="info-section mb-3">
            <div className="info-item mb-2">
              <FaEnvelope size={14} style={{ color: subTextColor, marginRight: 8, width: 16 }} />
              <span style={{ color: textColor, fontSize: '0.85rem' }} className="text-truncate">{user.email}</span>
            </div>
            <div className="info-item mb-2">
              <FaPhone size={14} style={{ color: subTextColor, marginRight: 8, width: 16 }} />
              <span style={{ color: textColor, fontSize: '0.85rem' }}>{user.number}</span>
            </div>
            <div className="info-item">
              <FaMapMarkerAlt size={14} style={{ color: subTextColor, marginRight: 8, width: 16 }} />
              <span style={{ color: textColor, fontSize: '0.85rem' }} className="text-truncate">{user.address || 'N/A'}</span>
            </div>
          </div>

          {/* Personal Information */}
          <div className="info-section">
            <div className="info-item mb-2">
              <FaCalendarAlt size={14} style={{ color: subTextColor, marginRight: 8, width: 16 }} />
              <span style={{ color: textColor, fontSize: '0.85rem' }}>DOB: {formatDate(user.dob)}</span>
            </div>
            <div className="info-item mb-2">
              <FaVenusMars size={14} style={{ color: subTextColor, marginRight: 8, width: 16 }} />
              <span style={{ color: textColor, fontSize: '0.85rem' }}>{user.gender}</span>
            </div>
            <div className="info-item">
              <FaFlag size={14} style={{ color: subTextColor, marginRight: 8, width: 16 }} />
              <span style={{ color: textColor, fontSize: '0.85rem' }}>{user.nationality}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effects and Responsive Styles */}
      <style>{`
        .user-card-modern:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.15);
        }
        
        .user-card-modern:hover .user-avatar-wrapper::after {
          opacity: 1;
        }
        
        .user-card-modern:hover .user-avatar {
          transform: scale(1.05);
        }
        
        .user-avatar {
          transition: transform 0.3s ease;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          word-break: break-word;
        }
        
        .action-btn {
          transition: all 0.2s ease;
          opacity: 0.8;
        }
        
        .action-btn:hover {
          transform: scale(1.1);
          opacity: 1;
        }
        
        .user-avatar-wrapper {
          position: relative;
        }
        
        .user-avatar-wrapper::after {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: linear-gradient(45deg, var(--primary), #cbe2ff);
          border-radius: 50%;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .user-card-modern:hover .user-avatar-wrapper::after {
          opacity: 1;
        }
        
        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        @media (max-width: 768px) {
          .user-card-modern {
            margin-bottom: 1rem;
          }
          
          .user-avatar {
            width: 64px !important;
            height: 64px !important;
          }
          
          .user-name {
            font-size: 1.1rem !important;
          }
          
          .user-card-header {
            padding: 1rem !important;
          }
          
          .user-card-content {
            padding: 1rem !important;
          }
        }
        
        @media (max-width: 576px) {
          .user-actions {
            position: absolute;
            top: 1rem;
            right: 1rem;
          }
          
          .user-basic-info {
            margin-top: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UserCard;
