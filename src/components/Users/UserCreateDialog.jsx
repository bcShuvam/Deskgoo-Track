import React, { useState } from "react";
import api from "../../api";
import AnimatedAlert from "../Layout/AnimatedAlert";
import Loader from "../Common/Loader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaCalendar, FaCalendarPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdBusinessCenter } from "react-icons/md";
import { MdBadge } from "react-icons/md";
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
  { label: "Admin", value: { role: "Admin", roleValue: 1001 } },
  { label: "Hospital Representative", value: { role: "Hospital Representative", roleValue: 3031 } },
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

const UserCreateDialog = ({ show, onClose, onUserCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle dropdowns with objects
  const handleRoleChange = (e) => {
    const selected = roles.find(r => r.label === e.target.value);
    setForm((prev) => ({ ...prev, role: selected.value }));
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
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="modal fade show d-block animate__animated animate__fadeIn" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.4)", minHeight: "100vh" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered w-100 m-0" role="document" style={{ maxWidth: "900px", width: "100vw" }}>
        <div className="modal-content" style={{ minHeight: "90vh" }}>
          <div className="modal-header">
            <h5 className="modal-title">Create User/Admin</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="modal-body">
              {alert.show && <AnimatedAlert type={alert.type} message={alert.message} />}
              {loading && <Loader />}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Username</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaUser /></span>
                    <input type="text" className="form-control" name="username" value={form.username} onChange={handleChange} required placeholder="Enter username" autoComplete="off" />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaEnvelope /></span>
                    <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required placeholder="Enter email" autoComplete="off" />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaLock /></span>
                    <input type={showPwd ? "text" : "password"} className="form-control" name="password" value={form.password} onChange={handleChange} required placeholder="Enter password" autoComplete="new-password" />
                    <span className="input-group-text" style={{ cursor: "pointer" }} onClick={() => setShowPwd(v => !v)}>
                      {showPwd ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={roles.find(r => r.value.role === form.role.role)?.label} onChange={handleRoleChange} required>
                    {roles.map(r => <option key={r.label}>{r.label}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Department</label>
                  <select className="form-select" name="department" value={form.department} onChange={handleChange} required>
                    {departments.map(dep => <option key={dep}>{dep}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Designation</label>
                  <select className="form-select" name="designation" value={form.designation} onChange={handleChange} required>
                    {designations.map(des => <option key={des}>{des}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Country Code</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      {countryCodes.find(c => c.code === form.countryCode)?.flag}
                    </span>
                    <select className="form-select" value={form.countryCode} onChange={handleCountryCodeChange} required>
                      {countryCodes.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                    </select>
                    <span className="input-group-text"><FaPhone /></span>
                    <input type="text" className="form-control" name="number" value={form.number} onChange={handleChange} required placeholder="Phone number" autoComplete="off" />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Address</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaMapMarkerAlt /></span>
                    <input type="text" className="form-control" name="address" value={form.address} onChange={handleChange} required placeholder="Enter address" autoComplete="off" />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Nationality</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      {nationalities.find(n => n.value === form.nationality)?.flag}
                    </span>
                    <select className="form-select" value={form.nationality} onChange={handleNationalityChange} required>
                      {nationalities.map(n => <option key={n.value} value={n.value}>{n.flag} {n.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date of Birth</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaCalendar /></span>
                    <DatePicker
                      selected={form.dob}
                      onChange={date => handleDateChange("dob", date)}
                      className="form-control"
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select date of birth"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      maxDate={new Date()}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date of Joining</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaCalendarPlus /></span>
                    <DatePicker
                      selected={form.doj}
                      onChange={date => handleDateChange("doj", date)}
                      className="form-control"
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select date of joining"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Marital Status</label>
                  <select className="form-select" name="maritalStatus" value={form.maritalStatus} onChange={handleChange} required>
                    {maritalStatuses.map(ms => <option key={ms}>{ms}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Gender</label>
                  <select className="form-select" name="gender" value={form.gender} onChange={handleChange} required>
                    {genders.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>Create User</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserCreateDialog;
