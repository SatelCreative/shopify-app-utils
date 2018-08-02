/**
 * Checks if a string is a valid `.myshopify.com` domain (exclude the protocol)
 * @param {Object} options
 * @param {string} options.shop
 * @return {boolean}
 * @example
 * const validDomain = validateDomain({ shop: 'my-shop.myshopify.com' });
 */
const validateDomain = ({ shop }) =>
  // eslint-disable-next-line no-useless-escape
  !!shop && shop.match(/^[-a-zA-Z0-9\.]{2,256}\.myshopify.com$/gi) !== null;

module.exports = validateDomain;
