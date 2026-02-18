import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { sendError } from "../utils/response.js";

// Main authentication middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return sendError(res, "No authentication token provided", 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    req.userId = decoded.id;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Token has expired", 401);
    }
    if (error.name === "JsonWebTokenError") {
      return sendError(res, "Invalid or malformed token", 401);
    }
    return sendError(res, "Authentication failed", 401, {
      error: error.message,
    });
  }
};

// Admin-only authentication middleware
export const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return sendError(res, "Admin token required", 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    if (decoded.role !== "admin") {
      return sendError(res, "Access denied. Admin privileges required", 403);
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    req.userId = decoded.id;

    next();
  } catch (error) {
    return sendError(res, "Admin authentication failed", 401, {
      error: error.message,
    });
  }
};

// Optional authentication - allows request to continue even without token
export const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      req.userId = decoded.id;
      req.isAuthenticated = true;
    } else {
      req.isAuthenticated = false;
    }

    next();
  } catch (error) {
    req.isAuthenticated = false;
    next();
  }
};

// Helper function to extract token from request
function getTokenFromRequest(req) {
  // Check header
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }
    return authHeader;
  }

  // Check custom header
  if (req.headers.token) {
    return req.headers.token;
  }

  // Check cookie
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  // Check query parameter
  if (req.query.token) {
    return req.query.token;
  }

  return null;
}

// JWT token generation utility
export const generateToken = (userId, email, role = "user") => {
  return jwt.sign(
    {
      id: userId,
      email,
      role,
      iat: Date.now(),
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpire,
    }
  );
};

// JWT token verification utility
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

// Refresh token helper
export const refreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret, { ignoreExpiration: true });
    return generateToken(decoded.id, decoded.email, decoded.role);
  } catch (error) {
    return null;
  }
};

// Check token expiration
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded) return true;
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};
