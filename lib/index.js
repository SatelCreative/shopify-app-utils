// OAUTH
const parseRequest = require('./oauth/parse-request');

// HMAC
const computeHMAC = require('./hmac/hmac');
const validateAuthHMAC = require('./hmac/auth');
const validateProxyHMAC = require('./hmac/proxy');

// UTIL
const validateDomain = require('./utils/validate-domain');
const validateTimestamp = require('./utils/validate-timestamp');
const generateJSRedirect = require('./utils/generate-js-redirect');

module.exports = {
  parseRequest,
  computeHMAC,
  validateAuthHMAC,
  validateProxyHMAC,
  validateDomain,
  validateTimestamp,
  generateJSRedirect,
};
