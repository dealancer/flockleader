process.on('message', ({ id, func, args  }) => {
  eval("func = " + func); 
  func(...args).then(result => {
    process.send({ id: id, status: 'done', result: result });
  }).catch(reason => {
    process.send({ id: id, status: 'error', reason: reason });
 });
});