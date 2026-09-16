import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { startTunnel } from 'untun';

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

function cleanBase64(dataUrl) {
  if (!dataUrl) return null;
  const idx = dataUrl.indexOf(',');
  return idx !== -1 ? dataUrl.substring(idx + 1) : dataUrl;
}

function photoStoragePlugin() {
  let publicTunnelUrl = null;

  // Start Cloudflare Tunnel for Public 4G/5G mobile access
  async function initCloudflareTunnel() {
    try {
      const tunnel = await startTunnel({ port: 5173 });
      publicTunnelUrl = await tunnel.getURL();
      console.log('\n🚀 [Cloudflare Tunnel Online] Live Public URL:', publicTunnelUrl);
    } catch (e) {
      console.warn('Could not establish Cloudflare tunnel:', e.message);
    }
  }

  return {
    name: 'photo-storage-plugin',
    configureServer(server) {
      initCloudflareTunnel();

      const uploadDir = path.resolve(__dirname, 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Endpoint: Get Local Network IP & Cloudflare Public Tunnel URL
      server.middlewares.use('/api/network-ip', (req, res) => {
        const ip = getLocalIp();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          ip, 
          publicUrl: publicTunnelUrl,
          port: 5173 
        }));
      });

      // Endpoint: Save Softfile Bundle (Photos, GIF, Video, ZIP) to disk
      server.middlewares.use('/api/save-photo', (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const { id, renderedPhoto, poses = [], gifData, motionVideo, zipData } = data;

            if (!id || !renderedPhoto) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing id or renderedPhoto' }));
              return;
            }

            // 1. Save Rendered Strip
            const base64Data = cleanBase64(renderedPhoto);
            const buffer = Buffer.from(base64Data, 'base64');
            const filePath = path.join(uploadDir, `${id}.jpg`);
            fs.writeFileSync(filePath, buffer);

            // 2. Save Poses if available
            const posePaths = [];
            poses.forEach((poseBase64, idx) => {
              try {
                if (poseBase64) {
                  const pData = cleanBase64(poseBase64);
                  const pBuffer = Buffer.from(pData, 'base64');
                  const pPath = path.join(uploadDir, `${id}_pose_${idx + 1}.jpg`);
                  fs.writeFileSync(pPath, pBuffer);
                  posePaths.push(`/uploads/${id}_pose_${idx + 1}.jpg`);
                }
              } catch (e) {
                console.error('Error saving pose file:', e);
              }
            });

            // 3. Save Boomerang GIF if available
            let gifPath = null;
            if (gifData) {
              try {
                const gData = cleanBase64(gifData);
                const gBuffer = Buffer.from(gData, 'base64');
                const gFilePath = path.join(uploadDir, `${id}_boomerang.gif`);
                fs.writeFileSync(gFilePath, gBuffer);
                gifPath = `/uploads/${id}_boomerang.gif`;
              } catch (e) {
                console.error('Error saving GIF file:', e);
              }
            }

            // 4. Save Live Motion Video if available
            let motionPath = null;
            if (motionVideo) {
              try {
                const isMp4 = motionVideo.startsWith('data:video/mp4');
                const vData = cleanBase64(motionVideo);
                const vBuffer = Buffer.from(vData, 'base64');
                
                // Write both .mp4 and .webm for maximum compatibility across Windows & Mobile
                fs.writeFileSync(path.join(uploadDir, `${id}_motion.mp4`), vBuffer);
                fs.writeFileSync(path.join(uploadDir, `${id}_motion.webm`), vBuffer);
                
                motionPath = isMp4 ? `/uploads/${id}_motion.mp4` : `/uploads/${id}_motion.mp4`;
              } catch (e) {
                console.error('Error saving motion video file:', e);
              }
            }

            // 5. Save ZIP Bundle if available
            let zipPath = null;
            if (zipData) {
              try {
                const zData = cleanBase64(zipData);
                const zBuffer = Buffer.from(zData, 'base64');
                const zFilePath = path.join(uploadDir, `${id}_bundle.zip`);
                fs.writeFileSync(zFilePath, zBuffer);
                zipPath = `/uploads/${id}_bundle.zip`;
              } catch (e) {
                console.error('Error saving ZIP bundle file:', e);
              }
            }

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
              poses: posePaths,
              gifUrl: gifPath,
              motionUrl: motionPath,
              zipUrl: zipPath,
              publicUrl: publicTunnelUrl ? `${publicTunnelUrl}/?guestPhoto=${id}` : null
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
    host: true,
    allowedHosts: true
  }
});
