// Admin Dashboard configuration
const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000"),

  // Environment
  env: import.meta.env.VITE_ENV || "development",
  isDevelopment: import.meta.env.VITE_ENV === "development",
  isProduction: import.meta.env.VITE_ENV === "production",

  // Admin Auth
  loginTimeout: parseInt(import.meta.env.VITE_ADMIN_LOGIN_TIMEOUT || "1800000"), // 30 minutes

  // Cloudinary
  cloudinary: {
    name: import.meta.env.VITE_CLOUDINARY_NAME,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === "true",
    orderManagement: import.meta.env.VITE_ENABLE_ORDER_MANAGEMENT === "true",
    userManagement: import.meta.env.VITE_ENABLE_USER_MANAGEMENT === "true",
  },

  // Charts
  chartLibrary: import.meta.env.VITE_CHART_LIBRARY || "recharts",

  // Pagination
  itemsPerPage: 10,
  maxItemsPerPage: 50,
};

export default config;
