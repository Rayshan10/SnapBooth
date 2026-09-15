/**
 * Cloud Storage Uploader for SnapBooth
 * Uploads rendered photo strips to cloud storage with 1-hour auto expiration
 */

export async function uploadToCloud(dataUrl, filename = 'snapbooth_photo.jpg') {
  // Convert Data URL to Blob
  const byteString = atob(dataUrl.split(',')[1]);
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });

  // 1. Primary Method: Litterbox (Catbox) with 1-Hour Auto-Delete
  try {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('time', '1h'); // Auto-delete after 1 hour
    formData.append('fileToUpload', blob, filename);

    const res = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const url = await res.text();
      if (url && url.startsWith('http')) {
        return url.trim();
      }
    }
  } catch (err) {
    console.warn('Litterbox upload error, trying fallback:', err);
  }

  // 2. Fallback Method: tmpfiles.org (Auto-expires after 60 mins)
  try {
    const formData = new FormData();
    formData.append('file', blob, filename);

    const res = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.data?.url) {
        // Convert to direct download URL (e.g. tmpfiles.org/123/file.jpg -> tmpfiles.org/dl/123/file.jpg)
        const directUrl = json.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
        return directUrl;
      }
    }
  } catch (err) {
    console.warn('TmpFiles upload error, trying fallback:', err);
  }

  // 3. Fallback Method: file.io (1-hour auto expiry)
  try {
    const formData = new FormData();
    formData.append('file', blob, filename);

    const res = await fetch('https://file.io/?expires=1h', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.link) {
        return json.link;
      }
    }
  } catch (err) {
    console.warn('File.io upload error:', err);
  }

  return null;
}
