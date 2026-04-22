
const activityLogger = (req, res, next) => {
  const startedAt = new Date().toISOString();

  res.on('finish', () => {
    const logEntry = {
      timestamp: startedAt,
      actor: req.user 
        ? req.user.email || req.user._id.toString()
        : 'Anonymous',
      method: req.method,
      endpoint: req.originalUrl,
      status: res.statusCode
    };

    const line = JSON.stringify(logEntry);

    // Print to console with color (green for success, red for errors)
    const colour = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${colour}[ACTIVITY]\x1b[0m ${line}`);
  });

  next();
};

module.exports = activityLogger;