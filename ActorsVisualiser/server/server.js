const http = require('http');
const router = require('./routes/Router');

const server = http.createServer((req, res) => {

    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    if (req.method === 'OPTIONS') {
        res.writeHead(200);   // ok to preflight requests
        res.end();
        return;
    }

    router(req, res);

});

server.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});