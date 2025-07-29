import React from "react";
import UserCard from "./UserCard";
import UserListItem from "./UserListItem";
import "../../App.css";
import "animate.css";

const UserList = ({ users, viewMode = "grid", onUserUpdated }) => {
  if (users.length === 0) {
    return (
      <div className="no-users-container text-center py-5">
        <div className="no-users-icon mb-3">
          <i className="fas fa-users" style={{ fontSize: '4rem', color: '#ccc' }}></i>
        </div>
        <h4 className="text-muted mb-2">No users found</h4>
        <p className="text-muted">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="users-list-container animate__animated animate__fadeIn">
        <div className="users-list-wrapper">
          {users.map((user, index) => (
            <UserListItem 
              key={user._id} 
              user={user} 
              index={index}
              onUserUpdated={onUserUpdated}
            />
          ))}
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="users-grid-container animate__animated animate__fadeIn">
      <div className="row g-4">
        {users.map((user, index) => (
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={user._id}>
            <UserCard 
              user={user} 
              index={index}
              onUserUpdated={onUserUpdated}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
