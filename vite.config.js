import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import os from 'os';

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

function photoStoragePlugin() {
  return {
    name: 'photo-storage-plugin',
    configureServer(server) {
      const uploadDir = path.resolve(__dirname, 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Endpoint: Get Local Network IP & Server Info
      server.middlewares.use('/api/network-ip', (req, res) => {
        const ip = getLocalIp();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ip, port: 5173 }));
      });

      // Endpoint: Save Photo to disk
      server.middlewares.use('/api/save-photo', (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const { id, renderedPhoto, poses = [] } = data;

            if (!id || !renderedPhoto) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing id or renderedPhoto' }));
              return;
            }

            // Save Rendered Strip
            const base64Data = renderedPhoto.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filePath = path.join(uploadDir, `${id}.jpg`);
            fs.writeFileSync(filePath, buffer);

            // Save Poses if available
            const posePaths = [];
            poses.forEach((poseBase64, idx) => {
              try {
                const pData = poseBase64.replace(/^data:image\/\w+;base64,/, '');
                const pBuffer = Buffer.from(pData, 'base64');
                const pPath = path.join(uploadDir, `${id}_pose_${idx + 1}.jpg`);
                fs.writeFileSync(pPath, pBuffer);
                posePaths.push(`/uploads/${id}_pose_${idx + 1}.jpg`);
              } catch (e) {
                console.error('Error saving pose file:', e);
              }
            });

            // Clean up uploads older than 1 hour (3600s)
            const now = Date.now();
            fs.readdirSync(uploadDir).forEach(file => {
              try {
                const curFile = path.join(uploadDir, file);
                const stats = fs.statSync(curFile);
                if (now - stats.mtimeMs > 3600 * 1000) {
                  fs.unlinkSync(curFile);
                }
              } catch (e) {}
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              id,
              photoUrl: `/uploads/${id}.jpg`,
              poses: posePaths
            }));
          } catch (err) {
            console.error('Error saving photo API:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    photoStoragePlugin()
  ],
  server: {
    port: 5173,
    host: true
  }
});
