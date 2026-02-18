import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  logoutUser,
} from "../controllers/userController.js";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";

const userRoute = express.Router();

// Public routes
userRoute.post("/register", registerUser);
userRoute.post("/login", loginUser);

// Protected routes
userRoute.get("/profile", authMiddleware, getUserProfile);
userRoute.put("/profile", authMiddleware, updateUserProfile);
userRoute.post("/change-password", authMiddleware, changePassword);
userRoute.post("/logout", authMiddleware, logoutUser);

export default userRoute;
