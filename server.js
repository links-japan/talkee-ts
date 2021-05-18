const express = require('express');
const open = require('@omni-door/cli/lib/commands/dev/open').default;
const app = express();

app.use(express.static('./'));

app.listen(8084, async () => {
  const url = 'http://localhost:8084';
  await open(url);
  console.info(`> Server start at: ${url}`);
})