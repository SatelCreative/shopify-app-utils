const validShopifyDomain = require('./validate-shopify-domain');

describe('Validate Shopify Domains', () => {
  it('should identify a valid domain', () => {
    expect(validShopifyDomain({ shop: 'example-store.myshopify.com' })).toEqual(
      true,
    );
  });

  it('should identify an invalid domain', () => {
    expect(
      validShopifyDomain({ shop: 'https://example-store.myshopify.com' }),
    ).toEqual(false);
  });

  it('should invalidate an empty domain', () => {
    expect(validShopifyDomain({ shop: '' })).toEqual(false);
  });
});
