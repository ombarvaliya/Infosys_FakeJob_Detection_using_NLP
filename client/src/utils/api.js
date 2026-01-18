import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // If data is FormData, remove Content-Type to let axios set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

export const authAPI = {
  registerRequest: (data) => api.post("/auth/register-request", data),
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data)
};

export const predictionsAPI = {
  predict: (data) => api.post("/predictions/predict", data),
  predictImage: (formData) => api.post("/predictions/predict-image", formData),
  getHistory: () => api.get("/predictions/history"),
  getDetails: (id) => api.get(`/predictions/${id}`),
  clearHistory: () => api.delete("/predictions/history")
};

export const usersAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  getStats: () => api.get("/users/stats"),
  changePassword: (data) => api.put("/users/change-password", data)
};

export const adminAPI = {
  getUsers: () => api.get("/admin/users"),
  getNoActivityUsers: () => api.get("/admin/users/no-activity/list"),
  getUserActivity: (id) => api.get(`/admin/users/${id}/activity`),
  deactivateUser: (id) => api.put(`/admin/users/${id}/deactivate`),
  activateUser: (id) => api.put(`/admin/users/${id}/activate`),
  promoteUser: (id) => api.put(`/admin/users/${id}/promote`),
  demoteUser: (id) => api.put(`/admin/users/${id}/demote`),
  getDashboardStats: () => api.get("/admin/dashboard/stats"),
  getDailyStats: (days = 30) => api.get(`/admin/dashboard/daily-stats?days=${days}`),
  getRecentActivity: () => api.get("/admin/activity/recent"),
  getJobDetails: (id) => api.get(`/admin/job-details/${id}`),
  getFlaggedPosts: (status) => api.get(`/admin/flagged-posts${status ? `?status=${status}` : ""}`),
  updateFlaggedPostStatus: (id, data) => api.put(`/admin/flagged-posts/${id}/status`, data),
  getFeedback: (status, type) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (type) params.append("type", type);
    return api.get(`/admin/feedback?${params.toString()}`);
  },
  updateFeedbackStatus: (id, data) => api.put(`/admin/feedback/${id}/status`, data)
};

export const feedbackAPI = {
  submitFeedback: (data) => api.post("/feedback/submit", data),
  getMyFeedback: () => api.get("/feedback/my-feedback"),
  flagPrediction: (id, reason) => api.post(`/feedback/flag-prediction/${id}`, { reason }),
  unflagPrediction: (id) => api.post(`/feedback/unflag-prediction/${id}`)
};

export default api;
