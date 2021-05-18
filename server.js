const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.static('./'));

app.listen(8084, () => {
  const url = 'http://localhost:8084/?p=234455';
  switch (process.platform) {
    case 'darwin':
      exec(`open ${url}`)
      break
    case 'win32':
      exec(`start ${url}`)
      break
  }

  console.info(`> Server start at: ${url}`);
})