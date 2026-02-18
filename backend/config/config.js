// Backend configuration file
import dotenv from "dotenv";

dotenv.config();

const config = {
  // Server Configuration
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database Configuration
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/cravecart",

  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || "your_jwt_secret_key_here",
  jwtExpire: process.env.JWT_EXPIRE || "7d",

  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  // Stripe Payment Gateway
  stripePublicKey: process.env.STRIPE_PUBLIC_KEY || "pk_test_",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "sk_test_",

  // Cloudinary (Image Upload)
  cloudinary: {
    name: process.env.CLOUDINARY_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Email Configuration
  smtp: {
    service: process.env.EMAIL_SERVICE || "gmail",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
  },

  // Session Configuration
  sessionSecret: process.env.SESSION_SECRET || "your_session_secret_key",

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",

  // API Configuration
  apiTimeout: parseInt(process.env.API_TIMEOUT || "30000"),
  maxRequestSize: "50mb",
  maxJsonSize: "50mb",
};

export default config;
