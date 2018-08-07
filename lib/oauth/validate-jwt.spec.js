const mockNow = require('jest-mock-now');
const validateJWT = require('./validate-jwt');

// Which is 1533160800 UTC
beforeEach(() =>
  mockNow(new Date('Wednesday, 1 August 2018 15:00:00 GMT-07:00')));
afterEach(() => Date.now.mockRestore());

describe('oauth/validateJWT', () => {
  it('should correctly validate jwt', async () => {
    const { valid, shop, decoded } = await validateJWT({
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBTY29wZSI6WyJyZWFkX3Byb2R1Y3RzIl0sInVzZXJTY29wZSI6WyJyZWFkX3Byb2R1Y3RzIl0sInNob3AiOiJleGFtcGxlLm15c2hvcGlmeS5jb20iLCJpYXQiOjE1MzMxNjA4MDB9.XlIMQ-gE51LC5yyJxr0Duhs_w1EkTi4E-2MFRDEcTr8',
      secret: 'hunter2',
    });

    expect(valid).toEqual(true);
    expect(shop).toEqual('example.myshopify.com');
    expect(decoded).toMatchSnapshot();
  });

  it('should reject invalid signature', async () => {
    const { valid, shop, decoded } = await validateJWT({
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBTY29wZSI6WyJyZWFkX3Byb2R1Y3RzIl0sInVzZXJTY29wZSI6WyJyZWFkX3Byb2R1Y3RzIl0sInNob3AiOiJleGFtcGxlLm15c2hvcGlmeS5jb20iLCJpYXQiOjE1MzMxNjA4MDB9.XlIMQ-gE51LC5yyJxr0Duhs_w1EkTi4E-2MFRDEcTr8',
      secret: 'different-secret',
    });

    expect(valid).toEqual(false);
    expect(shop).toEqual('example.myshopify.com');
    expect(decoded).toMatchSnapshot();
  });
});
