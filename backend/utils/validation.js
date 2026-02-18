// Validation utilities

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateZipCode = (zipCode) => {
  const zipRegex = /^\d{5,6}$/;
  return zipRegex.test(zipCode);
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const validateObjectId = (id) => {
  return id.match(/^[0-9a-fA-F]{24}$/) !== null;
};

export const validatePaymentAmount = (amount) => {
  return typeof amount === "number" && amount > 0 && amount <= 999999.99;
};

export const validateRating = (rating) => {
  return typeof rating === "number" && rating >= 0 && rating <= 5;
};

export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  
  // Remove special characters that could be used for injection attacks
  return input.trim().replace(/[<>\"']/g, "");
};

export const validateRequired = (fields) => {
  const missing = [];
  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      missing.push(key);
    }
  }
  return missing.length === 0 ? { valid: true } : { valid: false, missing };
};

export const validatePagination = (page, limit) => {
  const p = parseInt(page) || 1;
  const l = parseInt(limit) || 10;
  
  return {
    valid: p > 0 && l > 0 && l <= 100,
    page: Math.max(1, p),
    limit: Math.min(100, Math.max(1, l)),
    skip: (p - 1) * l,
  };
};
