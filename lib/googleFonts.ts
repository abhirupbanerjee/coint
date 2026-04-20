export type FontCategory = 'serif' | 'sans-serif' | 'display' | 'monospace' | 'handwriting'

export interface GoogleFont {
  family: string
  category: FontCategory
}

export const GOOGLE_FONTS: readonly GoogleFont[] = [
  // Serif — good for headings / editorial body
  { family: 'Fraunces', category: 'serif' },
  { family: 'Playfair Display', category: 'serif' },
  { family: 'Merriweather', category: 'serif' },
  { family: 'Lora', category: 'serif' },
  { family: 'Cormorant Garamond', category: 'serif' },
  { family: 'Libre Baskerville', category: 'serif' },
  { family: 'EB Garamond', category: 'serif' },
  { family: 'Crimson Pro', category: 'serif' },
  { family: 'Spectral', category: 'serif' },
  { family: 'Source Serif 4', category: 'serif' },
  { family: 'Bitter', category: 'serif' },
  { family: 'PT Serif', category: 'serif' },
  { family: 'Cardo', category: 'serif' },
  { family: 'Vollkorn', category: 'serif' },
  { family: 'Noto Serif', category: 'serif' },
  { family: 'DM Serif Display', category: 'serif' },
  { family: 'DM Serif Text', category: 'serif' },

  // Sans-serif — good for body / UI
  { family: 'Inter', category: 'sans-serif' },
  { family: 'Roboto', category: 'sans-serif' },
  { family: 'Lato', category: 'sans-serif' },
  { family: 'Open Sans', category: 'sans-serif' },
  { family: 'Montserrat', category: 'sans-serif' },
  { family: 'Work Sans', category: 'sans-serif' },
  { family: 'Nunito', category: 'sans-serif' },
  { family: 'Source Sans 3', category: 'sans-serif' },
  { family: 'Poppins', category: 'sans-serif' },
  { family: 'Raleway', category: 'sans-serif' },
  { family: 'Karla', category: 'sans-serif' },
  { family: 'DM Sans', category: 'sans-serif' },
  { family: 'Public Sans', category: 'sans-serif' },
  { family: 'IBM Plex Sans', category: 'sans-serif' },
  { family: 'Plus Jakarta Sans', category: 'sans-serif' },
  { family: 'Manrope', category: 'sans-serif' },
  { family: 'Figtree', category: 'sans-serif' },
  { family: 'Mulish', category: 'sans-serif' },
  { family: 'Archivo', category: 'sans-serif' },
  { family: 'Be Vietnam Pro', category: 'sans-serif' },
  { family: 'Noto Sans', category: 'sans-serif' },
  { family: 'Outfit', category: 'sans-serif' },
  { family: 'Space Grotesk', category: 'sans-serif' },

  // Display — heavy hitters for headings
  { family: 'Abril Fatface', category: 'display' },
  { family: 'Bebas Neue', category: 'display' },
  { family: 'Oswald', category: 'display' },
  { family: 'Alfa Slab One', category: 'display' },
  { family: 'Staatliches', category: 'display' },

  // Monospace
  { family: 'JetBrains Mono', category: 'monospace' },
  { family: 'Fira Code', category: 'monospace' },
  { family: 'IBM Plex Mono', category: 'monospace' },
  { family: 'Source Code Pro', category: 'monospace' },
  { family: 'Roboto Mono', category: 'monospace' },
] as const

export const DEFAULT_HEADING_FONT = 'Fraunces'
export const DEFAULT_BODY_FONT = 'Inter'

const FAMILY_SET = new Set(GOOGLE_FONTS.map(f => f.family))

export function isKnownFont(family: string | null | undefined): family is string {
  return typeof family === 'string' && FAMILY_SET.has(family)
}

export function resolveFont(family: string | null | undefined, fallback: string): string {
  return isKnownFont(family) ? family : fallback
}

export function getCategory(family: string): FontCategory | null {
  return GOOGLE_FONTS.find(f => f.family === family)?.category ?? null
}

function genericFallbackFor(family: string): string {
  const cat = getCategory(family)
  if (cat === 'serif') return 'serif'
  if (cat === 'monospace') return 'monospace'
  if (cat === 'handwriting') return 'cursive'
  return 'sans-serif'
}

export function fontStack(family: string): string {
  return `"${family}", ${genericFallbackFor(family)}`
}

export function googleFontsHref(families: string[]): string {
  const unique = Array.from(new Set(families.filter(isKnownFont)))
  if (unique.length === 0) return ''
  const params = unique
    .map(family => `family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;500;600;700`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}
