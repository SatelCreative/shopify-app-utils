const validDomain = require('./validate-domain');

describe('Validate Shopify Domains', () => {
  it('should identify a valid domain', () => {
    expect(validDomain({ shop: 'example-store.myshopify.com' })).toEqual(true);
  });

  it('should identify an invalid domain', () => {
    expect(
      validDomain({ shop: 'https://example-store.myshopify.com' }),
    ).toEqual(false);
  });

  it('should invalidate an empty domain', () => {
    expect(validDomain({ shop: '' })).toEqual(false);
  });
});
