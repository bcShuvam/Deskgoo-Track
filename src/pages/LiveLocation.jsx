import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import api from "../api";
import Loader from "../components/Common/Loader";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import AnimatedAlert from "../components/Layout/AnimatedAlert";
import { ThemeContext } from "../context/ThemeContext";
import { FaBatteryHalf, FaWifi, FaClock, FaRuler, FaBullseye } from "react-icons/fa";
import "../App.css";
import "animate.css";

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

const MARKER_SIZE = 72;
const INFO_GAP_PX = 12;

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
      {loading && <Loader />}
      {error && <AnimatedAlert type="error" message={error} />}
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
                  onClick={() => setActiveUserId(activeUserId === user._id ? null : user._id)}
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
                  <div className={`infowindow-content ${theme === 'dark' ? 'infowindow-dark' : 'infowindow-light'}`} style={{ minWidth: 240, fontSize: 15, height: 'auto', background: 'none', boxShadow: 'none', padding: 12 }}>
                    <div className="d-flex flex-column align-items-center mb-3">
                      <img src={user.profileImage} alt="Profile" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", marginBottom: 8, border: '2px solid #a4c2f4' }} />
                      <div className="fw-bold" style={{ fontSize: 18 }}>{user.username}</div>
                    </div>
                    <div className="infowindow-row">
                      <span className="infowindow-label"><FaBatteryHalf style={{ marginRight: 6 }} />Battery</span>
                      <span className="infowindow-value">{user.latestLocation.batteryPercentage}%</span>
                    </div>
                    <div className="infowindow-row">
                      <span className="infowindow-label"><FaWifi style={{ marginRight: 6 }} />Connectivity</span>
                      <span className="infowindow-value">{user.latestLocation.connectivityType} ({user.latestLocation.connectivityStatus})</span>
                    </div>
                    <div className="infowindow-row">
                      <span className="infowindow-label"><FaClock style={{ marginRight: 6 }} />Mobile Time</span>
                      <span className="infowindow-value">{formatMobileTime(user.latestLocation.mobileTime)}</span>
                    </div>
                    <div className="infowindow-row">
                      <span className="infowindow-label"><FaRuler style={{ marginRight: 6 }} />Distance</span>
                      <span className="infowindow-value">{user.latestLocation.distance?.toFixed(2)} km</span>
                    </div>
                    <div className="infowindow-row">
                      <span className="infowindow-label"><FaBullseye style={{ marginRight: 6 }} />Accuracy</span>
                      <span className="infowindow-value">{user.latestLocation.accuracy}</span>
                    </div>
                    <style>{`
                      .infowindow-content {
                        background: ${theme === 'dark' ? '#23272b' : '#fff'} !important;
                        color: ${theme === 'dark' ? '#fff' : '#222'} !important;
                        border-radius: 14px;
                        box-shadow: 0 4px 24px rgba(44,62,80,0.12);
                        padding: 12px !important;
                        font-family: inherit;
                        min-height: unset !important;
                        height: auto !important;
                      }
                      .infowindow-dark {
                        background: #23272b !important;
                        color: #fff !important;
                      }
                      .infowindow-light {
                        background: #fff !important;
                        color: #222 !important;
                      }
                      .gm-style-iw-d {
                        background: transparent !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                      }
                      .gm-style-iw {
                        background: transparent !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                      }
                      .infowindow-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 10px;
                        margin-bottom: 7px;
                        font-size: 15px;
                      }
                      .infowindow-label {
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        color: ${theme === 'dark' ? '#a4c2f4' : '#1976d2'};
                      }
                      .infowindow-value {
                        font-weight: 500;
                        color: ${theme === 'dark' ? '#fff' : '#222'};
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