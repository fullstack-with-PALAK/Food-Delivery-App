// Frontend configuration
const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000"),

  // Environment
  env: import.meta.env.VITE_ENV || "development",
  isDevelopment: import.meta.env.VITE_ENV === "development",
  isProduction: import.meta.env.VITE_ENV === "production",

  // Payment
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,

  // Cloudinary
  cloudinary: {
    name: import.meta.env.VITE_CLOUDINARY_NAME,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  },

  // Feature Flags
  features: {
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === "true",
    reviews: import.meta.env.VITE_ENABLE_REVIEWS === "true",
    wishlist: import.meta.env.VITE_ENABLE_WISHLIST === "true",
    promoCodes: import.meta.env.VITE_ENABLE_PROMO_CODES === "true",
  },

  // Session
  sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || "3600000"), // 1 hour
};

export default config;
