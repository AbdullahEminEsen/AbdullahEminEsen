// Fetches the contribution calendar and renders assets/metrics-{dark,light}.svg
// Run: GITHUB_TOKEN=... node scripts/stats.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { THEMES, FONT, MONO, esc, svg, card, header } from './lib.mjs';

const USER = process.env.PROFILE_USER ?? 'AbdullahEminEsen';
const TOKEN = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
if (!TOKEN) throw new Error('GITHUB_TOKEN is required');

const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': USER },
  body: JSON.stringify({ query, variables: { login: USER } }),
});
const json = await res.json();
if (json.errors) throw new Error(JSON.stringify(json.errors));
const cal = json.data.user.contributionsCollection.contributionCalendar;
const days = cal.weeks.flatMap((w) => w.contributionDays);

// Streaks (today may still be empty, so the current streak may end yesterday)
let longest = 0, run = 0;
for (const d of days) { run = d.contributionCount ? run + 1 : 0; longest = Math.max(longest, run); }
let current = 0, i = days.length - 1;
if (i >= 0 && !days[i].contributionCount) i--;
for (; i >= 0 && days[i].contributionCount; i--) current++;
const best = days.reduce((m, d) => (d.contributionCount > m.contributionCount ? d : m), days[0]);
const weekly = cal.weeks.map((w) => w.contributionDays.reduce((s, d) => s + d.contributionCount, 0));
const wd = [0, 0, 0, 0, 0, 0, 0];
days.forEach((d) => { wd[new Date(d.date + 'T00:00:00Z').getUTCDay()] += d.contributionCount; });
const busiest = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][wd.indexOf(Math.max(...wd))];

function render(t) {
  const W = 1000, H = 250;
  const metrics = [
    ['contributions', cal.totalContributions.toLocaleString('en-US'), 'last 12 months', t.a],
    ['current_streak', `${current}d`, 'consecutive days', t.b],
    ['longest_streak', `${longest}d`, 'personal best', t.c],
    ['peak_day', `${best.contributionCount}`, `${best.date} · busiest: ${busiest}`, t.ok],
  ];
  const mw = 220;
  const blocks = metrics.map(([k, v, s, col], j) => {
    const x = 36 + (j % 2) * (mw + 16), y = 72 + Math.floor(j / 2) * 82;
    return `<rect x="${x}" y="${y}" width="${mw}" height="70" rx="10" fill="${t.panel}" stroke="${t.line}"/>
<rect x="${x}" y="${y + 14}" width="3" height="42" rx="1.5" fill="${col}"/>
<text x="${x + 16}" y="${y + 22}" font-family="${MONO}" font-size="11" fill="${t.sub}">${esc(k)}</text>
<text x="${x + 16}" y="${y + 50}" font-family="${FONT}" font-size="24" font-weight="800" fill="${t.text}">${esc(v)}</text>
<text x="${x + 16}" y="${y + 63}" font-family="${MONO}" font-size="9.5" fill="${t.dim}">${esc(s)}</text>`;
  }).join('');

  // Weekly activity chart, styled like a training curve
  const cx = 530, cy = 72, cw = 434, ch = 152, max = Math.max(1, ...weekly);
  const pts = weekly.map((v, k) => [cx + (cw / (weekly.length - 1)) * k, cy + ch - 12 - (v / max) * (ch - 34)]);
  const line = pts.map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${cx + cw} ${cy + ch} L${cx} ${cy + ch} Z`;
  const len = Math.round(pts.reduce((s, p, k) => (k ? s + Math.hypot(p[0] - pts[k - 1][0], p[1] - pts[k - 1][1]) : 0), 0)) + 10;
  const last = pts.at(-1);
  const grid = [0.25, 0.5, 0.75].map((f) => `<line x1="${cx}" x2="${cx + cw}" y1="${cy + ch * f}" y2="${cy + ch * f}" stroke="${t.grid}"/>`).join('');

  const body = `${card(W, H, t, 'metrics')}
<defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.b}" stop-opacity=".35"/><stop offset="1" stop-color="${t.b}" stop-opacity="0"/></linearGradient>
<linearGradient id="ln" x1="0" x2="1"><stop offset="0" stop-color="${t.a}"/><stop offset="1" stop-color="${t.b}"/></linearGradient>
<clipPath id="chart"><rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="8"/></clipPath></defs>
${header(36, 46, 'training_metrics.log', t)}
<text x="964" y="46" text-anchor="end" font-family="${MONO}" font-size="11" fill="${t.dim}">auto-updated daily · ${new Date().toISOString().slice(0, 10)}</text>
${blocks}
<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="8" fill="${t.panel}" stroke="${t.line}"/>
<g clip-path="url(#chart)">${grid}<path d="${area}" fill="url(#area)"/>
<path d="${line}" fill="none" stroke="url(#ln)" stroke-width="2.5" stroke-linejoin="round" stroke-dasharray="${len}" stroke-dashoffset="${len}"><animate attributeName="stroke-dashoffset" from="${len}" to="0" dur="2.5s" fill="freeze"/></path></g>
<circle cx="${last[0] - 2}" cy="${last[1]}" r="4" fill="${t.b}"><animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite"/></circle>
<text x="${cx + 12}" y="${cy + 20}" font-family="${MONO}" font-size="11" fill="${t.sub}">commits / week · 52 epochs</text>`;
  return svg(W, H, body, `GitHub activity: ${cal.totalContributions} contributions in the last year, current streak ${current} days, longest streak ${longest} days`);
}

const out = new URL('../assets/', import.meta.url);
mkdirSync(out, { recursive: true });
for (const t of Object.values(THEMES)) writeFileSync(new URL(`metrics-${t.name}.svg`, out), render(t));
console.log({ total: cal.totalContributions, current, longest, best: best.contributionCount });
