const { URLSearchParams } = require('url');
const fetch = require('node-fetch');
const jsonwebtoken = require('jsonwebtoken');
const validateHMAC = require('./hmac');
const validateDomain = require('../utils/validate-domain');
const validateTimestamp = require('../utils/validate-timestamp');

/**
 * Used to validate a previously generated nonce
 * @callback validateNonce
 * @param {object} options
 * @param {string} options.shop the .myshopify domain
 * @param {string} options.nonce the retrieved nonce
 * @return {boolean|Promise<boolean>}
 */

/**
 * Called when a request is authorized
 * @callback onAuthenticated
 * @param {object} options
 * @param {string} options.token the shopify access token
 * @param {string} options.online indicates if the current token is online or offline
 * @param {string} options.jwt a jwt token
 * @param {string} options.shop the .myshopify domain
 * @param {string[]} options.appScope the application scope (when jwt was generated)
 * @param {string[]|undefined} options.userScope the user scope (only applicable to online tokens)
 */

/**
 *
 * @param {object} options
 * @param {string} options.url
 * @param {string} options.key shopify app api key
 * @param {string} options.secret shopify app shared secret
 * @param {validateNonce} options.validateNonce
 * @param {onAuthenticated} options.onAuthenticated
 * @param {number} [options.margin=60]
 */
const handleCallback = async ({
  url,
  key,
  secret,
  validateNonce,
  onAuthenticated,
  margin = 60,
}) => {
  let params;
  try {
    const query = url.split('?')[1];

    if (!query) {
      return;
    }

    params = new URLSearchParams(query);
  } catch (e) {
    throw new Error('Failed to parse URL');
  }

  // Extract query params
  const shop = params.get('shop');
  const hmac = params.get('hmac');
  const timestamp = params.get('timestamp');
  const code = params.get('code');
  const nonce = params.get('state');

  // Expect all needed params to be present
  if (!shop || !hmac || !timestamp || !code || !nonce) {
    return;
  }

  // Check the parameters
  const validShop = validateDomain({ shop });
  const validHMAC = validateHMAC({ url, secret });
  const validTimestamp = validateTimestamp({ timestamp, margin });

  // Ensure recent and from shopify
  if (!(validShop && validHMAC && validTimestamp)) {
    return;
  }

  // Check nonce
  if (!(await Promise.resolve(validateNonce({ shop, nonce })))) {
    return;
  }

  try {
    const tokenResponse = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: key,
          client_secret: secret,
          code,
        }),
      },
    );

    // Check for success
    let token;
    let rawAppScope;
    let rawUserScope;
    if (tokenResponse.ok) {
      ({
        access_token: token,
        scope: rawAppScope,
        associated_user_scope: rawUserScope,
      } = await tokenResponse.json());
    } else {
      // TODO
      return;
    }

    // Extract the scopes
    const appScope = rawAppScope.split();
    const userScope =
      rawUserScope !== undefined ? rawUserScope.split() : undefined;

    const jwt = jsonwebtoken.sign(
      {
        appScope,
        userScope,
        shop,
      },
      secret,
    );

    onAuthenticated({
      token,
      online: Boolean(rawUserScope),
      shop,
      appScope,
      userScope,
      jwt,
    });
  } catch (e) {
    // intentionally empty
  }
};

module.exports = handleCallback;
