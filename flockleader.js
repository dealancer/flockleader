const cp = require('child_process');
const util = require('./util.js');

class FlockLeader {
  constructor(workerCount) {
    this.workerCount = workerCount ? workerCount : 1;
    this.workerPool = new Array();
    this.promiseMap = new Map();

    var onMessage = ({ command, workerId, funcId, func, args, result, reason }) => {
      if (command == 'done') {
        const promise = this.promiseMap.get(funcId);
        promise.resolve({ funcId: funcId, result: result });
      } else if (command == 'error') {
        const promise = this.promiseMap.get(funcId);
        promise.reject({ funcId: funcId, reason: reason });
      } else if (command == 'run') {
        this.runFunc({ funcId: funcId, func: func, args: args }).then(
          ({ funcId, result }) => {
            this.workerPool[workerId].send({ command: 'done', funcId: funcId, result: result })
          }
        ).catch(
          ({ funcId, reason }) => {
            this.workerPool[workerId].send({ command: 'error', funcId: funcId, reason: reason })
          }
        );
      }
    }

    for (let i = 0; i < this.workerCount; i++) {
      let worker = cp.fork("./worker.js");
      let onMessageWrapper = (args) => {
        return onMessage({ ...args, ...{ workerId: i } });
      };
      worker.on('message',  onMessageWrapper);
      this.workerPool.push(worker);
    }
  }

  runFunc = function({ funcId, func, args }) {
    if (!funcId) {
      funcId = util.createId();
    }
    const promise = new Promise((resolve, reject) => {
      this.promiseMap.set(funcId, { resolve: resolve, reject: reject })
    });
    var workerId = Math.floor(Math.random() * this.workerCount);
    this.workerPool[workerId].send(
      { command: 'run', funcId: funcId, func: func.toString(), args: args }
    );
    return promise;
  }

  run = function(func, args) {
    return new Promise((resolve, reject) => {
      this.runFunc({ func: func, args: args }).then(
        ({ result }) => resolve(result)
      ).catch(
        ({ reason }) => reject(reason)
      );
    });
  }
}

module.exports = FlockLeader;