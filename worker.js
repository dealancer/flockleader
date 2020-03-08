const util = require('./util.js');
const promiseMap = new Map();

const globals = {};

process.on('message', ({ command, funcId, func, args, result, reason }) => {
  if (command == 'done') {
    promiseMap.get(funcId).resolve(result);
  } else if (command == 'error') {
    promiseMap.get(funcId).reject(reason);
  } else if (command == 'run') {
    eval("func = " + func);

    let run = function(...args) {
      let newFuncId = util.createId();
      let promise = new Promise((resolve, reject) => {
        promiseMap.set(newFuncId, { resolve: resolve, reject: reject })
      });
      process.send({ command: 'run', funcId: newFuncId, func: func.toString(), args: args });
      return promise;
    };

    let terminate = function(result) {
      process.send({ command: 'terminate', result: result });
    }
  
    func(...args).then(result => {
      process.send({ command: 'done', funcId: funcId, result: result });
    }).catch(reason => {
      process.send({ command: 'error', funcId: funcId, reason: reason.toString() });
    });
  }
});
