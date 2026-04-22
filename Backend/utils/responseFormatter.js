

const formatResponse = (statusCode, message, data = null, errors = null) => {
  return {
    status: statusCode >= 400 ? "error" : "success",
    statusCode,
    message,
    data,
    errors,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Success response (2xx)
 * @param {string} message - Response message
 * @param {*} data - Response data
 * @returns {object} Formatted response
 */
const successResponse = (statusCode, message, data = null) => {
  return formatResponse(statusCode, message, data, null);
};

/**
 * Error response (4xx, 5xx)
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {array} errors - Validation or specific errors
 * @returns {object} Formatted response
 */
const errorResponse = (statusCode, message, errors = null) => {
  return formatResponse(statusCode, message, null, errors);
};

module.exports = {
  formatResponse,
  successResponse,
  errorResponse,
};
