// Auto-detects render images in /public without needing exact filenames.
// Vite's import.meta.glob eagerly finds every image file at build time,
// so you can drop any images into /public/renders/ (or /public) and they appear.
//
// Recommended: put your 10 render PNGs in  public/renders/
// The logo stays at            public/forge_Logo.png

const modules = import.meta.glob(
  '/public/renders/*.{png,jpg,jpeg,webp}',
  { eager: true, query: '?url', import: 'default' }
)

// Fall back: also check the public root for any hero-named files.
const rootModules = import.meta.glob(
  '/public/*.{png,jpg,jpeg,webp}',
  { eager: true, query: '?url', import: 'default' }
)

function toPublicUrl(globKey, mod) {
  // globKey like '/public/renders/x.png' -> served at '/renders/x.png'
  return typeof mod === 'string' ? mod : globKey.replace('/public', '')
}

export const RENDERS = Object.entries(modules)
  .map(([k, m]) => toPublicUrl(k, m))
  .sort()

// Root images minus the logo, used only if /renders is empty.
const ROOT_IMAGES = Object.entries(rootModules)
  .map(([k, m]) => toPublicUrl(k, m))
  .filter(u => !/forge_logo/i.test(u))
  .sort()

export const GALLERY = RENDERS.length ? RENDERS : ROOT_IMAGES

// Hero = first available render; components can override.
export const HERO_IMAGE = GALLERY[0] || null

export const LOGO = '/forge_Logo.png'
