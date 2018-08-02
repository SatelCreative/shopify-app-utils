const { URLSearchParams } = require('url');
const generateJSRedirect = require('../utils/generate-js-redirect');

const generateRedirect = ({
  shop,
  apiKey,
  nonce,
  redirect,
  scopes,
  online = false,
  iframe = false,
}) => {
  const baseUrl = `https://${shop}/admin/oauth/authorize`;
  const params = new URLSearchParams();

  params.set('client_id', apiKey);
  params.set('state', nonce);
  params.set('redirect_uri', redirect);
  params.set('scope', scopes.join());

  if (online) {
    params.set('grant_options[]', 'per-user');
  }

  if (iframe) {
    return generateJSRedirect({
      url: `${baseUrl}?${decodeURIComponent(params.toString())}`,
    });
  }

  return `${baseUrl}?${params.toString()}`;
};

module.exports = generateRedirect;
