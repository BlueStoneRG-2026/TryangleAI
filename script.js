/* ===============================================
   TRY — Interaction layer (v4)
   =============================================== */

(() => {
'use strict';

const CONFIG = {
  productURLs: { playbook: '#' },     // Wire to Gumroad/Stripe
  foundingSlotsRemaining: 100,         // Manual count, redeploy to update
  leadMagnetEndpoint: null
};

const WORKFLOWS = [
  { id: 'review',   name: 'Review Responder',     hours: 3, dollars: 156 },
  { id: 'quote',    name: 'Quote Generator',      hours: 5, dollars: 260 },
  { id: 'callback', name: 'Missed-Call Text-Back',hours: 2, dollars: 480 },
  { id: 'email',    name: 'Email Triage',         hours: 6, dollars: 312 },
  { id: 'invoice',  name: 'Invoice Follow-Up',    hours: 2, dollars: 200 },
  { id: 'meetings', name: 'Meeting Notes',        hours: 2, dollars: 104 },
  { id: 'social',   name: 'Social Content',       hours: 4, dollars: 208 },
  { id: 'leads',    name: 'Lead Qualifier',       hours: 3, dollars: 240 },
  { id: 'reengage', name: 'Customer Re-engagement', hours: 2, dollars: 320 },
  { id: 'jobs',     name: 'Job Post Writer',      hours: 1, dollars: 100 },
  { id: 'contracts',name: 'Contract Review',      hours: 1, dollars: 200 },
  { id: 'brief',    name: 'Weekly Owner Brief',   hours: 1, dollars: 52 }
];

/* ============ LIVE DEMO SCENES ============ */
const DEMO_SCENES = [
  {
    name: 'Review Responder',
    engine: 'gpt-4o',
    input: '"Got a haircut today. Took an hour because they were short staffed. Cut was good but I waited 45 min past my appointment. Probably won\'t be back."\n\n— Mike R., 2★',
    output: 'Hi Mike — I\'m so sorry about the wait, that\'s on us, not on you. We were short two stylists yesterday and it cascaded all afternoon. The cut was the easy part — earning your trust back is the harder one. If you give us another shot, I\'ll book you personally and the haircut\'s on the house.\n\n— Sarah, owner',
    saved: 'Saved: 2 min 47 sec'
  },
  {
    name: 'Quote Generator',
    engine: 'claude-sonnet',
    input: '"Customer needs full bathroom renovation. 6×8 ft. Wants new tub, vanity, tile, paint. Mid-range finishes. Timeline ~3 weeks."',
    output: 'BATHROOM RENOVATION — 6×8 ft\n\nDemo & disposal ........... $850\nPlumbing rough-in ......... $1,400\nTile (floor + walls) ...... $2,200\nFixtures (mid-range) ...... $1,800\nVanity + countertop ....... $950\nPaint + finish work ....... $600\nLabor (3 wks @ 35 hrs) .... $4,200\n\nSubtotal .................. $12,000\n10% contingency ........... $1,200\nTOTAL ..................... $13,200',
    saved: 'Saved: 22 minutes'
  },
  {
    name: 'Missed-Call Text-Back',
    engine: 'gpt-4o',
    input: 'Inbound call: (516) 555-0143\n\nCall duration: 0 sec (missed)\nTime: 2:14 PM Tuesday\nCustomer: Unknown number',
    output: 'Hi! This is Sarah from Bay Ridge HVAC. I just missed your call and I\'m on a job site until 4 — but I want to make sure you don\'t wait.\n\nReply with what you need (estimate, repair, schedule) and I\'ll text you back within the hour with availability.\n\nIf it\'s an emergency, call 555-0150.',
    saved: 'Saved: a $400 job'
  }
];

const state = {
  picks: [],
  demoIdx: 0,
  demoTimer: null,
  demoCancel: false
};

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  renderFoundingCount();
  renderBuilderOptions();
  renderPersonalBook();
  renderStats(true);
  bindNav();
  bindStickyBar();
  bindStatCounters();
  startDemoLoop();
});

function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

function renderFoundingCount() {
  const slots = CONFIG.foundingSlotsRemaining;
  ['slotsLeft', 'sbSlots'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = slots;
  });
}

