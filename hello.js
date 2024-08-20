const http = require('http');

const hostname = 'localhost';
const port = 3000;

const server = http.createServer((req, res) => {

  if(req.url.includes('/set-timer')){
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Called set-timer!\n');
    console.log(req.url)
  }
  else{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World from gtihub!\n');

  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
