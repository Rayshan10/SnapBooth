import QRCode from 'qrcode';

const STORAGE_KEY = 'snapbooth_softfiles_v1';
const EXPIRY_MS = 60 * 60 * 1000; // 1 Jam (3600 detik)

/**
 * Clean up files older than 1 hour from local storage
 */
export function pruneExpiredPhotos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const store = JSON.parse(raw);
    const now = Date.now();
    const updated = {};
    
    Object.keys(store).forEach(id => {
      if (store[id].expiresAt > now) {
        updated[id] = store[id];
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to prune expired photos', e);
  }
}

/**
 * Get the server's public Cloudflare Tunnel URL or local network address
 */
async function getNetworkBaseUrl() {
  try {
    const res = await fetch('/api/network-ip');
    if (res.ok) {
      const data = await res.json();
      // 1. Prefer Cloudflare Tunnel Public HTTPS URL (accessible anywhere on 4G/5G)
      if (data.publicUrl && data.publicUrl.startsWith('https://')) {
        return { baseUrl: data.publicUrl, isPublicCloud: true };
      }
      // 2. Fallback to local Wi-Fi IP
      if (data.ip && data.ip !== 'localhost' && data.ip !== '127.0.0.1') {
        const port = window.location.port ? `:${window.location.port}` : '';
        return { baseUrl: `http://${data.ip}${port}`, isPublicCloud: false };
      }
    }
  } catch (e) {
    console.warn('Cannot fetch network IP, using origin:', e);
  }
  return { baseUrl: window.location.origin, isPublicCloud: false };
}

function blobToBase64(blob) {
  return new Promise((resolve) => {
    if (!blob) return resolve(null);
    if (typeof blob === 'string') return resolve(blob);
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

/**
 * Save softfile, write to disk via Vite API, and generate QR Code with Cloudflare Public URL
 * Supports object param { renderedDataUrl, rawPhotos, gifDataUrl, motionVideoBlob, zipBlob } or positional params
 */
export async function saveSoftfileAndGenerateQR(paramsOrRendered, rawPhotos = []) {
  pruneExpiredPhotos();

  let renderedDataUrl, poses, gifDataUrl, motionVideoBlob, zipBlob;

  if (typeof paramsOrRendered === 'object' && paramsOrRendered.renderedDataUrl) {
    renderedDataUrl = paramsOrRendered.renderedDataUrl;
    poses = paramsOrRendered.rawPhotos || [];
    gifDataUrl = paramsOrRendered.gifDataUrl || null;
    motionVideoBlob = paramsOrRendered.motionVideoBlob || null;
    zipBlob = paramsOrRendered.zipBlob || null;
  } else {
    renderedDataUrl = paramsOrRendered;
    poses = rawPhotos;
  }

  const id = 'snap_' + Math.random().toString(36).substring(2, 8) + '_' + Date.now().toString(36);
  const now = Date.now();
  const expiresAt = now + EXPIRY_MS;

  // Convert blobs to base64 for API upload
  const motionVideoBase64 = motionVideoBlob ? await blobToBase64(motionVideoBlob) : null;
  const zipBase64 = zipBlob ? await blobToBase64(zipBlob) : null;

  // 1. Save Photo Bundle to server disk (public/uploads/)
  try {
    await fetch('/api/save-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        renderedPhoto: renderedDataUrl,
        poses,
        gifData: gifDataUrl,
        motionVideo: motionVideoBase64,
        zipData: zipBase64
      })
    });
  } catch (err) {
    console.warn('Local file saving error, continuing with client storage:', err);
  }

  // 2. Determine Mobile Download URL (Cloudflare Public URL or Local IP)
  const { baseUrl, isPublicCloud } = await getNetworkBaseUrl();
  const downloadUrl = `${baseUrl}/?guestPhoto=${id}`;

  const photoRecord = {
    id,
    createdAt: now,
    expiresAt,
    renderedPhoto: renderedDataUrl,
    downloadUrl,
    isPublicCloud,
    poses,
    gifUrl: gifDataUrl,
    hasMotion: !!motionVideoBase64,
    hasZip: !!zipBase64
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[id] = photoRecord;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('LocalStorage full, trimming older photos', e);
    const singleStore = { [id]: photoRecord };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(singleStore));
  }

  // 3. Generate Clean QR Code pointing to the Public Cloud URL
  const qrDataUrl = await QRCode.toDataURL(downloadUrl, {
    width: 380,
    margin: 2,
    color: {
      dark: '#272a33',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  });

  return {
    id,
    downloadUrl,
    qrDataUrl,
    expiresAt,
    isPublicCloud,
    photoUrl: `/uploads/${id}.jpg`,
    gifUrl: `/uploads/${id}_boomerang.gif`,
    motionUrl: `/uploads/${id}_motion.webm`,
    zipUrl: `/uploads/${id}_bundle.zip`,
    zipBlob
  };
}

/**
 * Fetch photo by ID if not expired
 */
export function getSoftfileById(id) {
  pruneExpiredPhotos();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw);
    const photo = store[id];
    if (!photo) return null;
    if (Date.now() > photo.expiresAt) {
      return null; // Expired
    }
    return photo;
  } catch (e) {
    return null;
  }
}
