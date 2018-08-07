const { URLSearchParams } = require('url');
const generateJSRedirect = require('../utils/generate-js-redirect');

/**
 * Generates the url / html based redirect to start the oauth2 process
 * @param {Object} options
 * @param {string} options.shop
 * @param {string} options.apiKey
 * @param {string} options.nonce
 * @param {string} options.redirect
 * @param {Array<string>} options.scope
 * @param {boolean} [options.online=false]
 * @param {boolean} [options.iframe=false]
 * @return {string}
 * @example
 * // Full Page App
 * res.redirect(
 *   generateRedirect({
 *     shop: 'example.myshopify.com',
 *     apiKey: 'MY_APP_API_KEY',
 *     nonce: 'unique-request-identifier',
 *     redirect: 'https://my-app.com/path/to/redirect',
 *     scope: ['read_products', 'write_products', 'etc'],
 *   }),
 * );
 *
 * // Embedded online app
 * res.send(
 *   generateRedirect({
 *     shop: 'example.myshopify.com',
 *     apiKey: 'MY_APP_API_KEY',
 *     nonce: 'unique-request-identifier',
 *     redirect: 'https://my-app.com/path/to/redirect',
 *     scope: ['read_products', 'write_products', 'etc'],
 *     online: true,
 *     iframe: true,
 *   }),
 * );
 */

const generateRedirect = ({
  shop,
  apiKey,
  nonce,
  redirect,
  scope,
  online = false,
  iframe = false,
}) => {
  const baseUrl = `https://${shop}/admin/oauth/authorize`;
  const params = new URLSearchParams();

  params.set('client_id', apiKey);
  params.set('state', nonce);
  params.set('redirect_uri', redirect);
  params.set('scope', scope.join());

  if (online) {
    params.set('grant_options[]', 'per-user');
  }

  if (iframe) {
    return generateJSRedirect({
      url: `${baseUrl}?${decodeURIComponent(params.toString())}`,
    });
  }

  return `${baseUrl}?${params.toString()}`;
};

module.exports = generateRedirect;
