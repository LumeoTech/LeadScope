// Script de Keep-Alive periódico para evitar cold-start (a cada 10 minutos)
const https = require('https');
const http = require('http');

const URL = process.env.BACKEND_HEALTH_URL || 'https://leadscope-e8lo.onrender.com/api/health';
const INTERVAL_MS = 10 * 60 * 1000; // 10 minutos

function ping() {
  const client = URL.startsWith('https') ? https : http;
  const req = client.get(URL, (res) => {
    console.log(`[${new Date().toISOString()}] Ping keep-alive enviado. Status: ${res.statusCode}`);
  });

  req.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Falha no ping:`, err.message);
  });

  req.setTimeout(45000, () => {
    req.destroy();
    console.warn(`[${new Date().toISOString()}] Timeout no ping keep-alive`);
  });
}

console.log(`Keep-alive ativo para: ${URL} (intervalo: 10 minutos)`);
ping();
setInterval(ping, INTERVAL_MS);
