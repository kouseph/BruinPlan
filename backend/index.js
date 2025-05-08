// index.js
import http from "http";

const hostname = "127.0.0.1"; // or 'localhost'
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200; // HTTP status OK
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello from Node.js!\n");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
