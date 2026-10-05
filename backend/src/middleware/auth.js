'use strict';

const { verifyToken } = require('../utils/jwt');
const { ApiError } = require('./error');

// Requires a valid "Authorization: Bearer <token>" header.
// On success, sets req.auth = { userId, email }.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Missing or malformed Authorization header'));
  }
  try {
    const payload = verifyToken(token);
    req.auth = { userId: payload.sub, email: payload.email };
    next();
  } catch (e) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = { requireAuth };
