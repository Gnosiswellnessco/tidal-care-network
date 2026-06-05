// Tidal Care Network — shared brand tokens. One source of truth for colors,
// borders, and the serif heading font, so the whole site stays consistent.

export const BRAND = {
  // Core palette
  teal: '#3e6a70',          // primary actions, links
  tealLight: '#5ba1a9',
  dark: '#2c4d52',          // headings
  mint: '#e8eff0',          // soft fills, category chips
  gold: '#e8b54a',          // rating stars

  // Premium / champagne accents
  champagne: '#b5aa8e',
  champagneDark: '#7d7256',
  champagneTint: '#efe9dc',

  // Surfaces
  pageBg: '#f7f6f2',        // warm off-white page background
  cardBg: '#ffffff',
  panelBg: '#eef3f3',       // muted teal-tinted panel (e.g. values strip)
  hairline: '#e5e3dc',      // hairline borders, rules
} as const

// Serif heading font, exposed by app/layout.tsx as --font-serif (Cormorant Garamond).
export const SERIF = 'var(--font-serif), Georgia, serif'

// Logo asset paths (in /public).
export const LOGO = {
  full: '/tidal-care-network.svg',   // full stacked lockup — hero & footer
  mark: '/slim-vector-header.svg',   // mark only — site header
  favicon: '/tidal-care-favicon.svg',
} as const
