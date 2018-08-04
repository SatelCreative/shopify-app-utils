const jsonwebtoken = require('jsonwebtoken');
const validateRequest = require('./validate-request');

const baseArgs = {
  url: '/',
  jwt: '',
  host: 'https://example.com',
  redirectRoute: '/redirect',
  scopes: ['read_products'],
  key: 'app-key',
  secret: 'hunter2',
  online: false,
  offline: false,
  generateNonce: ({ shop }) => `nonce-${shop}`,
};

describe('oauth/validateRequest', () => {
  it('Should redirect as expected in online mode', async () => {
    const onAuthenticated = jest.fn();
    const onRedirect = jest.fn();

    await validateRequest({
      ...baseArgs,
      url: '/?shop=example.myshopify.com',
      jwt: undefined,
      online: true,
      onAuthenticated,
      onRedirect,
    });

    expect(onAuthenticated).toHaveBeenCalledTimes(0);
    expect(onRedirect).toHaveBeenCalledTimes(1);
    expect(onRedirect.mock.calls[0][0]).toMatchSnapshot();
  });

  it('Should authenticate as expected in online mode', async () => {
    const onAuthenticated = jest.fn();
    const onRedirect = jest.fn();

    const secret = 'hunter2';
    const jwt = jsonwebtoken.sign(
      {
        shop: 'example.myshopify.com',
        scopes: ['read_products'],
      },
      secret,
    );

    await validateRequest({
      ...baseArgs,
      jwt,
      secret,
      online: true,
      onAuthenticated,
      onRedirect,
    });

    expect(onAuthenticated).toHaveBeenCalledTimes(1);
    expect(onRedirect).toHaveBeenCalledTimes(0);
    // Remove the timestamp
    const args = onAuthenticated.mock.calls[0][0];
    delete args.iat;
    expect(args).toMatchSnapshot();
  });

  it('Should not authenticate invalid jwt', async () => {
    const onAuthenticated = jest.fn();
    const onRedirect = jest.fn();

    const secret = 'hunter2';
    const jwt = jsonwebtoken.sign(
      {
        shop: 'example.com',
        scopes: ['read_products'],
      },
      'wrong-secret',
    );

    await validateRequest({
      ...baseArgs,
      jwt,
      secret,
      online: true,
      onAuthenticated,
      onRedirect,
    });

    expect(onAuthenticated).toHaveBeenCalledTimes(0);
    expect(onRedirect).toHaveBeenCalledTimes(0);
  });
});