/* ============ BUILDER ============ */
function renderBuilderOptions() {
  const root = document.getElementById('builderOptions');
  if (!root) return;
  root.innerHTML = WORKFLOWS.map((wf, i) => `
    <button class="bo-chip" data-id="${wf.id}" type="button" aria-pressed="false">
      <span class="bo-chip-num">${String(i + 1).padStart(2, '0')}</span>
      <span class="bo-chip-name">${wf.name}</span>
      <span class="bo-chip-check" aria-hidden="true">✓</span>
    </button>
  `).join('');
  root.querySelectorAll('.bo-chip').forEach(btn => {
    btn.addEventListener('click', () => togglePick(btn.dataset.id));
  });
}

function togglePick(id) {
  const idx = state.picks.indexOf(id);
  if (idx > -1) {
    state.picks.splice(idx, 1);
  } else {
    if (state.picks.length >= 3) return;
    state.picks.push(id);
  }
  refreshBuilderUI();
}

function refreshBuilderUI() {
  document.querySelectorAll('.bo-chip').forEach(btn => {
    const id = btn.dataset.id;
    const isPicked = state.picks.includes(id);
    btn.classList.toggle('selected', isPicked);
    btn.setAttribute('aria-pressed', String(isPicked));
    const atCap = state.picks.length >= 3 && !isPicked;
    btn.classList.toggle('disabled', atCap);
  });
  renderPersonalBook();
  renderStats();
}

function renderPersonalBook() {
  const list = document.getElementById('bcPicks');
  if (!list) return;
  list.innerHTML = [0, 1, 2].map(slot => {
    const id = state.picks[slot];
    const wf = id ? WORKFLOWS.find(w => w.id === id) : null;
    if (!wf) {
      return `<li class="bc-pick bc-pick-empty"><span class="bc-pick-num">${slot + 1}.</span><span class="bc-pick-text">— pick one —</span></li>`;
    }
    return `<li class="bc-pick bc-pick-filled"><span class="bc-pick-num">${slot + 1}.</span><span class="bc-pick-text">${wf.name}</span></li>`;
  }).join('');
}

function renderStats(initial) {
  const hoursEl = document.getElementById('hoursSaved');
  const yearEl  = document.getElementById('yearSaved');
  if (!hoursEl || !yearEl) return;
  const targetH = state.picks.reduce((s, id) => {
    const w = WORKFLOWS.find(x => x.id === id);
    return s + (w ? w.hours : 0);
  }, 0);
  const targetD = state.picks.reduce((s, id) => {
    const w = WORKFLOWS.find(x => x.id === id);
    return s + (w ? w.dollars * 12 : 0);
  }, 0);
  if (initial) {
    hoursEl.textContent = '0';
    yearEl.textContent = '0';
    return;
  }
  countTo(hoursEl, parseInt(hoursEl.textContent || '0', 10), targetH, 380);
  countTo(yearEl,  parseInt((yearEl.textContent || '0').replace(/,/g, ''), 10), targetD, 520, true);
}

function countTo(el, from, to, duration, withCommas) {
  const start = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const v = Math.round(from + (to - from) * ease(t));
    el.textContent = withCommas ? v.toLocaleString('en-US') : String(v);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ============ STAT COUNTERS — animate when in view ============ */
function bindStatCounters() {
  const cards = document.querySelectorAll('.stat-card');
  if (!cards.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const card = e.target;
      const valEl = card.querySelector('.sc-val');
      const fillEl = card.querySelector('.sc-bar-fill');
      if (!valEl || valEl.dataset.animated) return;
      valEl.dataset.animated = '1';
      const target = parseInt(valEl.dataset.target || '0', 10);
      animateCount(valEl, target, 1400);
      if (fillEl) {
        const pct = Math.min(100, Math.max(8, target));
        // For dollar/hour values, scale to a visual percent
        const visualPct = target >= 100 ? 95 : Math.max(20, target * 1.2);
        setTimeout(() => { fillEl.style.width = visualPct + '%'; }, 100);
      }
    });
  }, { threshold: 0.4 });
  cards.forEach(c => io.observe(c));
}

function animateCount(el, to, duration) {
  const start = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = Math.round(to * ease(t));
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ============ NAV SCROLL ============ */
function bindNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============ STICKY BAR ============ */
function bindStickyBar() {
  const bar = document.getElementById('stickyBar');
  const hero = document.querySelector('.hero');
  if (!bar || !hero) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      bar.classList.toggle('visible', !e.isIntersecting);
    });
  }, { rootMargin: '-100px 0px 0px 0px', threshold: 0 });
  io.observe(hero);
  const final = document.querySelector('.final');
  if (final) {
    const fio = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) bar.classList.remove('visible'); });
    }, { threshold: 0.3 });
    fio.observe(final);
  }
}

