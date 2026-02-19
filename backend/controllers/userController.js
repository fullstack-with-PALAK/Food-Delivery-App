import { userQuery } from "../config/supabaseHelpers.js";
import { sendSuccess, sendError, sendValidationError } from "../utils/response.js";
import { validateEmail, validatePassword, validateRequired } from "../utils/validation.js";
import { JWTManager } from "../utils/jwt.js";
import { PasswordManager } from "../utils/password.js";
import validator from "validator";

// ============== AUTHENTICATION CONTROLLERS ==============

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate required fields
    const validation = validateRequired({ name, email, password });
    if (!validation.valid) {
      return sendValidationError(res, validation.missing);
    }

    // Validate email format
    if (!validateEmail(email) || !validator.isEmail(email)) {
      return sendError(res, "Invalid email format", 400);
    }

    // Validate password strength
    const passwordValidation = PasswordManager.validatePassword(password);
    if (!passwordValidation.valid) {
      return sendError(res, "Password does not meet requirements", 400, {
        errors: passwordValidation.errors,
      });
    }

    // Check password and confirm password match
    if (password !== confirmPassword) {
      return sendError(res, "Passwords do not match", 400);
    }

    // Check if user already exists
    const { data: existingUser, error: findError } = await userQuery.findByEmail(email);
    if (!findError && existingUser) {
      return sendError(res, "Email already registered. Please login instead.", 409);
    }

    // Hash password
    const hashedPassword = await PasswordManager.hashPassword(password);

    // Create new user in Supabase
    const { data: newUser, error: createError } = await userQuery.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
      created_at: new Date(),
    });

    if (createError) {
      return sendError(res, "Failed to create user", 500, { error: createError.message });
    }

    // Generate token pair
    const tokenPair = JWTManager.generateTokenPair(newUser.id, newUser.email, newUser.role);

    // Return success response
    return sendSuccess(res, "User registered successfully", {
      ...JWTManager.formatTokenResponse(tokenPair.accessToken, tokenPair.refreshToken),
    }, 201);
  } catch (error) {
    console.error("Register error:", error);
    return sendError(res, "Registration failed", 500, { error: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const validation = validateRequired({ email, password });
    if (!validation.valid) {
      return sendValidationError(res, validation.missing);
    }

    // Validate email format
    if (!validateEmail(email)) {
      return sendError(res, "Invalid email format", 400);
    }

    // Find user by email
    const { data: user, error } = await userQuery.findByEmail(email);
    if (error || !user) {
      return sendError(res, "User not found. Please register first.", 404);
    }

    // Compare password
    const isPasswordCorrect = await PasswordManager.comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return sendError(res, "Invalid credentials", 401);
    }

    // Update last login
    await userQuery.update(user.id, {
      last_login: new Date(),
      updated_at: new Date(),
    });

    // Generate token pair
    const tokenPair = JWTManager.generateTokenPair(user.id, user.email, user.role);

    // Return success response
    return sendSuccess(res, "Login successful", {
      ...JWTManager.formatTokenResponse(tokenPair.accessToken, tokenPair.refreshToken),
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, "Login failed", 500, { error: error.message });
  }
};

// ============== USER PROFILE CONTROLLERS ==============

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return sendError(res, "User ID not found in request", 400);
    }

    const { data: user, error } = await userQuery.findById(userId);

    if (error || !user) {
      return sendError(res, "User not found", 404);
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return sendSuccess(res, "Profile retrieved successfully", userWithoutPassword);
  } catch (error) {
    console.error("Get profile error:", error);
    return sendError(res, "Failed to retrieve profile", 500, { error: error.message });
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, address } = req.body;

    if (!userId) {
      return sendError(res, "User ID not found in request", 400);
    }

    // First verify user exists
    const { data: user, error: findError } = await userQuery.findById(userId);
    if (findError || !user) {
      return sendError(res, "User not found", 404);
    }

    // Prepare update object
    const updates = { updated_at: new Date() };
    if (name) updates.name = name.trim();
    if (phone) updates.phone = phone.trim();
    if (address) updates.address = address;

    // Update user
    const { data: updatedUser, error: updateError } = await userQuery.update(userId, updates);

    if (updateError) {
      return sendError(res, "Failed to update profile", 500, { error: updateError.message });
    }

    return sendSuccess(res, "Profile updated successfully", {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return sendError(res, "Failed to update profile", 500, { error: error.message });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const validation = validateRequired({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!validation.valid) {
      return sendValidationError(res, validation.missing);
    }

    // Get user by ID
    const { data: user, error: findError } = await userQuery.findById(userId);

    if (findError || !user) {
      return sendError(res, "User not found", 404);
    }

    // Verify current password
    const isPasswordCorrect = await PasswordManager.comparePassword(currentPassword, user.password);

    if (!isPasswordCorrect) {
      return sendError(res, "Current password is incorrect", 401);
    }

    // Validate new passwords match
    if (newPassword !== confirmPassword) {
      return sendError(res, "Passwords do not match", 400);
    }

    // Validate new password strength
    const passwordValidation = PasswordManager.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return sendError(res, "New password does not meet requirements", 400, {
        errors: passwordValidation.errors,
      });
    }

    // Hash new password
    const hashedPassword = await PasswordManager.hashPassword(newPassword);

    // Update password in Supabase
    const { error: updateError } = await userQuery.update(userId, {
      password: hashedPassword,
      updated_at: new Date(),
    });

    if (updateError) {
      return sendError(res, "Failed to update password", 500, { error: updateError.message });
    }

    return sendSuccess(res, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return sendError(res, "Failed to change password", 500, { error: error.message });
  }
};

// Logout User (token invalidation handled on client side)
export const logoutUser = async (req, res) => {
  try {
    return sendSuccess(res, "Logged out successfully");
  } catch (error) {
    return sendError(res, "Logout failed", 500, { error: error.message });
  }
};
