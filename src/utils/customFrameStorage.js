import { FRAME_TEMPLATES } from './canvasRenderer';

const CUSTOM_FRAMES_STORAGE_KEY = 'snapbooth_custom_frames_v1';
const FRAME_VISIBILITY_STORAGE_KEY = 'snapbooth_frame_visibility_v1';

/**
 * Get all custom user-uploaded frames from localStorage
 */
export function getCustomFrames() {
  try {
    const raw = localStorage.getItem(CUSTOM_FRAMES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load custom frames:', e);
    return [];
  }
}

/**
 * Save or update a custom frame template
 */
export function saveCustomFrame(frameData) {
  try {
    const existing = getCustomFrames();
    const id = frameData.id || `custom-${Date.now()}`;
    const newFrame = {
      ...frameData,
      id,
      isCustom: true,
      createdAt: frameData.createdAt || Date.now()
    };

    const index = existing.findIndex(f => f.id === id);
    let updated;
    if (index >= 0) {
      updated = [...existing];
      updated[index] = newFrame;
    } else {
      updated = [newFrame, ...existing];
    }

    localStorage.setItem(CUSTOM_FRAMES_STORAGE_KEY, JSON.stringify(updated));
    return newFrame;
  } catch (e) {
    console.error('Failed to save custom frame:', e);
    throw e;
  }
}

/**
 * Delete a custom frame by ID
 */
export function deleteCustomFrame(id) {
  try {
    const existing = getCustomFrames();
    const updated = existing.filter(f => f.id !== id);
    localStorage.setItem(CUSTOM_FRAMES_STORAGE_KEY, JSON.stringify(updated));

    // Also clean up visibility map
    const vis = getFrameVisibility();
    delete vis[id];
    localStorage.setItem(FRAME_VISIBILITY_STORAGE_KEY, JSON.stringify(vis));
    return true;
  } catch (e) {
    console.error('Failed to delete custom frame:', e);
    return false;
  }
}

/**
 * Get frame visibility map (frameId -> boolean)
 */
export function getFrameVisibility() {
  try {
    const raw = localStorage.getItem(FRAME_VISIBILITY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Set visibility for a single frame
 */
export function setFrameVisibility(id, isVisible) {
  try {
    const current = getFrameVisibility();
    current[id] = isVisible;
    localStorage.setItem(FRAME_VISIBILITY_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to set frame visibility:', e);
  }
}

/**
 * Get all frames (both built-in and custom)
 * @param {boolean} includeDisabled - whether to include frames disabled by admin
 */
export function getAllFrames(includeDisabled = false) {
  const custom = getCustomFrames();
  const visibility = getFrameVisibility();

  const all = [
    ...custom.map(f => ({ ...f, enabled: visibility[f.id] !== false })),
    ...FRAME_TEMPLATES.map(f => ({ ...f, enabled: visibility[f.id] !== false }))
  ];

  if (includeDisabled) {
    return all;
  }

  const enabledFrames = all.filter(f => f.enabled);
  return enabledFrames.length > 0 ? enabledFrames : FRAME_TEMPLATES;
}
