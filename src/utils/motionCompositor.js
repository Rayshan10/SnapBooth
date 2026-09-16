import { applyCanvasFilter } from './filterEngine';

/**
 * Render Live Motion Video Strip from video clips in the selected frame layout
 * @param {Array<Blob|string>} videoClips - array of video blobs or video URLs for each pose
 * @param {Object} template - frame template definition
 * @param {string} filterId - filter preset id
 * @param {Object} eventSettings - title, subtitle, date, etc.
 * @param {number} durationMs - total video duration (default 3500ms)
 * @returns {Promise<Blob>} Video Blob (video/webm or video/mp4)
 */
export async function renderMotionVideoStrip(
  videoClips,
  template,
  filterId = 'normal',
  eventSettings = {},
  durationMs = 3500
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

      // Create video elements for each pose
      const videoElements = await Promise.all(
        videoClips.map((clip) => {
          return new Promise((res) => {
            const vid = document.createElement('video');
            vid.crossOrigin = 'anonymous';
            vid.muted = true;
            vid.loop = true;
            vid.playsInline = true;
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

      // Setup Canvas Stream Recorder
      const stream = canvas.captureStream(30); // 30 FPS
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: mimeType });
        // Clean up video elements
        videoElements.forEach((vid) => {
          if (vid && vid.src && vid.src.startsWith('blob:')) {
            URL.revokeObjectURL(vid.src);
          }
        });
        resolve(finalBlob);
      };

      recorder.start();

      const startTime = performance.now();

      function drawFrame(currentTime) {
        const elapsed = currentTime - startTime;
        if (elapsed >= durationMs) {
          recorder.stop();
          return;
        }

        // 1. Draw Background
        ctx.fillStyle = template.bgColor || '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 2. Draw Header
        ctx.fillStyle = template.textColor || '#1e293b';
        ctx.textAlign = 'center';
        ctx.font = 'bold 24px "Outfit", sans-serif';
        ctx.fillText(eventSettings.title || 'SNAPBOOTH', width / 2, 60);

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

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, itemWidth, itemHeight, 16);
            ctx.clip();

            if (vid && vid.readyState >= 2) {
              applyCanvasFilter(ctx, itemWidth, itemHeight, filterId);
              ctx.drawImage(vid, x, y, itemWidth, itemHeight);
            } else {
              ctx.fillStyle = '#cbd5e1';
              ctx.fillRect(x, y, itemWidth, itemHeight);
            }
            ctx.restore();
          }
        }

        // 4. Draw Footer Text
        ctx.fillStyle = template.subtextColor || '#64748b';
        ctx.font = 'bold 18px "Outfit", sans-serif';
        ctx.fillText(eventSettings.subtitle || 'SPECIAL MEMORIES & MOMENTS', width / 2, height - 60);
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(eventSettings.date || new Date().toLocaleDateString('id-ID'), width / 2, height - 35);

        requestAnimationFrame(drawFrame);
      }

      requestAnimationFrame(drawFrame);
    } catch (error) {
      console.error('Error rendering motion video strip:', error);
      reject(error);
    }
  });
}
