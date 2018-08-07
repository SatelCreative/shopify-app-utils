const shortid = require('shortid');
const validateRequestFull = require('./validate-request');
const handleCallbackFull = require('./handle-callback');

// Internal nonce storage
const nonces = {};

/**
 * @private
 */
const generateNonce = ({ shop }) => {
  const nonce = shortid.generate();
  nonces[shop] = nonce;
  return nonce;
};

/**
 * @private
 */
const validateNonce = ({ shop, nonce }) => {
  if (nonces[shop] === nonce) {
    delete nonces[shop];
    return true;
  }
  return false;
};

/**
 * @private
 */
const createValidateRequest = ({ ...closure }) => ({ ...instance }) =>
  validateRequestFull({
    ...closure,
    ...instance,
    generateNonce,
  });

/**
 * @private
 */
const createHandleCallback = ({ ...closure }) => async ({ ...instance }) =>
  handleCallbackFull({
    ...closure,
    ...instance,
    validateNonce,
  });

/**
 * Creates instances of validateRequest & handleCallback wrapped in a closure
 * @param {object} options
 * @param {string} options.host the base url of the app
 * @param {string} options.redirectRoute the route where oauth2 redirects will be handled
 * @param {string[]} options.scope scope your app will require
 * @param {string} options.key shopify app api key
 * @param {string} options.secret shopify app shared secret
 * @param {boolean} [options.online=false] do you require an online token
 * @param {boolean} [options.offline=false] do you require an offline token
 * @example
 * const oauth = require('@satel/shopify-app-utils');
 *
 * const { validateRequest, handleCallback } = oauth.create({
 *   host: 'https://my-app.com',
 *   redirectRoute: '/redirect',
 *   scope: ['read_products'],
 *   key: 'MY_KEY',
 *   secret: 'MY_SECRET',
 *   online: true,
 * });
 */
const createOAuth = ({
  host,
  redirectRoute,
  scope,
  key,
  secret,
  online = false,
  offline = false,
}) => {
  // Validation
  if (!host || !redirectRoute || !scope || !key || !secret) {
    throw new Error('Missing required parameter');
  }

  if (!online && !offline) {
    throw new Error('One of `online` & `offline` must be selected');
  }

  // TODO all other modes
  if (online && offline) {
    throw new Error('NOT IMPLEMENTED');
  }

  const validateRequest = createValidateRequest({
    host,
    redirectRoute,
    scope,
    key,
    secret,
    online,
    offline,
  });

  const handleCallback = createHandleCallback({
    key,
    secret,
    online,
    offline,
  });

  return {
    validateRequest,
    handleCallback,
  };
};

module.exports = createOAuth;
