import userModel from "../models/userModel.js";
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
    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, "Email already registered. Please login instead.", 409);
    }

    // Hash password
    const hashedPassword = await PasswordManager.hashPassword(password);

    // Create new user
    const newUser = new userModel({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
    });

    await newUser.save();

    // Generate token pair
    const tokenPair = JWTManager.generateTokenPair(
      newUser._id,
      newUser.email,
      newUser.role
    );

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

    // Find user
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, "User not found. Please register first.", 404);
    }

    // Compare password
    const isPasswordCorrect = await PasswordManager.comparePassword(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return sendError(res, "Invalid credentials", 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token pair
    const tokenPair = JWTManager.generateTokenPair(
      user._id,
      user.email,
      user.role
    );

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

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, "Profile retrieved successfully", user);
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

    const user = await userModel.findById(userId);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Update allowed fields
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (address) user.address = address;

    user.updatedAt = new Date();
    await user.save();

    return sendSuccess(res, "Profile updated successfully", {
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
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

    const user = await userModel.findById(userId);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Verify current password
    const isPasswordCorrect = await PasswordManager.comparePassword(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return sendError(res, "Current password is incorrect", 401);
    }

    // Validate new password
    if (newPassword !== confirmPassword) {
      return sendError(res, "Passwords do not match", 400);
    }

    const passwordValidation = PasswordManager.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return sendError(res, "New password does not meet requirements", 400, {
        errors: passwordValidation.errors,
      });
    }

    // Hash and save new password
    user.password = await PasswordManager.hashPassword(newPassword);
    user.updatedAt = new Date();
    await user.save();

    return sendSuccess(res, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return sendError(res, "Failed to change password", 500, { error: error.message });
  }
};

// Logout User (optional - token invalidation on client side)
export const logoutUser = async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    return sendSuccess(res, "Logged out successfully");
  } catch (error) {
    return sendError(res, "Logout failed", 500, { error: error.message });
  }
};
        success: false,
        message: "Please enter strong password",
      });
    }

    // hashing user password

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const role=user.role;
    const token = createToken(user._id);
    res.json({ success: true, token, role});
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { loginUser, registerUser };
