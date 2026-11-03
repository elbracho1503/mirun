// Servidor local mínimo para probar la app (sin dependencias). Uso: node .claude/serve.js
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css',
  '.json':'application/json','.png':'image/png'};
http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, p === '/' ? 'index.html' : p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  // sin Service Worker en pruebas: así siempre se ve la última versión
  if (p === '/sw.js') { res.writeHead(404); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
    res.end(data);
  });
}).listen(8080, () => console.log('MiRun en http://localhost:8080'));
