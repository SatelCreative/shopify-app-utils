const mockNow = require('jest-mock-now');
const validateShopifyTimestamp = require('./validate-shopify-timestamp');

// Which is 1533160800 UTC
beforeEach(() =>
  mockNow(new Date('Wednesday, 1 August 2018 15:00:00 GMT-07:00')));
afterEach(() => Date.now.mockRestore());

describe('Validate Shopify Timestamp', () => {
  it('should reject empty or undefined times', () => {
    expect(validateShopifyTimestamp({})).toEqual(false);
  });

  it('should validate correct times', () => {
    expect(validateShopifyTimestamp({ timestamp: '1533160800' })).toEqual(true);
  });

  it('should reject outdated times', () => {
    mockNow(new Date('Wednesday, 1 August 2018 15:39:15 GMT-07:00'));
    expect(validateShopifyTimestamp({ timestamp: '1533160839' })).toEqual(
      false,
    );
  });

  it('should reject future times', () => {
    mockNow(new Date('Wednesday, 1 August 2018 15:39:15 GMT-07:00'));
    expect(validateShopifyTimestamp({ timestamp: '1533160861' })).toEqual(
      false,
    );
  });

  it('should respect margins', () => {
    expect(
      validateShopifyTimestamp({ timestamp: '1533160789', margin: 10 }),
    ).toEqual(false);
    expect(
      validateShopifyTimestamp({ timestamp: '1533160790', margin: 10 }),
    ).toEqual(true);
    expect(
      validateShopifyTimestamp({ timestamp: '1533160810', margin: 10 }),
    ).toEqual(true);
    expect(
      validateShopifyTimestamp({ timestamp: '1533160811', margin: 10 }),
    ).toEqual(false);
  });
});
