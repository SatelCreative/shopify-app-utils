const { promisify } = require('util');
const jsonwebtoken = require('jsonwebtoken');

const verifyJWT = promisify(jsonwebtoken.verify);

const validateJWT = async ({ token, secret }) => {
  try {
    const decoded = await verifyJWT(token, secret);
    return { valid: true, decoded };
  } catch (error) {
    try {
      // Try to extract the payload anyway
      const decoded = jsonwebtoken.decode(token, secret) || {};
      return { valid: false, decoded };
    } catch (err) {
      // Unable to decode
      return { valid: false, decoded: {} };
    }
  }
};

module.exports = validateJWT;
