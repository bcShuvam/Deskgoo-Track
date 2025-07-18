import React, { useEffect, useState } from "react";
import api from "../api";
import Loader from "../components/Common/Loader";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import AnimatedAlert from "../components/Layout/AnimatedAlert";
import "../App.css";
import "animate.css";

const containerStyle = {
  width: "100%",
  height: "70vh",
  minHeight: 400,
  borderRadius: 12,
};

const defaultCenter = { lat: 27.7172, lng: 85.3240 };

const LiveLocation = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load Google Maps JS API (replace with your API key)
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyD-REPLACE_WITH_YOUR_KEY", // TODO: Replace with your key
  });

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
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
  }, []);

  return (
    <div className="container-fluid px-0 animate__animated animate__fadeIn" style={{ minHeight: "100vh", width: "100vw" }}>
      <div className="row justify-content-center">
        <div className="col-12">
          <h2 className="mb-2 mt-4 text-center">Live Location</h2>
          <p className="text-muted text-center mb-4" style={{ maxWidth: 600, margin: "0 auto" }}>
            View the current live location of all users on the map below.
          </p>
          {loading && <Loader />}
          {error && <AnimatedAlert type="error" message={error} />}
          {isLoaded && !loading && !error && (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={locations.length ? {
                lat: locations[0].latestLocation.latitude,
                lng: locations[0].latestLocation.longitude
              } : defaultCenter}
              zoom={8}
            >
              {locations.map(user => (
                <Marker
                  key={user._id}
                  position={{
                    lat: user.latestLocation.latitude,
                    lng: user.latestLocation.longitude
                  }}
                  icon={{
                    url: user.profileImage,
                    scaledSize: { width: 48, height: 48 },
                  }}
                  title={user.username}
                />
              ))}
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveLocation;
