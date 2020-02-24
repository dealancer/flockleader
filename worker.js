const promiseMap = new Map();

process.on('message', ({ command, id, func, args, result, reason }) => {
  if (command == 'done') {
    const promise = promiseMap.get(id);
    promise.resolve(result);
  } else if (command == 'error') {
    const promise = promiseMap.get(id);
    promise.reject(reason);
  } else if (command == 'run') {
    var funcStr = func;
    eval("func = " + func);
    const run = function(...args) {
      const newId = Math.floor(Math.random() * 1000000);
      const promise = new Promise((resolve, reject) => {
        promiseMap.set(newId, { resolve: resolve, reject: reject })
      });
      process.send({ command: 'run', id: newId, func: funcStr, args: args });
      return promise;
    };
    func(...args).then(result => {
      process.send({ command: 'done', id: id, result: result });
    }).catch(reason => {
      process.send({ command: 'error', id: id, reason: reason });
    });
  }
});