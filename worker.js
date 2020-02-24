process.on('message', ({ command, id, func, args  }) => {
  if (command == 'run') {
    eval("func = " + func); 
    func(...args).then(result => {
      process.send({ command: 'done', id: id, result: result });
    }).catch(reason => {
      process.send({ command: 'error', id: id, reason: reason });
    });
  }
});