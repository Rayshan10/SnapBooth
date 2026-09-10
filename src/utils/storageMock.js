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
 * Save softfile with 1 hour TTL and generate QR Code data URL
 * @param {string} renderedDataUrl - Base64 rendered photo
 * @param {Array<string>} rawPhotos - array of captured poses
 * @returns {Promise<{ id: string, downloadUrl: string, qrDataUrl: string, expiresAt: number }>}
 */
export async function saveSoftfileAndGenerateQR(renderedDataUrl, rawPhotos = []) {
  pruneExpiredPhotos();

  const id = 'snap_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
  const now = Date.now();
  const expiresAt = now + EXPIRY_MS;

  const photoRecord = {
    id,
    createdAt: now,
    expiresAt,
    renderedPhoto: renderedDataUrl,
    poses: rawPhotos
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[id] = photoRecord;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('LocalStorage full, trimming older photos', e);
    // Keep only current one if storage is close to 5MB limit
    const singleStore = { [id]: photoRecord };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(singleStore));
  }

  // Construct Download URL (point to origin with ?photoId=id or softfile viewer)
  const currentOrigin = window.location.origin;
  const downloadUrl = `${currentOrigin}/?photoId=${id}`;

  // Generate QR Code with high quality and custom dark theme colors
  const qrDataUrl = await QRCode.toDataURL(downloadUrl, {
    width: 320,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });

  return {
    id,
    downloadUrl,
    qrDataUrl,
    expiresAt
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
