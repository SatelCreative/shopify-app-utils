const { URLSearchParams } = require('url');
const computeHMAC = require('../utils/compute-hmac');

/**
 * Parses the url and validates proxied requests from Shopify
 * @see https://help.shopify.com/en/api/guides/application-proxies
 * @param {Object} options
 * @param {string} options.url
 * @param {string} options.secret
 * @return {boolean}
 * @example
 * // Import
 * import { proxy } from '@satel/shopify-app-utils';
 * const { proxy } = require('@satel/shopify-app-utils');
 * const { validateSignature } = proxy;
 *
 * // Directly
 * const validateSignature = require('@satel/shopify-app-utils/oauth/proxy');
 *
 * // General
 * const valid = validateSignature({ url, secret: 'hush' });
 *
 * // Express
 * app.use(req => {
 *   const valid = validateSignature({ url: req.url, secret: 'hush' });
 * });
 */
const validateSignature = ({ url, secret }) => {
  let params;

  // Ignore empty urls
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Ignore empty secret
  if (!secret || typeof secret !== 'string') {
    return false;
  }

  try {
    params = new URLSearchParams(url.split('?')[1]);
  } catch (e) {
    return false;
  }

  // Extract & remove signature
  const signature = params.get('signature');
  params.delete('signature');

  // Remove `&`, alphabetize, and concat
  const text = Array.from(params.keys())
    .map(key => `${key}=${params.get(key)}`)
    .sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    })
    .join('');

  // Compare hmac
  return (
    computeHMAC({
      text,
      secret,
    }) === signature
  );
};

module.exports = validateSignature;
