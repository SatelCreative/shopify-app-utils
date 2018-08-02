const generateShopifyRedirect = require('./generate-js-redirect');

describe('Generate Shopify Redirect', () => {
  it('should generate a javascript based redirect', () => {
    expect(
      generateShopifyRedirect({ url: 'https://example.com' }),
    ).toMatchSnapshot();
  });
});
