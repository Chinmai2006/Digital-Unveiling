import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PresentationStateMachine } from './stateMachine.js';
import { setupWebSocketServer } from './websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize state machine & websocket server
const stateMachine = new PresentationStateMachine();
const { getLocalIp } = setupWebSocketServer(server, stateMachine);

// Serve static client assets if built
const clientDist = path.join(__dirname, '../dist');
app.use(express.static(clientDist));

// API Endpoint for LAN info
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    ip: getLocalIp(),
    port: PORT,
  });
});

// SPA fallback for routing
app.get('*', (req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) {
        res.status(200).send(`
          <html>
            <body style="font-family: sans-serif; background: #07090e; color: #fff; text-align: center; padding: 50px;">
              <h1>ACES Logo Unveil Server is Running</h1>
              <p>WebSocket server listening on port <strong>${PORT}</strong></p>
              <p>LAN IP Address: <strong>${getLocalIp()}</strong></p>
              <p>Run Vite client with <code>npm run dev:client</code> for frontend experience.</p>
            </body>
          </html>
        `);
      }
    });
  }
});

server.listen(PORT, () => {
  const ip = getLocalIp();
  console.log(`\n=================================================`);
  console.log(`🚀 ACES LOGO UNVEIL SERVER STARTED SUCCESSFULLY`);
  console.log(`=================================================`);
  console.log(`📡 WebSocket / Express Server: http://${ip}:${PORT}`);
  console.log(`💻 Local Access:              http://localhost:${PORT}`);
  console.log(`📱 Tablet Connection Target:   ws://${ip}:${PORT}`);
  console.log(`=================================================\n`);
});
