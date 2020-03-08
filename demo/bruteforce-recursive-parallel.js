const FlockLeader = require('../flockleader.js');

const init = async function() {
  const sha256 = require('js-sha256').sha256;

  const password = "999";
  const passwordHashed = sha256(password);

  globals.maxLen = 3;
  globals.alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
  globals.testPassword = function(p) {
    return sha256(p) == passwordHashed;
  }
}

const bruteforce = async function(p) {
  if (globals.testPassword(p)) {
    return [true, p];
  }

  if (p.length >= globals.maxLen) {
    return [false, null];
  }

  let calls = new Array();
  for (let i = 0; i < globals.alphabet.length; i++) {
    calls.push(run(p + globals.alphabet[i]));
  }
  let results = await Promise.all(calls);
  for (let i = 0; i < globals.alphabet.length; i++) {
    if (results[i][0]) {
      return results[i];
    }
  }

  return [false, null]
}


const fl = new FlockLeader(10);
fl.init(init).then().catch(
  reason => console.error(reason)
);

fl.run(bruteforce, "").then(
  result => console.log(result)
).catch(
  reason => console.error(reason)
).finally(
  () => fl.done()
);
