import { applyCanvasFilter } from './filterEngine';

export const FRAME_TEMPLATES = [
  {
    id: 'strip-3-white',
    name: 'Classic White (3 Pose)',
    type: 'strip-3',
    poses: 3,
    aspectRatio: '2:6',
    bgColor: '#ffffff',
    textColor: '#1e293b',
    subtextColor: '#64748b',
    borderColor: '#e2e8f0',
    tag: 'Populer',
    theme: 'Clean Modern'
  },
  {
    id: 'strip-3-dark',
    name: 'Midnight Black (3 Pose)',
    type: 'strip-3',
    poses: 3,
    aspectRatio: '2:6',
    bgColor: '#0f172a',
    textColor: '#f8fafc',
    subtextColor: '#94a3b8',
    borderColor: '#334155',
    tag: 'Sleek',
    theme: 'Dark Aesthetic'
  },
  {
    id: 'strip-4-pastel',
    name: 'Pastel Dream (4 Pose)',
    type: 'strip-4',
    poses: 4,
    aspectRatio: '2:6',
    bgColor: '#fdf2f8',
    textColor: '#831843',
    subtextColor: '#db2777',
    borderColor: '#fbcfe8',
    tag: 'Cute',
    theme: 'Korean Pastel'
  },
  {
    id: 'strip-4-cyber',
    name: 'Neon Cyber (4 Pose)',
    type: 'strip-4',
    poses: 4,
    aspectRatio: '2:6',
    bgColor: '#09090b',
    textColor: '#38bdf8',
    subtextColor: '#a855f7',
    borderColor: '#6366f1',
    tag: 'Vibrant',
    theme: 'Music Festival'
  },
  {
    id: 'grid-4r-luxury',
    name: 'Wedding Gold (Grid 4R)',
    type: 'grid-4',
    poses: 4,
    aspectRatio: '4:6',
    bgColor: '#fefdf8',
    textColor: '#854d0e',
    subtextColor: '#a16207',
    borderColor: '#fef08a',
    tag: 'Elegant',
    theme: 'Wedding & Gala'
  },
  {
    id: 'grid-4r-monochrome',
    name: 'Studio Matte (Grid 4R)',
    type: 'grid-4',
    poses: 4,
    aspectRatio: '4:6',
    bgColor: '#18181b',
    textColor: '#fafafa',
    subtextColor: '#a1a1aa',
    borderColor: '#27272a',
    tag: 'Classy',
    theme: 'Studio Look'
  }
];

// Helper to load image object
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Composite photos into a high resolution printable photo strip/sheet
 * @param {Array<string>} photoDataUrls - array of base64 images
 * @param {Object} template - frame template definition
 * @param {string} filterId - applied filter id
 * @param {Object} eventInfo - { title, subtitle, date, location }
 * @returns {Promise<string>} dataUrl of composite image
 */
