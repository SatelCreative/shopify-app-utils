const { URLSearchParams } = require('url');
const { promisify } = require('util');
const jsonwebtoken = require('jsonwebtoken');
const shortid = require('shortid');
const generateRedirect = require('../oauth/generate-redirect');
const generateJSRedirect = require('../utils/generate-js-redirect');
const validateDomain = require('../utils/validate-domain');
const handleCallbackOld = require('../oauth/handle-callback');

const verifyJWT = promisify(jsonwebtoken.verify);

// STORAGE
const nonces = {};

const createValidateRequest = ({
  host,
  redirectRoute,
  scopes,
  key,
  secret,
  online,
  // offline,
}) => async ({ url, jwt, authenticated, redirect }) => {
  // TODO validation

  // Check token
  try {
    const decoded = await verifyJWT(jwt, secret);

    // TODO verify shop, timestamp etc.

    if (authenticated) {
      authenticated({ ...decoded });
    }
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

  // TODO pass to user
  const nonce = shortid.generate();
  nonces[shop] = nonce;

  const redirectURL = generateRedirect({
    shop,
    apiKey: key,
    nonce,
    redirect: `${host}${redirectRoute}`,
    scopes,
    online,
  });

  redirect({
    url: redirectURL,
    html: generateJSRedirect({ url: redirectURL }),
  });
};

const createHandleCallback = ({ key, secret }) => async ({ url }) => {
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

  const nonce = nonces[shop];
  delete nonces[shop];

  try {
    const { token, scopes } = await handleCallbackOld({
      url,
      nonce,
      apiKey: key,
      secret,
    });

    const jwt = jsonwebtoken.sign(
      {
        scopes,
        shop,
      },
      secret,
    );

    return {
      token,
      shop,
      jwt,
    };
  } catch (e) {
    throw new Error('TODO');
  }
};

const createOAuth = ({
  host,
  redirectRoute,
  scopes,
  key,
  secret,
  online = false,
  offline = false,
  // spa TODO
}) => {
  // Validation
  if (!host || !redirectRoute || !scopes || !key || !secret) {
    throw new Error('Missing required parameter');
  }

  if (!online && !offline) {
    throw new Error('One of `online` & `offline` must be true');
  }

  // TODO all other modes
  if (!online || (online && offline)) {
    throw new Error('NOT IMPLEMENTED');
  }

  const validateRequest = createValidateRequest({
    host,
    redirectRoute,
    scopes,
    key,
    secret,
    online,
    offline,
  });

  const handleCallback = createHandleCallback({
    key,
    secret,
  });

  return {
    validateRequest,
    handleCallback,
  };
};

module.exports = createOAuth;
