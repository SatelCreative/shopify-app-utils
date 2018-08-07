const generateRedirect = require('./generate-redirect');

describe('Generate Redirect', () => {
  it('should generate a url', () => {
    expect(
      generateRedirect({
        shop: 'example.myshopify.com',
        apiKey: 'key',
        scope: ['read_products'],
        nonce: 'nonce',
        redirect: 'https://example.com',
      }),
    ).toMatchSnapshot();
  });

  it('should generate an online url', () => {
    expect(
      generateRedirect({
        shop: 'example.myshopify.com',
        apiKey: 'key',
        scope: ['read_products'],
        nonce: 'nonce',
        redirect: 'https://example.com',
        online: true,
      }),
    ).toMatchSnapshot();
  });

  it('should generate an iframe redirect', () => {
    expect(
      generateRedirect({
        shop: 'example.myshopify.com',
        apiKey: 'key',
        scope: ['read_products'],
        nonce: 'nonce',
        redirect: 'https://example.com',
        iframe: true,
      }),
    ).toMatchSnapshot();
  });
});
