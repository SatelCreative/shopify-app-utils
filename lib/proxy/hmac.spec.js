const validateProxyHMAC = require('./hmac');

describe('Validate Shopify Proxy HMAC', () => {
  it('should reject an emtpy url', () => {
    expect(validateProxyHMAC({ url: '', secret: 'hush' })).toEqual(false);
  });

  it('should reject an emtpy secret', () => {
    expect(
      validateProxyHMAC({
        url:
          '/?query=a,b,c&apple=fruit&signature=7eb79c7da1c277994037a3962ff7bc67b61df52fc49ebf84d7ade715ecf1b9c8',
        secret: '',
      }),
    ).toEqual(false);
  });

  it('should reject empty signature', () => {
    expect(
      validateProxyHMAC({
        url: '/?query=a,b,c&apple=fruit&signature=',
        secret: 'hunter2',
      }),
    ).toEqual(false);
  });

  it('should validate valid signatures', () => {
    expect(
      validateProxyHMAC({
        // From https://www.freeformatter.com/hmac-generator.html
        url:
          '/?query=a,b,c&a=123&signature=7eb79c7da1c277994037a3962ff7bc67b61df52fc49ebf84d7ade715ecf1b9c8',
        secret: 'hunter2',
      }),
    ).toEqual(true);
  });

  it('should reject invalid signatures', () => {
    expect(
      validateProxyHMAC({
        url: '/?query=a,b,c&a=123&signature=000000000',
        secret: 'hunter2',
      }),
    ).toEqual(false);
  });
});
