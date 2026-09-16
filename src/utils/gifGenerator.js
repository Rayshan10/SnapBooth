import gifshot from 'gifshot';

/**
 * Generate animated GIF from array of image Data URLs
 * @param {Array<string>} images - array of photo data URLs
 * @param {number} width - output width (default 480)
 * @param {number} height - output height (default 640)
 * @param {number} interval - seconds per frame (default 0.5)
 * @returns {Promise<string>} Base64 GIF data URL
 */
export function generateGifFromPhotos(images, width = 480, height = 640, interval = 0.5) {
  return new Promise((resolve, reject) => {
    if (!images || images.length === 0) {
      return reject(new Error('No images provided for GIF generation'));
    }

    try {
      gifshot.createGIF(
        {
          images: images,
          gifWidth: width,
          gifHeight: height,
          interval: interval,
          numFrames: images.length,
          sampleInterval: 10,
          numWorkers: 2
        },
        function (obj) {
          if (!obj.error) {
            resolve(obj.image);
          } else {
            console.error('GIF generation error:', obj.error);
            reject(obj.error);
          }
        }
      );
    } catch (err) {
      console.error('Failed to create GIF:', err);
      reject(err);
    }
  });
}
