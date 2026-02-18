import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import "dotenv/config";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import config from "./config/config.js";

// Route imports
import foodRoute from "./routes/foodRoute.js";
import userRoute from "./routes/userRoute.js";
import cartRoute from "./routes/cartRoute.js";
import orderRoute from "./routes/orderRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import notificationRoute from "./routes/notificationRoute.js";
import promoRoute from "./routes/promoRoute.js";

// Initialize Express app
const app = express();

// Database Connection
connectDB();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(bodyParser.json({ limit: config.maxJsonSize }));
app.use(bodyParser.urlencoded({ limit: config.maxJsonSize, extended: true }));
app.use(express.json({ limit: config.maxJsonSize }));
app.use(express.urlencoded({ limit: config.maxJsonSize, extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// STATIC FILES & ROUTES
// ============================================

// Serve uploaded images
app.use("/images", express.static("uploads"));

// API Routes
app.use("/api/food", foodRoute);
app.use("/api/user", userRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
app.use("/api/review", reviewRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/promo", promoRoute);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Welcome endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "CraveCart API v1.0.0",
    status: "Running",
    documentation: "/api/docs",
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[ERROR] ${statusCode} - ${message}`);
  console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(config.port, () => {
  console.log("================================");
  console.log(`✓ CraveCart Server Started`);
  console.log(`✓ Port: ${config.port}`);
  console.log(`✓ Environment: ${config.nodeEnv}`);
  console.log(`✓ CORS Origin: ${config.corsOrigin}`);
  console.log(`✓ API Base URL: http://localhost:${config.port}/api`);
  console.log("================================");
});
