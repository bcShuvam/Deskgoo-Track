import React, { useEffect, useState } from "react";
import api from "../api";
import UserList from "../components/Users/UserList";
import UserCreateDialog from "../components/Users/UserCreateDialog";
import Loader from "../components/Common/Loader";
import AnimatedAlert from "../components/Layout/AnimatedAlert";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users");
      setUsers(res.data.users);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserCreated = () => {
    setShowCreate(false);
    setSuccessMsg("User created successfully!");
    fetchUsers();
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  return (
    <div className="users-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Users</h2>
        <button className="btn btn-success" onClick={() => setShowCreate(true)}>
          <i className="fa fa-user-plus me-2"></i> Create User
        </button>
      </div>
      {loading && <Loader />}
      {error && <AnimatedAlert type="error" message={error} />}
      {successMsg && <AnimatedAlert type="success" message={successMsg} />}
      {!loading && !error && <UserList users={users} />}
      {showCreate && (
        <UserCreateDialog
          show={showCreate}
          onClose={() => setShowCreate(false)}
          onUserCreated={handleUserCreated}
        />
      )}
    </div>
  );
};

export default Users;
