/**
 * activityLogger.js
 * Middleware that logs every POST and PATCH request as a structured JSON entry
 * to both the console and an append-only activity.log file.
 */

const fs   = require('fs');
const path = require('path');

// Log file path — sits at Backend/logs/activity.log
const LOG_DIR  = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'activity.log');

// Ensure the logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Build a sanitised copy of the request body with passwords redacted.
 */
function sanitiseBody(body) {
  if (!body || typeof body !== 'object') return body;
  const safe = { ...body };
  ['password', 'confirmPassword', 'token'].forEach(key => {
    if (key in safe) safe[key] = '***REDACTED***';
  });
  return safe;
}

/**
 * activityLogger middleware
 * Intercepts POST and PATCH requests, captures the response body,
 * then writes a JSON log entry once the response finishes.
 */
const activityLogger = (req, res, next) => {
  const METHOD = req.method.toUpperCase();
  if (METHOD !== 'POST' && METHOD !== 'PATCH') return next();

  const startedAt = new Date().toISOString();
  const startMs   = Date.now();

  // Capture the original json() send method so we can intercept the body
  const originalJson = res.json.bind(res);
  let responseBody   = null;

  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

  res.on('finish', () => {
    const durationMs = Date.now() - startMs;

    const logEntry = {
      timestamp:    startedAt,
      method:       METHOD,
      url:          req.originalUrl,
      statusCode:   res.statusCode,
      durationMs,
      actor: req.user
        ? { id: req.user._id, email: req.user.email, role: req.user.role }
        : null,
      requestBody:  sanitiseBody(req.body),
      responseBody: (() => {
        if (!responseBody || typeof responseBody !== 'object') return responseBody;
        const safe = { ...responseBody };
        if (safe.token) safe.token = '***REDACTED***';
        return safe;
      })(),
    };

    const line = JSON.stringify(logEntry);

    // Print to console (coloured for readability)
    const colour = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${colour}[ACTIVITY LOG]\x1b[0m ${line}`);

    // Append to file (non-blocking)
    fs.appendFile(LOG_FILE, line + '\n', err => {
      if (err) console.error('[ACTIVITY LOG] Failed to write to log file:', err.message);
    });
  });

  next();
};

module.exports = activityLogger;
