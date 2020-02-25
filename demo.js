const FlockLeader = require('./flockleader.js');

const fl = new FlockLeader(10);

const mergeSort = async function(arr) {
  if (arr.length < 2) {
    return arr;
  }

  var [a, b] = await Promise.all([
    run(arr.slice(0, Math.floor(arr.length / 2))).catch(reason => console.log(reason)),
    run(arr.slice(Math.floor(arr.length / 2), arr.length)).catch(reason => console.log(reason)),
  ]);

  var resArr = [];
  var i = 0, j = 0;
  while (true) {
    if ( i < a.length && j < b.length) {
      if (a[i] < b[j]) {
        resArr.push(a[i]);
        i++;
      } else {
        resArr.push(b[j]);
        j++;
      }
    } else if (i < a.length) {
      resArr.push(...a.slice(i, a.length))
      break;
    } else if (j < b.length) {
      resArr.push(...b.slice(j, b.length))
      break;
    }
  }

  return resArr;
}

const arr = new Array();
for (let i = 0; i < 10; i++) {
  arr.push(Math.floor(Math.random() * 1000000000) - 500000000);
}

// TODO: add comments
// TODO: debug
// TODO: stop processes
fl.run(mergeSort, [arr]).then(
  result => console.log(result)
).catch(
  reason => console.log(reason)
);