const crypto = require('crypto');

/**
 * Produces a hex encoded Sha256 hmac
 * @param {string} text
 * @param {string} secret
 * @return {string}
 */
const hmac = ({ text, secret }) =>
  crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');

module.exports = hmac;
