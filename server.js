// server.js
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
let WSCLIENT = {}
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const WebSocket = require('ws');

app.prepare().then(() => {
  const server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
  })
  const wss = new WebSocket.Server({ server });
  wss.on('connection', function connection(ws) {
    console.log(ws)
    ws.on('message', function incoming(message) {
      const req = JSON.parse(message)
      switch (req.type) {
          case "register":
              WSCLIENT[req.negotiationid] = {...WSCLIENT[req.negotiationid], [req.party]: ws}
              break;
      
          default:
              break;
      }
    });
   
    ws.send('something');
  });
  
  server.listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})