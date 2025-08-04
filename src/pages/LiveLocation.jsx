import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import api from "../api";
import Loader from "../components/Common/Loader";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import AnimatedAlert from "../components/Layout/AnimatedAlert";
import { ThemeContext } from "../context/ThemeContext";
import { FaBatteryHalf, FaWifi, FaClock, FaRuler, FaBullseye, FaFilter } from "react-icons/fa";
import "../App.css";
import "animate.css";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import BikramSambat from "bikram-sambat-js";
import { useNavigate } from "react-router-dom";

const defaultCenter = { lat: 27.7172, lng: 85.3240 };

// Helper to create a circular image for marker
function createCircularMarkerIcon(url, size = 72) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      ctx.drawImage(img, 0, 0, size, size);
      resolve({ url: canvas.toDataURL(), scaledSize: { width: size, height: size } });
    };
    img.onerror = function () {
      resolve({ url, scaledSize: { width: size, height: size } });
    };
    img.src = url;
  });
}

function formatMobileTime(mobileTime) {
  // Expecting format: '15:48:51 2025-02-18'
  if (!mobileTime) return '';
  const [time, date] = mobileTime.split(' ');
  if (!time || !date) return mobileTime;
  const [h, m] = time.split(":");
  const [yyyy, mm, dd] = date.split("-");
  return `${h}:${m} ${dd}/${mm}/${yyyy.slice(2)}`;
}

function getTimeBadgeColor(mobileTime) {
  if (!mobileTime) return 'red';
  
  try {
    // Parse mobileTime: '15:48:51 2025-02-18'
    const [time, date] = mobileTime.split(' ');
    if (!time || !date) return 'red';
    
    const [h, m, s] = time.split(":");
    const [yyyy, mm, dd] = date.split("-");
    
    // Create mobile time Date object
    const mobileDateTime = new Date(yyyy, mm - 1, dd, h, m, s);
    const currentTime = new Date();
    
    // Calculate time difference in minutes
    const timeDiffMinutes = Math.abs(currentTime - mobileDateTime) / (1000 * 60);
    
    // Check if mobileTime is today
    const isToday = mobileDateTime.toDateString() === currentTime.toDateString();
    
    if (timeDiffMinutes < 10) {
      return 'green'; // Less than 10 minutes
    } else if (timeDiffMinutes >= 10 && isToday) {
      return 'yellow'; // More than 10 minutes but same day
    } else {
      return 'red'; // More than a day
    }
  } catch (error) {
    console.error('Error parsing mobileTime:', error);
    return 'red';
  }
}

const MARKER_SIZE = 72;
const INFO_GAP_PX = 12;

