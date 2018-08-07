const fetch = require('node-fetch');
const jsonwebtoken = require('jsonwebtoken');
const extractParams = require('../utils/extract-params');
const validateHMAC = require('./hmac');
const validateDomain = require('../utils/validate-domain');
const validateTimestamp = require('../utils/validate-timestamp');

/**
 * Used to validate a previously generated nonce
 * @callback handleCallback~validateNonce
 * @param {object} options
 * @param {string} options.shop the .myshopify domain
 * @param {string} options.nonce the retrieved nonce
 * @return {boolean|Promise<boolean>}
 */

/**
 * Called when a request is authorized
 * @callback handleCallback~onAuthenticated
 * @param {object} options
 * @param {string} options.token the shopify access token
 * @param {string} options.online indicates if the current token is online or offline
 * @param {string} options.jwt a jwt token
 * @param {string} options.shop the .myshopify domain
 * @param {string[]} options.appScope the application scope (when jwt was generated)
 * @param {string[]|undefined} options.userScope the user scope (only applicable to online tokens)
 */

/**
 * Called when request cannot be authorized
 * @callback handleCallback~onFailed
 * @param {object} options
 */

/**
 *
 * @param {object} options
 * @param {string} options.url
 * @param {string} options.key shopify app api key
 * @param {string} options.secret shopify app shared secret
 * @param {handleCallback~validateNonce} options.validateNonce
 * @param {handleCallback~onAuthenticated} options.onAuthenticated
 * @param {handleCallback~onFailed} options.onFailed
 * @param {number} [options.margin=60]
 */
const handleCallback = async ({
  url,
  key,
  secret,
  validateNonce,
  onAuthenticated,
  onFailed,
  margin = 60,
}) => {
  // TODO validation

  const query = extractParams({ url });
  const shop = query.get('shop');
  const hmac = query.get('hmac');
  const timestamp = query.get('timestamp');
  const code = query.get('code');
  const nonce = query.get('state');

  // Expect all needed params to be present
  if (!shop || !hmac || !timestamp || !code || !nonce) {
    await Promise.resolve(onFailed());
    return;
  }

  // Check the parameters
  const validShop = validateDomain({ shop });
  const validHMAC = validateHMAC({ url, secret });
  const validTimestamp = validateTimestamp({ timestamp, margin });

  // Ensure recent and from shopify
  if (!(validShop && validHMAC && validTimestamp)) {
    await Promise.resolve(onFailed());
    return;
  }

  // Check nonce
  if (!(await Promise.resolve(validateNonce({ shop, nonce })))) {
    await Promise.resolve(onFailed());
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

    // Extract the scope
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
    await Promise.resolve(onFailed());
  }
};

module.exports = handleCallback;
