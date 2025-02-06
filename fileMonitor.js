const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const socketIO = require('socket.io');

let logFilePath = '';

const monitorLogFile = (server) => {
  const io = socketIO(server);
  let socket;

  io.on('connection', (client) => {
    socket = client;
    console.log('Client connected:', client.id);
  });

  const watchFile = (filePath) => {
    if (logFilePath) {
      chokidar.unwatch(logFilePath);
    }
    logFilePath = filePath;

    const watcher = chokidar.watch(filePath, {
      persistent: true,
      usePolling: true,
      interval: 1000,
    });

    watcher.on('change', (filePath) => {
      console.log(`File changed: ${filePath}`);
      const logContent = fs.readFileSync(filePath, 'utf-8');
      if (socket) {
        socket.emit('logUpdate', logContent);
      }
    });

    watcher.on('error', (error) => {
      console.error(`Watcher error: ${error}`);
    });
  };

  return {
    setLogFilePath: (filePath) => {
      watchFile(filePath);
    },
  };
};

module.exports = monitorLogFile;