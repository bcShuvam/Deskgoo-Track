import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AnimatedAlert from "../components/Layout/AnimatedAlert";
import { FaUserCircle, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log(email);
    console.log(password);
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, type: "", message: "" });
    try {
      await login(email, password);
      setAlert({ show: true, type: "success", message: "Login successful!" });
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setAlert({ show: true, type: "error", message: err.message || "Login failed" });
    }
    setLoading(false);
  };

  return (
    <div className="login-bg d-flex align-items-center justify-content-center min-vh-100" style={{ background: "linear-gradient(135deg, #a4c2f4 0%, #f8fafc 100%)" }}>
      <form
        className="login-form p-4 rounded-4 animate__animated animate__fadeIn"
        onSubmit={handleSubmit}
        autoComplete="off"
        style={{
          background: "#fff",
          minWidth: 340,
          maxWidth: 380,
          width: "100%",
          boxShadow: "0 8px 32px rgba(44,62,80,0.10)",
          border: "1.5px solid #e0e0e0",
          borderRadius: 18,
        }}
      >
        <div className="d-flex flex-column align-items-center mb-4">
          <FaUserCircle size={56} style={{ color: "#a4c2f4", marginBottom: 8 }} />
          <h2 className="mb-0 fw-bold" style={{ color: "#222", letterSpacing: 1 }}>Admin Login</h2>
        </div>
        <div className="mb-3">
          <label htmlFor="login-email" className="form-label fw-semibold" style={{ color: "#555" }}>Email</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0"><FaEnvelope /></span>
            <input
              id="login-email"
              type="email"
              className="form-control border-start-0"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ fontSize: 16, background: "#f8fafc" }}
            />
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="login-password" className="form-label fw-semibold" style={{ color: "#555" }}>Password</label>
          <div className="input-group-modern">
            <span className="input-icon"><FaLock /></span>
            <input
              id="login-password"
              type={showPwd ? "text" : "password"}
              className="form-control-modern"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <button
          className="btn btn-primary w-100 mt-2 login-btn-animate"
          type="submit"
          disabled={loading}
          style={{ fontWeight: 600, fontSize: 17, letterSpacing: 1, borderRadius: 10, boxShadow: "0 2px 8px rgba(164,194,244,0.10)" }}
        >
          {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : null}
          {loading ? "Logging in..." : "Login"}
        </button>
        {alert.show && (
          <AnimatedAlert type={alert.type} message={alert.message} />
        )}
      </form>
      <style>{`
        .login-form:focus-within {
          box-shadow: 0 0 0 3px #a4c2f433;
        }
        .login-btn-animate:active {
          transform: scale(0.98);
        }
        
        .input-group-modern {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          z-index: 2;
        }

        .form-control-modern {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: #f8fafc;
          color: #222;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .form-control-modern:focus {
          outline: none;
          border-color: #a4c2f4;
          box-shadow: 0 0 0 3px rgba(164,194,244,0.1);
          background: #fff;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .password-toggle:hover {
          color: #222;
          background: rgba(0,0,0,0.1);
        }
        
        @media (max-width: 500px) {
          .login-form {
            min-width: 90vw !important;
            max-width: 98vw !important;
            padding: 1.2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
