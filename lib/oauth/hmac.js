const extractParams = require('../utils/extract-params');
const computeHMAC = require('../utils/compute-hmac');

/**
 * Parses the url and validates the HMAC provided by shopify
 * @see https://help.shopify.com/en/api/getting-started/authentication/oauth#verification
 * @param {Object} options
 * @param {string} options.url
 * @param {string} options.secret
 * @return {boolean}
 * @example
 * // Import
 * import { oauth } from '@satel/shopify-app-utils';
 * const { oauth } = require('@satel/shopify-app-utils');
 * const { validateHMAC } = oauth;
 *
 * // Directly
 * const validateHMAC = require('@satel/shopify-app-utils/oauth/hmac');
 *
 * // General
 * const validHMAC = validateHMAC({ url, secret: 'hush' });
 *
 * // Express
 * app.use(req => {
 *   const validHMAC = validateHMAC({ url: req.url, secret: 'hush' });
 * });
 */
const validateHMAC = ({ url, secret }) => {
  const query = extractParams({ url });

  const hmac = query.get('hmac');
  query.delete('hmac');
  const text = decodeURIComponent(query.toString());

  // URLSearchParams will consistently encode
  // characters regardless of encoded / decoded input
  // In this case shopify generates the hmac after decoding

  // Compare hmac
  return (
    computeHMAC({
      text,
      secret,
    }) === hmac
  );
};

module.exports = validateHMAC;
