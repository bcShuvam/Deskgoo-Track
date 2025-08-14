import React, { useEffect, useState, useContext, useRef } from "react";
import api from "../api";
import Loader from "../components/Common/Loader";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader, Polyline } from "@react-google-maps/api";
import AnimatedAlert from "../components/Layout/AnimatedAlert";
import { ThemeContext } from "../context/ThemeContext";
import { FaBatteryHalf, FaWifi, FaClock, FaRuler, FaBullseye, FaFilter, FaPlay, FaPause, FaUndo } from "react-icons/fa";
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

// Helper function to extract date from mobileTime
function getDateFromMobileTime(mobileTime) {
  if (!mobileTime) return '';
  const parts = mobileTime.split(' ');
  return parts.length > 1 ? parts[1] : '';
}

const defaultCenter = { lat: 27.7172, lng: 85.3240 };
const MARKER_SIZE = 72;
const INFO_GAP_PX = 12;

// Helper to create a circular image for marker
function createCircularMarkerIcon(url, size = 72) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  
  // Create circular clipping path
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();
  
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      // Calculate aspect ratio to maintain proportions
      const imgAspectRatio = img.width / img.height;
      const canvasAspectRatio = size / size;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas
        drawHeight = size;
        drawWidth = size * imgAspectRatio;
        offsetX = (size - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller than canvas
        drawWidth = size;
        drawHeight = size / imgAspectRatio;
        offsetX = 0;
        offsetY = (size - drawHeight) / 2;
      }
      
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      resolve({ url: canvas.toDataURL(), scaledSize: { width: size, height: size } });
    };
    img.onerror = function () {
      resolve({ url, scaledSize: { width: size, height: size } });
    };
    img.src = url;
  });
}

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
  const [playPolyline, setPlayPolyline] = useState([]);
  const [markerIcons, setMarkerIcons] = useState({});
  const [showPlaybackControls, setShowPlaybackControls] = useState(true);
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

  // Generate circular marker icons when locationHistory changes
  useEffect(() => {
    const genIcons = async () => {
      if (selectedUser && selectedUser.profileImage) {
        const icons = {};
        icons[selectedUser._id] = await createCircularMarkerIcon(selectedUser.profileImage, MARKER_SIZE);
        setMarkerIcons(icons);
      }
    };
    genIcons();
  }, [selectedUser]);

  // Set initial map center to first location when locationHistory changes
  useEffect(() => {
    if (locationHistory && locationHistory.locations && locationHistory.locations.length > 0) {
      setMapCenter({
        lat: locationHistory.locations[0].latitude,
        lng: locationHistory.locations[0].longitude
      });
    }
  }, [locationHistory]);

  // Map type control theme
  const overlayBg = theme === "dark" ? "#23272b" : "#fff";
  const overlayText = theme === "dark" ? "#fff" : "#111";
  const selectBg = theme === "dark" ? "#23272b" : "#fff";
  const selectText = theme === "dark" ? "#fff" : "#111";
  const selectBorder = theme === "dark" ? "2px solid #fff" : "2px solid #111";
  const overlayShadow = theme === "dark"
    ? "0 4px 16px rgba(255,255,255,0.25)"
    : "0 2px 8px rgba(25, 255, 255, 0.25)";

  // Function to get markers to display based on date changes
  const getMarkersToDisplay = () => {
    if (!locationHistory.locations || locationHistory.locations.length === 0) return [];
    
    const locations = locationHistory.locations;
    const markers = [];
    
    // Always add first marker
    markers.push(0);
    
    // Check for date changes and add markers
    for (let i = 1; i < locations.length; i++) {
      const currentDate = getDateFromMobileTime(locations[i].mobileTime);
      const previousDate = getDateFromMobileTime(locations[i - 1].mobileTime);
      
      if (currentDate !== previousDate) {
        markers.push(i);
      }
    }
    
    // Always add last marker if it's not already included
    if (markers[markers.length - 1] !== locations.length - 1) {
      markers.push(locations.length - 1);
    }
    
    return markers;
  };

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
  const handlePlay = () => {
    if (locationHistory.locations && locationHistory.locations.length > 0) {
      setIsPlaying(true);
      setPlayPolyline([]); // Clear polyline completely
      setPlayIdx(0);
      setMapCenter({
        lat: locationHistory.locations[0].latitude,
        lng: locationHistory.locations[0].longitude
      });
    }
  };
  
  const handlePause = () => setIsPlaying(false);
  
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
            const newIdx = prev + 1;
            setMapCenter({
              lat: locationHistory.locations[newIdx].latitude,
              lng: locationHistory.locations[newIdx].longitude
            });
            
            // Start plotting polyline only when index reaches 1
            if (newIdx >= 1) {
              setPlayPolyline(prevPolyline => {
                // If this is the first point (index 1), start with index 0 and 1
                if (newIdx === 1) {
                  return [
                    { lat: locationHistory.locations[0].latitude, lng: locationHistory.locations[0].longitude },
                    { lat: locationHistory.locations[1].latitude, lng: locationHistory.locations[1].longitude }
                  ];
                } else {
                  // Add the new point to existing polyline
                  return [
                    ...prevPolyline,
                    { lat: locationHistory.locations[newIdx].latitude, lng: locationHistory.locations[newIdx].longitude }
                  ];
                }
              });
            }
            
            return newIdx;
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

  // Progress bar and time calculations
  const total = locationHistory.locations ? locationHistory.locations.length : 0;
  const totalTimeMs = total > 0 ? total * (250 / speed) : 0;
  const playedTimeMs = playIdx !== null ? (playIdx + 1) * (250 / speed) : 0;
  
  // Format time - show mm:ss if less than 1 hour, otherwise hh:mm:ss
  function formatTime(ms) {
    const sec = Math.ceil(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    
    if (h > 0) {
      return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
    } else {
      return [m, s].map(v => String(v).padStart(2, '0')).join(':');
    }
  }
  
  const totalTimeStr = formatTime(totalTimeMs);
  const playedTimeStr = formatTime(playedTimeMs);

  const handleReset = () => {
    setIsPlaying(false);
    setPlayIdx(null);
    setPlayPolyline([]);
    if (locationHistory.locations && locationHistory.locations.length > 0) {
      setMapCenter({
        lat: locationHistory.locations[0].latitude,
        lng: locationHistory.locations[0].longitude
      });
    }
  };

  // Get markers to display based on current state
  const getCurrentMarkers = () => {
    if (!locationHistory.locations) return [];
    
    if (isPlaying && playIdx !== null) {
      // During playback: only show current marker
      return [playIdx];
    } else {
      // When not playing or after completion: show smart markers based on date changes
      return getMarkersToDisplay();
    }
  };

  const currentMarkers = getCurrentMarkers();

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
            zoom={12}
            mapTypeId={mapType}
            options={{ mapTypeControl: false, fullscreenControl: false, zoomControl: false, streetViewControl: false, panControl: false, rotateControl: false, scaleControl: false, backgroundColor: theme === 'dark' ? '#181c22' : '#f7faff' }}
          >
            {/* Markers: show based on current state */}
            {locationHistory.locations && currentMarkers.map(idx => (
              <Marker
                key={locationHistory.locations[idx]._id || idx}
                position={{ 
                  lat: locationHistory.locations[idx].latitude, 
                  lng: locationHistory.locations[idx].longitude 
                }}
                title={`Point ${idx + 1}`}
                onClick={() => setActiveLocIdx(idx)}
                icon={markerIcons[selectedUser?._id]}
              />
            ))}
            {/* Polyline: show progressive path during playback, complete path when not playing */}
            {locationHistory.locations && locationHistory.locations.length > 1 && !isPlaying && (
              <Polyline
                path={locationHistory.locations.map(loc => ({ lat: loc.latitude, lng: loc.longitude }))}
                options={{ strokeColor: theme === 'dark' ? '#a4c2f4' : '#1976d2', strokeOpacity: 0.95, strokeWeight: 5 }}
              />
            )}
            {/* Progressive polyline during playback */}
            {isPlaying && playPolyline.length > 1 && (
              <Polyline
                path={playPolyline}
                options={{ strokeColor: theme === 'dark' ? '#a4c2f4' : '#1976d2', strokeOpacity: 0.95, strokeWeight: 5, icons: [{ icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2, strokeColor: theme === 'dark' ? '#a4c2f4' : '#1976d2' }, offset: '100%' }] }}
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
                    background: theme === 'dark' ? '#232b33' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#23272b',
                    padding: '26px 24px 18px 24px',
                    position: 'relative',
                    fontFamily: 'inherit',
                    fontSize: 15,
                    fontWeight: 400,
                    border: 'none',
                  }}
                >
                  <button className="infowindow-close-btn" onClick={() => setActiveLocIdx(null)} aria-label="Close InfoWindow" style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: theme === 'dark' ? '#a4c2f4' : '#888', zIndex: 2, borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s, background 0.2s' }}>&#10005;</button>
                  <img src={selectedUser.profileImage} alt="Profile" style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", marginBottom: 14, marginTop: 12, border: '2.5px solid #a4c2f4', background: theme === 'dark' ? '#232b33' : '#fff', boxShadow: '0 2px 8px rgba(164,194,244,0.10)' }} />
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
      {/* Enhanced Playback Control Panel */}
      {locationHistory && locationHistory.locations && locationHistory.locations.length > 0 && (
        <div style={{ 
          position: 'absolute', 
          left: '50%', 
          bottom: 32, 
          transform: 'translateX(-50%)', 
          zIndex: 30, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          maxHeight: 'calc(100vh - 64px)',
          overflow: 'hidden'
        }}>
          {/* Arrow Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 20,
            background: theme === 'dark' ? 'rgba(30,34,40,0.98)' : 'rgba(255,255,255,0.98)',
            borderRadius: '20px 20px 0 0',
            border: theme === 'dark' ? '1.5px solid #232b33' : '1.5px solid #e3eaf2',
            borderBottom: 'none',
            boxShadow: theme === 'dark' ? '0 -2px 8px rgba(0,0,0,0.2)' : '0 -2px 8px rgba(44,62,80,0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 31,
            position: 'relative',
            bottom: showPlaybackControls ? 0 : -16
          }} onClick={() => setShowPlaybackControls(!showPlaybackControls)}>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: showPlaybackControls ? '8px solid #a4c2f4' : '8px solid #a4c2f4',
              transform: showPlaybackControls ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }} />
          </div>
          
          {/* Main Control Panel */}
          <div style={{ 
            background: theme === 'dark' ? 'rgba(30,34,40,0.98)' : 'rgba(255,255,255,0.98)', 
            borderRadius: '20px 20px 20px 20px', 
            boxShadow: theme === 'dark' ? '0 4px 24px rgba(0,0,0,0.45), 0 1.5px 6px rgba(164,194,244,0.10)' : '0 2px 12px rgba(44,62,80,0.10), 0 1.5px 6px rgba(164,194,244,0.10)', 
            padding: '12px 20px', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            gap: 12, 
            minWidth: 380, 
            maxWidth: '90vw', 
            border: theme === 'dark' ? '1.5px solid #232b33' : '1.5px solid #e3eaf2',
            backdropFilter: 'blur(10px)',
            transform: showPlaybackControls ? 'translateY(0)' : 'translateY(calc(100% - 20px))',
            opacity: showPlaybackControls ? 1 : 0,
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden'
          }}>
            {/* User Info Section */}
            {locationHistory && selectedUser && (
                              <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                <img 
                  src={selectedUser.profileImage} 
                  alt={selectedUser.username} 
                  style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    border: '2px solid #a4c2f4', 
                    background: theme === 'dark' ? '#232b33' : '#eee', 
                    boxShadow: '0 2px 8px rgba(164,194,244,0.15)' 
                  }} 
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: 18, 
                    color: theme === 'dark' ? '#fff' : '#23272b', 
                    letterSpacing: 0.2,
                    marginBottom: 4,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {selectedUser.username}
                  </div>
                  <div style={{ 
                    fontSize: 14, 
                    color: theme === 'dark' ? '#a4c2f4' : '#1976d2', 
                    fontWeight: 500 
                  }}>
                    {filterFromBS} - {filterToBS}
                  </div>
                </div>
              </div>
            )}
            
                                {/* Visual Divider */}
                    <div style={{
                      width: '100%',
                      height: 1,
                      background: theme === 'dark' ? 'rgba(164,194,244,0.2)' : 'rgba(25,118,210,0.15)',
                      borderRadius: 0.5,
                      margin: '2px 0'
                    }} />
            
            {/* Playback Controls */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10, 
              width: '100%' 
            }}>
              {isPlaying ? (
                <button className="btn btn-light" style={{ 
                  borderRadius: 10, 
                  fontSize: 16, 
                  padding: '10px 14px', 
                  background: theme === 'dark' ? '#232b33' : '#f7faff', 
                  color: theme === 'dark' ? '#a4c2f4' : '#1976d2', 
                  border: 'none', 
                  boxShadow: '0 2px 8px rgba(164,194,244,0.15)',
                  transition: 'all 0.2s ease',
                  minWidth: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }} onClick={handlePause}>
                  <FaPause />
                </button>
              ) : (
                <button className="btn btn-light" style={{ 
                  borderRadius: 10, 
                  fontSize: 16, 
                  padding: '10px 14px', 
                  background: theme === 'dark' ? '#232b33' : '#f7faff', 
                  color: theme === 'dark' ? '#a4c2f4' : '#1976d2', 
                  border: 'none', 
                  boxShadow: '0 2px 8px rgba(164,194,244,0.15)',
                  transition: 'all 0.2s ease',
                  minWidth: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }} onClick={handlePlay} disabled={playIdx === total - 1}>
                  <FaPlay />
                </button>
              )}
              
              <button className="btn btn-light" style={{ 
                borderRadius: 10, 
                fontSize: 14, 
                padding: '10px 14px', 
                background: theme === 'dark' ? '#232b33' : '#f7faff', 
                color: theme === 'dark' ? '#a4c2f4' : '#1976d2', 
                border: 'none', 
                boxShadow: '0 2px 8px rgba(164,194,244,0.15)',
                transition: 'all 0.2s ease',
                minWidth: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} onClick={handleReset} title="Reset">
                <FaUndo />
              </button>
              
              {/* Time Display */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 4,
                minWidth: 60
              }}>
                <span style={{ 
                  fontSize: 14, 
                  color: theme === 'dark' ? '#a4c2f4' : '#555', 
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 600
                }}>
                  {playedTimeStr}
                </span>
                <span style={{ 
                  fontSize: 12, 
                  color: theme === 'dark' ? '#a4c2f4' : '#888', 
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {totalTimeStr}
                </span>
              </div>
              
              {/* Progress Bar */}
              <input
                type="range"
                min={0}
                max={total - 1}
                value={playIdx === null ? 0 : playIdx}
                onChange={handleSlider}
                style={{ 
                  flex: 1, 
                  minWidth: 120, 
                  maxWidth: 200, 
                  accentColor: theme === 'dark' ? '#a4c2f4' : '#1976d2', 
                  background: 'transparent', 
                  borderRadius: 8, 
                  height: 6,
                  cursor: 'pointer'
                }}
              />
              
              {/* Speed Control */}
              <select
                className="form-select form-select-sm"
                style={{ 
                  width: 70, 
                  fontWeight: 600, 
                  background: theme === 'dark' ? '#232b33' : '#fff', 
                  color: theme === 'dark' ? '#a4c2f4' : '#23272b', 
                  border: theme === 'dark' ? '1.5px solid #a4c2f4' : '1.5px solid #1976d2', 
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14
                }}
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
              >
                {speedOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}x</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationHistory; 