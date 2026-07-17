/* ─────────────────────────────────────────────────────────────
   TRACE project page — interaction script.
   Scroll-reveal ported from the GET_Planning page; interactive
   widgets for the TRACE demos are added below.
   ───────────────────────────────────────────────────────────── */

const PREFERS_MOTION = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

// Frame metadata shared by the hero loop and the Watch-It-Work viewer,
// derived verbatim from video/real_video/metrics.txt.
const RUN_BADGES = [
  'Initial estimate', 'After declutter', 'Divergence Push #1', 'After Push #1',
  'Divergence Push #2', 'After Push #2', 'Divergence Push #3', 'Final trace',
  'Resolved ✓'
];
const RUN_FRAMES = 9;

// Preload run frames once for the run viewer.
for (let k = 0; k < RUN_FRAMES; k++) { const p = new Image(); p.src = `media/loop/iter_${k}.jpg`; }

// ── Monochrome challenge toggle ─────────────────────────
(() => {
  const img = document.getElementById('challengeImg');
  const btns = document.querySelectorAll('.challenge .seg-btn');
  if (!img || !btns.length) return;
  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    img.style.opacity = '0';
    setTimeout(() => { img.src = btn.dataset.img; img.style.opacity = '1'; }, 180);
  }));
})();

// ── Run viewer (real logged robot run, 9 frames) — autoplays & loops in view ──
(() => {
  const img = document.getElementById('runImg');
  const scrub = document.getElementById('runScrub');
  const playBtn = document.getElementById('runPlay');
  const idxEl = document.getElementById('runIdx');
  const capEl = document.getElementById('runCaption');
  const badgeEl = document.getElementById('runBadge');
  const stage = document.querySelector('.run-viewer');
  if (!img || !scrub) return;

  // Captions derived verbatim from video/real_video/metrics.txt
  // (badges + frame count + preload are shared via RUN_BADGES / RUN_FRAMES above).
  const captions = [
    'Iteration 0 — initial bi-directional trace of all eight connectors. Many cables break at crossings (≈30% traced) and foreground clutter is present. Next move: declutter the workspace.',
    'Re-trace after decluttering. Cables are cleaner but traces still disagree where paths cross. Next move: Divergence Push (15.96° to bisector, 52 px).',
    'Divergence Push #1 — the gripper pushes through the divergence point to pull the tangle apart.',
    'Re-trace after push #1. Fewer disagreements remain. Next move: Divergence Push (18.58°, 40 px).',
    'Divergence Push #2 — disambiguating the next contested crossing.',
    'Re-trace after push #2. Most cables now read as continuous. Next move: Divergence Push (12.83°, 69 px).',
    'Divergence Push #3 — one last crossing to separate.',
    'Final re-trace. All eight cables are recovered as continuous, topologically consistent traces.',
    'Result: 8 / 8 endpoints matched — 100% of every cable traced, up from ≈30% at the start.'
  ];
  const N = RUN_FRAMES;
  let i = 0, timer = null, userPaused = false;

  function show(n) {
    i = (n + N) % N;
    img.src = `media/loop/iter_${i}.jpg`;
    scrub.value = i;
    idxEl.textContent = i;
    capEl.textContent = captions[i];
    badgeEl.textContent = RUN_BADGES[i];
  }
  // Recursive timeout so the resolved final frame can hold a beat longer before looping.
  function schedule() {
    const delay = i === N - 1 ? 2400 : 1100;
    timer = setTimeout(() => { show(i + 1); schedule(); }, delay);
  }
  function play() {
    if (timer) return;
    playBtn.textContent = '❚❚ Pause';
    schedule();
  }
  // soft = paused by scroll/scrub, not by the user's explicit click.
  function stop(soft) {
    clearTimeout(timer); timer = null;
    playBtn.textContent = '▶ Play';
    if (!soft) userPaused = true;
  }

  playBtn.addEventListener('click', () => {
    if (timer) { stop(); } else { userPaused = false; play(); }
  });
  scrub.addEventListener('input', () => { stop(true); show(parseInt(scrub.value, 10)); });
  show(0);

  // Autoplay while on screen — like WARP-RM's rollout clips — unless the user
  // paused or prefers reduced motion. Pauses (softly) when scrolled away.
  if (PREFERS_MOTION && 'IntersectionObserver' in window && stage) {
    new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { if (!userPaused) play(); }
        else { stop(true); }
      }),
      { threshold: 0.35 }
    ).observe(stage);
  }
})();

