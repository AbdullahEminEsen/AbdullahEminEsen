// Shared helpers for the profile SVG generators.
import { readFileSync } from 'node:fs';

const ICONS = JSON.parse(readFileSync(new URL('./icons.json', import.meta.url), 'utf8'));

// Two themes; every card is rendered in both and swapped via <picture> in the README.
export const THEMES = {
  dark: {
    name: 'dark',
    bg: '#070B14', bg2: '#0D1424', panel: '#111A2E', line: '#1E2A44', grid: '#16203A',
    text: '#E6EDF7', sub: '#8B9AB8', dim: '#4A5878',
    a: '#8B5CF6', b: '#22D3EE', c: '#F472B6', ok: '#34D399',
    mono: '#FFFFFF',
    // brand colours too dark to read on the dark background
    brand: { mysql: '#5EB0E5', electron: '#9FEAF9', ultralytics: '#6B8BFF', python: '#5A9FD4', typescript: '#4A90E2' },
  },
  light: {
    name: 'light',
    bg: '#F7F8FC', bg2: '#EEF1F8', panel: '#FFFFFF', line: '#D9DFEC', grid: '#E6EAF3',
    text: '#0F172A', sub: '#475569', dim: '#94A3B8',
    a: '#7C3AED', b: '#0891B2', c: '#DB2777', ok: '#059669',
    mono: '#0F172A',
  },
};

export const FONT = `'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;
export const MONO = `ui-monospace, 'Cascadia Code', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace`;

// Brand colours; null = use the theme's monochrome colour (black logos etc.)
const BRAND = {
  php: '#777BB4', laravel: '#FF2D20', mysql: '#4479A1', javascript: '#F7DF1E',
  typescript: '#3178C6', nodedotjs: '#5FA04E', nextdotjs: null, python: '#3776AB',
  pytorch: '#EE4C2C', opencv: '#5C3EE8', nginx: '#009639', claude: '#D97757',
  tailwindcss: '#06B6D4', electron: '#47848F', socketdotio: null, git: '#F05032',
  figma: '#F24E1E', vercel: null, ultralytics: '#0B23A9', linux: '#FCC624', anthropic: null,
};

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Simple Icons glyph (24x24 viewBox) placed at x,y with the given pixel size. */
export function icon(slug, x, y, size, t, color) {
  const d = ICONS[slug];
  if (!d) throw new Error(`missing icon: ${slug}`);
  const fill = color ?? t.brand?.[slug] ?? BRAND[slug] ?? t.mono;
  return `<g transform="translate(${x} ${y}) scale(${size / 24})"><path fill="${fill}" d="${d}"/></g>`;
}

/** Approximate monospace text width (0.6em per char). */
export const monoWidth = (text, size) => text.length * size * 0.6;

export const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${body}</svg>\n`;

/** Rounded card background with subtle dot grid. */
export function card(w, h, t, id) {
  return `<defs>
<pattern id="dots-${id}" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${t.grid}"/></pattern>
<linearGradient id="edge-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.a}"/><stop offset=".5" stop-color="${t.b}"/><stop offset="1" stop-color="${t.c}"/></linearGradient>
</defs>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14" fill="${t.bg}"/>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14" fill="url(#dots-${id})"/>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14" fill="none" stroke="url(#edge-${id})" stroke-opacity=".55"/>`;
}

/** Small mono header like "// section_name" with a pulsing status dot. */
export function header(x, y, label, t) {
  return `<circle cx="${x + 4}" cy="${y - 4}" r="4" fill="${t.ok}"><animate attributeName="opacity" values="1;.25;1" dur="1.6s" repeatCount="indefinite"/></circle>
<text x="${x + 16}" y="${y}" font-family="${MONO}" font-size="12" fill="${t.sub}" letter-spacing="1">${esc(label)}</text>`;
}
