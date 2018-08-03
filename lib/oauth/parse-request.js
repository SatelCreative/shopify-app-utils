const { URLSearchParams } = require('url');
const validateHMAC = require('./hmac');
const validateDomain = require('../utils/validate-domain');
const validateTimestamp = require('../utils/validate-timestamp');

/**
 * @typedef {Object} ParsedRequest
 * @property {string} shop
 * @property {boolean} malformed
 * @property {boolean} fromShopify
 */
const response = {
  shop: '',
  malformed: false,
  fromShopify: false,
};

/**
 * Parses a url and makes determining the next step more user friendly. Handles validation of shop, hmac, and timestamp
 * @param {Object} options
 * @param {string} options.url
 * @param {string} options.secret
 * @param {string} [options.margin=60]
 * @return {ParsedRequest}
 * @example
 *const { shop, malformed, fromShopify } = parseRequest({
 *  url: req.url,
 *  secret: SHARED_SECRET,
 *});
 *
 *if (fromShopify) {
 *  // App store install or returning user
 *}
 *
 *if (shop && !malformed) {
 *  // Unlisted installation
 *}
 *
 *if (!shop && !malformed) {
 *  // Homepage
 *}
 *
 * // etc
 */
const parseRequest = ({ url: rawURL, secret, margin = 60 }) => {
  // @TODO validation

  // Parse url
  let params;
  try {
    const query = rawURL.split('?')[1];

    if (!query) {
      return { ...response };
    }

    params = new URLSearchParams(query);
  } catch (e) {
    return { ...response, malformed: true };
  }

  // Extract query params
  const shop = params.get('shop');
  const hmac = params.get('hmac');
  const timestamp = params.get('timestamp');

  const validShop = validateDomain({ shop });
  const validHMAC = validateHMAC({ url: rawURL, secret });
  const validTimestamp = validateTimestamp({ timestamp, margin });
  const fromShopify = validShop && validHMAC && validTimestamp;

  let malformed = true;
  if (fromShopify) {
    malformed = false;
  } else if (validShop && !hmac && !timestamp) {
    malformed = false;
  }

  return {
    shop,
    malformed,
    fromShopify,
  };
};

module.exports = parseRequest;
