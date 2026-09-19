import JSZip from 'jszip';

function cleanBase64(dataUrl) {
  if (!dataUrl) return '';
  const idx = dataUrl.indexOf(',');
  return idx !== -1 ? dataUrl.substring(idx + 1) : dataUrl;
}

/**
 * Create a complete ZIP package of all photobooth assets
 * @param {Object} assets
 * @param {string} assets.photoStripDataUrl - Photo strip JPG Base64
 * @param {Array<string>} assets.posesDataUrls - Array of pose JPG Base64
 * @param {string|Blob} assets.gifDataUrl - GIF Base64 or Blob
 * @param {Blob|string} assets.motionVideoBlob - Video Blob or URL
 * @param {string} assets.sessionId - Unique session identifier
 * @returns {Promise<Blob>} ZIP File Blob
 */
export async function createSoftfileZip(assets) {
  const {
    photoStripDataUrl,
    posesDataUrls = [],
    gifDataUrl,
    motionVideoBlob,
    sessionId = 'snapbooth'
  } = assets;

  const zip = new JSZip();
  const folder = zip.folder(`SnapBooth_${sessionId}`);

  // 1. Add Main Photo Strip JPG
  if (photoStripDataUrl) {
    const base64Data = cleanBase64(photoStripDataUrl);
    folder.file('01_SnapBooth_PhotoStrip_HD.jpg', base64Data, { base64: true });
  }

  // 2. Add Animated Boomerang GIF
  if (gifDataUrl) {
    if (typeof gifDataUrl === 'string') {
      const gifBase64 = cleanBase64(gifDataUrl);
      folder.file('02_SnapBooth_Boomerang.gif', gifBase64, { base64: true });
    } else if (gifDataUrl instanceof Blob) {
      folder.file('02_SnapBooth_Boomerang.gif', gifDataUrl);
    }
  }

  // 3. Add Live Motion Video Strip
  if (motionVideoBlob) {
    if (motionVideoBlob instanceof Blob) {
      const isMp4 = motionVideoBlob.type && motionVideoBlob.type.includes('mp4');
      const ext = isMp4 ? 'mp4' : 'webm';
      folder.file(`03_SnapBooth_LiveMotion_Video.${ext}`, motionVideoBlob);
    } else if (typeof motionVideoBlob === 'string') {
      const isMp4 = motionVideoBlob.startsWith('data:video/mp4');
      const ext = isMp4 ? 'mp4' : 'webm';
      const vidBase64 = cleanBase64(motionVideoBlob);
      folder.file(`03_SnapBooth_LiveMotion_Video.${ext}`, vidBase64, { base64: true });
    }
  }

  // 4. Add Individual Poses in a subfolder
  if (posesDataUrls && posesDataUrls.length > 0) {
    const posesFolder = folder.folder('Pose_Satuan');
    posesDataUrls.forEach((poseUrl, idx) => {
      if (poseUrl && typeof poseUrl === 'string') {
        const pBase64 = cleanBase64(poseUrl);
        posesFolder.file(`Pose_${idx + 1}.jpg`, pBase64, { base64: true });
      }
    });
  }

  // Generate ZIP Blob
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  return zipBlob;
}

/**
 * Export all saved event sessions from localStorage into a single master ZIP file
 * @param {string} eventTitle - name of event
 * @returns {Promise<Blob|null>} ZIP Blob of all event photos
 */
export async function exportMasterEventZip(eventTitle = 'SnapBooth_Event') {
  const raw = localStorage.getItem('snapbooth_softfiles_v1');
  if (!raw) return null;

  try {
    const store = JSON.parse(raw);
    const sessionIds = Object.keys(store);
    if (sessionIds.length === 0) return null;

    const zip = new JSZip();
    const rootFolder = zip.folder(`${eventTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_MasterPhotos`);

    sessionIds.forEach((id, sIdx) => {
      const record = store[id];
      const sessionFolder = rootFolder.folder(`Sesi_${String(sIdx + 1).padStart(3, '0')}_${id}`);

      // Main Rendered Photo Strip
      if (record.renderedPhoto) {
        const base64Data = cleanBase64(record.renderedPhoto);
        sessionFolder.file('PhotoStrip_HD.jpg', base64Data, { base64: true });
      }

      // Individual Poses
      if (record.poses && record.poses.length > 0) {
        const posesFolder = sessionFolder.folder('Pose_Satuan');
        record.poses.forEach((poseUrl, pIdx) => {
          if (poseUrl) {
            const pBase64 = cleanBase64(poseUrl);
            posesFolder.file(`Pose_${pIdx + 1}.jpg`, pBase64, { base64: true });
          }
        });
      }

      // GIF if stored
      if (record.gifUrl) {
        const gifBase64 = cleanBase64(record.gifUrl);
        sessionFolder.file('Boomerang.gif', gifBase64, { base64: true });
      }
    });

    const masterBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    return masterBlob;
  } catch (err) {
    console.error('Error generating master event zip:', err);
    return null;
  }
}

