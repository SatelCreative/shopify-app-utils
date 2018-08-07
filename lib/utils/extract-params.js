const { URLSearchParams } = require('url');

const extractParams = ({ url }) => {
  try {
    const query = url.split('?')[1];

    if (!query) {
      return new URLSearchParams();
    }

    return new URLSearchParams(query);
  } catch (e) {
    return new URLSearchParams();
  }
};

module.exports = extractParams;
