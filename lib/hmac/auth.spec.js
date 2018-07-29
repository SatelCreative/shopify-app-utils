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

  it('should correctly determine valid signatures', () => {
    // From https://www.freeformatter.com/hmac-generator.html
    // Of note this MUST be encoded using url.URLSearchParams.toString()
    // as this encodes the commas correctly unlike encodeURI()
    // The below hmac was generated using `query=a%2Cb%2Cc&apple=fruit`
    // as the value not `query=a,b,c&apple=fruit`
    expect(
      validateAuthHMAC({
        url:
          '/?query=a,b,c&apple=fruit&hmac=7908e3d3a19b104e9e2166eedb98ec2708e132067d7cb23b7b5475d0fb80efa6',
        secret: 'hunter2',
      }),
    ).toEqual(true);
  });

  it('should correctly determine invalid signatures', () => {
    expect(
      validateAuthHMAC({
        url: '/?query=a,b,c&apple=fruit&hmac=0000000000',
        secret: 'hunter2',
      }),
    ).toEqual(false);
  });
});
