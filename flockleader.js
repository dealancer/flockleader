const cp = require('child_process');
const util = require('./util.js');

class FlockLeader {
  constructor(workerCount) {
    this.workerCount = workerCount ? workerCount : 1;
    this.workerPool = new Array();
    this.promiseMap = new Map();

    let onMessage = ({ command, workerId, funcId, func, args, result, reason }) => {
      if (command == 'done') {
        this.promiseMap.get(funcId).resolve({ funcId: funcId, result: result });
      } else if (command == 'error') {
        this.promiseMap.get(funcId).reject({ funcId: funcId, reason: reason });
      } else if (command == 'run') {
        this.runFunc({ funcId: funcId, func: func, args: args }).then(({ funcId, result }) => {
            this.workerPool[workerId].send({ command: 'done', funcId: funcId, result: result })
        }).catch(({ funcId, reason }) => {
          this.workerPool[workerId].send({ command: 'error', funcId: funcId, reason: reason.toString() })
        });
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
    funcId = funcId ? funcId : util.createId();
    let promise = new Promise((resolve, reject) => {
      this.promiseMap.set(funcId, { resolve: resolve, reject: reject })
    });
    let workerId = Math.floor(Math.random() * this.workerCount);
    this.workerPool[workerId].send({ command: 'run', funcId: funcId, func: func.toString(), args: args });
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

  done = function() {
    this.workerPool.map(worker => worker.kill());
  }
}

module.exports = FlockLeader;
