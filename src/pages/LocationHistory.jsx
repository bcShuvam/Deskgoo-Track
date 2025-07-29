import React, { useEffect, useState, useContext, useRef } from "react";
import api from "../api";
import Loader from "../components/Common/Loader";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader, Polyline } from "@react-google-maps/api";
import AnimatedAlert from "../components/Layout/AnimatedAlert";
import { ThemeContext } from "../context/ThemeContext";
import { FaBatteryHalf, FaWifi, FaClock, FaRuler, FaBullseye, FaFilter, FaPlay, FaPause, FaBackward, FaForward, FaUndo } from "react-icons/fa";
import "../App.css";
import "animate.css";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import BikramSambat from "bikram-sambat-js";
import { useLocation, useNavigate } from "react-router-dom";

function formatMobileTime(mobileTime) {
  if (!mobileTime) return '';
  const [time, date] = mobileTime.split(' ');
  if (!time || !date) return mobileTime;
  const [h, m] = time.split(":");
  const [yyyy, mm, dd] = date.split("-");
  return `${h}:${m} ${dd}/${mm}/${yyyy.slice(2)}`;
}

const defaultCenter = { lat: 27.7172, lng: 85.3240 };
const MARKER_SIZE = 72;
const INFO_GAP_PX = 12;

// Remove the getInfoWindowPosition function if not used.

const LocationHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userList, selectedUser: initialUser, filterFromBS: initialFromBS, filterToBS: initialToBS, locationHistory: initialHistory } = location.state || {};
  const [selectedUser, setSelectedUser] = useState(initialUser);
  const [filterFromBS, setFilterFromBS] = useState(initialFromBS);
  const [filterToBS, setFilterToBS] = useState(initialToBS);
  const [locationHistory, setLocationHistory] = useState(initialHistory);
  const [showFilter, setShowFilter] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapType, setMapType] = useState("roadmap");
  const { theme } = useContext(ThemeContext);
  const [activeLocIdx, setActiveLocIdx] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playIdx, setPlayIdx] = useState(null);
  const playIntervalRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [speed, setSpeed] = useState(1); // 1x by default
  const speedOptions = [0.5, 0.75, 1, 1.5, 2, 3, 4];

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDOq5UlrICMQ9rATXRmfMGXkXZPCJEoxgM",
  });

  useEffect(() => {
    if (!userList || !selectedUser || !filterFromBS || !filterToBS || !locationHistory) {
      navigate("/livelocation");
    }
  }, [userList, selectedUser, filterFromBS, filterToBS, locationHistory, navigate]);

  // Map type control theme
  const overlayBg = theme === "dark" ? "#23272b" : "#fff";
  const overlayText = theme === "dark" ? "#fff" : "#111";
  const selectBg = theme === "dark" ? "#23272b" : "#fff";
  const selectText = theme === "dark" ? "#fff" : "#111";
  const selectBorder = theme === "dark" ? "2px solid #fff" : "2px solid #111";
  const overlayShadow = theme === "dark"
    ? "0 4px 16px rgba(255,255,255,0.25)"
    : "0 2px 8px rgba(255,255,255,0.25)";

  // Filter popup/modal (same as before)
  const renderFilterPopup = () => (
    <div className="filter-popup-overlay">
      <div className="filter-popup-modern">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 fw-bold">Filter Location History</h5>
          <button className="btn-close" onClick={() => setShowFilter(false)} aria-label="Close filter"></button>
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search user..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            style={{ marginBottom: 8, borderRadius: 10, fontSize: 16 }}
          />
          <div className="user-list-scroll-modern" style={{ maxHeight: 220, overflowY: 'auto' }}>
            {userList.filter(u => u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())).map(user => (
              <div
                key={user._id}
                className={`d-flex align-items-center mb-2 gap-2 filter-user-row${selectedUser?._id === user._id ? ' filter-user-selected' : ''}`}
                style={{ cursor: 'pointer', background: selectedUser?._id === user._id ? '#eaf2ff' : 'transparent', borderRadius: 10, padding: '7px 10px', fontSize: 16, fontWeight: selectedUser?._id === user._id ? 600 : 500 }}
                onClick={() => setSelectedUser(user)}
              >
                <img src={user.profileImage} alt={user.username} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #a4c2f4', background: '#eee' }} onError={e => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.username); }} />
                <span>{user.username}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-3 row g-2 align-items-center">
          <div className="col-6">
            <label className="fw-semibold mb-2">From (BS)</label>
            <NepaliDatePicker
              inputClassName="form-control filter-datepicker"
              value={filterFromBS}
              onChange={value => setFilterFromBS(value)}
              options={{ calenderLocale: "en", valueLocale: "en" }}
              placeholder="Start Nepali Date"
            />
          </div>
          <div className="col-6">
            <label className="fw-semibold mb-2">To (BS)</label>
            <NepaliDatePicker
              inputClassName="form-control filter-datepicker"
              value={filterToBS}
              onChange={value => setFilterToBS(value)}
              options={{ calenderLocale: "en", valueLocale: "en" }}
              placeholder="End Nepali Date"
            />
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-2">
          <button className="btn btn-secondary" onClick={() => setShowFilter(false)} style={{ borderRadius: 8, fontSize: 16, padding: '8px 22px' }}>Cancel</button>
          <button className="btn btn-primary" type="button" onClick={async () => {
            if (!selectedUser || !filterFromBS || !filterToBS) {
              alert('Please select a user and date from and to.');
              return;
            }
            setShowFilter(false);
            setLoading(true);
            setError("");
            // Convert BS to AD
            const fromAD = new BikramSambat(filterFromBS, 'BS').toAD();
            const toAD = new BikramSambat(filterToBS, 'BS').toAD();
            try {
              const res = await api.get(`/location/latestByDate?_id=${selectedUser._id}&from=${fromAD}&to=${toAD}`);
              if (res.data.locations && res.data.locations.length > 0) {
                setLocationHistory(res.data);
              } else {
                setError('Location not found for given range of date.');
              }
            } catch (err) {
              setError(err?.response?.data?.message || err?.message || "Failed to fetch location history");
            }
            setLoading(false);
          }} style={{ borderRadius: 8, fontSize: 16, padding: '8px 22px', fontWeight: 600 }}>Apply</button>
        </div>
      </div>
      <style>{`
        .filter-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.25);
          z-index: 4000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .filter-popup-modern {
          min-width: 380px;
          max-width: 98vw;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(44,62,80,0.18);
          padding: 2.2rem 1.7rem 1.5rem 1.7rem;
          animation: fadeSlideIn 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          color: #222;
        }
        .user-list-scroll-modern {
          max-height: 220px;
          overflow-y: auto;
          border: 1.5px solid #e0e0e0;
          border-radius: 12px;
          padding: 0.5rem 0.5rem 0.5rem 0.25rem;
          background: #f8fafc;
          margin-bottom: 1rem;
          width: 100%;
        }
      `}</style>
    </div>
  );

  // Play/Pause animation logic
  // Remove pause feature: only allow play, not pause/resume.
  // When play is clicked, clear all markers and polyline, then plot them one by one with 250ms gap.
  // After animation completes, allow replay by showing play button again.
  const handlePlay = () => {
    if (locationHistory.locations && locationHistory.locations.length > 0) {
      setIsPlaying(true);
      if (playIdx === null || playIdx === locationHistory.locations.length - 1) {
        setPlayIdx(0);
        setMapCenter({
          lat: locationHistory.locations[0].latitude,
          lng: locationHistory.locations[0].longitude
        });
      }
    }
  };
  const handlePause = () => setIsPlaying(false);
  const skipPoints = Math.max(1, Math.round((10 / speed) / 0.25)); // 10s worth of points at current speed
  const handleBackward = () => {
    setPlayIdx(idx => {
      const newIdx = idx > 0 ? Math.max(0, idx - skipPoints) : 0;
      setMapCenter({
        lat: locationHistory.locations[newIdx].latitude,
        lng: locationHistory.locations[newIdx].longitude
      });
      return newIdx;
    });
    setIsPlaying(false);
  };
  const handleForward = () => {
    setPlayIdx(idx => {
      const newIdx = idx < locationHistory.locations.length - 1 ? Math.min(locationHistory.locations.length - 1, idx + skipPoints) : idx;
      setMapCenter({
        lat: locationHistory.locations[newIdx].latitude,
        lng: locationHistory.locations[newIdx].longitude
      });
      return newIdx;
    });
    setIsPlaying(false);
  };
  const handleSlider = (e) => {
    const idx = Number(e.target.value);
    setPlayIdx(idx);
    setMapCenter({
      lat: locationHistory.locations[idx].latitude,
      lng: locationHistory.locations[idx].longitude
    });
    setIsPlaying(false);
  };

  useEffect(() => {
    if (isPlaying && locationHistory && locationHistory.locations && locationHistory.locations.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setPlayIdx(prev => {
          if (prev === null) return 0;
          if (prev < locationHistory.locations.length - 1) {
            setMapCenter({
              lat: locationHistory.locations[prev + 1].latitude,
              lng: locationHistory.locations[prev + 1].longitude
            });
            return prev + 1;
          } else {
            setIsPlaying(false);
            clearInterval(playIntervalRef.current);
            return prev;
          }
        });
      }, 250 / speed);
    } else {
      clearInterval(playIntervalRef.current);
    }
    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, locationHistory, speed]);

  // Reset playIdx when not playing
  useEffect(() => {
    if (!isPlaying) setPlayIdx(null);
  }, [isPlaying]);

  if (!userList || !selectedUser || !filterFromBS || !filterToBS || !locationHistory) {
    return <Loader />;
  }

  // Progress bar and time left
  const total = locationHistory.locations ? locationHistory.locations.length : 0;
  const current = playIdx === null ? 0 : playIdx + 1;
  const timeLeftMs = total > 0 && playIdx !== null ? (total - current) * (250 / speed) : 0;
  // Format time as hh:mm:ss
  function formatTime(ms) {
    const sec = Math.ceil(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
  }
  const timeLeftStr = formatTime(timeLeftMs);

  const handleReset = () => {
    setIsPlaying(false);
    setPlayIdx(null);
    if (locationHistory.locations && locationHistory.locations.length > 0) {
      setMapCenter({
        lat: locationHistory.locations[0].latitude,
        lng: locationHistory.locations[0].longitude
      });
    }
  };

  return (
    <div className="flex-grow-1 d-flex flex-column position-relative" style={{ minHeight: 0, minWidth: 0, height: "100%", width: "100%", padding: 0, margin: 0 }}>
      {/* Map type control overlay */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          background: overlayBg,
          color: overlayText,
          borderRadius: 8,
          boxShadow: overlayShadow,
          padding: 8,
          display: "flex",
          alignItems: "center",
          transition: "box-shadow 0.2s"
        }}
      >
        <label className="me-2 fw-bold" style={{ color: overlayText }}>Map Type:</label>
        <select
          className="form-select form-select-sm w-auto d-inline-block"
          value={mapType}
          onChange={e => setMapType(e.target.value)}
          style={{ background: selectBg, color: selectText, border: selectBorder }}
        >
          <option value="roadmap">Default</option>
          <option value="satellite">Satellite</option>
        </select>
      </div>
      {/* Filter Button */}
      <button
        className="btn btn-light filter-btn position-absolute"
        style={{ top: 80, right: 16, zIndex: 10, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        onClick={() => setShowFilter(true)}
        title="Filter Location History"
      >
        <FaFilter size={20} />
      </button>
      {showFilter && renderFilterPopup()}
      {/* Floating user info */}
      {locationHistory && selectedUser && (
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 20, background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(44,62,80,0.10)', padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, maxWidth: '90vw', fontWeight: 600, fontSize: 18 }}>
          <img src={selectedUser.profileImage} alt={selectedUser.username} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #a4c2f4', background: '#eee' }} />
          <span style={{ fontWeight: 700, fontSize: 19 }}>{selectedUser.username}</span>
          <span style={{ fontSize: 16, color: '#555', fontWeight: 500 }}>{filterFromBS} - {filterToBS}</span>
        </div>
      )}
      {/* Error/Loader/No Data */}
      {loading && <Loader />}
      {error && <AnimatedAlert type="error" message={error} />}
      {locationHistory && locationHistory.locations && locationHistory.locations.length === 0 && (
        <AnimatedAlert type="error" message="Location not found for given range of date." />
      )}
      {isLoaded && !loading && !error && (
        <div style={{ flex: 1, minHeight: 0, minWidth: 0, height: "100%", width: "100%", display: "flex" }}>
          <GoogleMap
            mapContainerStyle={{ flex: 1, minHeight: 0, minWidth: 0, height: "100%", width: "100%" }}
            center={mapCenter}
            zoom={18}
            mapTypeId={mapType}
            options={{ mapTypeControl: false, fullscreenControl: false, zoomControl: false, streetViewControl: false, panControl: false, rotateControl: false, scaleControl: false }}
          >
            {/* Markers: show all if not playing, or up to playIdx if playing */}
            {locationHistory.locations && playIdx !== null && (isPlaying && playIdx !== null
              ? locationHistory.locations.slice(0, playIdx + 1)
              : locationHistory.locations.slice(0, playIdx + 1)
            ).map((loc, idx) => (
              <Marker
                key={loc._id || idx}
                position={{ lat: loc.latitude, lng: loc.longitude }}
                title={`Point ${idx + 1}`}
                onClick={() => setActiveLocIdx(idx)}
              />
            ))}
            {/* Polyline: show up to playIdx if playing, else all */}
            {locationHistory.locations && playIdx !== null && (isPlaying && playIdx !== null
              ? playIdx > 0
              : playIdx > 0
            ) && (
              <Polyline
                path={locationHistory.locations.slice(0, playIdx + 1).map(loc => ({ lat: loc.latitude, lng: loc.longitude }))}
                options={{ strokeColor: '#1976d2', strokeOpacity: 0.9, strokeWeight: 4 }}
              />
            )}
            {/* InfoWindow on marker click */}
            {activeLocIdx !== null && locationHistory.locations && locationHistory.locations[activeLocIdx] && (
              <InfoWindow
                position={{
                  lat: locationHistory.locations[activeLocIdx].latitude + (INFO_GAP_PX + MARKER_SIZE) * 0.0000089,
                  lng: locationHistory.locations[activeLocIdx].longitude
                }}
                onCloseClick={() => setActiveLocIdx(null)}
                options={{ pixelOffset: { width: 0, height: -MARKER_SIZE } }}
              >
                <div className={`infowindow-modern ${theme === 'dark' ? 'infowindow-dark' : 'infowindow-light'}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: 280,
                    maxWidth: 340,
                    borderRadius: 18,
                    boxShadow: theme === 'dark' ? '0 6px 32px rgba(0,0,0,0.45)' : '0 4px 24px rgba(44,62,80,0.12)',
                    background: theme === 'dark' ? '#11181f' : '#f7faff',
                    color: theme === 'dark' ? '#fff' : '#23272b',
                    padding: '26px 24px 18px 24px',
                    position: 'relative',
                    fontFamily: 'inherit',
                    fontSize: 15,
                    fontWeight: 400,
                    border: 'none',
                  }}
                >
                  <button className="infowindow-close-btn" onClick={() => setActiveLocIdx(null)} aria-label="Close InfoWindow" style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#888', zIndex: 2, borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s, background 0.2s' }}>&#10005;</button>
                  <img src={selectedUser.profileImage} alt="Profile" style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", marginBottom: 14, marginTop: 12, border: '2.5px solid #a4c2f4', background: theme === 'dark' ? '#11181f' : '#fff', boxShadow: '0 2px 8px rgba(164,194,244,0.10)' }} />
                  <div className="fw-bold" style={{ fontSize: 21, fontWeight: 700, marginBottom: 18, textAlign: 'center', wordBreak: 'break-word', color: theme === 'dark' ? '#fff' : '#23272b', letterSpacing: 0.2 }}>{selectedUser.username}</div>
                  <div className="infowindow-list" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {[
                      { icon: <FaBatteryHalf style={{ color: theme === 'dark' ? '#a4c2f4' : '#1976d2', fontSize: 19 }} />, label: 'Battery', value: locationHistory.locations[activeLocIdx].batteryPercentage + '%' },
                      { icon: <FaWifi style={{ color: theme === 'dark' ? '#a4c2f4' : '#1976d2', fontSize: 19 }} />, label: 'Connectivity', value: locationHistory.locations[activeLocIdx].connectivityType + ' (' + locationHistory.locations[activeLocIdx].connectivityStatus + ')' },
                      { icon: <FaClock style={{ color: theme === 'dark' ? '#a4c2f4' : '#1976d2', fontSize: 19 }} />, label: 'Mobile Time', value: formatMobileTime(locationHistory.locations[activeLocIdx].mobileTime) },
                      { icon: <FaRuler style={{ color: theme === 'dark' ? '#a4c2f4' : '#1976d2', fontSize: 19 }} />, label: 'Distance', value: (locationHistory.locations[activeLocIdx].distance?.toFixed(2) || '0') + ' km' },
                      { icon: <FaBullseye style={{ color: theme === 'dark' ? '#a4c2f4' : '#1976d2', fontSize: 19 }} />, label: 'Accuracy', value: locationHistory.locations[activeLocIdx].accuracy },
                    ].map((item, idx, arr) => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 14, padding: '13px 8px', borderBottom: idx < arr.length - 1 ? `1.5px solid ${theme === 'dark' ? '#232b33' : '#e3eaf2'}` : 'none' }}>
                        <div style={{ width: 28, display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                        <div style={{ flex: 1, fontSize: 15.5, fontWeight: 500, color: theme === 'dark' ? '#a4c2f4' : '#1976d2' }}>{item.label}</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: theme === 'dark' ? '#fff' : '#23272b', textAlign: 'right', minWidth: 80 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      )}
      {/* Playback controller at bottom center */}
      {locationHistory && locationHistory.locations && locationHistory.locations.length > 0 && (
        <div style={{ position: 'absolute', left: '50%', bottom: 32, transform: 'translateX(-50%)', zIndex: 30, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(44,62,80,0.10)', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 18, minWidth: 320, maxWidth: '90vw' }}>
          <button className="btn btn-light" style={{ borderRadius: 8, fontSize: 20, padding: '6px 10px' }} onClick={handleBackward} disabled={playIdx === 0 || playIdx === null}><FaBackward /></button>
          {isPlaying ? (
            <button className="btn btn-light" style={{ borderRadius: 8, fontSize: 20, padding: '6px 10px' }} onClick={handlePause}><FaPause /></button>
          ) : (
            <button className="btn btn-light" style={{ borderRadius: 8, fontSize: 20, padding: '6px 10px' }} onClick={handlePlay} disabled={playIdx === total - 1}><FaPlay /></button>
          )}
          <button className="btn btn-light" style={{ borderRadius: 8, fontSize: 20, padding: '6px 10px' }} onClick={handleReset} title="Reset"><FaUndo /></button>
          <button className="btn btn-light" style={{ borderRadius: 8, fontSize: 20, padding: '6px 10px' }} onClick={handleForward} disabled={playIdx === total - 1 || playIdx === null}><FaForward /></button>
          {/* Slidable progress bar */}
          <input
            type="range"
            min={0}
            max={total - 1}
            value={playIdx === null ? 0 : playIdx}
            onChange={handleSlider}
            style={{ flex: 1, minWidth: 80, maxWidth: 200, margin: '0 16px' }}
          />
          <span style={{ fontSize: 15, color: '#555', minWidth: 64, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{timeLeftStr} left</span>
          {/* Speed dropdown */}
          <select
            className="form-select form-select-sm ms-3"
            style={{ width: 80, fontWeight: 600 }}
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          >
            {speedOptions.map(opt => (
              <option key={opt} value={opt}>{opt}x</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default LocationHistory; 