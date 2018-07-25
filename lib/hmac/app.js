const { URLSearchParams } = require('url');
const validateHMAC = require('./hmac');

/**
 * TODO
 */
const appHMACMiddleware = ({ secret }) => (req, _, next) => {
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

module.exports = appHMACMiddleware;