/* ============ LIVE DEMO ============ */
function startDemoLoop() {
  const term = document.getElementById('terminal');
  if (!term) return;
  // Wait until terminal scrolls into view, then start
  let started = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !started) {
        started = true;
        runDemoCycle();
      }
    });
  }, { threshold: 0.3 });
  io.observe(term);
}

async function runDemoCycle() {
  while (true) {
    if (state.demoCancel) return;
    const scene = DEMO_SCENES[state.demoIdx];
    await playScene(scene, state.demoIdx);
    state.demoIdx = (state.demoIdx + 1) % DEMO_SCENES.length;
    await wait(1200);
  }
}

async function playScene(scene, idx) {
  // Reset
  const tName = document.getElementById('tName');
  const tInput = document.getElementById('tInput');
  const tOutput = document.getElementById('tOutput');
  const tSaved = document.getElementById('tSaved');
  const tEngine = document.getElementById('tEngine');
  const tCount = document.getElementById('tCount');
  const tClock = document.getElementById('tClock');
  const tProgress = document.getElementById('tProgress');

  if (tName) tName.textContent = scene.name;
  if (tCount) tCount.textContent = idx + 1;
  if (tEngine) tEngine.textContent = scene.engine;
  if (tInput) tInput.innerHTML = '';
  if (tOutput) tOutput.innerHTML = '';
  if (tSaved) tSaved.textContent = '—';
  if (tProgress) tProgress.style.width = '0%';

  const startTime = performance.now();
  const clockTimer = setInterval(() => {
    const ms = performance.now() - startTime;
    const sec = ms / 1000;
    if (tClock) tClock.textContent = `00:${sec.toFixed(2).padStart(5, '0')}`;
  }, 50);

  // Phase 1: type input
  if (tProgress) tProgress.style.width = '15%';
  await typeText(tInput, scene.input, 14);
  if (tProgress) tProgress.style.width = '40%';
  await wait(500);

  // Phase 2: AI processing (just wait while spinner runs)
  if (tEngine) tEngine.textContent = scene.engine + ' · processing';
  if (tProgress) tProgress.style.width = '70%';
  await wait(1400);

  // Phase 3: output (typing)
  if (tEngine) tEngine.textContent = scene.engine + ' · done';
  await typeText(tOutput, scene.output, 8);
  if (tProgress) tProgress.style.width = '100%';
  if (tSaved) tSaved.textContent = scene.saved;

  clearInterval(clockTimer);
  await wait(3500);
}

async function typeText(el, text, speedMs) {
  if (!el) return;
  el.innerHTML = '';
  const cursor = document.createElement('span');
  cursor.className = 't-cursor';
  el.appendChild(cursor);
  for (let i = 0; i < text.length; i++) {
    if (state.demoCancel) return;
    const ch = text[i];
    const node = document.createTextNode(ch);
    el.insertBefore(node, cursor);
    // Skip wait on whitespace bursts to feel snappier
    const wait_ms = ch === ' ' ? speedMs * 0.4 : speedMs;
    await wait(wait_ms + (Math.random() * 4));
  }
  cursor.remove();
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/* ============ BUY ============ */
window.handleBuy = function (key) {
  const url = CONFIG.productURLs[key];
  showToast('Redirecting to checkout…');
  if (url && url !== '#') {
    setTimeout(() => { window.location.href = url; }, 600);
  } else {
    setTimeout(() => {
      showToast('Wire CONFIG.productURLs in script.js', 4000);
    }, 800);
  }
};

/* ============ LEAD ============ */
window.handleLeadMagnet = function (e) {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value.trim();
  const status = document.getElementById('lfStatus');
  if (!email) return;
  if (status) status.textContent = 'Sending…';
  if (CONFIG.leadMagnetEndpoint) {
    fetch(CONFIG.leadMagnetEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }).then(() => onLeadOK(form, status))
      .catch(() => { if (status) status.textContent = 'Error'; });
  } else {
    setTimeout(() => onLeadOK(form, status), 600);
  }
};

function onLeadOK(form, status) {
  form.reset();
  if (status) { status.textContent = 'Sent ✓'; status.style.color = 'var(--lime)'; }
  showToast('Chapter 1 is on its way. Check your inbox.', 4500);
}

/* ============ TOAST ============ */
let toastTimer = null;
function showToast(msg, duration = 2400) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toastMsg');
  if (!toast || !msgEl) return;
  msgEl.textContent = msg;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), duration);
}

})();
