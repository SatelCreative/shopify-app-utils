const app = require('./auth');

describe('Shopify App HMAC Middleware', () => {
  it('should catch empty hmac', () => {
    // Mock data
    const req = {
      query: {},
    };
    const next = jest.fn();

    const middleware = app({
      secret: 'hunter2',
    });

    middleware(req, undefined, next);

    expect(req.validSignature).toEqual(false);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should correctly determine valid signatures', () => {
    // Mock data
    const req = {
      // From https://www.freeformatter.com/hmac-generator.html
      // Of note this MUST be encoded using url.URLSearchParams.toString()
      // as this encodes the commas correctly unlike encodeURI()
      // The below hmac was generated using `query=a%2Cb%2Cc&apple=fruit`
      // as the value not `query=a,b,c&apple=fruit`
      url:
        '/?query=a,b,c&apple=fruit&hmac=7908e3d3a19b104e9e2166eedb98ec2708e132067d7cb23b7b5475d0fb80efa6',
      query: {
        hmac:
          '7908e3d3a19b104e9e2166eedb98ec2708e132067d7cb23b7b5475d0fb80efa6',
      },
    };
    const next = jest.fn();

    const middleware = app({
      secret: 'hunter2',
    });

    middleware(req, undefined, next);

    expect(req.validSignature).toEqual(true);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should correctly determine invalid signatures', () => {
    // Mock data
    const req = {
      url: '/?query=a,b,c&apple=fruit&hmac=0000000000',
      query: {
        hmac: '0000000000',
      },
    };
    const next = jest.fn();

    const middleware = app({
      secret: 'hunter2',
    });

    middleware(req, undefined, next);

    expect(req.validSignature).toEqual(false);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
