const validateAuthHMAC = require('./auth');

describe('Validate Shopify Authentication HMAC', () => {
  it('should reject an emtpy url', () => {
    expect(validateAuthHMAC({ url: '', secret: 'hush' })).toEqual(false);
  });

  it('should reject an emtpy secret', () => {
    expect(
      validateAuthHMAC({ url: '/?query=a,b,c&apple=fruit&hmac=', secret: '' }),
    ).toEqual(false);
  });

  it('should correctly determine invalid signatures', () => {
    expect(
      validateAuthHMAC({
        url: '/?query=a,b,c&apple=fruit&hmac=0000000000',
        secret: 'hunter2',
      }),
    ).toEqual(false);
  });

  it('should correctly handle normally encoded characters', () => {
    // From https://www.freeformatter.com/hmac-generator.html
    expect(
      validateAuthHMAC({
        url:
          '/?hmac=619a097aeaa5f79e5940443587ca5c139a8ec8d73134270ea77bab2a777a099a&locale=en&protocol=https://&shop=example.myshopify.com&timestamp=1234567890',
        secret: 'hunter2',
      }),
    ).toEqual(true);
  });

  it('should correctly handle encoded urls', () => {
    // From https://www.freeformatter.com/hmac-generator.html
    expect(
      validateAuthHMAC({
        url:
          '/?hmac=619a097aeaa5f79e5940443587ca5c139a8ec8d73134270ea77bab2a777a099a&locale=en&protocol=https%3A%2F%2F&shop=example.myshopify.com&timestamp=1234567890',
        secret: 'hunter2',
      }),
    ).toEqual(true);
  });
});
