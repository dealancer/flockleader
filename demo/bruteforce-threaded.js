const FlockLeader = require('../flockleader.js');

const init = async function() {
  const sha256 = require('js-sha256').sha256;

  const password = "9999";
  const passwordHashed = sha256(password);

  globals.maxLen = 4;
  globals.alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  
  globals.testPassword = function(p) {
    return sha256(p) == passwordHashed;
  }
}

const bruteforce = async function({len, start, end}) {
  for (var i = start; i < end; i++) {
    let p = "";

    let j = i;
    while (j > 0) {
      p += globals.alphabet[j % globals.alphabet.length];
      j = Math.floor(j / globals.alphabet.length);
    }

    for (let k = p.length; k < len; k++) {
      p += globals.alphabet[0];
    }

    if (globals.testPassword(p)) {
      return [true, p];
    }
  }

  return [false, null];
}


const globals = {};
const threads = 5;
const fl = new FlockLeader(threads);

init();

fl.init(init).then().catch(
  reason => console.error(reason)
);

var chunkSize = Math.ceil(Math.pow(globals.alphabet.length, globals.maxLen) / threads);
for (let len = 0; len <= globals.maxLen; len++) {
  let count = Math.pow(globals.alphabet.length, len);
  for (let start = 0; start < count; start += chunkSize) {
    let end = Math.min(start + chunkSize, count);
    fl.run(bruteforce, { len, start, end }).then(
      result => {
        if (result[1]) {
          console.log(result[1]);
          fl.done();
        }
      }
    ).catch(
      reason => console.error(reason)
    );
  }
}
