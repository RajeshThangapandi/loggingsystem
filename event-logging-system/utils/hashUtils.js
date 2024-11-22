const crypto = require('crypto');

const calculateHash = (data) => {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

module.exports = { calculateHash };
