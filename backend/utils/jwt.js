// JWT token management utilities

import jwt from "jsonwebtoken";
import config from "../config/config.js";

export class JWTManager {
  // Generate access token
  static generateAccessToken(userId, email, role = "user", expiresIn = config.jwtExpire) {
    return jwt.sign(
      {
        id: userId,
        email,
        role,
        type: "access",
      },
      config.jwtSecret,
      {
        expiresIn,
        algorithm: "HS256",
      }
    );
  }

  // Generate refresh token (longer expiration)
  static generateRefreshToken(userId, email) {
    return jwt.sign(
      {
        id: userId,
        email,
        type: "refresh",
      },
      config.jwtSecret,
      {
        expiresIn: "30d",
        algorithm: "HS256",
      }
    );
  }

  // Generate token pair (access + refresh)
  static generateTokenPair(userId, email, role = "user") {
    return {
      accessToken: this.generateAccessToken(userId, email, role),
      refreshToken: this.generateRefreshToken(userId, email),
    };
  }

  // Verify token
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw {
        message: error.message,
        name: error.name,
      };
    }
  }

  // Decode token without verification
  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  // Check if token is expired
  static isExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return true;
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }

  // Get time until expiration (in seconds)
  static getTimeToExpiry(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return 0;
      return Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
    } catch (error) {
      return 0;
    }
  }

  // Check if token will expire soon (within threshold)
  static isExpiringSoon(token, thresholdSeconds = 300) {
    const timeToExpiry = this.getTimeToExpiry(token);
    return timeToExpiry > 0 && timeToExpiry <= thresholdSeconds;
  }

  // Format token for response
  static formatTokenResponse(accessToken, refreshToken = null) {
    const decoded = jwt.decode(accessToken);
    return {
      accessToken,
      ...(refreshToken && { refreshToken }),
      expiresIn: config.jwtExpire,
      tokenType: "Bearer",
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      },
    };
  }

  // Validate token structure
  static isValidToken(token) {
    if (!token || typeof token !== "string") return false;
    try {
      jwt.verify(token, config.jwtSecret);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default JWTManager;
