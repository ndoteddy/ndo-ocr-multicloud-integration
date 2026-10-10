const crypto = require('crypto');
const env = require('../config/env');

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Still run a comparison of equal-length buffers so the response time
    // doesn't leak the correct key's length.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function apiKeyAuth(req, res, next) {
  const suppliedKey = req.header('x-api-key');

  if (!suppliedKey || !safeEqual(suppliedKey, env.apiKey)) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid API key' });
  }

  return next();
}

module.exports = apiKeyAuth;
