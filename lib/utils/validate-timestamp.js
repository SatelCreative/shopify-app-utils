/**
 * Verifies the shopify timestamp generally provided with authenticated responses from shopify
 * @param {Object} options
 * @param {string} timestamp
 * @param {number} [margin=60] Timestamp must be withing margin of now
 * @return {boolean}
 * @example
 * const validTimestamp = validateTimestamp({ timestamp: '1533160800', margin: 60 * 5 });
 */
const validateTimestamp = ({ timestamp, margin = 60 }) => {
  if (typeof timestamp !== 'string') {
    return false;
  }

  if (typeof margin !== 'number' || margin < 0 || margin > 86400) {
    throw new Error('Invalid margin');
  }

  // Get UTC in Seconds
  const now = Math.round(Date.now() / 1000);

  try {
    // Must be +- 1m
    return Math.abs(now - parseInt(timestamp, 10)) <= margin;
  } catch (e) {
    return false;
  }
};

module.exports = validateTimestamp;
