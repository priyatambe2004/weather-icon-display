const $ = id => document.getElementById(id);

// ---------- SVG icon pieces (viewBox 0 0 120 120) ----------
const rays = (cx, cy, r1, r2) => Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4, c = Math.cos(a), s = Math.sin(a);
  return `<line x1="${(cx + r1 * c).toFixed(1)}" y1="${(cy + r1 * s).toFixed(1)}" x2="${(cx + r2 * c).toFixed(1)}" y2="${(cy + r2 * s).toFixed(1)}"/>`;
}).join('');
const sun = (cx, cy, r) =>
  `<g class="spin" style="transform-origin:${cx}px ${cy}px"><g stroke="#ffd23f" stroke-width="5" stroke-linecap="round">${rays(cx, cy, r + 8, r + 16)}</g></g>` +
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffd23f"/><circle cx="${cx - r * .25}" cy="${cy - r * .25}" r="${r * .5}" fill="#ffe985" opacity=".7"/>`;
const cloud = (fill, x = 0, y = 0, s = 1) =>
  `<g class="float"><g transform="translate(${x} ${y}) scale(${s})" fill="${fill}"><circle cx="40" cy="70" r="16"/><circle cx="62" cy="56" r="22"/><circle cx="86" cy="70" r="14"/><rect x="26" y="68" width="74" height="18" rx="9"/></g></g>`;
