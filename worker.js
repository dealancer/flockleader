const util = require('./util.js');

const promiseMap = new Map();

process.on('message', ({ command, funcId, func, args, result, reason }) => {
  if (command == 'done') {
    const promise = promiseMap.get(funcId);
    promise.resolve(result);
  } else if (command == 'error') {
    const promise = promiseMap.get(funcId);
    promise.reject(reason);
  } else if (command == 'run') {
    var funcStr = func;
    eval("func = " + func);
    const run = function(...args) {
      const newFuncId = util.createId();
      const promise = new Promise((resolve, reject) => {
        promiseMap.set(newFuncId, { resolve: resolve, reject: reject })
      });
      process.send({ command: 'run', funcId: newFuncId, func: funcStr, args: args });
      return promise;
    };
    func(...args).then(result => {
      process.send({ command: 'done', funcId: funcId, result: result });
    }).catch(reason => {
      process.send({ command: 'error', funcId: funcId, reason: reason });
    });
  }
});