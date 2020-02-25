var crypto = require("crypto");

class Util {
  static createId() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = Util;