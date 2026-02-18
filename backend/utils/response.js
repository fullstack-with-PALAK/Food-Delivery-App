// Response formatting utilities for consistent API responses

export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (res, message, statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  });
};

export const sendPaginatedResponse = (
  res,
  message,
  data,
  page,
  limit,
  total,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
    timestamp: new Date().toISOString(),
  });
};

export const sendValidationError = (res, fields = []) => {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: fields.map((field) => ({
      field,
      message: `${field} is required`,
    })),
    timestamp: new Date().toISOString(),
  });
};

export const sendRedirectResponse = (res, message, redirectUrl, statusCode = 302) => {
  res.redirect(statusCode, redirectUrl);
};

export const formatResponse = (data, message = null, statusCode = 200) => {
  return {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    statusCode,
    timestamp: new Date().toISOString(),
  };
};
