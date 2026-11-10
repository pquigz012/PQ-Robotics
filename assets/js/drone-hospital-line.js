/* Drone Hospital repair line for the home page hero.
   Each drone loops through one life cycle:
   take off at HOME, fly the mission, fail after WP 05 and limp along the last leg,
   drop onto the belt, get scanned at the ER, new prop at bay 01, arm welded at bay 02,
   firmware flashed at bay 03, test flight in the cage, land at HOME, repeat.
   Several drones run the same cycle at staggered times. */
(() => {
  const svg = document.querySelector('#home .hero-route');
  const hosp = svg && svg.querySelector('#hosp');
  const route = svg && svg.querySelector('#flight');
  if (!hosp || !route || typeof route.getTotalLength !== 'function') return;

  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = id => hosp.querySelector('#' + id);
  const setC = (e, c) => { if (e._c !== c) { e.setAttribute('class', c); e._c = c; } };
  const show = (e, on) => { const v = on ? 'visible' : 'hidden'; if (e._v !== v) { e.setAttribute('visibility', v); e._v = v; } };
  const text = (e, t) => { if (e._t !== t) { e.textContent = t; e._t = t; } };
  const line = (e, x1, y1, x2, y2) => {
    e.setAttribute('x1', x1.toFixed(1)); e.setAttribute('y1', y1.toFixed(1));
    e.setAttribute('x2', x2.toFixed(1)); e.setAttribute('y2', y2.toFixed(1));
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const ease = u => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
  const easeOut = u => 1 - (1 - u) * (1 - u);
  const rnd = (a, b) => {
    let h = (Math.imul(a + 1, 374761393) + Math.imul(b + 7, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // the plain SMIL drone is only a no-script fallback
  const fallback = svg.querySelector('.drone');
  if (fallback) fallback.remove();

  const layer = { robots: $('h-robots'), drones: $('h-drones'), front: $('h-front'), fx: $('h-fx') };

  /* ---------- mission route, sampled once ---------- */
  const L = route.getTotalLength();
  const STEP = 2;
  const N = Math.ceil(L / STEP) + 1;
  const RX = new Float32Array(N), RY = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const p = route.getPointAtLength(Math.min(L, i * STEP));
    RX[i] = p.x; RY[i] = p.y;
  }
  const at = l => {
    const f = clamp(l, 0, L) / STEP;
    const i = Math.min(N - 2, Math.floor(f));
    const k = clamp(f - i, 0, 1);
    return { x: lerp(RX[i], RX[i + 1], k), y: lerp(RY[i], RY[i + 1], k) };
  };
  const heading = l => {
    const a = at(Math.max(0, l - 3)), b = at(Math.min(L, l + 3));
    return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  };
  let lW5 = 0;
  {
    let best = Infinity;
    for (let i = 0; i < N; i++) {
      const d = (RX[i] - 1420) ** 2 + (RY[i] - 640) ** 2;
      if (d < best) { best = d; lW5 = i * STEP; }
    }
  }

  /* ---------- one drone life cycle ---------- */
  const BY = 803;                       // drone centre when lying on the belt
  const SPEED = 56;                     // belt speed, matches the tread animation
  const HOME = { x: 170, y: 760 };
  const CAGE = { x: 372, y: 766 };
  const X = { intake: 1110, b1: 955, b2: 800, b3: 645, end: 452 };

  const seg = [];
  let T = 0;
  const add = (name, dur, o) => { const s = Object.assign({ name, t0: T, dur }, o || {}); seg.push(s); T += dur; return s; };
  const S = {};
  S.takeoff = add('takeoff', 1.2);
  S.route = add('route', 30);
  S.limp = add('limp', 4);
  S.sputter = add('sputter', 0.6);
  S.fall = add('fall', 0.9);
  S.bounce = add('bounce', 0.35);
  S.triage = add('dwell', 2.2, { x: X.intake });
  add('move', (X.intake - X.b1) / SPEED, { a: X.intake, b: X.b1 });
  S.bay1 = add('dwell', 3.4, { x: X.b1 });
  add('move', (X.b1 - X.b2) / SPEED, { a: X.b1, b: X.b2 });
  S.bay2 = add('dwell', 3.2, { x: X.b2 });
  add('move', (X.b2 - X.b3) / SPEED, { a: X.b2, b: X.b3 });
  S.bay3 = add('dwell', 3.2, { x: X.b3 });
  add('move', (X.b3 - X.end) / SPEED, { a: X.b3, b: X.end });
  S.lift = add('lift', 1);
  S.test = add('test', 2.8);
  S.home = add('home', 1.8);
  S.park = add('park', 1.2);
  const CYCLE = T;
  const tIn = (s, p) => s.t0 + s.dur * p;

  const DMG = S.limp.t0;
  const PROP_OFF = tIn(S.bay1, 0.17);
  const PROP_ON = tIn(S.bay1, 0.74);
  const ARM_FIX = tIn(S.bay2, 0.8);
  const FW_FIX = tIn(S.bay3, 0.8);
  const H0 = heading(0), HL = heading(L);
  const FALL_ROT = HL + 620;
  const REST_ROT = Math.round(FALL_ROT / 90) * 90;

  function pose(tau) {
    let s = seg[seg.length - 1];
    for (const g of seg) { if (tau < g.t0 + g.dur) { s = g; break; } }
    const u = clamp((tau - s.t0) / s.dur, 0, 1);
    let x, y, rot = REST_ROT, sc = 0.9, flat = 0.5;
    switch (s.name) {
      case 'takeoff':
        x = HOME.x; y = HOME.y; sc = 0.72 + 0.28 * ease(u); flat = 1; rot = H0 * ease(u); break;
      case 'route': {
        const l = lW5 * u, p = at(l);
        x = p.x; y = p.y; rot = heading(l); sc = 1; flat = 1; break;
      }
      case 'limp': {
        const l = lerp(lW5, L, u), p = at(l), h = heading(l) * Math.PI / 180;
        const w = (1.5 + 4 * u) * Math.sin(tau * 17);
        x = p.x - Math.sin(h) * w; y = p.y + Math.cos(h) * w;
        rot = heading(l) + (12 + 30 * u) * Math.sin(tau * 9); sc = 1 - 0.05 * u; flat = 1; break;
      }
      case 'sputter': {
        const p = at(L);
        x = p.x + 2.2 * Math.sin(tau * 61); y = p.y + 1.6 * Math.sin(tau * 47);
        rot = HL + 35 * Math.sin(tau * 23); sc = 0.95; flat = 1; break;
      }
      case 'fall': {
        const p = at(L);
        x = lerp(p.x, X.intake, u); y = p.y + (BY - p.y) * u * u - 16 * u * (1 - u);
        rot = HL + 620 * u * u; sc = 0.95 - 0.05 * u; flat = 1 - 0.5 * u * u; break;
      }
      case 'bounce':
        x = X.intake; y = BY - 5 * Math.sin(Math.PI * u); rot = lerp(FALL_ROT, REST_ROT, easeOut(u)); break;
      case 'dwell':
        x = s.x; y = BY; break;
      case 'move':
        x = lerp(s.a, s.b, ease(u)); y = BY; break;
      case 'lift': {
        const e = ease(u);
        x = lerp(X.end, CAGE.x, e); y = lerp(BY, CAGE.y, easeOut(u));
        flat = 0.5 + 0.5 * e; sc = 0.9; rot = REST_ROT + 10 * Math.sin(Math.PI * u); break;
      }
      case 'test':
        x = CAGE.x + 22 * Math.sin(2 * Math.PI * u); y = CAGE.y - 9 * Math.sin(4 * Math.PI * u);
        rot = REST_ROT + 14 * Math.sin(2 * Math.PI * u); sc = 0.9; flat = 1; break;
      case 'home': {
        const v = 1 - u, cx = 275, cy = 680;
        x = v * v * CAGE.x + 2 * v * u * cx + u * u * HOME.x; // arc up and over to the pad
        y = v * v * CAGE.y + 2 * v * u * cy + u * u * HOME.y;
        sc = lerp(0.9, 0.72, u * u) + 0.08 * Math.sin(Math.PI * u); flat = 1; break;
      }
      default: // park
        x = HOME.x; y = HOME.y; sc = 0.72; flat = 1; rot = 0;
    }
    return { s, u, x, y, rot, sc, flat };
  }

  function damage(tau) {
    const dm = tau >= DMG;
    return {
      dm,
      prop: !dm ? 'ok' : tau < PROP_OFF ? 'broken' : tau < PROP_ON ? 'gone' : 'ok',
      bent: dm && tau < ARM_FIX,
      led: !dm ? 'off' : tau < FW_FIX ? 'fault' : 'ok',
    };
  }

  const toWorld = (P, lx, ly) => {
    const r = P.rot * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    return { x: P.x + (lx * c - ly * s) * P.sc, y: P.y + (lx * s + ly * c) * P.sc * P.flat };
  };

  /* ---------- drones ---------- */
  const ROTOR = [[-9, -9], [9, -9], [9, 9], [-9, 9]];
  const straightPts = j => `0,0 ${ROTOR[j][0] * 0.67},${ROTOR[j][1] * 0.67}`;
  const bentPts = j => {
    const sx = Math.sign(ROTOR[j][0]), sy = Math.sign(ROTOR[j][1]);
    return `0,0 ${3 * sx - 2 * sy},${3 * sy + 2 * sx} ${6 * sx},${6 * sy}`;
  };
  const NDR = 3;
  const drones = [];
  for (let i = 0; i < NDR; i++) {
    const g = mk('g', { class: 'hd' }, layer.drones);
    const arms = ROTOR.map((_, j) => mk('polyline', { class: 'hd-arm', points: straightPts(j) }, g));
    const rotors = ROTOR.map(([a, b]) => mk('circle', { class: 'hd-rotor', cx: a, cy: b, r: 4.5 }, g));
    mk('rect', { class: 'hd-body', x: -4, y: -4, width: 8, height: 8, rx: 2 }, g);
    const led = mk('circle', { class: 'hd-led', r: 1.6 }, g);
    drones.push({ g, arms, rotors, led, prev: null });
  }

  function renderDrone(D, P, dg, ri, ai, t) {
    D.g.setAttribute('transform',
      `translate(${P.x.toFixed(1)} ${P.y.toFixed(1)}) scale(${P.sc.toFixed(3)} ${(P.sc * P.flat).toFixed(3)}) rotate(${P.rot.toFixed(1)})`);
    D.rotors.forEach((r, j) => {
      const st = j === ri ? dg.prop : 'ok';
      setC(r, st === 'broken' ? 'hd-rotor broken' : st === 'gone' ? 'hd-rotor gone' : 'hd-rotor');
    });
    D.arms.forEach((a, j) => {
      const b = j === ai && dg.bent;
      if (a._b !== b) { a._b = b; a.setAttribute('points', b ? bentPts(j) : straightPts(j)); setC(a, b ? 'hd-arm bent' : 'hd-arm'); }
    });
    setC(D.led, dg.led === 'fault' ? (Math.sin(t * 14) > 0 ? 'hd-led fault' : 'hd-led') : dg.led === 'ok' ? 'hd-led ok' : 'hd-led');
  }

  /* ---------- worker robots ---------- */
  const RK = 1.25; // robot size
  function makeRobot(rx, ry, m, phase) {
    const tf = `translate(${rx} ${ry}) scale(${m * RK} ${RK})`;
    const back = mk('g', { transform: tf }, layer.robots);
    const bob = mk('g', {}, back);
    mk('rect', { class: 'kf', x: -11, y: -6, width: 22, height: 6, rx: 3 }, bob);
    mk('circle', { class: 'k', cx: -6, cy: -3, r: 1.6 }, bob);
    mk('circle', { class: 'k', cx: 6, cy: -3, r: 1.6 }, bob);
    mk('rect', { class: 'kf', x: -9, y: -23, width: 18, height: 16, rx: 3 }, bob);
    mk('path', { class: 'red', d: 'M-1 -18h2v2h2v2h-2v2h-2v-2h-2v-2h2z' }, bob);
    const head = mk('g', {}, bob);
    mk('path', { class: 'k', d: 'M0 -23V-26' }, head);
    mk('rect', { class: 'kf', x: -8, y: -35, width: 16, height: 9, rx: 2.5 }, head);
    const visor = mk('rect', { class: 'hr-visor', x: -7, y: -33, width: 9, height: 4.5, rx: 1.5 }, head);
    mk('circle', { class: 'red', cx: -4.5, cy: -30.75, r: 1.1 }, head);
    mk('path', { class: 'k', d: 'M3 -35L5 -40' }, head);
    const tip = mk('circle', { class: 'red', cx: 5, cy: -41, r: 1.5 }, head);
    const front = mk('g', { transform: tf }, layer.front);
    const upper = mk('line', { class: 'hr-arm' }, front);
    const fore = mk('line', { class: 'hr-arm' }, front);
    const j1 = mk('line', { class: 'hr-jaw' }, front);
    const j2 = mk('line', { class: 'hr-jaw' }, front);
    mk('circle', { class: 'kf', cx: -9, cy: -18, r: 2 }, front);
    return { rx, ry, m, phase, head, visor, tip, upper, fore, j1, j2, wrist: { x: rx, y: ry }, dir: { x: -1, y: 0 } };
  }

  // two-link arm, shoulder at (-9,-18) in robot space, elbow kept up
  function armTo(R, wx, wy, open) {
    const lx = (wx - R.rx) * R.m / RK, ly = (wy - R.ry) / RK;
    const sx = -9, sy = -18, A = 15, B = 14;
    const d = clamp(Math.hypot(lx - sx, ly - sy), 2, A + B - 0.2);
    const th = Math.atan2(ly - sy, lx - sx);
    const al = Math.acos(clamp((A * A + d * d - B * B) / (2 * A * d), -1, 1));
    const ea = { x: sx + A * Math.cos(th + al), y: sy + A * Math.sin(th + al) };
    const eb = { x: sx + A * Math.cos(th - al), y: sy + A * Math.sin(th - al) };
    const e = ea.y < eb.y ? ea : eb;
    const w = { x: sx + d * Math.cos(th), y: sy + d * Math.sin(th) };
    line(R.upper, sx, sy, e.x, e.y);
    line(R.fore, e.x, e.y, w.x, w.y);
    const ux = (w.x - e.x) / B, uy = (w.y - e.y) / B, px = -uy, py = ux, o = open == null ? 1.6 : open;
    line(R.j1, w.x, w.y, w.x + ux * 3.5 + px * o, w.y + uy * 3.5 + py * o);
    line(R.j2, w.x, w.y, w.x + ux * 3.5 - px * o, w.y + uy * 3.5 - py * o);
    R.wrist = { x: R.rx + w.x * R.m * RK, y: R.ry + w.y * RK };
    R.dir = { x: ux * R.m, y: uy };
  }

  const keyPath = (p, kf) => {
    if (p <= kf[0][0]) return { x: kf[0][1], y: kf[0][2] };
    for (let i = 1; i < kf.length; i++) {
      if (p <= kf[i][0]) {
        const a = kf[i - 1], b = kf[i], u = ease((p - a[0]) / (b[0] - a[0] || 1));
        return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u) };
      }
    }
    const z = kf[kf.length - 1];
    return { x: z[1], y: z[2] };
  };

  const FLOOR = 818;
  const R1 = makeRobot(X.b1 + 32, FLOOR, 1, 0.3);
  const R2 = makeRobot(X.b2 + 32, FLOOR, 1, 1.9);
  const R3 = makeRobot(X.b3 + 32, FLOOR, 1, 3.1);
  const RF = makeRobot(296, FLOOR, -1, 4.4);
  const rest = (R, t) => ({ x: R.rx - R.m * 20, y: FLOOR - 27 + Math.sin(t * 1.4 + R.phase) * 1.2 });
  const idleTouches = (R, t) => {
    R.head.setAttribute('transform', `translate(0 ${(Math.sin(t * 1.4 + R.phase) * 0.5).toFixed(2)})`);
    R.tip.setAttribute('opacity', Math.sin(t * 2.6 + R.phase * 2) > 0.55 ? 1 : 0.35);
  };

  const el = {
    er: $('h-er'), test: $('h-test'), count: $('h-count'), mon: $('h-mon'), bar: $('h-bar'),
    beam: $('h-beam'), scan: $('h-scan'), glow: $('h-glow'), cable: $('h-cable'), torch: $('h-torch'),
    held: $('h-held'), pole: $('h-pole'), flag: $('h-flag'),
  };

  /* ---------- particles ---------- */
  const pool = [];
  for (let i = 0; i < 80; i++) pool.push({ c: mk('circle', { r: 0 }, layer.fx), live: false });
  function spawn(o) {
    const p = pool.find(q => !q.live);
    if (!p) return;
    Object.assign(p, { live: true, age: 0, vx: 0, vy: 0, g: 0, r0: 1, r1: 1, o0: 1, arc: null }, o);
    setC(p.c, 'hp ' + o.cls);
  }
  function stepFx(dt) {
    for (const p of pool) {
      if (!p.live) continue;
      p.age += dt;
      const k = p.age / p.life;
      if (k >= 1) { p.live = false; p.c.setAttribute('r', 0); continue; }
      let x, y;
      if (p.arc) {
        const a = p.arc;
        x = lerp(a.x0, a.x1, k); y = lerp(a.y0, a.y1, k) - a.h * 4 * k * (1 - k);
      } else {
        p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; x = p.x; y = p.y;
      }
      p.c.setAttribute('cx', x.toFixed(1));
      p.c.setAttribute('cy', y.toFixed(1));
      p.c.setAttribute('r', lerp(p.r0, p.r1, k).toFixed(2));
      p.c.setAttribute('opacity', (p.o0 * (p.arc ? (k < 0.85 ? 1 : (1 - k) / 0.15) : 1 - k)).toFixed(2));
    }
  }
  const smoke = (x, y, n, o0) => {
    for (let i = 0; i < n; i++) {
      spawn({ cls: 'hp-smoke', x: x + (Math.random() - 0.5) * 5, y, vx: (Math.random() - 0.5) * 10, vy: -12 - Math.random() * 12,
        life: 1.1 + Math.random() * 0.7, r0: 1.5, r1: 5 + Math.random() * 3, o0: o0 || 0.26 });
    }
  };
  const sparks = (x, y, n, spd) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = spd * (0.4 + Math.random());
      spawn({ cls: Math.random() < 0.35 ? 'hp-spark hot' : 'hp-spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spd * 0.4,
        g: 240, life: 0.25 + Math.random() * 0.35, r0: 1.1, r1: 0.3, o0: 1 });
    }
  };
  const ring = (x, y, r1, cls) => spawn({ cls: 'hp-ring' + (cls ? ' ' + cls : ''), x, y, life: 0.8, r0: 3, r1, o0: 0.8 });
  const chance = (rate, dt) => Math.random() < rate * dt;

  /* ---------- timed events (fire when a drone's clock crosses them) ---------- */
  let count = 0;
  const EVENTS = [
    [0, () => ring(HOME.x, HOME.y, 30)],
    [DMG, (P) => {
      sparks(P.x, P.y, 16, 70);
      spawn({ cls: 'hp-prop', x: P.x, y: P.y, vx: (Math.random() < 0.5 ? -1 : 1) * (30 + Math.random() * 30), vy: -40, g: 150, life: 1.1, r0: 3, r1: 3, o0: 0.9 });
    }],
    [S.bounce.t0, (P) => { ring(P.x, P.y + 2, 24); smoke(P.x, P.y, 6, 0.35); sparks(P.x, P.y, 8, 50); }],
    [tIn(S.bay1, 0.37), () => spawn({ cls: 'hp-prop', arc: { x0: R1.wrist.x, y0: R1.wrist.y, x1: X.b1 + 58, y1: FLOOR - 16, h: 18 }, life: 0.55, r0: 3.6, r1: 3, o0: 1 })],
    [PROP_ON, () => ring(R1.wrist.x, R1.wrist.y, 9)],
    [FW_FIX, (P) => ring(P.x, P.y, 16, 'pass')],
    [S.lift.t0, (P) => ring(P.x, P.y + 4, 16)],
    [S.home.t0, () => { count++; text(el.count, String(count).padStart(2, '0')); }],
    [S.park.t0, () => ring(HOME.x, HOME.y, 30)],
  ];
  const crossed = (prev, cur, t) => (prev <= cur ? prev < t && t <= cur : t > prev || t <= cur);

  /* ---------- station scenes ---------- */
  function triage(st, t) {
    if (!st) {
      text(el.er, 'ER · TRIAGE'); setC(el.er, 'lbl');
      show(el.beam, false); show(el.scan, false);
      return;
    }
    const p = (st.tau - S.triage.t0) / S.triage.dur;
    const scanning = p > 0.08 && p < 0.86;
    show(el.beam, scanning); show(el.scan, scanning);
    if (scanning) {
      const y = st.P.y - 6 + 12 * (0.5 - 0.5 * Math.cos(p * Math.PI * 4));
      el.beam.setAttribute('points', `1088,786 ${st.P.x - 11},${y.toFixed(1)} ${st.P.x + 11},${y.toFixed(1)}`);
      el.scan.setAttribute('d', `M${st.P.x - 11} ${y.toFixed(1)}H${st.P.x + 11}`);
    }
    if (p < 0.7) { text(el.er, 'ER · SCANNING'); setC(el.er, 'lbl'); }
    else { text(el.er, 'ER · 3 FAULTS'); setC(el.er, 'lbl alert'); }
  }

  function bay1(st, t) {
    if (!st) { armTo(R1, rest(R1, t).x, rest(R1, t).y); show(el.held, false); return; }
    const p = (st.tau - S.bay1.t0) / S.bay1.dur;
    const rw = toWorld(st.P, ROTOR[st.ri][0], ROTOR[st.ri][1]);
    const rs = rest(R1, t), up = { x: X.b1 + 32, y: FLOOR - 43 }, disp = { x: X.b1 + 11, y: FLOOR - 46 };
    const k = keyPath(p, [[0, rs.x, rs.y], [0.14, rw.x, rw.y - 1], [0.2, rw.x, rw.y - 1], [0.34, up.x, up.y], [0.4, up.x, up.y],
      [0.52, disp.x, disp.y], [0.6, disp.x, disp.y], [0.72, rw.x, rw.y - 1], [0.8, rw.x, rw.y - 1], [0.95, rs.x, rs.y]]);
    const holdOld = p > 0.17 && p < 0.37, holdNew = p > 0.57 && p < 0.74;
    armTo(R1, k.x, k.y, holdOld || holdNew ? 0.6 : 1.8);
    show(el.held, holdOld || holdNew);
    if (holdOld || holdNew) {
      setC(el.held, holdOld ? 'h-held broken' : 'h-held');
      el.held.setAttribute('cx', (R1.wrist.x + R1.dir.x * 5).toFixed(1));
      el.held.setAttribute('cy', (R1.wrist.y + R1.dir.y * 5).toFixed(1));
    }
  }

  function bay2(st, t, dt) {
    if (!st) {
      armTo(R2, rest(R2, t).x, rest(R2, t).y, 0.4); setC(R2.visor, 'hr-visor');
      line(el.torch, R2.wrist.x, R2.wrist.y, R2.wrist.x + R2.dir.x * 6, R2.wrist.y + R2.dir.y * 6);
      el.glow.setAttribute('r', 0);
      return;
    }
    const p = (st.tau - S.bay2.t0) / S.bay2.dur;
    const [a, b] = ROTOR[st.ai];
    const wp = toWorld(st.P, a * 0.4, b * 0.4);
    const rs = rest(R2, t), tg = { x: wp.x + 8, y: wp.y - 7 };
    const welding = p > 0.18 && p < 0.8;
    const jit = welding ? Math.sin(t * 40) * 0.8 : 0;
    const k = keyPath(p, [[0, rs.x, rs.y], [0.15, tg.x, tg.y], [0.82, tg.x, tg.y], [0.97, rs.x, rs.y]]);
    armTo(R2, k.x + jit, k.y, 0.4);
    const near = p > 0.12 && p < 0.86;
    if (near) line(el.torch, R2.wrist.x, R2.wrist.y, wp.x + 1.5, wp.y - 1.5);
    else line(el.torch, R2.wrist.x, R2.wrist.y, R2.wrist.x + R2.dir.x * 6, R2.wrist.y + R2.dir.y * 6);
    setC(R2.visor, p > 0.1 && p < 0.86 ? 'hr-visor down' : 'hr-visor');
    if (welding) {
      el.glow.setAttribute('cx', wp.x.toFixed(1)); el.glow.setAttribute('cy', wp.y.toFixed(1));
      el.glow.setAttribute('r', (2.5 + Math.random() * 2).toFixed(2));
      el.glow.setAttribute('opacity', (0.35 + Math.random() * 0.4).toFixed(2));
      if (dt && chance(38, dt)) sparks(wp.x, wp.y, 2, 55);
    } else el.glow.setAttribute('r', 0);
  }

  function bay3(st, t) {
    if (!st) {
      armTo(R3, rest(R3, t).x, rest(R3, t).y, 0.5);
      show(el.cable, false); text(el.mon, 'FW'); setC(el.mon, 'h-mon-t');
      el.bar.setAttribute('width', 0);
      return;
    }
    const p = (st.tau - S.bay3.t0) / S.bay3.dur;
    const port = toWorld(st.P, 0, 0), rs = rest(R3, t), tg = { x: port.x + 7, y: port.y - 3 };
    const k = keyPath(p, [[0, rs.x, rs.y], [0.12, tg.x, tg.y], [0.86, tg.x, tg.y], [0.98, rs.x, rs.y]]);
    armTo(R3, k.x, k.y, 0.5);
    const cx = R3.rx - 5, cy = FLOOR - 13, wx = R3.wrist.x, wy = R3.wrist.y;
    show(el.cable, p > 0.02 && p < 0.97);
    const plug = p > 0.12 && p < 0.86 ? ` L${port.x.toFixed(1)} ${port.y.toFixed(1)}` : '';
    el.cable.setAttribute('d', `M${cx} ${cy} Q${((cx + wx) / 2).toFixed(1)} ${(Math.max(cy, wy) + 7).toFixed(1)} ${wx.toFixed(1)} ${wy.toFixed(1)}${plug}`);
    const prog = clamp((p - 0.16) / (0.8 - 0.16), 0, 1);
    el.bar.setAttribute('width', (24 * prog).toFixed(1));
    const done = p >= 0.8;
    setC(el.bar, done ? 'h-bar pass' : 'h-bar');
    text(el.mon, done ? 'OK' : p > 0.16 ? Math.round(prog * 100) + '%' : 'FW');
    setC(el.mon, done ? 'h-mon-t pass' : 'h-mon-t');
  }

  function flagRobot(states, t) {
    let mode = 'idle';
    for (const s of states) {
      if (s.tau >= S.home.t0 && s.tau < S.home.t0 + 2.4) { mode = 'pass'; break; }
      if (s.tau >= S.lift.t0 && s.tau < S.home.t0) mode = 'watch';
    }
    const rs = rest(RF, t);
    let tg = rs;
    if (mode === 'watch') tg = { x: RF.rx + 18, y: FLOOR - 32 };
    if (mode === 'pass') tg = { x: RF.rx + 11, y: FLOOR - 45 + Math.sin(t * 11) * 1.5 };
    armTo(RF, tg.x, tg.y, 0.5);
    const wx = RF.wrist.x, wy = RF.wrist.y, top = wy - 13, wave = mode === 'pass' ? Math.sin(t * 14) * 2 : 0;
    show(el.pole, true); show(el.flag, true);
    line(el.pole, wx, wy + 2, wx, top);
    el.flag.setAttribute('points', `${wx.toFixed(1)},${top.toFixed(1)} ${(wx + 10).toFixed(1)},${(top + 2.5 + wave).toFixed(1)} ${wx.toFixed(1)},${(top + 5).toFixed(1)}`);
    setC(el.flag, mode === 'pass' ? 'h-flag pass' : 'h-flag');
    if (mode === 'pass') { text(el.test, 'TEST FLIGHT · PASS'); setC(el.test, 'lbl pass'); }
    else { text(el.test, 'TEST FLIGHT'); setC(el.test, 'lbl'); }
  }

  /* ---------- main loop ---------- */
  const OFF = S.route.t0 + 21; // first drone is 9 s from trouble when the page opens
  let simT = reduce ? tIn(S.bay1, 0.65) - OFF : 0;

  function update(dt) {
    const states = drones.map((D, i) => {
      const abs = simT + OFF + (i * CYCLE) / NDR;
      const tau = ((abs % CYCLE) + CYCLE) % CYCLE;
      const cyc = Math.floor(abs / CYCLE);
      const ri = Math.floor(rnd(i, cyc) * 4);
      const ai = (ri + 1 + Math.floor(rnd(i + 11, cyc) * 3)) % 4;
      return { D, i, tau, P: pose(tau), dg: damage(tau), ri, ai };
    });
    for (const s of states) renderDrone(s.D, s.P, s.dg, s.ri, s.ai, simT);

    const inDwell = g => states.find(s => s.tau >= g.t0 && s.tau < g.t0 + g.dur);
    triage(inDwell(S.triage), simT);
    bay1(inDwell(S.bay1), simT);
    bay2(inDwell(S.bay2), simT, dt);
    bay3(inDwell(S.bay3), simT);
    flagRobot(states, simT);
    for (const R of [R1, R2, R3, RF]) idleTouches(R, simT);

    if (dt > 0) {
      for (const s of states) {
        const { D, P, tau, dg } = s;
        if (D.prev != null) for (const [tt, fn] of EVENTS) if (crossed(D.prev, tau, tt)) fn(P, s);
        D.prev = tau;
        const n = P.s.name;
        if (n === 'limp' && chance(10, dt)) smoke(P.x, P.y, 1);
        if (n === 'sputter') { if (chance(24, dt)) smoke(P.x, P.y, 1, 0.32); if (chance(6, dt)) sparks(P.x, P.y, 2, 40); }
        if (dg.bent && (n === 'dwell' || n === 'move') && chance(2.5, dt)) smoke(P.x, P.y - 2, 1, 0.16);
      }
    }
    stepFx(dt);
  }

  if (reduce) { update(0); return; }

  let raf = 0, last = 0, onScreen = true;
  const frame = now => {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    simT += dt;
    update(dt);
    raf = onScreen ? requestAnimationFrame(frame) : 0;
  };
  update(0);
  raf = requestAnimationFrame(frame);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      onScreen = entries[0].isIntersecting;
      if (onScreen && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    }).observe(document.getElementById('home'));
  }
  document.addEventListener('visibilitychange', () => { last = 0; });
})();
