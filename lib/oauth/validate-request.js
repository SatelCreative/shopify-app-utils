const { URLSearchParams } = require('url');
const { promisify } = require('util');
const jsonwebtoken = require('jsonwebtoken');
const generateRedirect = require('./generate-redirect');
const generateJSRedirect = require('../utils/generate-js-redirect');
const validateDomain = require('../utils/validate-domain');

// TODO abstract
const verifyJWT = promisify(jsonwebtoken.verify);

/**
 * Used to generate a nonce to be used in a redirect url
 * @callback generateNonce
 * @param {object} options
 * @param {string} options.shop the .myshopify domain
 * @return {string}
 */

/**
 * Called when a request is authorized
 * @callback onAuthenticated
 * @param {object} options
 * @param {string} options.shop the .myshopify domain
 * @param {string[]} options.scopes TODO
 */

/**
 * Called when a redirect is required
 * @callback onRedirect
 * @param {object} options
 * @param {string} options.url the redirect url
 * @param {string} options.html a js based redirect for use in iframes
 */

/**
 * TODO
 * @param {object} options
 * @param {string} options.url url of the request to validate
 * @param {string} options.jwt jwt associated with the current request
 * @param {string} options.host the base url of the app
 * @param {string} options.redirectRoute the route where oauth2 redirects will be handled
 * @param {string[]} options.scopes scopes your app will require
 * @param {string} options.key shopify app api key
 * @param {string} options.secret shopify app shared secret
 * @param {boolean} [options.online=false] do you require an online token
 * @param {boolean} [options.offline=false] do you require an offline token
 * @param {generateNonce} options.generateNonce
 * @param {onAuthenticated} options.onAuthenticated
 * @param {onRedirect} options.onRedirect
 */
const validateRequest = async ({
  url,
  jwt,
  host,
  redirectRoute,
  scopes,
  key,
  secret,
  online = false,
  offline = false,
  generateNonce,
  onAuthenticated,
  onRedirect,
}) => {
  // TODO validation

  // Check token
  try {
    const decoded = await verifyJWT(jwt, secret);

    // TODO verify shop, timestamp etc.

    onAuthenticated({ ...decoded });
    return;
  } catch (e) {
    // TODO figure out which errors should bubble
  }

  if (!online || offline) {
    throw new Error('Only online mode is currently supported');
  }

  // TODO offline support

  let params;
  try {
    const query = url.split('?')[1];

    if (!query) {
      // TODO
    }

    params = new URLSearchParams(query);
  } catch (e) {
    throw new Error('Unable to parse URL');
  }

  const shop = params.get('shop');

  if (!shop) {
    return;
  }

  if (!validateDomain({ shop })) {
    throw new Error('Invalid Shop');
  }

  const nonce = generateNonce({ shop });

  const redirectURL = generateRedirect({
    shop,
    apiKey: key,
    nonce,
    redirect: `${host}${redirectRoute}`,
    scopes,
    online,
  });

  onRedirect({
    url: redirectURL,
    html: generateJSRedirect({ url: redirectURL }),
  });
};

module.exports = validateRequest;
