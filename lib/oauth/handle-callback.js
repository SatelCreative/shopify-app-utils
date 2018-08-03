const { URLSearchParams } = require('url');
const fetch = require('node-fetch');
const parseRequest = require('./parse-request');

const handleCallback = async ({ url, nonce, apiKey, secret, margin = 60 }) => {
  if (!nonce) {
    throw new Error('A nonce must be provided');
  }

  if (!apiKey) {
    throw new Error('An apiKey must be provided');
  }

  if (!secret) {
    throw new Error('A secret must be provided');
  }

  // Validate request
  const { fromShopify } = parseRequest({ url, secret, margin });

  if (!fromShopify) {
    throw new Error('Invalid request');
  }

  // We know this exists as parseRequest checks
  const params = new URLSearchParams(url.split('?')[1]);

  const code = params.get('code');
  const returnedNonce = params.get('state');
  const shop = params.get('shop');

  if (returnedNonce !== nonce) {
    throw new Error('Invalid nonce');
  }

  try {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: secret,
        code,
      }),
    });

    const { access_token: token, scope: rawScopes } = await response.json();

    return {
      token,
      scopes: rawScopes.split(),
    };
  } catch (e) {
    throw new Error('Error fetching token');
  }
};

module.exports = handleCallback;
