import { applyCanvasFilter } from './filterEngine';

export function getSupportedVideoMimeType() {
  const types = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp8',
    'video/webm'
  ];
  for (const t of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return 'video/webm';
}

/**
 * Render Live Motion Video Strip from video clips in the selected frame layout
 * @param {Array<Blob|string>} videoClips - array of video blobs or video URLs for each pose
 * @param {Object} template - frame template definition
 * @param {string} filterId - filter preset id
 * @param {Object} eventSettings - title, subtitle, date, etc.
 * @param {Array<string>} fallbackPhotos - array of photo data URLs if video is unavailable
 * @param {number} durationMs - total video duration (default 4000ms = 4 detik)
 * @returns {Promise<Blob>} Video Blob (video/mp4 or video/webm)
 */
export async function renderMotionVideoStrip(
  videoClips = [],
  template,
  filterId = 'normal',
  eventSettings = {},
  fallbackPhotos = [],
  durationMs = 4000
) {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const isGrid = template.type === 'grid-4';
      
      // Vertical Strip or 4R Grid Dimensions
      const width = isGrid ? 1200 : 600;
      const height = isGrid ? 900 : 1800;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 1. Create video elements for each pose
      const videoElements = await Promise.all(
        (videoClips || []).map((clip) => {
          return new Promise((res) => {
            if (!clip) return res(null);
            const vid = document.createElement('video');
            vid.crossOrigin = 'anonymous';
            vid.muted = true;
            vid.loop = true;
            vid.playsInline = true;
            vid.autoplay = true;
            vid.src = typeof clip === 'string' ? clip : URL.createObjectURL(clip);
            vid.onloadeddata = () => {
              vid.play().catch(() => {});
              res(vid);
            };
            vid.onerror = () => res(null);
            setTimeout(() => res(vid), 1000); // safety timeout
          });
        })
      );

      // 2. Create fallback image elements for photos if any video clip is missing
      const imageElements = await Promise.all(
        (fallbackPhotos || []).map((photoUrl) => {
          return new Promise((res) => {
            if (!photoUrl) return res(null);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => res(img);
            img.onerror = () => res(null);
            img.src = photoUrl;
          });
        })
      );

      // Preload custom overlay image if provided
      let overlayImageEl = null;
      if (template.overlayImage) {
        overlayImageEl = await new Promise((res) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => res(img);
          img.onerror = () => res(null);
          img.src = template.overlayImage;
        });
      }

      // Preload custom watermark image if provided
      let watermarkImageEl = null;
      if (eventSettings?.watermarkImage && eventSettings?.enableWatermark !== false) {
        watermarkImageEl = await new Promise((res) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => res(img);
          img.onerror = () => res(null);
          img.src = eventSettings.watermarkImage;
        });
      }

      // Setup Canvas Stream Recorder
      const stream = canvas.captureStream(30); // 30 FPS
      const mimeType = getSupportedVideoMimeType();

      let recorder;
      try {
        recorder = new MediaRecorder(stream, { 
          mimeType, 
          videoBitsPerSecond: 3000000 
        });
      } catch (recErr) {
        recorder = new MediaRecorder(stream);
      }

      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: recorder.mimeType || mimeType });
        // Clean up video elements
        videoElements.forEach((vid) => {
          if (vid && vid.src && vid.src.startsWith('blob:')) {
            URL.revokeObjectURL(vid.src);
          }
        });
        resolve(finalBlob);
      };

      recorder.start(100);

      const startTime = performance.now();
      let animFrameId = null;

      function drawFrame(currentTime) {
        const elapsed = currentTime - startTime;
        if (elapsed >= durationMs) {
          if (animFrameId) cancelAnimationFrame(animFrameId);
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
          return;
        }

        // 1. Draw Background
        ctx.fillStyle = template.bgColor || '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 2. Draw Header (only if no custom overlay or not hidden)
        if (!template.overlayImage && !template.hideDefaultText) {
          ctx.fillStyle = template.textColor || '#1e293b';
          ctx.textAlign = 'center';
          ctx.font = 'bold 24px "Outfit", sans-serif';
          ctx.fillText(eventSettings.title || 'SNAPBOOTH', width / 2, 60);
        }

        // 3. Draw Video Boxes based on layout
        const posesCount = template.poses || 3;
        const padX = 40;
        const padTop = 90;
        const padBottom = 110;
        const availableHeight = height - padTop - padBottom;
        const gap = 20;

        if (template.type === 'strip-3' || template.type === 'strip-4') {
          const itemHeight = (availableHeight - (posesCount - 1) * gap) / posesCount;
          const itemWidth = width - padX * 2;

          for (let i = 0; i < posesCount; i++) {
            const vid = videoElements[i];
            const fallbackImg = imageElements[i];
            const y = padTop + i * (itemHeight + gap);

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(padX, y, itemWidth, itemHeight, 16);
            ctx.clip();

            if (vid && vid.readyState >= 2) {
              applyCanvasFilter(ctx, itemWidth, itemHeight, filterId);
              // Draw video maintaining aspect ratio cover
              const vAspect = (vid.videoWidth || 16) / (vid.videoHeight || 9);
              const bAspect = itemWidth / itemHeight;
              let dw = itemWidth, dh = itemHeight, dx = padX, dy = y;

              if (vAspect > bAspect) {
                dw = itemHeight * vAspect;
                dx = padX - (dw - itemWidth) / 2;
              } else {
                dh = itemWidth / vAspect;
                dy = y - (dh - itemHeight) / 2;
              }
              ctx.drawImage(vid, dx, dy, dw, dh);
            } else if (fallbackImg) {
              applyCanvasFilter(ctx, itemWidth, itemHeight, filterId);
              // Draw fallback image with subtle motion
              const iAspect = fallbackImg.naturalWidth / fallbackImg.naturalHeight;
              const bAspect = itemWidth / itemHeight;
              let dw = itemWidth, dh = itemHeight, dx = padX, dy = y;

              if (iAspect > bAspect) {
                dw = itemHeight * iAspect;
                dx = padX - (dw - itemWidth) / 2;
              } else {
                dh = itemWidth / iAspect;
                dy = y - (dh - itemHeight) / 2;
              }
              ctx.drawImage(fallbackImg, dx, dy, dw, dh);
            } else {
              ctx.fillStyle = '#cbd5e1';
              ctx.fillRect(padX, y, itemWidth, itemHeight);
            }
            ctx.restore();
          }
        } else if (template.type === 'grid-4') {
          // 2x2 Grid
          const cols = 2;
          const rows = 2;
          const gridGap = 20;
          const itemWidth = (width - padX * 2 - gridGap) / cols;
          const itemHeight = (availableHeight - gridGap) / rows;

          for (let i = 0; i < 4; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = padX + col * (itemWidth + gridGap);
            const y = padTop + row * (itemHeight + gridGap);
            const vid = videoElements[i];
            const fallbackImg = imageElements[i];

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, itemWidth, itemHeight, 16);
            ctx.clip();

            if (vid && vid.readyState >= 2) {
              applyCanvasFilter(ctx, itemWidth, itemHeight, filterId);
              ctx.drawImage(vid, x, y, itemWidth, itemHeight);
            } else if (fallbackImg) {
              applyCanvasFilter(ctx, itemWidth, itemHeight, filterId);
              ctx.drawImage(fallbackImg, x, y, itemWidth, itemHeight);
            } else {
              ctx.fillStyle = '#cbd5e1';
              ctx.fillRect(x, y, itemWidth, itemHeight);
            }
            ctx.restore();
          }
        }

        // 4. Draw Custom PNG Overlay if available
        if (overlayImageEl) {
          ctx.drawImage(overlayImageEl, 0, 0, width, height);
        }

        // 5. Draw Footer Text (only if not suppressed)
        if (!template.hideDefaultText) {
          ctx.fillStyle = template.subtextColor || '#64748b';
          ctx.font = 'bold 18px "Outfit", sans-serif';
          ctx.fillText(eventSettings.subtitle || 'SPECIAL MEMORIES & MOMENTS', width / 2, height - 60);
          ctx.font = '14px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(eventSettings.date || new Date().toLocaleDateString('id-ID'), width / 2, height - 35);
        }

        // 6. Draw Watermark / Sponsor Logo Overlay if available
        if (watermarkImageEl) {
          try {
            const position = eventSettings?.watermarkPosition || 'bottom-right';
            const opacity = (Number(eventSettings?.watermarkOpacity) || 90) / 100;
            const scaleFactor = (Number(eventSettings?.watermarkScale) || 22) / 100;

            ctx.save();
            ctx.globalAlpha = Math.max(0.1, Math.min(1.0, opacity));

            const maxW = width * scaleFactor;
            const aspect = (watermarkImageEl.naturalWidth || watermarkImageEl.width || 1) / (watermarkImageEl.naturalHeight || watermarkImageEl.height || 1);
            let targetW = maxW;
            let targetH = maxW / aspect;

            const maxH = height * 0.14;
            if (targetH > maxH) {
              targetH = maxH;
              targetW = targetH * aspect;
            }

            const padding = 20;
            let x = width - targetW - padding;
            let y = height - targetH - padding;

            if (position === 'bottom-left') {
              x = padding;
              y = height - targetH - padding;
            } else if (position === 'bottom-right') {
              x = width - targetW - padding;
              y = height - targetH - padding;
            } else if (position === 'top-left') {
              x = padding;
              y = padding + 10;
            } else if (position === 'top-right') {
              x = width - targetW - padding;
              y = padding + 10;
            } else if (position === 'center-bottom') {
              x = (width - targetW) / 2;
              y = height - targetH - padding;
            }

            ctx.drawImage(watermarkImageEl, x, y, targetW, targetH);
            ctx.restore();
          } catch (e) {
            // ignore frame drawing error for watermark
          }
        }

        animFrameId = requestAnimationFrame(drawFrame);
      }

      animFrameId = requestAnimationFrame(drawFrame);
    } catch (error) {
      console.error('Error rendering motion video strip:', error);
      reject(error);
    }
  });
}
