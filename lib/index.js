// INTEGRATED
const createOAuth = require('./integrated/create-oauth');

// OAUTH
const parseRequest = require('./oauth/parse-request');
const generateRedirect = require('./oauth/generate-redirect');
const handleCallback = require('./oauth/handle-callback');

// HMAC
const computeHMAC = require('./hmac/hmac');
const validateAuthHMAC = require('./hmac/auth');
const validateProxyHMAC = require('./hmac/proxy');

// UTIL
const validateDomain = require('./utils/validate-domain');
const validateTimestamp = require('./utils/validate-timestamp');
const generateJSRedirect = require('./utils/generate-js-redirect');

module.exports = {
  createOAuth,
  parseRequest,
  generateRedirect,
  handleCallback,
  computeHMAC,
  validateAuthHMAC,
  validateProxyHMAC,
  validateDomain,
  validateTimestamp,
  generateJSRedirect,
};
