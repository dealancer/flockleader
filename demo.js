const fl = require('./flockleader.js');

const func = async function(i) {
  if (i > 10)
    return i;
  return func(i + 1);
}

fl.run(func, [1]).then(
  result => console.log('result: ' + result)
).catch(
  reason => console.log('reason: ' + reason)
);