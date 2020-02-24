const fl = require('./flockleader.js');

const func = async function(i) {
  if (i > 4)
    return i;
  return await run(i + 1);
}

fl.run(func, [1]).then(
  result => console.log('result: ' + result)
).catch(
  reason => console.log('reason: ' + reason)
);