import QRCode from 'qrcode';
import { uploadToCloud } from './cloudStorage';

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
 * Save softfile with 1 hour TTL, upload to cloud for instant phone downloads, and generate QR Code
 * @param {string} renderedDataUrl - Base64 rendered photo
 * @param {Array<string>} rawPhotos - array of captured poses
 * @returns {Promise<{ id: string, downloadUrl: string, qrDataUrl: string, expiresAt: number, isCloud: boolean }>}
 */
export async function saveSoftfileAndGenerateQR(renderedDataUrl, rawPhotos = []) {
  pruneExpiredPhotos();

  const id = 'snap_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
  const now = Date.now();
  const expiresAt = now + EXPIRY_MS;

  // 1. Upload to Cloud Storage with 1-Hour TTL (so any phone on 4G/5G can download immediately)
  let cloudUrl = null;
  try {
    cloudUrl = await uploadToCloud(renderedDataUrl, `SnapBooth_${id}.jpg`);
  } catch (err) {
    console.warn('Cloud upload failed, falling back to local URL:', err);
  }

  // 2. Construct target Download URL
  const currentOrigin = window.location.origin;
  const downloadUrl = cloudUrl || `${currentOrigin}/?photoId=${id}`;

  const photoRecord = {
    id,
    createdAt: now,
    expiresAt,
    renderedPhoto: renderedDataUrl,
    cloudUrl,
    downloadUrl,
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

  // 3. Generate QR Code pointing to the Cloud Download URL
  const qrDataUrl = await QRCode.toDataURL(downloadUrl, {
    width: 360,
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
    isCloud: !!cloudUrl
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
