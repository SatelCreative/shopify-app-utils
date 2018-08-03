const { URLSearchParams } = require('url');
const { promisify } = require('util');
const jsonwebtoken = require('jsonwebtoken');
const generateRedirect = require('./generate-redirect');
const generateJSRedirect = require('../utils/generate-js-redirect');
const validateDomain = require('../utils/validate-domain');

// Break into it's own function
const verifyJWT = promisify(jsonwebtoken.verify);

const handleRequest = async ({
  url,
  jwt,
  host,
  redirectRoute,
  scopes,
  key,
  secret,
  online = false,
  // offline = false,
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

  // TODO offline only support

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

module.exports = handleRequest;
