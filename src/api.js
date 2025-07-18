import axios from "axios";

const api = axios.create({
  baseURL: "http://202.51.3.49:8002/api",
});

// Attach token and user id to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user"));
  if (token && user?._id) {
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["x-user-id"] = user._id;
  }
  return config;
});

// Redirect to login on 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 403].includes(error.response?.status)) {
      localStorage.clear();
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;
