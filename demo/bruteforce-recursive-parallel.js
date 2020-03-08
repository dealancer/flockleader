const FlockLeader = require('../flockleader.js');

const init = async function() {
  const sha256 = require('js-sha256').sha256;

  const password = "Sup";
  const passwordHashed = sha256(password);

  globals.maxLen = 3;
  globals.alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
  globals.testPassword = function(p) {
    return sha256(p) == passwordHashed;
  }
}

const bruteforce = async function(p) {
  if (globals.testPassword(p)) {
    terminate(p);
  }

  if (p.length >= globals.maxLen) {
    return;
  }

  let calls = new Array();
  for (let i = 0; i < globals.alphabet.length; i++) {
    calls.push(run(p + globals.alphabet[i]));
  }
  await Promise.all(calls);
}


const fl = new FlockLeader(12);
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
