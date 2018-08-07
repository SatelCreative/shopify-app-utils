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
 * // TODO
 */
const createOAuth = ({
  host,
  redirectRoute,
  scope,
  key,
  secret,
  online = false,
  offline = false,
  // spa TODO
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
