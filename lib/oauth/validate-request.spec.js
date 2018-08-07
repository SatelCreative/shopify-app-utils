const jsonwebtoken = require('jsonwebtoken');
const mockNow = require('jest-mock-now');
const validateRequest = require('./validate-request');

// Which is 1533160800 UTC
beforeEach(() =>
  mockNow(new Date('Wednesday, 1 August 2018 15:00:00 GMT-07:00')));
afterEach(() => Date.now.mockRestore());

const baseArgs = {
  url: '/',
  jwt: '',
  host: 'https://example.com',
  redirectRoute: '/redirect',
  scope: ['read_products'],
  key: 'app-key',
  secret: 'hunter2',
  online: false,
  offline: false,
  generateNonce: ({ shop }) => `nonce-${shop}`,
};

describe('oauth/validateRequest', () => {
  it('should redirect as expected in online mode', async () => {
    const onAuthenticated = jest.fn();
    const onRedirect = jest.fn();
    const onFailed = jest.fn();

    await validateRequest({
      ...baseArgs,
      url: '/?shop=example.myshopify.com',
      jwt: undefined,
      online: true,
      onAuthenticated,
      onRedirect,
      onFailed,
    });

    expect(onAuthenticated).toHaveBeenCalledTimes(0);
    expect(onRedirect).toHaveBeenCalledTimes(1);
    expect(onFailed).toHaveBeenCalledTimes(0);
    expect(onRedirect.mock.calls[0][0]).toMatchSnapshot();
  });

  it('should authenticate as expected in online mode', async () => {
    const onAuthenticated = jest.fn();
    const onRedirect = jest.fn();
    const onFailed = jest.fn();

    const secret = 'hunter2';
    const jwt = jsonwebtoken.sign(
      {
        shop: 'example.myshopify.com',
        appScope: ['read_products'],
        userScope: ['read_products'],
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
      onFailed,
    });

    expect(onAuthenticated).toHaveBeenCalledTimes(1);
    expect(onRedirect).toHaveBeenCalledTimes(0);
    expect(onFailed).toHaveBeenCalledTimes(0);
    expect(onAuthenticated.mock.calls[0]).toMatchSnapshot();
  });

  it('should redirect invalid jwt with shop param', async () => {
    const onAuthenticated = jest.fn();
    const onRedirect = jest.fn();
    const onFailed = jest.fn();

    const secret = 'hunter2';
    const jwt = jsonwebtoken.sign(
      {
        shop: 'example.myshopify.com',
        appScope: ['read_products'],
        userScope: ['read_products'],
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
      onFailed,
    });

    expect(onAuthenticated).toHaveBeenCalledTimes(0);
    expect(onRedirect).toHaveBeenCalledTimes(1);
    expect(onFailed).toHaveBeenCalledTimes(0);
    expect(onRedirect.mock.calls[0]).toMatchSnapshot();
  });

  it('should not authenticate invalid jwt', async () => {
    const onAuthenticated = jest.fn();
    const onRedirect = jest.fn();
    const onFailed = jest.fn();

    const secret = 'hunter2';
    const jwt = jsonwebtoken.sign(
      {
        shop: 'invalid-shop-domain.com',
        appScope: ['read_products'],
        userScope: ['read_products'],
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
      onFailed,
    });

    expect(onAuthenticated).toHaveBeenCalledTimes(0);
    expect(onRedirect).toHaveBeenCalledTimes(0);
    expect(onFailed).toHaveBeenCalledTimes(1);
    expect(onFailed.mock.calls[0]).toMatchSnapshot();
  });
});
