const cp = require('child_process');

class FlockLeader {
  constructor() {
    this.worker = cp.fork("./worker.js");
    this.promiseMap = new Map();

    this.worker.on('message', ({ command, id, func, args, result, reason }) => {
      if (command == 'done') {
        const promise = this.promiseMap.get(id);
        promise.resolve({ id: id, result: result });
      } else if (command == 'error') {
        const promise = this.promiseMap.get(id);
        promise.reject({ id: id, reason: reason });
      } else if (command == 'run') {
        this.runLogic({ id: id, func: func, args: args }).then(
          ({ id, result }) => this.worker.send({ command: 'done', id: id, result: result })
        ).catch(
          ({ id, reason }) => this.worker.send({ command: 'error', id: id, reason: reason })
        );
      }
    });
  }

  runLogic = function({ id, func, args }) {
    if (!id) {
      id = Math.floor(Math.random() * 1000);
    }
    const promise = new Promise((resolve, reject) => {
      this.promiseMap.set(id, { resolve: resolve, reject: reject })
    });
    this.worker.send({ command: 'run', id: id, func: func.toString(), args: args });
    return promise;
  }

  run = function(func, args) {
    return new Promise((resolve, reject) => {
      this.runLogic({ func: func, args: args }).then(
        ({ result }) => resolve(result)
      ).catch(
        ({ reason }) => reject(reason)
      );
    });
  }
}

module.exports = new FlockLeader();