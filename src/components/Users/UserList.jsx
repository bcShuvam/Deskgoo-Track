import React from "react";
import UserCard from "./UserCard";
import "../../App.css";
import "animate.css";

const UserList = ({ users }) => {
  return (
    <div className="row g-4 animate__animated animate__fadeIn">
      {users.map((user) => (
        <div className="col-12 col-md-6 col-lg-4" key={user._id}>
          <UserCard user={user} />
        </div>
      ))}
    </div>
  );
};

export default UserList;
