import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AnimatedAlert from "../components/Layout/AnimatedAlert";
import { FaUserCircle, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaRocket } from "react-icons/fa";
import { MdLocationOn, MdAccessTime } from "react-icons/md";
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
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const navigate = useNavigate();

  // Animated background particles
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'floating-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
      particle.style.animationDelay = Math.random() * 2 + 's';
      document.querySelector('.login-container').appendChild(particle);
      
      setTimeout(() => {
        particle.remove();
      }, 5000);
    };

    const interval = setInterval(createParticle, 300);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
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
    <div className="login-container">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="mesh-gradient"></div>
      </div>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="floating-card card-1">
          <MdLocationOn size={24} />
          <span>Live Tracking</span>
        </div>
        <div className="floating-card card-2">
          <MdAccessTime size={24} />
          <span>Real-time Data</span>
        </div>
        <div className="floating-card card-3">
          <FaShieldAlt size={24} />
          <span>Secure Access</span>
        </div>
      </div>

      {/* Main Login Form */}
      <div className="login-content">
        <div className="login-card">
          {/* Header Section */}
                     <div className="login-header">
             <div className="logo-container">
               <div className="logo-icon">
                 <img src="/deskgoo.png" alt="Deskgoo Track Logo" />
               </div>
               <h1 className="brand-title">Deskgoo Track</h1>
               <p className="brand-subtitle">Admin Portal</p>
             </div>
           </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
            <div className="form-group">
              <div className={`input-container ${isFocused.email ? 'focused' : ''}`}>
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused({ ...isFocused, email: true })}
                  onBlur={() => setIsFocused({ ...isFocused, email: false })}
                  required
                  className="form-input"
                />
                <div className="input-line"></div>
              </div>
            </div>

            <div className="form-group">
              <div className={`input-container ${isFocused.password ? 'focused' : ''}`}>
                <FaLock className="input-icon" />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused({ ...isFocused, password: true })}
                  onBlur={() => setIsFocused({ ...isFocused, password: false })}
                  required
                  className="form-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPwd(!showPwd)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
                <div className="input-line"></div>
              </div>
            </div>

            <button
              type="submit"
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              <span className="button-text">
                {loading ? "Logging In..." : "Login"}
              </span>
              {loading && <div className="button-loader"></div>}
            </button>

            {alert.show && (
              <AnimatedAlert type={alert.type} message={alert.message} />
            )}
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p className="footer-text">
              Secure access to your tracking dashboard
            </p>
          </div>
        </div>
      </div>

      <style>{`
                 .login-container {
           min-height: 100vh;
           display: flex;
           align-items: center;
           justify-content: center;
           position: relative;
           overflow: hidden;
           background: linear-gradient(135deg, #32b8f4 0%, #1e88e5 100%);
           font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
         }

        /* Animated Background */
        .animated-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.6;
          animation: float 6s ease-in-out infinite;
        }

                 .orb-1 {
           width: 300px;
           height: 300px;
           background: linear-gradient(45deg, #32b8f4, #1e88e5);
           top: 10%;
           left: 10%;
           animation-delay: 0s;
         }

         .orb-2 {
           width: 250px;
           height: 250px;
           background: linear-gradient(45deg, #81d4fa, #4fc3f7);
           top: 60%;
           right: 15%;
           animation-delay: 2s;
         }

         .orb-3 {
           width: 200px;
           height: 200px;
           background: linear-gradient(45deg, #b3e5fc, #29b6f6);
           bottom: 20%;
           left: 20%;
           animation-delay: 4s;
         }

                 .mesh-gradient {
           position: absolute;
           top: 0;
           left: 0;
           width: 100%;
           height: 100%;
           background: 
             radial-gradient(circle at 20% 80%, rgba(50, 184, 244, 0.3) 0%, transparent 50%),
             radial-gradient(circle at 80% 20%, rgba(30, 136, 229, 0.3) 0%, transparent 50%),
             radial-gradient(circle at 40% 40%, rgba(129, 212, 250, 0.3) 0%, transparent 50%);
         }

        /* Floating Elements */
        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }

        .floating-card {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          animation: float 8s ease-in-out infinite;
        }

        .card-1 {
          top: 15%;
          left: 10%;
          animation-delay: 0s;
        }

        .card-2 {
          top: 25%;
          right: 15%;
          animation-delay: 2s;
        }

        .card-3 {
          bottom: 25%;
          left: 15%;
          animation-delay: 4s;
        }

        /* Main Content */
        .login-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          padding: 20px;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px 40px;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideUp 0.8s ease-out;
        }

        /* Header */
        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

                 .logo-icon {
           width: 80px;
           height: 80px;
           background: linear-gradient(135deg, #32b8f4, #1e88e5);
           border-radius: 20px;
           display: flex;
           align-items: center;
           justify-content: center;
           color: white;
           box-shadow: 0 8px 32px rgba(50, 184, 244, 0.3);
           overflow: hidden;
         }

         .logo-icon img {
           width: 100%;
           height: 100%;
           object-fit: cover;
           border-radius: 20px;
         }

        .brand-title {
          font-size: 28px;
          font-weight: 700;
          color: #1a202c;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .brand-subtitle {
          font-size: 16px;
          color: #718096;
          margin: 0;
          font-weight: 500;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          position: relative;
        }

        .input-container {
          position: relative;
          background: #f7fafc;
          border-radius: 16px;
          padding: 4px;
          transition: all 0.3s ease;
        }

                 .input-container.focused {
           background: white;
           box-shadow: 0 0 0 3px rgba(50, 184, 244, 0.1);
         }

         .input-icon {
           position: absolute;
           left: 20px;
           top: 50%;
           transform: translateY(-50%);
           color: #a0aec0;
           z-index: 2;
           transition: color 0.3s ease;
         }

         .input-container.focused .input-icon {
           color: #32b8f4;
         }

                 .form-input {
           width: 100%;
           padding: 16px 20px 16px 56px;
           border: 2px solid #e2e8f0;
           background: transparent;
           font-size: 16px;
           color: #2d3748;
           outline: none;
           border-radius: 12px;
           transition: border-color 0.3s ease;
         }

         .form-input:focus {
           border-color: #32b8f4;
         }

        .form-input::placeholder {
          color: #a0aec0;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #a0aec0;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
          z-index: 2;
        }

                 .password-toggle:hover {
           color: #32b8f4;
           background: rgba(50, 184, 244, 0.1);
         }

        /* Button */
                 .login-button {
           position: relative;
           width: 100%;
           padding: 16px;
           background: #32b8f4;
           border: none;
           border-radius: 16px;
           color: white;
           font-size: 16px;
           font-weight: 600;
           cursor: pointer;
           transition: all 0.3s ease;
           overflow: hidden;
           margin-top: 8px;
         }

         .login-button:hover:not(:disabled) {
           transform: translateY(-2px);
           box-shadow: 0 8px 25px rgba(50, 184, 244, 0.3);
         }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-text {
          position: relative;
          z-index: 2;
        }

        .button-loader {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Footer */
        .login-footer {
          text-align: center;
          margin-top: 32px;
        }

        .footer-text {
          color: #718096;
          font-size: 14px;
          margin: 0;
        }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* Floating Particles */
        .floating-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: particleFloat 5s linear infinite;
          pointer-events: none;
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(1);
            opacity: 0;
          }
        }

        /* Responsive */
        @media (max-width: 480px) {
          .login-content {
            padding: 16px;
          }
          
          .login-card {
            padding: 32px 24px;
          }
          
          .brand-title {
            font-size: 24px;
          }
          
          .floating-card {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .floating-card {
            font-size: 12px;
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
