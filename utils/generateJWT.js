const jwt = require('jsonwebtoken');

/**
 * create JSON Web Token
 * @param {Object} payload token content
 * @param {String} secret token secret
 * @param {Object} [option] same to npm package - jsonwebtoken
 * @returns {String}
 */
module.exports = (payload, secret, option = {}) => new Promise((resolve, reject) => {
  jwt.sign(payload, secret, option, (err, token) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(token);
  });
});
