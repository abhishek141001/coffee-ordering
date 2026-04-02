import ssh2 from 'ssh2';
const { Server, utils } = ssh2;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { geolocateIP } from './lib/geo.js';
import { createApp } from './tui/app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOST_KEY_PATH = process.env.HOST_KEY_PATH || path.join(__dirname, 'host.key');
const PORT = process.env.SSH_PORT || 2222;

// Generate host key if it doesn't exist
if (!fs.existsSync(HOST_KEY_PATH)) {
  console.log('Generating SSH host key...');
  const key = utils.generateKeyPairSync('ed25519');
  fs.writeFileSync(HOST_KEY_PATH, key.private);
  console.log('Host key generated at', HOST_KEY_PATH);
}

const hostKey = fs.readFileSync(HOST_KEY_PATH);

const server = new Server({ hostKeys: [hostKey] }, (client) => {
  let clientIP = null;

  client.on('authentication', (ctx) => {
    // Store the client IP from the connection
    clientIP = client._sock?.remoteAddress || null;
    // Accept all authentication (no password required)
    ctx.accept();
  });

  client.on('ready', () => {
    console.log(`Client connected from ${clientIP}`);

    client.on('session', (accept) => {
      const session = accept();

      session.on('pty', (accept) => {
        accept();
      });

      session.on('shell', async (accept) => {
        const stream = accept();

        // Detect location from IP
        let location = null;
        if (clientIP) {
          // Clean up IPv6-mapped IPv4
          const cleanIP = clientIP.replace('::ffff:', '');
          location = await geolocateIP(cleanIP);
        }

        // If local/no geolocation, use a default (can be configured)
        if (!location) {
          // Default to a central location — user will see no shops unless
          // shops are registered near this location
          location = {
            lat: parseFloat(process.env.DEFAULT_LAT || '12.9716'),
            lng: parseFloat(process.env.DEFAULT_LNG || '77.5946'),
            city: 'Default Location',
          };
        }

        try {
          createApp(stream, { location });
        } catch (error) {
          console.error('TUI error:', error);
          stream.write('An error occurred. Please try again.\r\n');
          stream.end();
        }

        stream.on('close', () => {
          console.log(`Client disconnected from ${clientIP}`);
        });
      });
    });
  });

  client.on('error', (err) => {
    console.error('Client error:', err.message);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`☕ Coffee SSH server listening on port ${PORT}`);
  console.log(`   Connect with: ssh localhost -p ${PORT}`);
});
