const proxy = require('./proxy');

describe('Shopify Proxy Middleware', () => {
  it('should catch empty signature', () => {
    // Mock data
    const req = {
      query: {},
    };
    const next = jest.fn();

    const middleware = proxy({
      secret: 'hunter2',
    });

    middleware(req, undefined, next);

    expect(req.validSignature).toEqual(false);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should correctly determine valid signatures', () => {
    // Mock data
    const req = {
      query: {
        query: 'a,b,c',
        a: '123',
        // From https://www.freeformatter.com/hmac-generator.html
        signature:
          '7eb79c7da1c277994037a3962ff7bc67b61df52fc49ebf84d7ade715ecf1b9c8',
      },
    };
    const next = jest.fn();

    const middleware = proxy({
      secret: 'hunter2',
    });

    middleware(req, undefined, next);

    expect(req.validSignature).toEqual(true);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should correctly determine invalid signatures', () => {
    // Mock data
    const req = {
      query: {
        query: 'a,b,c',
        a: '123',
        signature: '0000000000',
      },
    };
    const next = jest.fn();

    const middleware = proxy({
      secret: 'hunter2',
    });

    middleware(req, undefined, next);

    expect(req.validSignature).toEqual(false);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
