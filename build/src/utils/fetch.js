const request = require("request");

const fetch = (url, options = {}) =>
  new Promise((resolve, reject) =>
    request(url, options, function(error, _, body) {
      if (error) reject(error);
      else resolve(body);
    })
  );

module.exports = fetch;
