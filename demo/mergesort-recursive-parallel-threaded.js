const FlockLeader = require('../flockleader.js');

const mergeSort = async function(arr) {
  if (arr.length < 2) {
    return arr;
  }

  let [a, b] = await runMultiple(
    arr.slice(0, Math.floor(arr.length / 2)),
    arr.slice(Math.floor(arr.length / 2), arr.length)
  );

  let resArr = [];
  let i = 0, j = 0;
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
      resArr.push(...a.slice(i, a.length));
      break;
    } else if (j < b.length) {
      resArr.push(...b.slice(j, b.length));
      break;
    }
  }

  return resArr;
}

let arr = new Array();
for (let i = 0; i < 50000; i++) {
  arr.push(Math.floor(Math.random() * 1000000000) - 500000000);
}

const fl = new FlockLeader(3, 2);
fl.run(mergeSort, arr).then(
  result => console.log(result)
).catch(
  reason => console.error(reason)
).finally(
  () => fl.done()
);