export async function renderHighResPhotoStrip(photoDataUrls, template, filterId, eventInfo) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (template.type === 'strip-3' || template.type === 'strip-4') {
    // 2x6 inch strip at 300 DPI = 600 x 1800 px
    const W = 600;
    const H = 1800;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = template.bgColor;
    ctx.fillRect(0, 0, W, H);

    // Subtle border
    ctx.strokeStyle = template.borderColor;
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, W - 12, H - 12);

    const poseCount = template.poses; // 3 or 4
    const marginX = 40;
    const photoW = W - marginX * 2; // 520 px
    
    // Top & Bottom margins for branding
    const headerHeight = 70;
    const footerHeight = 220;
    const availableH = H - headerHeight - footerHeight;
    const gap = 24;
    const photoH = (availableH - gap * (poseCount - 1)) / poseCount;

    // Draw header logo / text
    ctx.fillStyle = template.textColor;
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px "Outfit", sans-serif';
    ctx.fillText(eventInfo.title.toUpperCase(), W / 2, 48);

    // Draw photos
    for (let i = 0; i < poseCount; i++) {
      const photoSrc = photoDataUrls[i];
      if (!photoSrc) continue;

      const img = await loadImage(photoSrc);
      const photoY = headerHeight + i * (photoH + gap);

      // Save context for filter and rounded clipping
      ctx.save();
      
      // Rounded photo box
      const radius = 12;
      ctx.beginPath();
      ctx.moveTo(marginX + radius, photoY);
      ctx.lineTo(marginX + photoW - radius, photoY);
      ctx.quadraticCurveTo(marginX + photoW, photoY, marginX + photoW, photoY + radius);
      ctx.lineTo(marginX + photoW, photoY + photoH - radius);
      ctx.quadraticCurveTo(marginX + photoW, photoY + photoH, marginX + photoW - radius, photoY + photoH);
      ctx.lineTo(marginX + radius, photoY + photoH);
      ctx.quadraticCurveTo(marginX, photoY + photoH, marginX, photoY + photoH - radius);
      ctx.lineTo(marginX, photoY + radius);
      ctx.quadraticCurveTo(marginX, photoY, marginX + radius, photoY);
      ctx.closePath();
      ctx.clip();

      // Apply Filter
      applyCanvasFilter(ctx, photoW, photoH, filterId);

      // Draw image to cover photo box (object-fit: cover logic)
      const imgRatio = img.width / img.height;
      const targetRatio = photoW / photoH;
      let sx, sy, sw, sh;

      if (imgRatio > targetRatio) {
        sh = img.height;
        sw = img.height * targetRatio;
        sx = (img.width - sw) / 2;
        sy = 0;
      } else {
        sw = img.width;
        sh = img.width / targetRatio;
        sx = 0;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, marginX, photoY, photoW, photoH);
      ctx.restore();

      // Draw subtle photo border
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 2;
      ctx.strokeRect(marginX, photoY, photoW, photoH);
    }

    // Draw Footer (Event Date, Location, SnapBooth branding)
    const footerY = H - footerHeight + 40;
    
    // Decorative separator line
    ctx.strokeStyle = template.borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(marginX + 40, footerY);
    ctx.lineTo(W - marginX - 40, footerY);
    ctx.stroke();

    ctx.fillStyle = template.textColor;
    ctx.font = 'bold 26px "Outfit", sans-serif';
    ctx.fillText(eventInfo.subtitle || 'MEMORIES NEVER FADE', W / 2, footerY + 45);

    ctx.fillStyle = template.subtextColor;
    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(eventInfo.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, footerY + 80);

    ctx.font = 'bold 15px "Space Grotesk", monospace';
    ctx.fillStyle = template.subtextColor;
    ctx.fillText(`SNAPBOOTH • ${eventInfo.location || 'JAKARTA, ID'}`, W / 2, footerY + 115);

  } else {
    // 4R Grid layout: 4x6 inch = 1200 x 1800 px
    const W = 1200;
    const H = 1800;
    canvas.width = W;
    canvas.height = H;

    ctx.fillStyle = template.bgColor;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = template.borderColor;
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, W - 16, H - 16);

    const margin = 60;
    const headerH = 100;
    const footerH = 240;
    const gridGap = 30;

    const gridW = W - margin * 2;
    const photoW = (gridW - gridGap) / 2; // 525 px each
    const gridH = H - headerH - footerH;
    const photoH = (gridH - gridGap) / 2; // 685 px each

    // Header Title
    ctx.fillStyle = template.textColor;
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px "Outfit", sans-serif';
    ctx.fillText(eventInfo.title.toUpperCase(), W / 2, 70);

    // Photos 2x2 Grid
    for (let i = 0; i < 4; i++) {
      const photoSrc = photoDataUrls[i];
      if (!photoSrc) continue;

      const img = await loadImage(photoSrc);
      const col = i % 2;
      const row = Math.floor(i / 2);
      const px = margin + col * (photoW + gridGap);
      const py = headerH + row * (photoH + gridGap);

      ctx.save();
      const radius = 16;
      ctx.beginPath();
      ctx.roundRect(px, py, photoW, photoH, radius);
      ctx.clip();

      applyCanvasFilter(ctx, photoW, photoH, filterId);

      const imgRatio = img.width / img.height;
      const targetRatio = photoW / photoH;
      let sx, sy, sw, sh;

      if (imgRatio > targetRatio) {
        sh = img.height;
        sw = img.height * targetRatio;
        sx = (img.width - sw) / 2;
        sy = 0;
      } else {
        sw = img.width;
        sh = img.width / targetRatio;
        sx = 0;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, px, py, photoW, photoH);
      ctx.restore();
    }

    // Footer Info
    const footerY = H - footerH + 70;
    ctx.fillStyle = template.textColor;
    ctx.font = 'bold 38px "Outfit", sans-serif';
    ctx.fillText(eventInfo.subtitle || 'SPECIAL MOMENT', W / 2, footerY);

    ctx.fillStyle = template.subtextColor;
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(eventInfo.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, footerY + 50);

    ctx.font = 'bold 20px "Space Grotesk", monospace';
    ctx.fillText(`POWERED BY SNAPBOOTH • ${eventInfo.location || 'SPECIAL EVENT'}`, W / 2, footerY + 95);
  }

  return canvas.toDataURL('image/jpeg', 0.95);
}
