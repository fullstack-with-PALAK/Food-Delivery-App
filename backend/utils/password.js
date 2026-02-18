// Password management utilities

import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export class PasswordManager {
  // Hash password
  static async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      throw new Error(`Error hashing password: ${error.message}`);
    }
  }

  // Compare password with hash
  static async comparePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error(`Error comparing password: ${error.message}`);
    }
  }

  // Check password strength
  static checkPasswordStrength(password) {
    const strength = {
      score: 0,
      level: "weak",
      feedback: [],
    };

    if (!password || password.length === 0) {
      strength.feedback.push("Password is required");
      return strength;
    }

    if (password.length >= 8) strength.score++;
    else strength.feedback.push("Password should be at least 8 characters");

    if (password.length >= 12) strength.score++;

    if (/[a-z]/.test(password)) strength.score++;
    else strength.feedback.push("Add lowercase letters");

    if (/[A-Z]/.test(password)) strength.score++;
    else strength.feedback.push("Add uppercase letters");

    if (/\d/.test(password)) strength.score++;
    else strength.feedback.push("Add numbers");

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      strength.score++;
    } else {
      strength.feedback.push("Add special characters");
    }

    if (strength.score <= 2) {
      strength.level = "weak";
    } else if (strength.score <= 4) {
      strength.level = "medium";
    } else {
      strength.level = "strong";
    }

    return strength;
  }

  // Generate random password
  static generateRandomPassword(length = 12) {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}';:\"\\|,.<>/?";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Validate password requirements
  static validatePassword(password) {
    const errors = [];

    if (!password || password.length === 0) {
      errors.push("Password is required");
    }

    if (password && password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (password && password.length > 128) {
      errors.push("Password must not exceed 128 characters");
    }

    if (password && !/[a-z]/.test(password)) {
      errors.push("Password must contain lowercase letters");
    }

    if (password && !/[A-Z]/.test(password)) {
      errors.push("Password must contain uppercase letters");
    }

    if (password && !/\d/.test(password)) {
      errors.push("Password must contain numbers");
    }

    if (password && /\s/.test(password)) {
      errors.push("Password must not contain whitespace");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default PasswordManager;
