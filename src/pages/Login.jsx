import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AnimatedAlert from "../components/Layout/AnimatedAlert";
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, type: "", message: "" });
    try {
      const user = await login(email, password);
      if (!user?.role || user.role.roleValue !== 1011) {
        toast.error("Unauthorized User", { autoClose: 5000 });
        setLoading(false);
        return;
      }
      setAlert({ show: true, type: "success", message: "Login successful!" });
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setAlert({ show: true, type: "error", message: err.message || "Login failed" });
    }
    setLoading(false);
  };

  return (
    <div className="login-bg d-flex align-items-center justify-content-center min-vh-100">
      <form
        className="login-form p-4 rounded shadow animate__animated animate__fadeIn"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <h2 className="mb-4 text-center">Admin Login</h2>
        <div className="mb-3 input-group">
          <span className="input-group-text">
            <i className="fa fa-envelope"></i>
          </span>
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3 input-group">
          <span className="input-group-text">
            <i className="fa fa-lock"></i>
          </span>
          <input
            type={showPwd ? "text" : "password"}
            className="form-control"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="input-group-text cursor-pointer"
            onClick={() => setShowPwd((v) => !v)}
            style={{ cursor: "pointer" }}
          >
            <i className={showPwd ? "fa fa-eye-slash" : "fa fa-eye"}></i>
          </span>
        </div>
        <button
          className="btn btn-primary w-100 mt-2"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {alert.show && (
          <AnimatedAlert type={alert.type} message={alert.message} />
        )}
      </form>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default Login;
