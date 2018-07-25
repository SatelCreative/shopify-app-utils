const crypto = require('crypto');

/**
 * Produces a hex encoded Sha256 hmac
 * @param {Object} options
 * @param {string} options.text
 * @param {string} options.secret
 * @return {string}
 * @example
 * const hash = computeHMAC({
 *   text: 'message',
 *   secret: 'hush',
 * });
 */
const computeHMAC = ({ text, secret }) =>
  crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');

module.exports = computeHMAC;
