const cp = require('child_process');
const util = require('./util.js');

class FlockLeader {
  constructor(workerCount, maxRecursiveCallCount) {
    this.workerCount = workerCount ? workerCount : 1;
    this.maxRecursiveCallCount = maxRecursiveCallCount ? maxRecursiveCallCount : 1;

    this.workerPool = new Array();
    this.promiseMap = new Map();

    let onMessage = ({ command, workerId, funcId, func, args, result, reason }) => {
      if (command == 'terminate') {
        if (this.promiseMap.has(this.firstFuncId)) {
          this.promiseMap.get(this.firstFuncId).resolve({ funcId: funcId, result: result });
          this.promiseMap.delete(this.firstFuncId);
        }
      } else if (command == 'done') {
        if (this.promiseMap.has(funcId)) {
          this.promiseMap.get(funcId).resolve({ funcId: funcId, result: result });
          this.promiseMap.delete(funcId);
        }
      } else if (command == 'error') {
        if (this.promiseMap.has(funcId)) {
          this.promiseMap.get(funcId).reject({ funcId: funcId, reason: reason });
          this.promiseMap.delete(funcId);
        }
      } else if (command == 'run') {
        this.runFunc({ funcId: funcId, func: func, args: args }).then(({ funcId, result }) => {
            this.workerPool[workerId].send({ command: 'done', funcId: funcId, result: result })
        }).catch(({ funcId, reason }) => {
          this.workerPool[workerId].send({ command: 'error', funcId: funcId, reason: reason.toString() })
        });
      }
    }

    for (let i = 0; i < this.workerCount; i++) {
      let worker = cp.fork(__dirname + "/worker.js");
      let onMessageWrapper = (args) => {
        return onMessage({ ...args, ...{ workerId: i } });
      };
      worker.on('message',  onMessageWrapper);
      this.workerPool.push(worker);
    }

    this.init(async s => settings = s, {
      maxRecursiveCallCount: this.maxRecursiveCallCount
    }).then();
  }

  runFunc = function({ funcId, func, args, init }) {
    if (!funcId) {
      funcId = util.createId();
      this.firstFuncId = funcId;
    }
    let promise = new Promise((resolve, reject) => {
      this.promiseMap.set(funcId, { resolve: resolve, reject: reject })
    });
    if (init) {
      for (let workerId = 0; workerId < this.workerCount; workerId++) {
        this.workerPool[workerId].send({ command: 'run', funcId: funcId, func: func.toString(), args: args });
      }
    } else {
      let workerId = Math.floor(Math.random() * this.workerCount);
      this.workerPool[workerId].send({ command: 'run', funcId: funcId, func: func.toString(), args: args });
    }
    return promise;
  }

  run = function(func, ...args) {
    return new Promise((resolve, reject) => {
      this.runFunc({ func: func, args: args }).then(
        ({ result }) => resolve(result)
      ).catch(
        ({ reason }) => reject(reason)
      );
    });
  }

  init = function(func, ...args) {
    return new Promise((resolve, reject) => {
      this.runFunc({ func: func, args: args, init: true}).then(
        ({ result }) => resolve(result)
      ).catch(
        ({ reason }) => reject(reason)
      );
    });
  }

  done = function() {
    this.workerPool.map(worker => worker.kill());
  }
}

module.exports = FlockLeader;
