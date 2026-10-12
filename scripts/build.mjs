// Generates the static profile SVGs into ../assets (run: node scripts/build.mjs)
import { writeFileSync, mkdirSync } from 'node:fs';
import { THEMES, FONT, MONO, esc, icon, monoWidth, svg, card, header } from './lib.mjs';

const OUT = new URL('../assets/', import.meta.url);
mkdirSync(OUT, { recursive: true });
const write = (name, content) => writeFileSync(new URL(name, OUT), content);

// Deterministic PRNG so rebuilds produce identical files
function rng(seed) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

/* ------------------------------------------------------------------ hero */

const ROLES = [
  'Full-stack developer · Laravel & Next.js',
  'Computer vision tinkerer · YOLO & OpenCV',
  'Shipping AI-powered tools with Claude Code',
  'Currently leveling up in cybersecurity',
];

function typing(t, x, y, size) {
  const cycle = 18, slot = 1 / ROLES.length, cw = size * 0.6;
  let defs = '', body = '';
  ROLES.forEach((text, i) => {
    const n = text.length, s = i * slot;
    const typeEnd = s + slot * 0.45, holdEnd = s + slot * 0.85, eraseEnd = s + slot * 0.95;
    const times = [], widths = [];
    const push = (k, w) => { if (!times.length || k > times.at(-1)) { times.push(k); widths.push(w); } };
    push(0, 0);
    push(s, 0);
    for (let c = 1; c <= n; c++) push(s + (typeEnd - s) * (c / n), c * cw);
    push(holdEnd, n * cw);
    const steps = 12;
    for (let c = 1; c <= steps; c++) push(holdEnd + (eraseEnd - holdEnd) * (c / steps), n * cw * (1 - c / steps));
    if (times.at(-1) < 1) push(1, 0);
    const kt = times.map((v) => +v.toFixed(5)).join(';');
    const vals = widths.map((v) => +v.toFixed(1)).join(';');
    const cx = widths.map((v) => +(x + v + 2).toFixed(1)).join(';');
    defs += `<clipPath id="role${i}"><rect x="${x}" y="${y - size}" width="0" height="${size * 1.5}"><animate attributeName="width" dur="${cycle}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${kt}" values="${vals}"/></rect></clipPath>`;
    body += `<text x="${x}" y="${y}" font-family="${MONO}" font-size="${size}" fill="${t.text}" clip-path="url(#role${i})">${esc(text)}</text>`;
    // caret follows the active phrase only
    const vis = times.map((k) => (k >= s && k < eraseEnd ? 1 : 0)).join(';');
    body += `<rect y="${y - size + 3}" width="${size * 0.55}" height="${size + 2}" fill="${t.b}"><animate attributeName="x" dur="${cycle}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${kt}" values="${cx}"/><animate attributeName="fill-opacity" dur="${cycle}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${kt}" values="${vis}"/></rect>`;
  });
  return { defs, body };
}

function neuralDecor(t, ox, oy, w, h, seed) {
  const r = rng(seed);
  const layers = [3, 5, 6, 5, 3];
  const cols = layers.map((count, li) => {
    const x = ox + (w / (layers.length - 1)) * li;
    return Array.from({ length: count }, (_, k) => ({ x, y: oy + (h / (count + 1)) * (k + 1) }));
  });
  let edges = '', nodes = '', pulses = '';
  for (let li = 0; li < cols.length - 1; li++)
    for (const a of cols[li]) for (const b of cols[li + 1])
      edges += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${t.line}" stroke-width="1"/>`;
  cols.flat().forEach((n, i) => {
    const d = (r() * 3).toFixed(2);
    nodes += `<circle cx="${n.x}" cy="${n.y}" r="6" fill="${t.bg2}" stroke="${i % 3 === 0 ? t.a : t.b}" stroke-width="2"><animate attributeName="r" values="6;8;6" dur="3s" begin="${d}s" repeatCount="indefinite"/></circle>`;
  });
  for (let p = 0; p < 9; p++) {
    const path = cols.map((c) => c[Math.floor(r() * c.length)]).map((n, i) => `${i ? 'L' : 'M'}${n.x} ${n.y}`).join(' ');
    const col = [t.a, t.b, t.c][p % 3];
    const begin = (p * 0.55).toFixed(2);
    pulses += `<circle r="4" fill="${col}" opacity="0"><animateMotion dur="3s" begin="${begin}s" repeatCount="indefinite" path="${path}"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur="3s" begin="${begin}s" repeatCount="indefinite"/></circle>`;
  }
  return `<g opacity=".95">${edges}${pulses}${nodes}</g>`;
}

