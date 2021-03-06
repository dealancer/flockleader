const sha256 = require('js-sha256').sha256;

const password = "9999";
const passwordHashed = sha256(password);

const maxLen = 4;
const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";

const testPassword = function(p) {
  return sha256(p) == passwordHashed;
}

const bruteforce = async function(p) {
  if (testPassword(p)) {
    return [true, p];
  }

  if (p.length >= maxLen) {
    return [false, null];
  }

  for (let i = 0; i < alphabet.length; i++) {
    let res = await bruteforce(p + alphabet[i]);
    if (res[0]) {
      return res;
    }
  }

  return [false, null];
}

bruteforce("").then(
  result => console.log(result[1])
).catch(
  reason => console.error(reason)
)
