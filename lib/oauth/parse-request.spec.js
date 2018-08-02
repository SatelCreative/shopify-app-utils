const mockNow = require('jest-mock-now');
const parseRequest = require('./parse-request');

describe('Parse request', () => {
  it('should handle empty urls', () => {
    expect(parseRequest({ url: '', secret: 'hunter2' })).toEqual({
      shop: '',
      malformed: false,
      fromShopify: false,
    });
  });

  it('should handle malformed urls', () => {
    expect(parseRequest({ url: 123, secret: 'hunter2' })).toEqual({
      shop: '',
      malformed: true,
      fromShopify: false,
    });
  });

  it('should handle an unauthenticated install', () => {
    expect(
      parseRequest({
        url: '/?shop=slate-migration.myshopify.com',
        secret: 'hunter2',
      }),
    ).toEqual({
      shop: 'slate-migration.myshopify.com',
      malformed: false,
      fromShopify: false,
    });
  });

  it('should handle valid requests', () => {
    mockNow(new Date('Wednesday, 1 August 2018 15:00:00 GMT-07:00'));
    expect(
      parseRequest({
        url:
          '/?hmac=d0b2c0d914e32dd7b3756921f8ecdb7dc19dc1dc76e13a01ee78d103acdd7ce2&shop=slate-migration.myshopify.com&timestamp=1533160800',
        secret: 'hunter2',
      }),
    ).toEqual({
      shop: 'slate-migration.myshopify.com',
      malformed: false,
      fromShopify: true,
    });
    Date.now.mockRestore();
  });

  it('should handle invalid requests', () => {
    mockNow(new Date('Wednesday, 1 August 2018 15:00:00 GMT-07:00'));
    expect(
      parseRequest({
        url:
          '/?hmac=d0b2c0d914e32dd7b3756921f8ecdb7dc19dc1dc76e13a01ee78d103acddXXXX&shop=slate-migration.myshopify.com&timestamp=1533160800',
        secret: 'hunter2',
      }),
    ).toEqual({
      shop: 'slate-migration.myshopify.com',
      malformed: true,
      fromShopify: false,
    });
    Date.now.mockRestore();
  });
});
