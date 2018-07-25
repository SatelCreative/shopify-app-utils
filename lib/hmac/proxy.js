const hmac = require('./hmac');

/**
 * Express style middleware for validating proxied requests from Shopify. It will set a `validSignature` flag on the express `request` object
 * @see https://help.shopify.com/en/api/guides/application-proxies
 * @param {Object} options
 * @param {string} options.secret
 * @example
 * app.use(proxyHMACMiddleware({
 *   secret: 'hush',
 * }));
 *
 * app.get('*', req => {
 *   if (req.validSignature !== true) {
 *     // Forged request
 *   }
 *   // From Shopify
 * });
 */
const proxyHMACMiddleware = ({ secret }) => (req, _, next) => {
  const { query } = req;
  const { signature } = query;

  // Ensure signature exists
  if (typeof signature !== 'string') {
    req.validSignature = false;
    next();
    return;
  }

  /*
   * Generate hmac text per
   * https://help.shopify.com/en/api/guides/application-proxies
   * 1. Remove signature
   * 2. Loop through object keys
   * 3. Transform to key=value
   * 4. Sort alphabetically
   * 5. Join
   */
  delete query.signature;
  const text = Object.keys(query)
    .map(key => `${key}=${query[key]}`)
    .sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    })
    .join('');

  // Compare hmac & Set flag
  req.validSignature =
    hmac({
      text,
      secret,
    }) === signature;
  next();
};

module.exports = proxyHMACMiddleware;
