import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars, FaRing, FaFlag, FaBuilding, FaIdBadge, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import "../../App.css";
import "animate.css";

const UserListItem = ({ user, index }) => {
  const { theme } = useContext(ThemeContext);

  const textColor = theme === "dark" ? "#f1f1f1" : "#222";
  const subTextColor = theme === "dark" ? "#b0b0b0" : "#666";
  const cardBg = theme === "dark" ? "#23272b" : "#fff";
  const borderColor = theme === "dark" ? "#333" : "#e0e0e0";
  const hoverBg = theme === "dark" ? "#2d3540" : "#f8f9fa";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit user:", user._id);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete user:", user._id);
  };

  const handleView = () => {
    // TODO: Implement view functionality
    console.log("View user:", user._id);
  };

  return (
    <div 
      className="user-list-item animate__animated animate__fadeInUp"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: '1.5rem',
        marginBottom: '1rem',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative'
      }}

    >
      <div className="row align-items-center">
        {/* Profile Image and Basic Info */}
        <div className="col-12 col-md-3">
          <div className="d-flex align-items-center gap-3">
            <div className="user-avatar-wrapper">
              <img
                src={user.profileImage || "/user-fallback.png"}
                alt={user.username}
                className="user-avatar"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--primary)',
                  background: theme === 'dark' ? '#444' : '#eee'
                }}
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.username);
                }}
              />
            </div>
            <div className="user-basic-info">
              <h5 className="user-name mb-1" style={{ color: textColor, fontWeight: 600, fontSize: '1.1rem' }}>
                {user.username}
              </h5>
              <div className="user-role mb-1" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 500 }}>
                {user.role?.role || 'N/A'}
              </div>
              <div className="user-department" style={{ color: subTextColor, fontSize: '0.85rem' }}>
                {user.department} • {user.designation}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="col-12 col-md-4">
          <div className="user-contact-info">
            <div className="contact-item mb-2">
              <FaEnvelope size={14} style={{ color: subTextColor, marginRight: 8, width: 16 }} />
              <span style={{ color: textColor, fontSize: '0.9rem' }}>{user.email}</span>
            </div>
            <div className="contact-item mb-2">
              <FaPhone size={14} style={{ color: subTextColor, marginRight: 8, width: 16 }} />
              <span style={{ color: textColor, fontSize: '0.9rem' }}>{user.number}</span>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt size={14} style={{ color: subTextColor, marginRight: 8, width: 16 }} />
              <span style={{ color: textColor, fontSize: '0.9rem' }}>{user.address || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="col-12 col-md-3">
          <div className="user-personal-info">
            <div className="info-item mb-2">
              <FaCalendarAlt size={14} style={{ color: subTextColor, marginRight: 8, width: 16 }} />
              <span style={{ color: textColor, fontSize: '0.9rem' }}>DOB: {formatDate(user.dob)}</span>
            </div>
            <div className="info-item mb-2">
              <FaVenusMars size={14} style={{ color: subTextColor, marginRight: 8, width: 16 }} />
              <span style={{ color: textColor, fontSize: '0.9rem' }}>{user.gender}</span>
            </div>
            <div className="info-item">
              <FaFlag size={14} style={{ color: subTextColor, marginRight: 8, width: 16 }} />
              <span style={{ color: textColor, fontSize: '0.9rem' }}>{user.nationality}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="col-12 col-md-2">
          <div className="user-actions d-flex justify-content-end gap-2">
            <button
              className="btn btn-sm btn-outline-primary action-btn"
              onClick={handleView}
              title="View Details"
              style={{ borderRadius: 8, padding: '8px 12px' }}
            >
              <FaEye size={14} />
            </button>
            <button
              className="btn btn-sm btn-outline-secondary action-btn"
              onClick={handleEdit}
              title="Edit User"
              style={{ borderRadius: 8, padding: '8px 12px' }}
            >
              <FaEdit size={14} />
            </button>
            <button
              className="btn btn-sm btn-outline-danger action-btn"
              onClick={handleDelete}
              title="Delete User"
              style={{ borderRadius: 8, padding: '8px 12px' }}
            >
              <FaTrash size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Hover Effects */}
      <style>{`
        .user-list-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          background: ${hoverBg} !important;
        }
        
        .contact-item, .info-item {
          display: flex;
          align-items: center;
        }
        
        .action-btn {
          transition: all 0.2s ease;
        }
        
        .action-btn:hover {
          transform: scale(1.1);
        }
        
        .user-avatar-wrapper {
          position: relative;
        }
        
        .user-avatar-wrapper::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, var(--primary), #cbe2ff);
          border-radius: 50%;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .user-list-item:hover .user-avatar-wrapper::after {
          opacity: 1;
        }
        
        @media (max-width: 768px) {
          .user-list-item {
            padding: 1rem;
          }
          
          .user-avatar {
            width: 48px !important;
            height: 48px !important;
          }
          
          .user-name {
            font-size: 1rem !important;
          }
          
          .user-actions {
            margin-top: 1rem;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UserListItem; 