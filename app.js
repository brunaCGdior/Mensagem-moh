// Cartas para Você - lógica principal
const CATEGORIES = {
  saudade:  { from: '#ffb8d1', to: '#7a1538', emoji: '❤️', title: 'Quando sentir minha falta' },
  duvida:   { from: '#9ec9ff', to: '#0b1e54', emoji: '💙', title: 'Quando duvidar de si mesmo' },
  cansaco:  { from: '#aef0c9', to: '#0f3d2b', emoji: '💚', title: 'Quando estiver cansado' },
  musica:   { from: '#fff3a0', to: '#b8860b', emoji: '💛', title: 'Quando precisar de uma música' },
  sonhar:   { from: '#ffd2a8', to: '#b34700', emoji: '🧡', title: 'Quando quiser sonhar um pouco' },
};
const TOTAL = 100;
const STORAGE_KEY = 'cartas_lidas_v1';

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveProgress(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
function readCountFor(cat, progress) {
  return (progress[cat] || []).length;
}
function totalRead(progress) {
  return Object.keys(CATEGORIES).reduce((s, k) => s + readCountFor(k, progress), 0);
}
function markRead(cat, idx) {
  const p = loadProgress();
  if (!p[cat]) p[cat] = [];
  if (!p[cat].includes(idx)) p[cat].push(idx);
  saveProgress(p);
}

async function loadLetters() {
  const res = await fetch('./cartas.json');
  return await res.json();
}

// ---------- Home ----------
async function renderHome() {
  const progress = loadProgress();
  const total = totalRead(progress);

  document.getElementById('total-count').textContent = `${total} / ${TOTAL}`;
  document.getElementById('total-bar').style.width = `${(total / TOTAL) * 100}%`;

  const list = document.getElementById('cats');
  list.innerHTML = '';
  Object.entries(CATEGORIES).forEach(([key, c]) => {
    const read = readCountFor(key, progress);
    const a = document.createElement('a');
    a.href = `./categoria.html?c=${key}`;
    a.className = 'cat-card';
    a.style.setProperty('--from', c.from);
    a.style.setProperty('--to', c.to);
    a.innerHTML = `
      <div class="inner">
        <div class="emoji">${c.emoji}</div>
        <div class="meta">
          <div class="title">${c.title}</div>
          <div class="sub">${read} de 20 cartas</div>
          <div class="mini-bar"><span style="width:${(read/20)*100}%"></span></div>
        </div>
      </div>`;
    list.appendChild(a);
  });

  // Special card
  const unlocked = total >= TOTAL;
  const sp = document.createElement('a');
  sp.href = unlocked ? './categoria.html?c=especial' : '#';
  sp.className = 'cat-card ' + (unlocked ? 'unlocked' : 'locked');
  sp.style.setProperty('--from', '#ffffff');
  sp.style.setProperty('--to', '#888');
  sp.innerHTML = `
    <div class="inner">
      <div class="emoji">${unlocked ? '✨' : '🔒'}</div>
      <div class="meta">
        <div class="title">${unlocked ? 'Uma carta só nossa' : 'Carta secreta'}</div>
        <div class="sub">${unlocked ? 'Desbloqueada' : `Leia as ${TOTAL} cartas para desbloquear`}</div>
      </div>
    </div>`;
  if (!unlocked) sp.addEventListener('click', e => e.preventDefault());
  list.appendChild(sp);
}

// ---------- Category ----------
async function renderCategory() {
  const params = new URLSearchParams(location.search);
  const cat = params.get('c');
  const data = await loadLetters();
  const info = cat === 'especial'
    ? { from: '#ffffff', to: '#888', emoji: '✨', title: 'Uma carta só nossa' }
    : CATEGORIES[cat];
  if (!info || !data[cat]) { location.href = './index.html'; return; }

  document.documentElement.style.setProperty('--from', info.from);
  document.documentElement.style.setProperty('--to', info.to);

  document.getElementById('cat-title').textContent = info.title;
  document.getElementById('cat-sub').textContent = info.emoji + '  ' + (cat === 'especial' ? 'CARTA ESPECIAL' : '20 CARTAS');

  // Lock check for especial
  if (cat === 'especial') {
    const total = totalRead(loadProgress());
    if (total < TOTAL) { location.href = './index.html'; return; }
  }

  const letters = data[cat].letters;
  const progress = loadProgress();
  const read = new Set(progress[cat] || []);

  const grid = document.getElementById('envelopes');
  grid.innerHTML = '';
  if (cat === 'especial') grid.style.gridTemplateColumns = '1fr';

  letters.forEach((text, idx) => {
    const env = document.createElement('div');
    env.className = 'envelope' + (read.has(idx) ? ' read' : '');
    env.style.setProperty('--from', info.from);
    env.style.setProperty('--to', info.to);
    env.innerHTML = '<div class="seal"></div>';
    env.addEventListener('click', () => openLetter(cat, idx, text, info));
    grid.appendChild(env);
  });
}

function openLetter(cat, idx, text, info) {
  const overlay = document.getElementById('overlay');
  const letter = document.getElementById('letter');
  letter.style.setProperty('--from', info.from);
  letter.style.setProperty('--to', info.to);
  document.getElementById('letter-body').textContent = text;
  overlay.classList.add('open');

  markRead(cat, idx);
  // update envelope visual
  const env = document.querySelectorAll('.envelope')[idx];
  if (env) env.classList.add('read');
}

function closeLetter() {
  document.getElementById('overlay').classList.remove('open');
}

// expose
window.__cartas = { renderHome, renderCategory, closeLetter };
