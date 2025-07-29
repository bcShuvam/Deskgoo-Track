import React, { useState, useContext } from "react";
import api from "../../api";
import AnimatedAlert from "../Layout/AnimatedAlert";
import Loader from "../Common/Loader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ThemeContext } from "../../context/ThemeContext";
import { 
  FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaCalendar, 
  FaCalendarPlus, FaEye, FaEyeSlash, FaArrowRight, FaArrowLeft, 
  FaCheck, FaTimes, FaUserPlus, FaBuilding, FaIdBadge, FaGlobe,
  FaVenusMars, FaHeart, FaFlag, FaCheckCircle
} from "react-icons/fa";
import "../../App.css";
import "animate.css";

const initialForm = {
  username: "",
  email: "",
  password: "",
  role: { role: "Hospital Representative", roleValue: 3031 },
  department: "Marketing",
  designation: "Hospital Representative",
  number: "",
  countryCode: "+977",
  address: "",
  nationality: "Nepali",
  dob: null,
  doj: null,
  maritalStatus: "Married",
  gender: "Male",
};

const roles = [
  { label: "Admin", value: { role: "Admin", roleValue: 1001 }, icon: <FaUser /> },
  { label: "Hospital Representative", value: { role: "Hospital Representative", roleValue: 3031 }, icon: <FaIdBadge /> },
];
const departments = ["Marketing", "Administrator"];
const designations = ["Admin", "Hospital Representative"];
const maritalStatuses = ["Married", "Unmarried"];
const genders = ["Male", "Female", "Others"];
const nationalities = [
  { label: "Nepali", value: "Nepali", flag: "🇳🇵" },
  { label: "Indian", value: "Indian", flag: "🇮🇳" },
];
const countryCodes = [
  { code: "+977", flag: "🇳🇵" },
  { code: "+91", flag: "🇮🇳" },
];

const formSteps = [
  { id: 1, title: "Basic Info", icon: <FaUser />, description: "Personal details" },
  { id: 2, title: "Contact", icon: <FaPhone />, description: "Contact information" },
  { id: 3, title: "Professional", icon: <FaBuilding />, description: "Work details" },
  { id: 4, title: "Review", icon: <FaCheckCircle />, description: "Confirm details" }
];