const NEPALI_MONTHS = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const LiveLocation = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapType, setMapType] = useState("roadmap");
  const [markerIcons, setMarkerIcons] = useState({});
  const [activeUserId, setActiveUserId] = useState(null);
  const mapRef = useRef(null);
  const cameraRef = useRef({ center: defaultCenter, zoom: 8 });
  const { theme } = useContext(ThemeContext);
  const [showFilter, setShowFilter] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterFromBS, setFilterFromBS] = useState("");
  const [filterToBS, setFilterToBS] = useState("");
  const [locationHistory, setLocationHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const navigate = useNavigate();

  // Load Google Maps JS API (replace with your API key)
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDOq5UlrICMQ9rATXRmfMGXkXZPCJEoxgM",
  });

  // Fetch locations with polling
  useEffect(() => {
    let interval;
    const fetchLocations = async () => {
      setError("");
      try {
        const res = await api.get("/location/latest");
        setLocations(res.data.filter(u => u.latestLocation && u.latestLocation.latitude && u.latestLocation.longitude));
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Failed to fetch locations");
      }
      setLoading(false);
    };
    fetchLocations();
    interval = setInterval(fetchLocations, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Generate circular marker icons for users
  useEffect(() => {
    const genIcons = async () => {
      const icons = {};
      await Promise.all(
        locations.map(async (user) => {
          icons[user._id] = await createCircularMarkerIcon(user.profileImage, MARKER_SIZE);
        })
      );
      setMarkerIcons(icons);
    };
    if (locations.length) genIcons();
  }, [locations]);

  // Keep map instance in ref and store camera position
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    cameraRef.current = {
      center: map.getCenter().toJSON(),
      zoom: map.getZoom(),
    };
  }, []);

  // When map is moved, update cameraRef
  const onMapIdle = useCallback(() => {
    if (mapRef.current) {
      cameraRef.current = {
        center: mapRef.current.getCenter().toJSON(),
        zoom: mapRef.current.getZoom(),
      };
    }
  }, []);

  // Theme styles for map type control
  const overlayBg = theme === "dark" ? "#23272b" : "#fff";
  const overlayText = theme === "dark" ? "#fff" : "#111";
  const selectBg = theme === "dark" ? "#23272b" : "#fff";
  const selectText = theme === "dark" ? "#fff" : "#111";
  const selectBorder = theme === "dark" ? "2px solid #fff" : "2px solid #111";
  const overlayShadow = theme === "dark"
    ? "0 4px 16px rgba(255,255,255,0.25)"
    : "0 2px 8px rgba(255,255,255,0.25)";

  // InfoWindow offset: at least 32px above marker
  function getInfoWindowPosition(user) {
    if (!user?.latestLocation) return null;
    // Approximate offset in degrees (latitude): 1px ≈ 0.0000089 deg
    const offsetLat = user.latestLocation.latitude + (INFO_GAP_PX + MARKER_SIZE) * 0.0000089;
    return {
      lat: offsetLat,
      lng: user.latestLocation.longitude
    };
  }

  // Filter popup/modal
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
            {locations.filter(u => u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())).map(user => (
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
            setHistoryLoading(true);
            setHistoryError("");
            setLocationHistory(null);
            // Convert BS to AD
            const fromAD = new BikramSambat(filterFromBS, 'BS').toAD();
            const toAD = new BikramSambat(filterToBS, 'BS').toAD();
            try {
              const res = await api.get(`/location/latestByDate?_id=${selectedUser._id}&from=${fromAD}&to=${toAD}`);
              if (res.data.locations && res.data.locations.length > 0) {
                navigate('/locationhistory', { state: { userList: locations, selectedUser, filterFromBS, filterToBS, locationHistory: res.data } });
              } else {
                setHistoryError('Location not found for given range of date.');
              }
            } catch (err) {
              setHistoryError(err?.response?.data?.message || err?.message || "Failed to fetch location history");
            }
            setHistoryLoading(false);
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

  // Only update markers, don't reload map or reset camera
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
        style={{ top: 72, right: 16, zIndex: 10, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        onClick={() => setShowFilter(true)}
        title="Filter Location History"
      >
        <FaFilter size={20} />
      </button>
      {showFilter && renderFilterPopup()}
      {/* Selected User and Date Range */}
      {locationHistory && selectedUser && (
        <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
          <img src={selectedUser.profileImage} alt={selectedUser.username} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #a4c2f4', background: '#eee' }} />
          <span className="fw-bold" style={{ fontSize: 20 }}>{selectedUser.username}</span>
          <span className="badge bg-secondary" style={{ fontSize: 16, color: '#fff', background: '#444' }}>
            {filterFromBS} - {filterToBS}
          </span>
        </div>
      )}
      {/* Error/Loader/No Data */}
      {historyLoading && <Loader />}
      {historyError && <AnimatedAlert type="error" message={historyError} />}
      {locationHistory && locationHistory.locations && locationHistory.locations.length === 0 && (
        <AnimatedAlert type="error" message="Location not found for given range of date." />
      )}
      {isLoaded && !loading && !error && (
        <div style={{ flex: 1, minHeight: 0, minWidth: 0, height: "100%", width: "100%", display: "flex" }}>
          <GoogleMap
            mapContainerStyle={{ flex: 1, minHeight: 0, minWidth: 0, height: "100%", width: "100%" }}
            center={cameraRef.current.center}
            zoom={cameraRef.current.zoom}
            mapTypeId={mapType}
            onLoad={onMapLoad}
            onIdle={onMapIdle}
            onClick={() => setActiveUserId(null)}
            options={{ mapTypeControl: false, fullscreenControl: false, zoomControl: false, streetViewControl: false, panControl: false, rotateControl: false, scaleControl: false }}
          >
            {locations.map(user =>
              markerIcons[user._id] ? (
                <Marker
                  key={user._id}
                  position={{
                    lat: user.latestLocation.latitude,
                    lng: user.latestLocation.longitude
                  }}
                  icon={markerIcons[user._id]}
                  title={user.username}
                  onClick={() => setActiveUserId(user._id)}
                />
              ) : null
            )}
            {locations.map(user =>
              user._id === activeUserId && user.latestLocation ? (
                <InfoWindow
                  key={user._id}
                  position={getInfoWindowPosition(user)}
                  onCloseClick={() => setActiveUserId(null)}
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
                      // overflow: 'hidden',
                    }}
                  >
                    {/* Time Status Badge */}
                    <div 
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: getTimeBadgeColor(user.latestLocation.mobileTime),
                        border: `2px solid ${theme === 'dark' ? '#11181f' : '#f7faff'}`,
                        zIndex: 3,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    />
                    <button className="infowindow-close-btn" onClick={() => setActiveUserId(null)} aria-label="Close InfoWindow" style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#888', zIndex: 2, borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s, background 0.2s' }}>&#10005;</button>
                    <img src={user.profileImage} alt="Profile" style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", marginBottom: 14, marginTop: 12, border: '2.5px solid #a4c2f4', background: theme === 'dark' ? '#11181f' : '#fff', boxShadow: '0 2px 8px rgba(164,194,244,0.10)' }} />
                    <div className="fw-bold" style={{ fontSize: 21, fontWeight: 700, marginBottom: 18, textAlign: 'center', wordBreak: 'break-word', color: theme === 'dark' ? '#fff' : '#23272b', letterSpacing: 0.2 }}>{user.username}</div>
                    <div className="infowindow-list" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
                                              {[
                          { 
                            icon: <FaClock style={{ color: theme === 'dark' ? '#a4c2f4' : '#1976d2', fontSize: 19 }} />, 
                            label: 'Mobile Time', 
                            value: formatMobileTime(user.latestLocation.mobileTime),
                            isMobileTime: true
                          },
                        { icon: <FaBatteryHalf style={{ color: theme === 'dark' ? '#a4c2f4' : '#1976d2', fontSize: 19 }} />, label: 'Battery', value: user.latestLocation.batteryPercentage + '%' },
                        { icon: <FaWifi style={{ color: theme === 'dark' ? '#a4c2f4' : '#1976d2', fontSize: 19 }} />, label: 'Connectivity', value: user.latestLocation.connectivityType + ' (' + user.latestLocation.connectivityStatus + ')' },
                        { icon: <FaRuler style={{ color: theme === 'dark' ? '#a4c2f4' : '#1976d2', fontSize: 19 }} />, label: 'Distance', value: (user.latestLocation.distance?.toFixed(2) || '0') + ' km' },
                        { icon: <FaBullseye style={{ color: theme === 'dark' ? '#a4c2f4' : '#1976d2', fontSize: 19 }} />, label: 'Accuracy', value: user.latestLocation.accuracy },
                      ].map((item, idx, arr) => {
                        const isMobileTimeRow = item.label === 'Mobile Time';
                        const badgeColor = getTimeBadgeColor(user.latestLocation.mobileTime);
                        const mobileTimeColor = badgeColor === 'green' ? '#10b981' : 
                                               badgeColor === 'yellow' ? '#f59e0b' : 
                                               '#ef4444';
                        
                        return (
                          <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 14, padding: '13px 8px', borderBottom: idx < arr.length - 1 ? `1.5px solid ${theme === 'dark' ? '#232b33' : '#e3eaf2'}` : 'none' }}>
                            <div style={{ width: 28, display: 'flex', justifyContent: 'center' }}>
                              {isMobileTimeRow ? 
                                <FaClock style={{ color: mobileTimeColor, fontSize: 19 }} /> : 
                                item.icon
                              }
                            </div>
                            <div style={{ 
                              flex: 1, 
                              fontSize: 15.5, 
                              fontWeight: 500, 
                              color: isMobileTimeRow ? mobileTimeColor : (theme === 'dark' ? '#a4c2f4' : '#1976d2') 
                            }}>
                              {item.label}
                            </div>
                            <div style={{ 
                              fontSize: 16, 
                              fontWeight: 600, 
                              color: isMobileTimeRow ? mobileTimeColor : (theme === 'dark' ? '#fff' : '#23272b'), 
                              textAlign: 'right', 
                              minWidth: 80 
                            }}>
                              {item.value}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <style>{`
                      .infowindow-modern, .infowindow-dark, .infowindow-light {
                        background: ${theme === 'dark' ? '#11181f' : '#f7faff'} !important;
                        color: ${theme === 'dark' ? '#fff' : '#23272b'} !important;
                        box-shadow: 0 6px 32px rgba(0,0,0,0.45);
                        border-radius: 18px;
                        border: none !important;
                        padding: 0 !important;
                        min-width: 240px;
                        max-width: 340px;
                        // overflow: hidden;
                      }
                      .infowindow-close-btn:hover {
                        color: #e53935 !important;
                        background: rgba(229,57,53,0.08);
                      }
                      .gm-ui-hover-effect {
                        display: none !important;
                      }
                      .gmnoprint, .gm-style-cc, a[href^="https://maps.google.com/maps"], a[href^="https://www.google.com/maps"], .gm-style-cc span {
                        display: none !important;
                      }
                    `}</style>
                  </div>
                </InfoWindow>
              ) : null
            )}
          </GoogleMap>
        </div>
      )}
    </div>
  );
};

export default LiveLocation; 