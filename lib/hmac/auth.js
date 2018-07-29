const { URLSearchParams } = require('url');
const computeHMAC = require('./hmac');

/**
 * Parses the url and validates the HMAC provided by shopify
 * @see https://help.shopify.com/en/api/getting-started/authentication/oauth#verification
 * @param {Object} options
 * @param {string} options.url
 * @param {string} options.secret
 * @return {boolean}
 * @example
 * // General
 * const validHMAC = validateAuthHMAC({ url, secret: 'hush' });
 *
 * // Express
 * app.get('*', req => {
 *   const validHMAC = validateAuthHMAC({ url: req.url, secret: 'hush' });
 * });
 */
const validateAuthHMAC = ({ url, secret }) => {
  let params;

  try {
    params = new URLSearchParams(url.split('?')[1]);
  } catch (e) {
    return false;
  }

  const hmac = params.get('hmac');
  params.delete('hmac');
  const text = params.toString();

  // Compare hmac
  return (
    computeHMAC({
      text,
      secret,
    }) === hmac
  );
};

module.exports = validateAuthHMAC;
