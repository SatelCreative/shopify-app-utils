/**
 * Pass in a url and it returns an html document that will redirect top rather than the iFrame
 * @param {Object} options
 * @param {string} options.url
 * @return {string}
 * @example
 */
const generateJSRedirect = ({ url }) =>
  `<!DOCTYPE html><html><head><script type="text/javascript">window.top.location.href = "${url}"</script></head></html>`;

module.exports = generateJSRedirect;
