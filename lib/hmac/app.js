const { URLSearchParams } = require('url');
const validateHMAC = require('./hmac');

/**
 * Express style middleware for validating auth related calls from Shopify. It will set a `validSignature` flag on the express `request` object
 * @see https://help.shopify.com/en/api/getting-started/authentication/oauth#verification
 * @param {Object} options
 * @param {string} options.secret
 * @example
 * app.use(authHMACMiddleware({
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
const authHMACMiddleware = ({ secret }) => (req, _, next) => {
  const { hmac } = req.query;

  // Ensure signature exists
  if (typeof hmac !== 'string') {
    req.validSignature = false;
    next();
    return;
  }

  /*
   * Generate hmac text per
   * https://help.shopify.com/en/api/getting-started/authentication/oauth#verification
   * 1. Get raw query (to preserve order)
   * 2. Remove hmac
   */
  const params = new URLSearchParams(req.url.split('?')[1]);
  params.delete('hmac');
  const text = params.toString();

  // Compare hmac & Set flag
  req.validSignature =
    validateHMAC({
      text,
      secret,
    }) === hmac;
  next();
};

module.exports = authHMACMiddleware;
