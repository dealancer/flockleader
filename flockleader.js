const cp = require('child_process');

class FlockLeader {
  constructor() {
    this.worker = cp.fork("./worker.js");
    this.promiseMap = new Map();

    this.worker.on('message', ({ command, id, result, reason }) => {
      const promise = this.promiseMap.get(id);
      if (command == 'done') {
          promise.resolve(result);
      } else if (command == 'error') {
          promise.reject(reason);
      }
    });
  }

  run = function(func, args) {
    const id = Math.floor(Math.random() * 1000);
    const promise = new Promise((resolve, reject) => {
      this.promiseMap.set(id, { resolve: resolve, reject: reject })
    });
    this.worker.send({ command: "run", id: id, func: func.toString(), args: args });
    return promise;
  }
}

module.exports = new FlockLeader();