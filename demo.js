const fl = require('./flockleader.js');

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

const arr = [9, 2, 4, 1, 0, -2, 4, 1, 4, 2, 8, 4];

// TODO: figure out why no error messages are shown if there are error in mergeSort func.
fl.run(mergeSort, [arr]).then(
  result => console.log(result)
).catch(
  reason => console.log(reason)
);