// HMAC
const computeHMAC = require('./hmac/hmac');
const validateAuthHMAC = require('./hmac/auth');
const validateProxyHMAC = require('./hmac/proxy');

// GENERAL
const validateShopifyDomain = require('./utils/validate-shopify-domain');

module.exports = {
  computeHMAC,
  validateAuthHMAC,
  validateProxyHMAC,
  validateShopifyDomain,
};
