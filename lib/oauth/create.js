const { URLSearchParams } = require('url');
const jsonwebtoken = require('jsonwebtoken');
const shortid = require('shortid');
const validateRequestFull = require('./validate-request');

// TODO refactor
const handleCallbackOld = require('./handle-callback');

// STORAGE
const nonces = {};

const generateNonce = ({ shop }) => {
  const nonce = shortid.generate();
  nonces[shop] = nonce;
  return nonce;
};

const createValidateRequest = ({
  host,
  redirectRoute,
  scopes,
  key,
  secret,
  online,
  // offline,
}) => ({ url, jwt, onAuthenticated, onRedirect }) =>
  validateRequestFull({
    url,
    jwt,
    host,
    redirectRoute,
    scopes,
    key,
    secret,
    online,
    // offline,
    generateNonce,
    onAuthenticated,
    onRedirect,
  });

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
