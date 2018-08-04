const { URLSearchParams } = require('url');
const fetch = require('node-fetch');
const jsonwebtoken = require('jsonwebtoken');
const parseRequest = require('./parse-request');

const handleCallback = async ({
  url,
  key,
  secret,
  online = false,
  offline = false,
  validateNonce,
  onAuthenticated,
  margin = 60,
}) => {
  // TODO validation

  // TODO refactor
  const { fromShopify } = parseRequest({ url, secret, margin });

  if (!fromShopify) {
    return;
  }

  // TODO abstract url query parsing
  // We know this exists as parseRequest checks
  const params = new URLSearchParams(url.split('?')[1]);

  const code = params.get('code');
  const nonce = params.get('state');
  const shop = params.get('shop');

  if (!validateNonce({ shop, nonce })) {
    return;
  }

  try {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: key,
        client_secret: secret,
        code,
      }),
    });

    const { access_token: token, scope: rawScopes } = await response.json();

    const scopes = rawScopes.split();

    const jwt = jsonwebtoken.sign(
      {
        scopes,
        shop,
      },
      secret,
    );

    onAuthenticated({
      token,
      shop,
      scopes,
      jwt,
    });
  } catch (e) {
    // intentionally empty
  }
};

module.exports = handleCallback;