function hero(t) {
  const W = 1000, H = 330;
  const ty = typing(t, 64, 222, 19);
  const body = `${card(W, H, t, 'hero')}
<defs>${ty.defs}
<linearGradient id="name-g" x1="0" x2="1"><stop offset="0" stop-color="${t.a}"/><stop offset=".55" stop-color="${t.b}"/><stop offset="1" stop-color="${t.c}"/>
<animateTransform attributeName="gradientTransform" type="translate" values="-.3 0;.3 0;-.3 0" dur="8s" repeatCount="indefinite"/></linearGradient>
<radialGradient id="glow-hero"><stop offset="0" stop-color="${t.a}" stop-opacity=".22"/><stop offset="1" stop-color="${t.a}" stop-opacity="0"/></radialGradient>
</defs>
<circle cx="825" cy="165" r="230" fill="url(#glow-hero)"/>
${neuralDecor(t, 700, 30, 250, 270, 7)}
${header(64, 62, 'model: abdullah-emin-esen  ·  status: online', t)}
<text x="62" y="130" font-family="${FONT}" font-size="50" font-weight="800" fill="url(#name-g)" letter-spacing="-1">Abdullah Emin Esen</text>
<text x="64" y="164" font-family="${FONT}" font-size="17" fill="${t.sub}">Computer engineering student · web dev &amp; computer vision</text>
<text x="44" y="222" font-family="${MONO}" font-size="19" fill="${t.a}" font-weight="700">&gt;</text>
${ty.body}
${['laravel', 'nextdotjs', 'python', 'pytorch', 'claude'].map((s, i) => `<rect x="${64 + i * 46}" y="258" width="36" height="36" rx="9" fill="${t.panel}" stroke="${t.line}"/>${icon(s, 72 + i * 46, 266, 20, t)}`).join('')}
<text x="300" y="281" font-family="${MONO}" font-size="12" fill="${t.dim}">tokens/s: ∞  ·  temperature: 0.7  ·  hallucinations: rare</text>`;
  return svg(W, H, body, 'Abdullah Emin Esen — full-stack developer and computer vision tinkerer');
}

/* ------------------------------------------------------- stack network */

const LAYERS = [
  { label: 'frontend', items: [['javascript', 'JavaScript'], ['typescript', 'TypeScript'], ['tailwindcss', 'Tailwind'], ['nextdotjs', 'Next.js']] },
  { label: 'backend', items: [['php', 'PHP'], ['laravel', 'Laravel'], ['nodedotjs', 'Node.js'], ['mysql', 'MySQL']] },
  { label: 'ai · vision', items: [['python', 'Python'], ['pytorch', 'PyTorch'], ['opencv', 'OpenCV'], ['ultralytics', 'YOLO']] },
  { label: 'ship', items: [['nginx', 'Nginx'], ['vercel', 'Vercel'], ['electron', 'Electron'], ['git', 'Git']] },
];

