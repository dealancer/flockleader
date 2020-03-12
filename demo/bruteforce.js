const sha256 = require('js-sha256').sha256;

const password = "9999";
const passwordHashed = sha256(password);

const maxLen = 4;
const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";

const testPassword = function(p) {
  return sha256(p) == passwordHashed;
}

const bruteforce = function(len) {
  for (var i = 0; i < Math.pow(alphabet.length, len); i++) {
    let p = "";

    let j = i;
    while (j > 0) {
      p += alphabet[j % alphabet.length];
      j = Math.floor(j / alphabet.length);
    }

    for (let k = p.length; k < len; k++) {
      p += alphabet[0];
    }

    if (testPassword(p)) {
      return [true, p];
    }
  }

  return [false, null];
}

for (let i = 0; i <= maxLen; i++) {
  let result = bruteforce(i);
  if (result[1]) {
    console.log(result[1]);
    return;
  }
}
