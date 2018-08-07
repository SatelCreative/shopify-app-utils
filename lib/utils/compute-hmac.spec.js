const computeHMAC = require('./compute-hmac');

describe('Sha256 HMAC', () => {
  it('should correctly produce an hmac', () => {
    const hash = computeHMAC({
      text: 'super secret text',
      secret: 'hunter2',
    });

    // From https://www.freeformatter.com/hmac-generator.html
    expect(hash).toEqual(
      '89e86c9b806f88bf347234c878a64e18c5cc7cb7aa83b19f0c9527d555471986',
    );
  });
});