function stack(t) {
  const W = 1000, H = 500;
  const xs = [250, 425, 600, 775], ys = [160, 240, 320, 400], mid = 280;
  const idea = { x: 80, y: mid }, product = { x: 925, y: mid };
  const cols = LAYERS.map((l, li) => l.items.map((it, k) => ({ x: xs[li], y: ys[k], slug: it[0], name: it[1] })));
  const r = rng(42);

  let edges = '';
  const link = (a, b) => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${t.line}" stroke-width="1.2"/>`;
  for (const n of cols[0]) edges += link(idea, n);
  for (let li = 0; li < cols.length - 1; li++) for (const a of cols[li]) for (const b of cols[li + 1]) edges += link(a, b);
  for (const n of cols[3]) edges += link(n, product);

  let pulses = '';
  for (let p = 0; p < 14; p++) {
    const route = [idea, ...cols.map((c) => c[Math.floor(r() * 4)]), product];
    const path = route.map((n, i) => `${i ? 'L' : 'M'}${n.x} ${n.y}`).join(' ');
    const col = [t.a, t.b, t.c][p % 3], begin = (p * 0.43).toFixed(2);
    pulses += `<path d="${path}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-dasharray="40 2000" stroke-dashoffset="40" opacity=".0"><animate attributeName="stroke-dashoffset" values="40;-1000" dur="6s" begin="${begin}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.9;.9;0" keyTimes="0;.05;.8;1" dur="6s" begin="${begin}s" repeatCount="indefinite"/></path>`;
  }

  const node = (n, i) => `<g>
<circle cx="${n.x}" cy="${n.y}" r="25" fill="${t.panel}" stroke="${t.line}" stroke-width="1.5"/>
<circle cx="${n.x}" cy="${n.y}" r="25" fill="none" stroke="${t.b}" stroke-width="2" opacity="0"><animate attributeName="opacity" values="0;.9;0" dur="6s" begin="${(i * 0.37).toFixed(2)}s" repeatCount="indefinite"/></circle>
${icon(n.slug, n.x - 12, n.y - 12, 24, t)}
<text x="${n.x}" y="${n.y + 42}" text-anchor="middle" font-family="${MONO}" font-size="11" fill="${t.sub}">${esc(n.name)}</text></g>`;

  const endpoint = (n, label, sub, col) => `<circle cx="${n.x}" cy="${n.y}" r="34" fill="none" stroke="${col}" stroke-width="1.5" stroke-dasharray="4 5"><animateTransform attributeName="transform" type="rotate" from="0 ${n.x} ${n.y}" to="360 ${n.x} ${n.y}" dur="14s" repeatCount="indefinite"/></circle>
<circle cx="${n.x}" cy="${n.y}" r="26" fill="${col}" fill-opacity=".14" stroke="${col}" stroke-width="2"/>
<text x="${n.x}" y="${n.y + 5}" text-anchor="middle" font-family="${MONO}" font-size="13" font-weight="700" fill="${col}">${label}</text>
<text x="${n.x}" y="${n.y + 56}" text-anchor="middle" font-family="${MONO}" font-size="11" fill="${t.sub}">${sub}</text>`;

  const labels = LAYERS.map((l, li) => `<text x="${xs[li]}" y="112" text-anchor="middle" font-family="${MONO}" font-size="12" fill="${t.a}" letter-spacing="1">${esc(l.label)}</text><line x1="${xs[li] - 40}" y1="122" x2="${xs[li] + 40}" y2="122" stroke="${t.a}" stroke-opacity=".35"/>`).join('');

  const body = `${card(W, H, t, 'stack')}
${header(36, 46, 'tech_stack.forward(idea) → product', t)}
<text x="964" y="46" text-anchor="end" font-family="${MONO}" font-size="12" fill="${t.dim}">16 params · pruned from 50+</text>
${labels}
${edges}${pulses}
${endpoint(idea, 'idea', 'input', t.c)}
${endpoint(product, 'ship', 'output', t.ok)}
${cols.flat().map(node).join('')}
<g transform="translate(36 476)">${icon('claude', 0, -12, 14, t)}<text x="22" y="0" font-family="${MONO}" font-size="11" fill="${t.dim}">copilot: Claude Code — vibe coding, but with code review</text></g>`;
  return svg(W, H, body, 'Tech stack: JavaScript, TypeScript, Tailwind, Next.js, PHP, Laravel, Node.js, MySQL, Python, PyTorch, OpenCV, YOLO, Nginx, Vercel, Electron, Git');
}

/* ----------------------------------------------- projects (YOLO boxes) */

export const PROJECTS = [
  {
    file: 'flux-chess', repo: 'Flux-Chess', cls: 'realtime_game', conf: '0.99', main: 'socketdotio',
    title: 'Flux Chess',
    desc: ['Chess, but pieces have HP & ATK and captures', 'are timing-based duels. Real-time multiplayer.'],
    tags: [['nodedotjs', 'Node.js'], ['socketdotio', 'Socket.IO'], ['javascript', 'Canvas']],
  },
  {
    file: 'techstack-analyzer', repo: 'techstack-analyzer', cls: 'ai_tool', conf: '0.98', main: 'nextdotjs',
    title: 'Tech Stack Analyzer',
    desc: ['Paste a URL, get its full technology stack', 'in seconds. AI-powered detection.'],
    tags: [['typescript', 'TypeScript'], ['nextdotjs', 'Next.js'], ['vercel', 'Vercel']],
  },
  {
    file: 'laravel-auto-request', repo: 'laravel-auto-request', cls: 'laravel_package', conf: '0.97', main: 'laravel',
    title: 'Laravel Auto Request',
    desc: ['Generates Store & Update FormRequest classes', 'straight from your database migrations.'],
    tags: [['php', 'PHP'], ['laravel', 'Laravel'], ['mysql', 'Migrations']],
  },
  {
    file: 'system-dashboard', repo: 'system-dashboard', cls: 'desktop_app', conf: '0.95', main: 'electron',
    title: 'System Dashboard',
    desc: ['Always-on-top desktop widget showing', 'real-time CPU, RAM & system stats.'],
    tags: [['electron', 'Electron'], ['javascript', 'JavaScript'], ['python', 'Python']],
  },
];

