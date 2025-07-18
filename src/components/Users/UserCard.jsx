import React from "react";
import "../../App.css";
import "animate.css";

const UserCard = ({ user }) => {
  return (
    <div className="card shadow-sm user-card animate__animated animate__fadeInUp">
      <div className="card-body d-flex flex-column align-items-center">
        <img
          src={user.profileImage || "/user-fallback.png"}
          alt="Profile"
          className="rounded-circle mb-3"
          style={{ width: 72, height: 72, objectFit: "cover" }}
          onError={e => e.target.src = "/user-fallback.png"}
        />
        <h5 className="card-title mb-1">{user.username}</h5>
        <div className="mb-2 text-muted">{user.role?.role}</div>
        <div className="mb-2 small">{user.department} | {user.designation}</div>
        <div className="mb-2 small"><i className="fa fa-envelope me-1"></i> {user.email}</div>
        <div className="mb-2 small"><i className="fa fa-phone me-1"></i> {user.number}</div>
        <div className="mb-2 small"><i className="fa fa-map-marker-alt me-1"></i> {user.address}</div>
        <div className="mb-2 small"><i className="fa fa-birthday-cake me-1"></i> {user.dob}</div>
        <div className="mb-2 small"><i className="fa fa-venus-mars me-1"></i> {user.gender}</div>
        <div className="mb-2 small"><i className="fa fa-ring me-1"></i> {user.maritalStatus}</div>
        <div className="mb-2 small"><i className="fa fa-flag me-1"></i> {user.nationality}</div>
      </div>
    </div>
  );
};

export default UserCard;