const svg = (inner, label) => `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;

const ICONS = {
  default: cloud('rgba(255,255,255,.4)') + '<text x="60" y="84" text-anchor="middle" font-size="34" font-weight="800" fill="#fff" font-family="sans-serif">?</text>',
  sunny:  sun(60, 60, 22),
  partly: sun(44, 42, 15) + cloud('#ffffff', 4, 10),
  cloudy: cloud('#9aa7b8', -10, -8, .85) + cloud('#ffffff', 8, 8),
  rainy:  cloud('#b6c2d1', 0, -10) +
    '<g class="drip" stroke="#5db7ff" stroke-width="5" stroke-linecap="round"><line x1="44" y1="84" x2="39" y2="98"/><line x1="64" y1="84" x2="59" y2="98"/><line x1="84" y1="84" x2="79" y2="98"/></g>',
  stormy: cloud('#7d86a8', 0, -12) + '<polygon class="bolt" points="66,68 50,92 62,92 56,112 80,82 67,82 75,68" fill="#ffd23f"/>',
  snowy:  cloud('#dfe8f2', 0, -10) +
    '<g class="sway" fill="#fff"><circle cx="42" cy="92" r="4.5"/><circle cx="62" cy="100" r="4.5"/><circle cx="82" cy="92" r="4.5"/><circle cx="52" cy="110" r="3.5"/><circle cx="72" cy="110" r="3.5"/></g>',
  foggy:  cloud('#e6ebf0', 0, -16) +
    '<g class="sway" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".92"><line x1="24" y1="80" x2="96" y2="80"/><line x1="34" y1="94" x2="104" y2="94"/><line x1="24" y1="108" x2="84" y2="108"/></g>',
  windy:  '<g class="blow" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"><path d="M14 44H72a12 12 0 1 0-12-12"/><path d="M14 62H92a13 13 0 1 1-13 13"/><path d="M14 80H50a10 10 0 1 1-10 10"/></g>'
};

// ---------- the data: one object, keyed by condition ----------
const WEATHER = {
  sunny:  { label: 'Sunny',          temp: 32, feels: 34, hum: 35, wind: 10, rain: 0,  uv: '9 · Very high', desc: 'Clear skies and strong sunshine all day. Expect a hot afternoon with long, bright hours.', wear: 'Light cotton, sunglasses, a cap and sunscreen', good: 'Beach trips, cycling early in the morning', fx: { sun: true } },
  partly: { label: 'Partly cloudy',  temp: 27, feels: 28, hum: 50, wind: 14, rain: 10, uv: '6 · High',      desc: 'A mix of sun and drifting clouds. Comfortable and pleasant, with shade when you need it.', wear: 'A T-shirt and a light overshirt', good: 'Walks, picnics, outdoor sports', fx: { sun: true, clouds: 3 } },
  cloudy: { label: 'Cloudy',         temp: 24, feels: 24, hum: 65, wind: 12, rain: 20, uv: '3 · Moderate',  desc: 'A thick grey blanket covers the sky. It stays mild and calm, and the sun barely shows.', wear: 'Comfortable layers', good: 'Photography, a long run, errands', fx: { clouds: 5 } },
  rainy:  { label: 'Rainy',          temp: 21, feels: 20, hum: 88, wind: 18, rain: 85, uv: '1 · Low',       desc: 'Steady rain falls from low clouds. Roads are slick and puddles are everywhere.', wear: 'Waterproof jacket, umbrella, shoes that can get wet', good: 'Cafés, reading, a cosy movie day', fx: { clouds: 5, dark: true, rain: 80 } },
  stormy: { label: 'Thunderstorm',   temp: 22, feels: 21, hum: 90, wind: 40, rain: 95, uv: '1 · Low',       desc: 'Heavy rain with thunder and lightning. Gusty winds make it unsafe to be outside.', wear: 'Stay dry indoors. Avoid open areas', good: 'Staying home, charging your devices', fx: { clouds: 6, dark: true, rain: 110, flash: true } },
  snowy:  { label: 'Snowy',          temp: -3, feels: -8, hum: 80, wind: 16, rain: 70, uv: '1 · Low',       desc: 'Soft snow drifts down and settles on everything. It is cold and very quiet outside.', wear: 'Insulated coat, gloves, a hat and boots', good: 'Snowmen, hot chocolate, cosy evenings', fx: { clouds: 4, snow: 60 } },
  foggy:  { label: 'Foggy',          temp: 12, feels: 11, hum: 96, wind: 5,  rain: 10, uv: '1 · Low',       desc: 'Thick fog hangs low and softens everything. Visibility is short, especially near water.', wear: 'A warm jacket. Bright clothes help you stand out', good: 'Slow walks. Drive carefully with low beams', fx: { fog: true } },
  windy:  { label: 'Windy',          temp: 19, feels: 15, hum: 45, wind: 45, rain: 5,  uv: '4 · Moderate',  desc: 'Strong, steady gusts sweep across the sky. It feels cooler than the thermometer says.', wear: 'A windbreaker and secure hats', good: 'Kite flying. Tie down anything loose', fx: { clouds: 2, wind: 16 } }
};
// Shown before anything is selected
const DEFAULT = { label: 'Pick a sky', desc: 'Choose a weather condition from the menu to see its icon, details and mood. Every sky has its own background.', temp: null, wear: '–', good: '–', fx: { clouds: 2 } };

// ---------- helpers ----------
const store = {
  get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} }
};
let unit = store.get('nimbus-unit', 'C');
let current = '';
const temp = c => (c == null ? '–' : unit === 'C' ? `${c}°C` : `${Math.round((c * 9) / 5 + 32)}°F`);
const rnd = (a, b) => a + Math.random() * (b - a);

// ---------- background effects ----------
function buildFx(cfg) {
  const fx = $('fx');
  fx.innerHTML = '';
  const add = (cls, style = {}) => { const e = document.createElement('div'); e.className = cls; Object.assign(e.style, style); fx.appendChild(e); };
  if (cfg.sun) add('sunglow');
  for (let i = 0; i < (cfg.clouds || 0); i++) {
    add('cloudbg' + (cfg.dark ? ' dark' : ''), { top: rnd(6, 45) + '%', animationDuration: rnd(55, 95) + 's', animationDelay: -rnd(0, 70) + 's', scale: String(rnd(.8, 1.6)) });
  }
  for (let i = 0; i < (cfg.rain || 0); i++) add('drop', { left: rnd(0, 110) + '%', animationDuration: rnd(.6, 1.1) + 's', animationDelay: -rnd(0, 2) + 's', opacity: rnd(.4, .9) });
  for (let i = 0; i < (cfg.snow || 0); i++) { const s = rnd(3, 8) + 'px'; add('flake', { left: rnd(0, 100) + '%', width: s, height: s, animationDuration: rnd(6, 12) + 's', animationDelay: -rnd(0, 10) + 's', opacity: rnd(.5, 1) }); }
  for (let i = 0; i < (cfg.wind || 0); i++) add('streak', { top: rnd(5, 95) + '%', animationDuration: rnd(1.4, 3.4) + 's', animationDelay: -rnd(0, 3) + 's', width: rnd(120, 300) + 'px' });
  if (cfg.fog) [18, 42, 68].forEach((t, i) => add('fogband', { top: t + '%', animationDelay: -i * 4 + 's' }));
  if (cfg.flash) add('flash');
}

// ---------- render: look up the key, fall back to DEFAULT ----------
function render(key) {
  const data = WEATHER[key] ?? DEFAULT;
  current = WEATHER[key] ? key : '';
  document.body.dataset.weather = current || 'default';

  $('icon').innerHTML = svg(ICONS[current || 'default']);
  $('icon').setAttribute('aria-label', data.label + ' icon');
  $('label').textContent = data.label;
  $('desc').textContent = data.desc;
  $('sTemp').textContent = temp(data.temp);
  $('sFeels').textContent = temp(data.feels);
  $('sHum').textContent = data.hum != null ? data.hum + '%' : '–';
  $('sWind').textContent = data.wind != null ? data.wind + ' km/h' : '–';
  $('sRain').textContent = data.rain != null ? data.rain + '%' : '–';
  $('sUV').textContent = data.uv ?? '–';
  $('wear').textContent = data.wear;
  $('good').textContent = data.good;
  $('cond').value = current;
  document.querySelectorAll('.card').forEach(c => c.setAttribute('aria-pressed', c.dataset.key === current));
  buildFx(data.fx);
  if (current) { try { history.replaceState(null, '', '#' + current); } catch {} }
}

// ---------- build the dropdown and gallery from the same object ----------
Object.entries(WEATHER).forEach(([key, w]) => {
  const opt = document.createElement('option');
  opt.value = key; opt.textContent = w.label;
  $('cond').appendChild(opt);

  const card = document.createElement('button');
  card.type = 'button'; card.className = 'card'; card.dataset.key = key;
  card.setAttribute('aria-pressed', 'false');
  card.innerHTML = svg(ICONS[key]);
  card.append(w.label);
  card.addEventListener('click', () => { render(key); $('app').scrollIntoView({ behavior: 'smooth' }); });
  $('grid').appendChild(card);
});

// ---------- events ----------
$('cond').addEventListener('change', e => render(e.target.value));
$('random').addEventListener('click', () => {
  const keys = Object.keys(WEATHER).filter(k => k !== current);
  render(keys[Math.floor(Math.random() * keys.length)]);
});
$('units').addEventListener('click', e => {
  const b = e.target.closest('button[data-unit]');
  if (!b) return;
  unit = b.dataset.unit;
  store.set('nimbus-unit', unit);
  document.querySelectorAll('#units button').forEach(x => x.setAttribute('aria-pressed', x === b));
  render(current);
});

// ---------- start ----------
document.querySelectorAll('#units button').forEach(x => x.setAttribute('aria-pressed', x.dataset.unit === unit));
render(location.hash.slice(1));
