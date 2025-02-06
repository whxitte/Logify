const express = require('express');
const http = require('http');
const monitorLogFile = require('./fileMonitor');

const app = express();
const server = http.createServer(app);
const fileMonitor = monitorLogFile(server);

app.use(express.json());

app.post('/api/set-log-file', (req, res) => {
  const { filePath } = req.body;
  if (filePath) {
    fileMonitor.setLogFilePath(filePath);
    res.send({ message: 'Log file path set successfully' });
  } else {
    res.status(400).send({ message: 'File path is required' });
  }
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});