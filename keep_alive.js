var http = require('http');

http.createServer(function (req, res) {
  res.write(`im ready`);
  res.end();
}).listen(8080)