const UserCreateDialog = ({ show, onClose, onUserCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const { theme } = useContext(ThemeContext);

  const textColor = theme === "dark" ? "#f1f1f1" : "#222";
  const subTextColor = theme === "dark" ? "#b0b0b0" : "#666";
  const cardBg = theme === "dark" ? "#23272b" : "#fff";
  const borderColor = theme === "dark" ? "#333" : "#e0e0e0";

  // Validation functions
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!form.username.trim()) newErrors.username = "Username is required";
        if (!form.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
        if (!form.password) newErrors.password = "Password is required";
        else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        break;
      case 2:
        if (!form.number.trim()) newErrors.number = "Phone number is required";
        if (!form.address.trim()) newErrors.address = "Address is required";
        if (!form.dob) newErrors.dob = "Date of birth is required";
        break;
      case 3:
        if (!form.doj) newErrors.doj = "Date of joining is required";
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };


  const handleNationalityChange = (e) => {
    setForm((prev) => ({ ...prev, nationality: e.target.value }));
  };
  const handleCountryCodeChange = (e) => {
    setForm((prev) => ({ ...prev, countryCode: e.target.value }));
  };

  // Handle date pickers
  const handleDateChange = (name, date) => {
    setForm((prev) => ({ ...prev, [name]: date }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    setAlert({ show: false, type: "", message: "" });
    try {
      const payload = {
        ...form,
        dob: form.dob ? form.dob.toISOString().split("T")[0] : "",
        doj: form.doj ? form.doj.toISOString().split("T")[0] : "",
        number: form.countryCode + form.number,
      };
      await api.post("/users", payload);
      setAlert({ show: true, type: "success", message: "User created successfully!" });
      setTimeout(() => {
        setLoading(false);
        onUserCreated();
      }, 1200);
    } catch (err) {
      setAlert({ show: true, type: "error", message: err?.response?.data?.message || err?.message || "Failed to create user" });
      setLoading(false);
    }
  };



  if (!show) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content animate__animated animate__fadeIn">
            <h4 className="step-title mb-4" style={{ color: textColor }}>
              <FaUser className="me-2" style={{ color: 'var(--primary)' }} />
              Basic Information
            </h4>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ color: textColor }}>Username *</label>
                <div className="input-group-modern">
                  <span className="input-icon"><FaUser /></span>
                  <input 
                    type="text" 
                    className={`form-control-modern ${errors.username ? 'error' : ''}`}
                    name="username" 
                    value={form.username} 
                    onChange={handleChange} 
                    placeholder="Enter username"
                    autoComplete="off"
                  />
                </div>
                {errors.username && <div className="error-message">{errors.username}</div>}
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ color: textColor }}>Email Address *</label>
                <div className="input-group-modern">
                  <span className="input-icon"><FaEnvelope /></span>
                  <input 
                    type="email" 
                    className={`form-control-modern ${errors.email ? 'error' : ''}`}
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    placeholder="Enter email address"
                    autoComplete="off"
                  />
                </div>
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ color: textColor }}>Password *</label>
                <div className="input-group-modern">
                  <span className="input-icon"><FaLock /></span>
                  <input 
                    type={showPwd ? "text" : "password"} 
                    className={`form-control-modern ${errors.password ? 'error' : ''}`}
                    name="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    placeholder="Enter password"
                    autoComplete="new-password"
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPwd(v => !v)}
                  >
                    {showPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content animate__animated animate__fadeIn">
            <h4 className="step-title mb-4" style={{ color: textColor }}>
              <FaPhone className="me-2" style={{ color: 'var(--primary)' }} />
              Contact Information
            </h4>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ color: textColor }}>Phone Number *</label>
                <div className="phone-input-group">
                  <div className="country-code-selector">
                    <select 
                      className="country-code-select"
                      value={form.countryCode} 
                      onChange={handleCountryCodeChange}
                    >
                      {countryCodes.map(c => (
                        <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group-modern flex-grow-1">
                    <span className="input-icon"><FaPhone /></span>
                    <input 
                      type="text" 
                      className={`form-control-modern ${errors.number ? 'error' : ''}`}
                      name="number" 
                      value={form.number} 
                      onChange={handleChange} 
                      placeholder="Enter phone number"
                      autoComplete="off"
                    />
                  </div>
                </div>
                {errors.number && <div className="error-message">{errors.number}</div>}
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ color: textColor }}>Address *</label>
                <div className="input-group-modern">
                  <span className="input-icon"><FaMapMarkerAlt /></span>
                  <input 
                    type="text" 
                    className={`form-control-modern ${errors.address ? 'error' : ''}`}
                    name="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    placeholder="Enter full address"
                    autoComplete="off"
                  />
                </div>
                {errors.address && <div className="error-message">{errors.address}</div>}
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ color: textColor }}>Date of Birth *</label>
                <div className="input-group-modern">
                  <span className="input-icon"><FaCalendar /></span>
                  <DatePicker
                    selected={form.dob}
                    onChange={date => handleDateChange("dob", date)}
                    className={`form-control-modern ${errors.dob ? 'error' : ''}`}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select date of birth"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    maxDate={new Date()}
                  />
                </div>
                {errors.dob && <div className="error-message">{errors.dob}</div>}
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold" style={{ color: textColor }}>Gender</label>
                <select 
                  className="form-select-modern"
                  name="gender" 
                  value={form.gender} 
                  onChange={handleChange}
                >
                  {genders.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold" style={{ color: textColor }}>Nationality</label>
                <div className="input-group-modern">
                  <span className="input-icon">
                    {nationalities.find(n => n.value === form.nationality)?.flag}
                  </span>
                  <select 
                    className="form-select-modern"
                    value={form.nationality} 
                    onChange={handleNationalityChange}
                  >
                    {nationalities.map(n => (
                      <option key={n.value} value={n.value}>{n.flag} {n.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content animate__animated animate__fadeIn">
            <h4 className="step-title mb-4" style={{ color: textColor }}>
              <FaBuilding className="me-2" style={{ color: 'var(--primary)' }} />
              Professional Information
            </h4>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ color: textColor }}>Role *</label>
                <div className="role-selector">
                  {roles.map(role => (
                    <div 
                      key={role.label}
                      className={`role-option ${form.role.role === role.value.role ? 'selected' : ''}`}
                      onClick={() => setForm(prev => ({ ...prev, role: role.value }))}
                    >
                      <div className="role-icon">{role.icon}</div>
                      <div className="role-info">
                        <div className="role-title">{role.label}</div>
                        <div className="role-description">
                          {role.value.role === "Admin" ? "Full system access" : "Hospital management access"}
                        </div>
                      </div>
                      {form.role.role === role.value.role && <FaCheck className="role-check" />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold" style={{ color: textColor }}>Department</label>
                <select 
                  className="form-select-modern"
                  name="department" 
                  value={form.department} 
                  onChange={handleChange}
                >
                  {departments.map(dep => <option key={dep}>{dep}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold" style={{ color: textColor }}>Designation</label>
                <select 
                  className="form-select-modern"
                  name="designation" 
                  value={form.designation} 
                  onChange={handleChange}
                >
                  {designations.map(des => <option key={des}>{des}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ color: textColor }}>Date of Joining *</label>
                <div className="input-group-modern">
                  <span className="input-icon"><FaCalendarPlus /></span>
                  <DatePicker
                    selected={form.doj}
                    onChange={date => handleDateChange("doj", date)}
                    className={`form-control-modern ${errors.doj ? 'error' : ''}`}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select date of joining"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
                {errors.doj && <div className="error-message">{errors.doj}</div>}
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ color: textColor }}>Marital Status</label>
                <select 
                  className="form-select-modern"
                  name="maritalStatus" 
                  value={form.maritalStatus} 
                  onChange={handleChange}
                >
                  {maritalStatuses.map(ms => <option key={ms}>{ms}</option>)}
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content animate__animated animate__fadeIn">
            <h4 className="step-title mb-4" style={{ color: textColor }}>
              <FaCheckCircle className="me-2" style={{ color: 'var(--primary)' }} />
              Review Information
            </h4>
            <div className="review-section">
              <div className="review-card">
                <h6 className="review-section-title">Basic Information</h6>
                <div className="review-item">
                  <span className="review-label">Username:</span>
                  <span className="review-value">{form.username}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Email:</span>
                  <span className="review-value">{form.email}</span>
                </div>
              </div>
              <div className="review-card">
                <h6 className="review-section-title">Contact Information</h6>
                <div className="review-item">
                  <span className="review-label">Phone:</span>
                  <span className="review-value">{form.countryCode} {form.number}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Address:</span>
                  <span className="review-value">{form.address}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Date of Birth:</span>
                  <span className="review-value">{form.dob ? form.dob.toLocaleDateString() : 'Not set'}</span>
                </div>
              </div>
              <div className="review-card">
                <h6 className="review-section-title">Professional Information</h6>
                <div className="review-item">
                  <span className="review-label">Role:</span>
                  <span className="review-value">{form.role.role}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Department:</span>
                  <span className="review-value">{form.department}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Date of Joining:</span>
                  <span className="review-value">{form.doj ? form.doj.toLocaleDateString() : 'Not set'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay animate__animated animate__fadeIn" style={{ background: "rgba(0,0,0,0.6)", minHeight: "100vh" }}>
      <div className="modal-container">
        <div className="modal-content-modern" style={{ background: cardBg, borderRadius: 20 }}>
          {/* Header */}
          <div className="modal-header-modern">
            <div className="header-content">
              <div className="header-icon">
                <FaUserPlus size={24} style={{ color: 'var(--primary)' }} />
              </div>
              <div className="header-text">
                <h4 className="modal-title-modern" style={{ color: textColor, margin: 0 }}>
                  Create New User
                </h4>
                <p className="modal-subtitle" style={{ color: subTextColor, margin: 0, fontSize: '0.9rem' }}>
                  Step {currentStep} of 4
                </p>
              </div>
            </div>
            <button 
              type="button" 
              className="close-btn"
              onClick={onClose}
              style={{ color: subTextColor }}
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps">
            {formSteps.map((step) => (
              <div 
                key={step.id}
                className={`progress-step ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
              >
                <div className="step-indicator">
                  {currentStep > step.id ? (
                    <FaCheck size={16} />
                  ) : (
                    <span className="step-number">{step.id}</span>
                  )}
                </div>
                <div className="step-info">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Alert */}
          {alert.show && <AnimatedAlert type={alert.type} message={alert.message} />}

          {/* Loading */}
          {loading && <Loader />}

          {/* Form Content */}
          <div className="modal-body-modern">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="modal-footer-modern">
            <div className="footer-actions">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={prevStep}
                  disabled={loading}
                >
                  <FaArrowLeft className="me-2" />
                  Previous
                </button>
              )}
              <div className="spacer"></div>
              {currentStep < 4 ? (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={nextStep}
                  disabled={loading}
                >
                  Next
                  <FaArrowRight className="ms-2" />
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  <FaUserPlus className="me-2" />
                  Create User
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 5000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .modal-container {
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
        }

        .modal-content-modern {
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .modal-header-modern {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid ${borderColor};
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          background: rgba(164,194,244,0.1);
          border-radius: 12;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(0,0,0,0.1);
        }

        .progress-steps {
          display: flex;
          padding: 1.5rem 2rem;
          gap: 1rem;
          border-bottom: 1px solid ${borderColor};
          overflow-x: auto;
        }

        .progress-step {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          min-width: 0;
        }

        .step-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${subTextColor};
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .progress-step.active .step-indicator {
          background: var(--primary);
          color: #111;
        }

        .progress-step.completed .step-indicator {
          background: #28a745;
          color: white;
        }

        .step-info {
          min-width: 0;
        }

        .step-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: ${textColor};
          white-space: nowrap;
        }

        .step-description {
          font-size: 0.8rem;
          color: ${subTextColor};
          white-space: nowrap;
        }

        .modal-body-modern {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .step-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .step-title {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
          font-weight: 700;
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
          color: ${subTextColor};
          z-index: 2;
        }

        .form-control-modern {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border: 2px solid ${borderColor};
          border-radius: 12px;
          background: ${cardBg};
          color: ${textColor};
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-control-modern:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(164,194,244,0.1);
        }

        .form-control-modern.error {
          border-color: #dc3545;
        }

        .form-select-modern {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid ${borderColor};
          border-radius: 12px;
          background: ${cardBg};
          color: ${textColor};
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-select-modern:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(164,194,244,0.1);
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: ${subTextColor};
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .password-toggle:hover {
          color: ${textColor};
          background: rgba(0,0,0,0.1);
        }

        .phone-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .country-code-selector {
          flex-shrink: 0;
        }

        .country-code-select {
          padding: 12px 16px;
          border: 2px solid ${borderColor};
          border-radius: 12px;
          background: ${cardBg};
          color: ${textColor};
          font-size: 1rem;
          min-width: 120px;
        }

        .role-selector {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .role-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid ${borderColor};
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .role-option:hover {
          border-color: var(--primary);
          background: rgba(164,194,244,0.05);
        }

        .role-option.selected {
          border-color: var(--primary);
          background: rgba(164,194,244,0.1);
        }

        .role-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #111;
          font-size: 1.2rem;
        }

        .role-info {
          flex: 1;
        }

        .role-title {
          font-weight: 600;
          color: ${textColor};
          margin-bottom: 0.25rem;
        }

        .role-description {
          font-size: 0.85rem;
          color: ${subTextColor};
        }

        .role-check {
          position: absolute;
          right: 1rem;
          color: var(--primary);
        }

        .review-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .review-card {
          background: rgba(164,194,244,0.05);
          border: 1px solid ${borderColor};
          border-radius: 12px;
          padding: 1.5rem;
        }

        .review-section-title {
          color: var(--primary);
          font-weight: 600;
          margin-bottom: 1rem;
          font-size: 1rem;
        }

        .review-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid ${borderColor};
        }

        .review-item:last-child {
          border-bottom: none;
        }

        .review-label {
          font-weight: 500;
          color: ${subTextColor};
        }

        .review-value {
          font-weight: 600;
          color: ${textColor};
        }

        .error-message {
          color: #dc3545;
          font-size: 0.85rem;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .modal-footer-modern {
          padding: 1.5rem 2rem;
          border-top: 1px solid ${borderColor};
        }

        .footer-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .spacer {
          flex: 1;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .btn-primary {
          background: var(--primary);
          color: #111;
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-outline-secondary {
          background: transparent;
          color: ${subTextColor};
          border: 2px solid ${borderColor};
        }

        .btn-outline-secondary:hover {
          background: ${subTextColor};
          color: white;
        }

        @media (max-width: 768px) {
          .modal-container {
            max-width: 100vw;
            max-height: 100vh;
          }

          .modal-content-modern {
            max-height: 100vh;
            border-radius: 0;
          }

          .modal-header-modern,
          .modal-body-modern,
          .modal-footer-modern {
            padding: 1rem;
          }

          .progress-steps {
            padding: 1rem;
            gap: 0.5rem;
          }

          .step-info {
            display: none;
          }

          .step-indicator {
            width: 28px;
            height: 28px;
            font-size: 0.8rem;
          }

          .phone-input-group {
            flex-direction: column;
          }

          .country-code-selector {
            width: 100%;
          }

          .country-code-select {
            width: 100%;
          }

          .role-option {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .role-check {
            position: static;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserCreateDialog;
