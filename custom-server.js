const http = require('http');
const os = require('os');
const path = require('path');
const EventEmitter = require('events');
const sensorBus = new EventEmitter();
sensorBus.on('reading', r => console.log('Sensor reading:', r));
const server = http.createServer((req,res)=>{
  if(req.url === '/sensor') { const reading={stationId:'ST-001',ph:7.2,turbidity:2.1}; sensorBus.emit('reading',reading); res.writeHead(200,{'Content-Type':'application/json'}); return res.end(JSON.stringify(reading)); }
  if(req.url === '/system') { return res.end(JSON.stringify({platform:os.platform(),cpus:os.cpus().length,base:path.basename(__filename)})); }
  res.end('Smart Water custom Node server');
});
server.listen(8081,()=>console.log('Custom server: http://localhost:8081'));
