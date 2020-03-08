const util = require('./util.js');
const promiseMap = new Map();

var settings = {};
var globals = {};

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

    let runMultiple = async function(...allArgs) {
      var results = new Array();

      for (let i = 0; i < allArgs.length; i = i + settings.maxRecursiveCallCount) {
        let calls = allArgs.slice(
          i, Math.min(i + settings.maxRecursiveCallCount, allArgs.length)
        ).map(
          args => run(args)
        );
        results.push(...await Promise.all(calls));
      }

      return results;
    }

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
