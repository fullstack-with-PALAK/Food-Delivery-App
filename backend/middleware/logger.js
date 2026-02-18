// Logger middleware for request/response logging

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log incoming request
  console.log(`
📥 ${req.method.toUpperCase()} ${req.path}
   - IP: ${req.ip || req.connection.remoteAddress}
   - User-Agent: ${req.get("user-agent")}
  `);

  // Capture the original send function
  const originalSend = res.send;

  // Override the send function
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log outgoing response
    const statusEmoji = statusCode >= 400 ? "❌" : "✓";
    console.log(`
📤 Response: ${statusCode}
   - Duration: ${duration}ms
   - Method: ${req.method}
   - Path: ${req.path}
  `);

    // Call the original send function
    res.send = originalSend;
    return res.send(data);
  };

  next();
};

export const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  console.error(`
⚠️  ERROR LOG [${timestamp}]
   - Method: ${req.method}
   - Path: ${req.path}
   - Status: ${err.statusCode || 500}
   - Message: ${err.message}
   - Stack: ${err.stack}
  `);

  next(err);
};
