'use strict';

// A small error type that carries an HTTP status code.
class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Wrap async route handlers so thrown errors reach the error middleware.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) console.error('[error]', err);
  const body = { error: err.message || 'Internal server error' };
  if (err.details) body.details = err.details;
  res.status(status).json(body);
}

module.exports = { ApiError, asyncHandler, notFound, errorHandler };
