const extractParams = require('./extract-params');

describe('Extract URL Params', () => {
  it('should extract params correctly', () => {
    const p = 'my-unique-string';
    expect(extractParams({ url: `/?p=${p}` }).get('p')).toEqual(p);
  });
});
