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

/**
 * Save softfile, write to disk via Vite API, and generate QR Code with Cloudflare Public URL
 * @param {string} renderedDataUrl - Base64 rendered photo
 * @param {Array<string>} rawPhotos - array of captured poses
 * @returns {Promise<{ id: string, downloadUrl: string, qrDataUrl: string, expiresAt: number, isPublicCloud: boolean }>}
 */
export async function saveSoftfileAndGenerateQR(renderedDataUrl, rawPhotos = []) {
  pruneExpiredPhotos();

  const id = 'snap_' + Math.random().toString(36).substring(2, 8) + '_' + Date.now().toString(36);
  const now = Date.now();
  const expiresAt = now + EXPIRY_MS;

  // 1. Save Photo to server disk (public/uploads/)
  try {
    await fetch('/api/save-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        renderedPhoto: renderedDataUrl,
        poses: rawPhotos
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
    poses: rawPhotos
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
    isPublicCloud
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
