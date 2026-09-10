// Filter Presets & Canvas Pixel Filter Operations

export const FILTERS = [
  {
    id: 'normal',
    name: 'Normal',
    subtitle: 'Asli & Jernih',
    cssFilter: 'none',
    previewColor: '#e2e8f0',
    description: 'Warna natural asli kamera'
  },
  {
    id: 'bw_classic',
    name: 'B&W Film',
    subtitle: 'Monokrom Klasik',
    cssFilter: 'grayscale(100%) contrast(120%) brightness(105%)',
    previewColor: '#64748b',
    description: 'Nuansa hitam putih elegan nan timeless'
  },
  {
    id: 'vintage',
    name: 'Vintage 90s',
    subtitle: 'Nostalgia Retro',
    cssFilter: 'sepia(45%) contrast(110%) saturate(130%) brightness(95%)',
    previewColor: '#d97706',
    description: 'Tone hangat analog era 90-an'
  },
  {
    id: 'korean_glow',
    name: 'Korean Soft',
    subtitle: 'Bright & Glowing',
    cssFilter: 'brightness(112%) contrast(95%) saturate(105%)',
    previewColor: '#f472b6',
    description: 'Tone kulit cerah, glowing, dan lembut'
  },
  {
    id: 'warm_sunset',
    name: 'Warm Sunset',
    subtitle: 'Golden Hour',
    cssFilter: 'sepia(25%) saturate(140%) brightness(105%) hue-rotate(-10deg)',
    previewColor: '#f97316',
    description: 'Pencahayaan sore hari yang hangat dan dramatis'
  },
  {
    id: 'cool_nordic',
    name: 'Nordic Chill',
    subtitle: 'Moody & Crisp',
    cssFilter: 'saturate(85%) contrast(115%) brightness(102%) hue-rotate(15deg)',
    previewColor: '#06b6d4',
    description: 'Tone dingin modern ala sinematik Skandinavia'
  }
];

// Apply filter directly to HTML5 2D Canvas context
export function applyCanvasFilter(ctx, width, height, filterId) {
  const filter = FILTERS.find(f => f.id === filterId) || FILTERS[0];
  if (filter.cssFilter && filter.cssFilter !== 'none') {
    ctx.filter = filter.cssFilter;
  } else {
    ctx.filter = 'none';
  }
}
