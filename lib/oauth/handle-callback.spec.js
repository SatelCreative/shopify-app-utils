const nock = require('nock');
const mockNow = require('jest-mock-now');
const handleCallback = require('./handle-callback');

beforeEach(() =>
  // Which is 1533160800 UTC
  mockNow(new Date('Wednesday, 1 August 2018 15:00:00 GMT-07:00')));
afterEach(() => {
  Date.now.mockRestore();
  nock.cleanAll();
});

const shop = 'example.myshopify.com';

const defaultURLArgs = {
  shop,
  state: 'my-state',
  code: 'my-code',
  timestamp: '1533160800',
  hmac: '0461966b7a3a0869d9b4743888206783acf1abbefb10d9a6fd826e1aecfb7fe9',
};

const createURL = options => {
  const { shop: s, timestamp, state, code, hmac } = {
    ...defaultURLArgs,
    ...options,
  };
  return `/callback?shop=${s}&timestamp=${timestamp}&state=${state}&code=${code}&hmac=${hmac}`;
};

const defaultArgs = {
  key: 'api-key',
  secret: 'hunter2',
  online: true,
};

describe('Handle Callback', () => {
  it('should return token when request is valid', async () => {
    const body = jest.fn().mockImplementation(() => true);
    const validateNonce = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    const onAuthenticated = jest.fn();
    const onFailed = jest.fn();

    nock(`https://${shop}`)
      .post('/admin/oauth/access_token', body)
      .reply(200, {
        access_token: 'access_token',
        scope: 'read_products',
        associated_user_scope: 'read_products',
      });

    await handleCallback({
      ...defaultArgs,
      url: createURL(),
      validateNonce,
      onAuthenticated,
      onFailed,
    });

    expect(body).toHaveBeenCalledTimes(1);
    expect(validateNonce).toHaveBeenCalledTimes(1);
    expect(onAuthenticated).toHaveBeenCalledTimes(1);
    expect(onFailed).toHaveBeenCalledTimes(0);

    expect(body.mock.calls[0]).toMatchSnapshot();
    expect(validateNonce.mock.calls[0]).toMatchSnapshot();
    expect(onAuthenticated.mock.calls[0]).toMatchSnapshot();
  });

  it('should fail on invalid hmac', async () => {
    const body = jest.fn().mockImplementation(() => true);
    const validateNonce = jest.fn().mockImplementation(() => true);
    const onAuthenticated = jest.fn();
    const onFailed = jest.fn();

    nock(`https://${shop}`)
      .post('/admin/oauth/access_token', body)
      .reply(200, { access_token: 'access_token', scope: 'read_products' });

    await handleCallback({
      ...defaultArgs,
      url: createURL({ hmac: 'XXXXX' }),
      validateNonce,
      onAuthenticated,
      onFailed,
    });

    expect(body).toHaveBeenCalledTimes(0);
    expect(validateNonce).toHaveBeenCalledTimes(0);
    expect(onAuthenticated).toHaveBeenCalledTimes(0);
    expect(onFailed).toHaveBeenCalledTimes(1);
    expect(onFailed.mock.calls[0]).toMatchSnapshot();
  });

  it('should fail on invalid nonce', async () => {
    const body = jest.fn().mockImplementation(() => true);
    const validateNonce = jest.fn().mockImplementation(() => false);
    const onAuthenticated = jest.fn();
    const onFailed = jest.fn();

    nock(`https://${shop}`)
      .post('/admin/oauth/access_token', body)
      .reply(200, { access_token: 'access_token', scope: 'read_products' });

    await handleCallback({
      ...defaultArgs,
      url: createURL(),
      validateNonce,
      onAuthenticated,
      onFailed,
    });

    expect(body).toHaveBeenCalledTimes(0);
    expect(validateNonce).toHaveBeenCalledTimes(1);
    expect(onAuthenticated).toHaveBeenCalledTimes(0);
    expect(onFailed).toHaveBeenCalledTimes(1);

    expect(validateNonce.mock.calls[0]).toMatchSnapshot();
    expect(onFailed.mock.calls[0]).toMatchSnapshot();
  });
});