function project(p, t, idx) {
  const W = 490, H = 210, col = [t.a, t.b, t.c, t.ok][idx % 4];
  const bx = 18, by = 34, bw = W - 36, bh = H - 52, L = 22;
  const corners = `M${bx} ${by + L}V${by}H${bx + L} M${bx + bw - L} ${by}H${bx + bw}V${by + L} M${bx + bw} ${by + bh - L}V${by + bh}H${bx + bw - L} M${bx + L} ${by + bh}H${bx}V${by + bh - L}`;
  const label = `${p.cls} ${p.conf}`;
  const lw = monoWidth(label, 12) + 18;
  let tx = 40;
  const tags = p.tags.map(([slug, name]) => {
    const w = monoWidth(name, 11) + 34;
    const g = `<rect x="${tx}" y="160" width="${w}" height="22" rx="11" fill="${t.panel}" stroke="${t.line}"/>${icon(slug, tx + 7, 164, 14, t)}<text x="${tx + 26}" y="175" font-family="${MONO}" font-size="11" fill="${t.sub}">${esc(name)}</text>`;
    tx += w + 8;
    return g;
  }).join('');
  const body = `${card(W, H, t, `p${idx}`)}
<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${col}" fill-opacity=".04" stroke="${col}" stroke-opacity=".35" stroke-dasharray="3 6"/>
<path d="${corners}" fill="none" stroke="${col}" stroke-width="3"><animate attributeName="stroke-opacity" values="1;.45;1" dur="2.4s" repeatCount="indefinite"/></path>
<rect x="${bx}" y="${by - 22}" width="${lw}" height="22" fill="${col}"/>
<text x="${bx + 9}" y="${by - 7}" font-family="${MONO}" font-size="12" font-weight="700" fill="${t.bg}">${esc(label)}</text>
<rect x="${bx + 2}" y="${by}" width="${bw - 4}" height="2" fill="${col}" opacity=".5"><animate attributeName="y" values="${by};${by + bh - 2};${by}" dur="4s" begin="${idx * 0.7}s" repeatCount="indefinite"/></rect>
<rect x="${W - 86}" y="50" width="48" height="48" rx="12" fill="${t.panel}" stroke="${t.line}"/>${icon(p.main, W - 74, 62, 24, t)}
<text x="40" y="78" font-family="${FONT}" font-size="22" font-weight="700" fill="${t.text}">${esc(p.title)}</text>
${p.desc.map((d, i) => `<text x="40" y="${106 + i * 20}" font-family="${FONT}" font-size="14" fill="${t.sub}">${esc(d)}</text>`).join('')}
${tags}`;
  return svg(W, H, body, `${p.title}: ${p.desc.join(' ')}`);
}

/* ---------------------------------------------------------------- footer */

function footer(t) {
  const W = 1000, H = 90;
  const wave = (amp, phase) => {
    let d = '';
    for (let x = 0; x <= 2000; x += 20) d += `${x ? 'L' : 'M'}${x} ${45 + amp * Math.sin((x / 1000) * Math.PI * 4 + phase)}`;
    return d;
  };
  const body = `<defs><linearGradient id="fw" x1="0" x2="1"><stop offset="0" stop-color="${t.a}" stop-opacity="0"/><stop offset=".3" stop-color="${t.a}"/><stop offset=".7" stop-color="${t.b}"/><stop offset="1" stop-color="${t.c}" stop-opacity="0"/></linearGradient></defs>
${[[10, 0, 1], [6, 1.5, .5], [14, 3, .3]].map(([a, ph, op], i) => `<path d="${wave(a, ph)}" fill="none" stroke="url(#fw)" stroke-width="2" opacity="${op}"><animateTransform attributeName="transform" type="translate" values="0 0;-1000 0" dur="${8 + i * 3}s" repeatCount="indefinite"/></path>`).join('')}
<rect x="320" y="30" width="360" height="30" rx="15" fill="${t.bg}" stroke="${t.line}"/>
<text x="500" y="50" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${t.sub}">session.end()  <tspan fill="${t.a}">// thanks for visiting ✦</tspan></text>`;
  return svg(W, H, body, 'Thanks for visiting');
}

for (const t of Object.values(THEMES)) {
  write(`hero-${t.name}.svg`, hero(t));
  write(`stack-${t.name}.svg`, stack(t));
  write(`footer-${t.name}.svg`, footer(t));
  PROJECTS.forEach((p, i) => write(`project-${p.file}-${t.name}.svg`, project(p, t, i)));
}
console.log('built assets');