// ── Divergence stepper ──────────────────────────────────
(() => {
  const stepper = document.getElementById('divergeStepper');
  const cap = document.getElementById('divergeCaption');
  if (!stepper) return;
  const green = document.querySelectorAll('.s-endpoints');
  const cyan = document.querySelectorAll('.s-diverge');
  const text = {
    endpoints: 'The A and B connectors are detected (green); each one seeds an independent trace.',
    trace: 'The <span style="color:#d33">red</span> trace runs from connector A and the white trace from connector B; where they agree, the paths overlap (orange).',
    diverge: 'Where the two traces stop overlapping are the divergence points (cyan): the locations where a cable&rsquo;s identity is ambiguous.'
  };
  stepper.querySelectorAll('.step-btn').forEach(btn => btn.addEventListener('click', () => {
    stepper.querySelectorAll('.step-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const step = btn.dataset.step;
    green.forEach(m => m.classList.toggle('show', step === 'endpoints'));
    cyan.forEach(m => m.classList.toggle('show', step === 'diverge'));
    cap.innerHTML = text[step];
  }));
  green.forEach(m => m.classList.add('show')); // initial step = endpoints
})();

// ── Perception primitive selector (3-way: declutter / push / dilation) ──
(() => {
  const btns = document.querySelectorAll('.density-toggle .seg-btn');
  const cards = document.querySelectorAll('.primitive-card');
  if (!btns.length) return;
  function select(pick) {
    cards.forEach(c => c.classList.toggle('selected', c.dataset.primitive === pick));
  }
  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    select(btn.dataset.pick);
  }));
  select('push'); // default matches the initially-active button
})();

// ── Results bar chart ───────────────────────────────────
(() => {
  const chart = document.getElementById('chart');
  const cap = document.getElementById('chartCaption');
  const btns = document.querySelectorAll('[data-chart]');
  if (!chart) return;

  const data = {
    clutter: {
      handloom: [37.6, 36.3, 52.6, 34.4],
      trace:    [94.4, 91.4, 88.3, 82.9],
      caption: 'With foreground clutter, TRACE correctly traces all cables in 32 of 60 trials, a 77% average improvement over HANDLOOM 2.0.'
    },
    clean: {
      handloom: [89.5, 86.2, 60.0, 68.2],
      trace:    [99.1, 91.2, 94.2, 89.4],
      caption: 'Without clutter, TRACE exceeds HANDLOOM 2.0 in every tier, with the largest margins on the more complex 3–4 cable scenes.'
    }
  };

  // Static tier labels under the chart
  const tiers = document.createElement('div');
  tiers.className = 'chart-tiers';
  tiers.innerHTML = [1, 2, 3, 4].map(t => `<div class="bar-tier">Tier ${t}</div>`).join('');
  chart.after(tiers);

  // Numeric companion table mirrors the active scenario.
  const statsBody = document.querySelector('#tierStats tbody');
  function renderStats(d) {
    if (!statsBody) return;
    const row = (label, vals, cls = '') =>
      `<tr class="${cls}"><td>${label}</td>${vals.map(v => `<td>${v}</td>`).join('')}</tr>`;
    const delta = d.trace.map((v, i) => `+${(v - d.handloom[i]).toFixed(1)}`);
    statsBody.innerHTML =
      row('HANDLOOM 2.0', d.handloom.map(v => v + '%')) +
      row('TRACE', d.trace.map(v => `<strong>${v}%</strong>`), 'method-row') +
      row('Gain (pts)', delta, 'improvement-row');
  }

  function render(key) {
    const d = data[key];
    chart.innerHTML = [0, 1, 2, 3].map(t => `
      <div class="bar-group">
        <div class="bar" data-h="${d.handloom[t]}" style="background:#5B8DB8"><span class="bar-val">${d.handloom[t]}%</span></div>
        <div class="bar" data-h="${d.trace[t]}" style="background:#E8801A"><span class="bar-val">${d.trace[t]}%</span></div>
      </div>`).join('');
    cap.textContent = d.caption;
    renderStats(d);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      chart.querySelectorAll('.bar').forEach(b => { b.style.height = b.dataset.h + '%'; });
    }));
  }

  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render(btn.dataset.chart);
  }));
  render('clutter');
})();

// ── Sticky TOC scroll-spy ───────────────────────────────
(() => {
  const links = Array.from(document.querySelectorAll('.toc a'));
  if (!links.length || !('IntersectionObserver' in window)) return;
  const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const targets = links
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  let active = null;
  const setActive = id => {
    if (id === active) return;
    active = id;
    links.forEach(a => a.classList.toggle('current', a === byId.get(id)));
  };

  // Activate the section whose top is nearest above the 35%-viewport line.
  const io = new IntersectionObserver(() => {
    const line = window.innerHeight * 0.35;
    let best = null, bestDist = Infinity;
    targets.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      const dist = Math.abs(top - line);
      if (top - line <= 1 && dist < bestDist) { bestDist = dist; best = sec.id; }
    });
    if (best) setActive(best);
  }, { rootMargin: '0px 0px -65% 0px', threshold: [0, 1] });

  targets.forEach(t => io.observe(t));
})();
