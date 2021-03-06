const extractParams = require('../utils/extract-params');
const validateJWT = require('./validate-jwt');
const generateRedirect = require('./generate-redirect');
const generateJSRedirect = require('../utils/generate-js-redirect');
const validateDomain = require('../utils/validate-domain');

/**
 * Used to generate a nonce to be used in a redirect url
 * @callback validateRequest~generateNonce
 * @param {object} options
 * @param {string} options.shop the .myshopify domain
 * @return {string}
 */

/**
 * Called when a request is authorized
 * @callback validateRequest~onAuthenticated
 * @param {object} options
 * @param {string} options.shop the .myshopify domain
 * @param {string[]} options.appScope the application scope (when jwt was generated)
 * @param {string[]|undefined} options.userScope the user scope (only applicable to online tokens)
 * @param {object} options.decoded decoded body of the jwt
 */

/**
 * Called when a redirect is required
 * @callback validateRequest~onRedirect
 * @param {object} options
 * @param {string} options.url the redirect url
 * @param {string} options.html a js based redirect for use in iframes
 */

/**
 * Called when unable to redirect or authorize
 * @callback validateRequest~onFailed
 * @param {object} options
 */

/**
 * TODO
 * @param {object} options
 * @param {string} options.url url of the request to validate
 * @param {string} options.jwt jwt associated with the current request
 * @param {string} options.host the base url of the app
 * @param {string} options.redirectRoute the route where oauth2 redirects will be handled
 * @param {string[]} options.scope scope your app will require
 * @param {string} options.key shopify app api key
 * @param {string} options.secret shopify app shared secret
 * @param {boolean} [options.online=false] do you require an online token
 * @param {boolean} [options.offline=false] do you require an offline token
 * @param {validateRequest~generateNonce} options.generateNonce
 * @param {validateRequest~onAuthenticated} options.onAuthenticated
 * @param {validateRequest~onRedirect} options.onRedirect
 * @param {validateRequest~onFailed} options.onFailed
 */
const validateRequest = async ({
  url,
  jwt,
  host,
  redirectRoute,
  scope,
  key,
  secret,
  online = false,
  offline = false,
  generateNonce,
  onAuthenticated,
  onRedirect,
  onFailed,
}) => {
  // TODO validation

  if ((online && offline) || offline) {
    throw new Error('NOT IMPLEMENTED');
  }

  /**
   * Handles creating nonce and redirect callback
   * @private
   * @param {object} options
   * @param {string} options.shop the myshopify domain
   */
  const redirect = async ({ shop }) => {
    const nonce = await Promise.resolve(generateNonce({ shop }));

    const redirectURL = generateRedirect({
      shop,
      apiKey: key,
      nonce,
      redirect: `${host}${redirectRoute}`,
      scope,
      online,
    });

    await Promise.resolve(
      onRedirect({
        url: redirectURL,
        html: generateJSRedirect({ url: redirectURL }),
      }),
    );
  };

  // CHECK JWT
  const {
    valid: validToken,
    decoded: { shop: tokenShop, appScope, userScope, ...decoded },
  } = await validateJWT({
    token: jwt,
    secret,
  });

  // TODO user provided validation
  // TODO scope checking (reinstallation on missing app scope)
  // TODO session checking

  if (validateDomain({ shop: tokenShop })) {
    if (validToken) {
      await Promise.resolve(
        onAuthenticated({
          shop: tokenShop,
          appScope,
          userScope,
          decoded,
        }),
      );
      return;
    }

    await redirect({ shop: tokenShop });
    return;
  }

  // CHECK PARAMS
  const query = extractParams({ url });

  const queryShop = query.get('shop');

  if (validateDomain({ shop: queryShop })) {
    await redirect({ shop: queryShop });
    return;
  }

  // HANDLE ERRORS
  await Promise.resolve(onFailed());
};

module.exports = validateRequest;
