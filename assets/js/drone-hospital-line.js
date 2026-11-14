/* Drone Hospital repair line for the home page hero.
   Each drone loops through one life cycle:
   take off at HOME, fly the mission, fail after WP 05 and limp along the last leg,
   drop onto the belt, then:
     Bay 01 Diagnosis: the robot's head glows red and sweeps a scan beam over it, faults get tagged,
     Bay 02 Parts: the clerk at the parts computer looks the drone over while the parts list
       fills the screen and goes out as an order, then the parts box drops in through the tube,
     Bay 03 Repair: two robots swap the cracked prop and weld the bent arm, status goes green,
   then a test flight in the cage (the marshal presses a button and the flag runs up the pole),
   land at HOME, repeat.
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
  // the robots stand in front of the belt so their tracks show; drones still pass in front of them
  hosp.insertBefore(layer.robots, layer.drones);

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
  const X = { diag: 1110, parts: 930, repair: 740, end: 452 };
  const BOX_DX = 16;                    // parts box rides just right of its drone
  const HOVER_FLAT = 0.4;               // how flat the drone looks in the test flight (side view)

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
  S.diag = add('dwell', 3.4, { x: X.diag });
  add('move', (X.diag - X.parts) / SPEED, { a: X.diag, b: X.parts });
  S.parts = add('dwell', 4.2, { x: X.parts });
  add('move', (X.parts - X.repair) / SPEED, { a: X.parts, b: X.repair });
  S.repair = add('dwell', 5.0, { x: X.repair });
  add('move', (X.repair - X.end) / SPEED, { a: X.repair, b: X.end });
  S.lift = add('lift', 1);
  S.test = add('test', 2.8);
  S.home = add('home', 1.8);
  S.park = add('park', 1.2);
  const CYCLE = T;
  const tIn = (s, p) => s.t0 + s.dur * p;

  const DMG = S.limp.t0;
  // diagnosis finds the faults one at a time
  const TAG = [tIn(S.diag, 0.3), tIn(S.diag, 0.5), tIn(S.diag, 0.7)];
  // parts computer
  const LIST = [tIn(S.parts, 0.4), tIn(S.parts, 0.5), tIn(S.parts, 0.6)];
  const ORDERED = tIn(S.parts, 0.68);
  const BOX_DROP = tIn(S.parts, 0.74), BOX_LAND = tIn(S.parts, 0.86);
  // repair bay
  const BOX_OPEN = tIn(S.repair, 0.24);
  const PROP_OFF = tIn(S.repair, 0.12);
  const PROP_ON = tIn(S.repair, 0.6);
  const ARM_FIX = tIn(S.repair, 0.66);
  const BOX_GONE = tIn(S.repair, 0.76);
  const FW_FIX = tIn(S.repair, 0.84);
  const H0 = heading(0), HL = heading(L);
  const FALL_ROT = HL + 620;
  const REST_ROT = Math.round(FALL_ROT / 90) * 90;

  function pose(tau) {
    let s = seg[seg.length - 1];
    for (const g of seg) { if (tau < g.t0 + g.dur) { s = g; break; } }
    const u = clamp((tau - s.t0) / s.dur, 0, 1);
    let x, y, rot = REST_ROT, sc = 0.9, flat = 0.5, tilt = 0;
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
        x = lerp(p.x, X.diag, u); y = p.y + (BY - p.y) * u * u - 16 * u * (1 - u);
        rot = HL + 620 * u * u; sc = 0.95 - 0.05 * u; flat = 1 - 0.5 * u * u; break;
      }
      case 'bounce':
        x = X.diag; y = BY - 5 * Math.sin(Math.PI * u); rot = lerp(FALL_ROT, REST_ROT, easeOut(u)); break;
      case 'dwell':
        x = s.x; y = BY; break;
      case 'move':
        x = lerp(s.a, s.b, ease(u)); y = BY; break;
      case 'lift': {
        const e = ease(u);
        x = lerp(X.end, CAGE.x, e); y = lerp(BY, CAGE.y, easeOut(u));
        flat = lerp(0.5, HOVER_FLAT, e); sc = lerp(0.9, 1, e); tilt = -8 * Math.sin(Math.PI * u); break;
      }
      case 'test':
        // seen side-on, level like a real hover; it banks into each turn of the figure-8
        x = CAGE.x + 22 * Math.sin(2 * Math.PI * u); y = CAGE.y - 9 * Math.sin(4 * Math.PI * u);
        tilt = 13 * Math.cos(2 * Math.PI * u) * Math.min(1, u * 8, (1 - u) * 8); sc = 1; flat = HOVER_FLAT; break;
      case 'home': {
        const v = 1 - u, cx = 275, cy = 680;
        x = v * v * CAGE.x + 2 * v * u * cx + u * u * HOME.x; // arc up and over to the pad
        y = v * v * CAGE.y + 2 * v * u * cy + u * u * HOME.y;
        // turns from the side view back to the map's top view as it heads for the pad
        sc = lerp(1, 0.72, u * u) + 0.08 * Math.sin(Math.PI * u); flat = lerp(HOVER_FLAT, 1, ease(clamp(u * 1.6, 0, 1)));
        tilt = -12 * Math.sin(Math.PI * clamp(u * 2, 0, 1)); break;
      }
      default: // park
        x = HOME.x; y = HOME.y; sc = 0.72; flat = 1; rot = 0;
    }
    return { s, u, x, y, rot, sc, flat, tilt };
  }

  function damage(tau) {
    const dm = tau >= DMG;
    return {
      dm,
      prop: !dm ? 'ok' : tau < PROP_OFF ? 'broken' : tau < PROP_ON ? 'gone' : 'ok',
      bent: dm && tau < ARM_FIX,
      led: !dm ? 'off' : tau < FW_FIX ? 'fault' : 'ok',
      tags: [tau >= TAG[0] && tau < PROP_ON, tau >= TAG[1] && tau < ARM_FIX, tau >= TAG[2] && tau < FW_FIX],
    };
  }

  const toWorld = (P, lx, ly) => {
    const r = P.rot * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    return { x: P.x + (lx * c - ly * s) * P.sc, y: P.y + (lx * s + ly * c) * P.sc * P.flat };
  };

  /* ---------- drones and their parts boxes ---------- */
  const ROTOR = [[-9, -9], [9, -9], [9, 9], [-9, 9]];
  const straightPts = j => `0,0 ${ROTOR[j][0] * 0.67},${ROTOR[j][1] * 0.67}`;
  const bentPts = j => {
    const sx = Math.sign(ROTOR[j][0]), sy = Math.sign(ROTOR[j][1]);
    return `0,0 ${3 * sx - 2 * sy},${3 * sy + 2 * sx} ${6 * sx},${6 * sy}`;
  };
  const NDR = 3;
  const drones = [];
  for (let i = 0; i < NDR; i++) {
    const box = mk('g', { visibility: 'hidden' }, layer.drones);
    mk('rect', { class: 'hb-box', x: -5.5, y: -4.5, width: 11, height: 9, rx: 1 }, box);
    mk('path', { class: 'red', d: 'M-0.8 -3h1.6v1.7h1.7v1.6h-1.7v1.7h-1.6v-1.7h-1.7v-1.6h1.7z' }, box);
    const flaps = mk('path', { class: 'hb-flap', d: 'M-5.5 -4.5l-3 -4M5.5 -4.5l3 -4', visibility: 'hidden' }, box);
    const g = mk('g', { class: 'hd' }, layer.drones);
    const arms = ROTOR.map((_, j) => mk('polyline', { class: 'hd-arm', points: straightPts(j) }, g));
    const rotors = ROTOR.map(([a, b]) => mk('circle', { class: 'hd-rotor', cx: a, cy: b, r: 4.5 }, g));
    mk('rect', { class: 'hd-body', x: -4, y: -4, width: 8, height: 8, rx: 2 }, g);
    const led = mk('circle', { class: 'hd-led', r: 1.6 }, g);
    const tags = [mk('circle', { class: 'hd-tag', r: 7 }, g), mk('circle', { class: 'hd-tag', r: 4.5 }, g), mk('circle', { class: 'hd-tag', cx: 0, cy: 0, r: 6.5 }, g)];
    drones.push({ g, arms, rotors, led, tags, box, flaps, prev: null });
  }

  function boxPose(tau, P) {
    if (tau < BOX_DROP || tau >= BOX_GONE) return null;
    if (tau < BOX_LAND) {
      const u = (tau - BOX_DROP) / (BOX_LAND - BOX_DROP);
      return { x: X.parts + BOX_DX, y: lerp(754, BY + 3, u * u), s: 1 };
    }
    const shrink = tau > tIn(S.repair, 0.66) ? 1 - (tau - tIn(S.repair, 0.66)) / (BOX_GONE - tIn(S.repair, 0.66)) : 1;
    return { x: P.x + BOX_DX, y: BY + 3 + 4.5 * (1 - shrink), s: shrink };
  }

  function renderDrone(D, P, dg, ri, ai, t, tau) {
    D.g.setAttribute('transform',
      `translate(${P.x.toFixed(1)} ${P.y.toFixed(1)}) rotate(${P.tilt.toFixed(1)}) scale(${P.sc.toFixed(3)} ${(P.sc * P.flat).toFixed(3)}) rotate(${P.rot.toFixed(1)})`);
    D.rotors.forEach((r, j) => {
      const st = j === ri ? dg.prop : 'ok';
      setC(r, st === 'broken' ? 'hd-rotor broken' : st === 'gone' ? 'hd-rotor gone' : 'hd-rotor');
    });
    D.arms.forEach((a, j) => {
      const b = j === ai && dg.bent;
      if (a._b !== b) { a._b = b; a.setAttribute('points', b ? bentPts(j) : straightPts(j)); setC(a, b ? 'hd-arm bent' : 'hd-arm'); }
    });
    setC(D.led, dg.led === 'fault' ? (Math.sin(t * 14) > 0 ? 'hd-led fault' : 'hd-led') : dg.led === 'ok' ? 'hd-led ok' : 'hd-led');
    D.tags[0].setAttribute('cx', ROTOR[ri][0]); D.tags[0].setAttribute('cy', ROTOR[ri][1]);
    D.tags[1].setAttribute('cx', ROTOR[ai][0] * 0.4); D.tags[1].setAttribute('cy', ROTOR[ai][1] * 0.4);
    D.tags.forEach((tg, k) => show(tg, dg.tags[k]));
    const B = boxPose(tau, P);
    show(D.box, !!B);
    if (B) {
      D.box.setAttribute('transform', `translate(${B.x.toFixed(1)} ${B.y.toFixed(1)}) scale(${B.s.toFixed(3)})`);
      show(D.flaps, tau >= BOX_OPEN);
    }
  }

  /* ---------- worker robots ---------- */
  const RK = 1.25; // robot size
  // Tracked medic robot. Local space: floor at y=0, facing -x, shoulder at (-9,-18).
  // ROBOT picks the chest: plain (B1) or wider with a square plate and status lights (B2).
  const ROBOT = { bw: 18, plate: false, leds: false, seam: true };
  const cross = (x, y, s) => `M${x - s / 2} ${y - 1.5 * s}h${s}v${s}h${s}v${s}h${-s}v${s}h${-s}v${-s}h${-s}v${-s}h${s}z`;
  function drawRobot(g) {
    const o = ROBOT, bw = o.bw, bh = 16, top = -10 - bh, x0 = -bw / 2, cy = -10 - bh / 2 - 0.3, tw = bw > 18 ? 25 : 24;
    // tank track
    mk('rect', { class: 'k thin lug', x: -tw / 2 - 0.9, y: -8.9, width: tw + 1.8, height: 9.8, rx: 4.9 }, g);
    mk('rect', { class: 'kf', x: -tw / 2, y: -8, width: tw, height: 8, rx: 4 }, g);
    mk('path', { class: 'k thin', d: 'M-8 -4H8' }, g);
    for (const cx of [-tw / 2 + 4, 0, tw / 2 - 4]) { mk('circle', { class: 'k thin', cx, cy: -4, r: 2.3 }, g); mk('circle', { class: 'ink', cx, cy: -4, r: 0.75 }, g); }
    // battery pack and its cable
    mk('rect', { class: 'kf', x: -x0, y: top + 2, width: 4, height: 11, rx: 1.2 }, g);
    mk('path', { class: 'k thin', d: `M${-x0 + 1} ${top + 5}h2M${-x0 + 1} ${top + 7.5}h2M${-x0 + 1} ${top + 10}h2` }, g);
    mk('rect', { class: 'kf', x: -x0 + 1.2, y: top + 0.6, width: 1.6, height: 1.4, rx: 0.4 }, g);
    mk('path', { class: 'k thin', d: `M${-x0 + 2} ${top + 0.6}Q${-x0 + 2} ${top - 2.2} ${-x0 - 3} ${top - 0.2}` }, g);
    // turntable and chest
    mk('rect', { class: 'kf', x: -5.5, y: -10.8, width: 11, height: 2.6, rx: 1 }, g);
    mk('path', { class: 'k thin', d: 'M-3 -10.8v2.6M0 -10.8v2.6M3 -10.8v2.6' }, g);
    mk('rect', { class: 'kf', x: x0, y: top, width: bw, height: bh, rx: 3.5 }, g);
    if (o.plate) mk('rect', { class: 'k thin', x: -4.9, y: cy - 4.9, width: 9.8, height: 9.8, rx: 1.4 }, g);
    mk('path', { class: 'red', d: cross(0, cy, 2.3) }, g);
    mk('path', { class: 'k thin', d: `M${x0 + 1.6} -12.6h3M${x0 + 1.6} -11.4h3M${-x0 - 4.6} -12.6h3M${-x0 - 4.6} -11.4h3` }, g);
    for (const bx of [x0 + 1.9, -x0 - 1.9]) mk('circle', { class: 'ink', cx: bx, cy: top + 1.9, r: 0.55 }, g);
    if (o.leds) { mk('circle', { class: 'k thin', cx: -x0 - 2.4, cy: top + 5, r: 0.8 }, g); mk('circle', { class: 'ink', cx: -x0 - 2.4, cy: top + 7.4, r: 0.8 }, g); }
    if (o.seam) mk('path', { class: 'k thin', d: `M${x0} ${top + 3}H${-x0}` }, g);
    // head on a ribbed neck
    const head = mk('g', {}, g);
    mk('rect', { class: 'kf', x: -2.4, y: top - 3.2, width: 4.8, height: 3.4, rx: 0.8 }, head);
    mk('path', { class: 'k thin', d: `M-2.4 ${top - 1.5}h4.8` }, head);
    mk('circle', { class: 'kf', cx: 8.6, cy: -34.2, r: 1.8 }, head);
    mk('circle', { class: 'ink', cx: 8.9, cy: -34.2, r: 0.55 }, head);
    mk('rect', { class: 'kf', x: -8.5, y: -39.2, width: 17, height: 10, rx: 3 }, head);
    const visor = mk('rect', { class: 'hr-visor', x: -7.3, y: -36.8, width: 10.5, height: 4.8, rx: 2.2 }, head);
    mk('circle', { class: 'red', cx: -4.4, cy: -34.4, r: 1.15 }, head);
    mk('path', { class: 'k thin', d: 'M-1.6 -35.8h3.4M4.6 -36.7v4.6M6.2 -36.7v4.6M-6 -30.6h4' }, head);
    mk('rect', { class: 'kf', x: 2.9, y: -40.2, width: 2.6, height: 1.2, rx: 0.4 }, head);
    mk('path', { class: 'k', d: 'M4.2 -40.2L6 -44.4' }, head);
    const tip = mk('circle', { class: 'red', cx: 6.2, cy: -45.2, r: 1.4 }, head);
    return { head, visor, tip };
  }
  const EYE_L = { x: -4.4, y: -34.4 };   // the eye, in robot space
  function makeRobot(rx, ry, m, phase) {
    const tf = `translate(${rx} ${ry}) scale(${m * RK} ${RK})`;
    const back = mk('g', { class: 'hr', transform: tf }, layer.robots);
    const { head, visor, tip } = drawRobot(back);
    const front = mk('g', { class: 'hr', transform: tf }, layer.front);
    const upper = mk('line', { class: 'hr-arm' }, front);
    const fore = mk('line', { class: 'hr-arm' }, front);
    const j1 = mk('polyline', { class: 'hr-jaw' }, front);
    const j2 = mk('polyline', { class: 'hr-jaw' }, front);
    mk('circle', { class: 'kf', cx: -9, cy: -18, r: 2.5 }, front);
    const elbow = mk('circle', { class: 'kf', r: 1.5 }, front);
    return { rx, ry, m, phase, front, head, visor, tip, upper, fore, j1, j2, elbow, wrist: { x: rx, y: ry }, dir: { x: -1, y: 0 } };
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
    // pinchers: two hooked fingers hinged at the wrist
    const P = (t, n) => `${(w.x + ux * t + px * n).toFixed(1)},${(w.y + uy * t + py * n).toFixed(1)}`;
    R.j1.setAttribute('points', `${P(0, 0)} ${P(2.6, 1.2 + o)} ${P(5.4, 0.9 + o * 0.6)} ${P(6.4, 0.1 + o * 0.3)}`);
    R.j2.setAttribute('points', `${P(0, 0)} ${P(2.6, -1.2 - o)} ${P(5.4, -0.9 - o * 0.6)} ${P(6.4, -0.1 - o * 0.3)}`);
    R.elbow.setAttribute('cx', e.x.toFixed(1)); R.elbow.setAttribute('cy', e.y.toFixed(1));
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

  const FLOOR = 838;   // shop floor; the belt runs at waist height on its stands
  const RD = makeRobot(X.diag + 32, FLOOR, 1, 0.3);      // diagnosis, scanner head
  const RP = makeRobot(972, FLOOR, -1, 1.2);             // parts clerk at the computer
  const RR = makeRobot(X.repair + 36, FLOOR, 1, 1.9);    // repair: props
  const RW = makeRobot(X.repair - 32, FLOOR, -1, 3.1);   // repair: welder
  const RF = makeRobot(294, FLOOR, -1, 4.4);             // test flight marshal
  const rest = (R, t) => ({ x: R.rx - R.m * 20, y: FLOOR - 27 + Math.sin(t * 1.4 + R.phase) * 1.2 });
  const idleTouches = (R, t) => {
    const look = R.look ? ' scale(-1 1)' : '';
    R.head.setAttribute('transform', `translate(0 ${(Math.sin(t * 1.4 + R.phase) * 0.5).toFixed(2)})${look}`);
    R.tip.setAttribute('opacity', Math.sin(t * 2.6 + R.phase * 2) > 0.55 ? 1 : 0.35);
  };

  const el = {
    l1: $('h-l1'), l2: $('h-l2'), l3: $('h-l3'), test: $('h-test'), count: $('h-count'),
    mh: $('h-mh'), m: [$('h-m1'), $('h-m2'), $('h-m3')],
    beam: $('h-beam'), scan: $('h-scan'), scanglow: $('h-scanglow'), eyeglow: $('h-eyeglow'), btn: $('h-btn'),
    glow: $('h-glow'), torch: $('h-torch'),
    held: $('h-held'), flag: $('h-flag'),
  };
  const label = (e, t, cls) => { text(e, t); setC(e, 'lbl' + (cls ? ' ' + cls : '')); };

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
    [DMG, (s) => {
      sparks(s.P.x, s.P.y, 16, 70);
      spawn({ cls: 'hp-prop', x: s.P.x, y: s.P.y, vx: (Math.random() < 0.5 ? -1 : 1) * (30 + Math.random() * 30), vy: -40, g: 150, life: 1.1, r0: 3, r1: 3, o0: 0.9 });
    }],
    [S.bounce.t0, (s) => { ring(s.P.x, s.P.y + 2, 24); smoke(s.P.x, s.P.y, 6, 0.35); sparks(s.P.x, s.P.y, 8, 50); }],
    [TAG[0], (s) => { const w = toWorld(s.P, ROTOR[s.ri][0], ROTOR[s.ri][1]); ring(w.x, w.y, 10, 'alert'); }],
    [TAG[1], (s) => { const w = toWorld(s.P, ROTOR[s.ai][0] * 0.4, ROTOR[s.ai][1] * 0.4); ring(w.x, w.y, 10, 'alert'); }],
    [TAG[2], (s) => ring(s.P.x, s.P.y, 10, 'alert')],
    [BOX_LAND, (s) => ring(X.parts + BOX_DX, BY + 6, 12)],
    [tIn(S.repair, 0.3), () => spawn({ cls: 'hp-prop', arc: { x0: RR.wrist.x, y0: RR.wrist.y, x1: 806, y1: FLOOR - 22, h: 16 }, life: 0.5, r0: 3.6, r1: 3, o0: 1 })],
    [PROP_ON, () => ring(RR.wrist.x, RR.wrist.y, 9)],
    [BOX_GONE, (s) => smoke(s.P.x + BOX_DX, BY, 3, 0.2)],
    [FW_FIX, (s) => ring(s.P.x, s.P.y, 18, 'pass')],
    [S.lift.t0, (s) => ring(s.P.x, s.P.y + 4, 16)],
    [S.home.t0, () => { count++; text(el.count, String(count).padStart(2, '0')); }],
    [S.park.t0, () => ring(HOME.x, HOME.y, 30)],
  ];
  const crossed = (prev, cur, t) => (prev <= cur ? prev < t && t <= cur : t > prev || t <= cur);

  /* ---------- station scenes ---------- */
  const PROPS = ['PROP 5045', 'PROP 5143', 'PROP 3018', 'PROP 7035'];
  const ARMS = ['ARM 5IN', 'ARM 3IN', 'ARM 7IN'];

  // Bay 01: no arms, the robot's head lights up red and sweeps a scan beam over the drone
  const EYE = { x: RD.rx + EYE_L.x * RK * RD.m, y: FLOOR + EYE_L.y * RK };
  el.eyeglow.setAttribute('cx', EYE.x); el.eyeglow.setAttribute('cy', EYE.y);
  RD.front.setAttribute('visibility', 'hidden');
  function diagnosis(st, t) {
    const p = st ? (st.tau - S.diag.t0) / S.diag.dur : -1;
    const scanning = p > 0.08 && p < 0.76;
    setC(RD.visor, scanning ? 'hr-visor scan' : 'hr-visor');
    show(el.beam, scanning); show(el.scan, scanning);
    el.eyeglow.setAttribute('r', scanning ? (3.5 + Math.sin(t * 12) * 0.8).toFixed(2) : 0);
    if (scanning) {
      const y = st.P.y - 6 + 12 * (0.5 - 0.5 * Math.cos(((p - 0.08) / 0.68) * Math.PI * 4));
      const x0 = st.P.x - 12, x1 = st.P.x + 12;
      el.beam.setAttribute('points', `${EYE.x.toFixed(1)},${EYE.y.toFixed(1)} ${x0},${y.toFixed(1)} ${x1},${y.toFixed(1)}`);
      el.scan.setAttribute('d', `M${x0} ${y.toFixed(1)}H${x1}`);
      el.scanglow.setAttribute('cx', st.P.x); el.scanglow.setAttribute('cy', st.P.y);
      el.scanglow.setAttribute('r', 13);
      el.scanglow.setAttribute('opacity', (0.12 + 0.08 * Math.sin(t * 10)).toFixed(2));
    } else el.scanglow.setAttribute('r', 0);
    if (!st) label(el.l1, 'BAY 01 · DIAGNOSIS');
    else if (p < 0.72) label(el.l1, 'BAY 01 · SCANNING');
    else label(el.l1, 'BAY 01 · 3 FAULTS', 'alert');
  }

  // Bay 02: no arms, the clerk looks the drone over and the parts list fills the screen
  RP.front.setAttribute('visibility', 'hidden');
  function parts(st, t) {
    if (!st) {
      RP.look = false;
      text(el.mh, 'PARTS' + (Math.sin(t * 4) > 0 ? ' _' : '')); setC(el.mh, 'h-mon-t');
      el.m.forEach(e => text(e, ''));
      label(el.l2, 'BAY 02 · PARTS');
      return;
    }
    const p = (st.tau - S.parts.t0) / S.parts.dur;
    // looks at the drone, back to the screen for each line, one more glance, then the order goes in
    RP.look = (p > 0.04 && p < 0.34) || (p > 0.44 && p < 0.48) || (p > 0.54 && p < 0.58) || p > 0.86;
    const lines = [PROPS[st.ri], ARMS[st.ai % ARMS.length], 'FC FW 4.5'];
    el.m.forEach((e, j) => text(e, st.tau >= LIST[j] ? '+ ' + lines[j] : ''));
    if (st.tau >= ORDERED) { text(el.mh, 'ORDERED'); setC(el.mh, 'h-mon-t pass'); }
    else { text(el.mh, p < 0.34 ? 'CHECKING' : 'PARTS' + (Math.sin(t * 8) > 0 ? ' _' : '')); setC(el.mh, 'h-mon-t'); }
    if (p < 0.34) label(el.l2, 'BAY 02 · CHECKING');
    else if (st.tau < ORDERED) label(el.l2, 'BAY 02 · ORDERING');
    else if (st.tau < BOX_LAND) label(el.l2, 'BAY 02 · ORDERED');
    else label(el.l2, 'BAY 02 · PARTS IN', 'pass');
  }

  // Bay 03: prop robot swaps the prop from the parts box, welder fixes the arm
  function repair(st, t, dt) {
    if (!st) {
      const r = rest(RR, t), w = rest(RW, t);
      armTo(RR, r.x, r.y); armTo(RW, w.x, w.y, 0.4);
      setC(RW.visor, 'hr-visor');
      line(el.torch, RW.wrist.x, RW.wrist.y, RW.wrist.x + RW.dir.x * 6, RW.wrist.y + RW.dir.y * 6);
      show(el.torch, true); show(el.held, false);
      el.glow.setAttribute('r', 0);
      label(el.l3, 'BAY 03 · REPAIR');
      return;
    }
    const p = (st.tau - S.repair.t0) / S.repair.dur, P = st.P;
    // props
    const rw = toWorld(P, ROTOR[st.ri][0], ROTOR[st.ri][1]);
    const rs = rest(RR, t), up = { x: RR.rx + 4, y: FLOOR - 44 }, bx = { x: P.x + BOX_DX, y: BY - 3 };
    const k = keyPath(p, [[0, rs.x, rs.y], [0.1, rw.x, rw.y - 1], [0.14, rw.x, rw.y - 1], [0.26, up.x, up.y], [0.31, up.x, up.y],
      [0.4, bx.x, bx.y], [0.46, bx.x, bx.y], [0.56, rw.x, rw.y - 1], [0.62, rw.x, rw.y - 1], [0.74, rs.x, rs.y]]);
    const holdOld = p > 0.12 && p < 0.3, holdNew = p > 0.44 && p < 0.6;
    armTo(RR, k.x, k.y, holdOld || holdNew ? 0.6 : 1.8);
    show(el.held, holdOld || holdNew);
    if (holdOld || holdNew) {
      setC(el.held, holdOld ? 'h-held broken' : 'h-held');
      el.held.setAttribute('cx', (RR.wrist.x + RR.dir.x * 5).toFixed(1));
      el.held.setAttribute('cy', (RR.wrist.y + RR.dir.y * 5).toFixed(1));
    }
    // welder
    const wp = toWorld(P, ROTOR[st.ai][0] * 0.4, ROTOR[st.ai][1] * 0.4);
    const ws = rest(RW, t), tg = { x: wp.x - 8, y: wp.y - 7 };
    const welding = p > 0.16 && p < 0.64;
    const kw = keyPath(p, [[0, ws.x, ws.y], [0.12, tg.x, tg.y], [0.66, tg.x, tg.y], [0.78, ws.x, ws.y]]);
    armTo(RW, kw.x + (welding ? Math.sin(t * 40) * 0.8 : 0), kw.y, 0.4);
    if (p > 0.1 && p < 0.7) line(el.torch, RW.wrist.x, RW.wrist.y, wp.x - 1.5, wp.y - 1.5);
    else line(el.torch, RW.wrist.x, RW.wrist.y, RW.wrist.x + RW.dir.x * 6, RW.wrist.y + RW.dir.y * 6);
    setC(RW.visor, p > 0.08 && p < 0.7 ? 'hr-visor down' : 'hr-visor');
    if (welding) {
      el.glow.setAttribute('cx', wp.x.toFixed(1)); el.glow.setAttribute('cy', wp.y.toFixed(1));
      el.glow.setAttribute('r', (2.5 + Math.random() * 2).toFixed(2));
      el.glow.setAttribute('opacity', (0.35 + Math.random() * 0.4).toFixed(2));
      if (dt && chance(38, dt)) sparks(wp.x, wp.y, 2, 55);
    } else el.glow.setAttribute('r', 0);
    if (st.tau >= FW_FIX) label(el.l3, 'BAY 03 · REPAIRED', 'pass');
    else label(el.l3, 'BAY 03 · REPAIRING');
  }

  // Test flight: the marshal presses the button and the flag runs up the pole
  const BTN = { x: 317, y: FLOOR - 21 };
  const POLE = { x: 262, bottom: FLOOR - 10, top: 734 };
  const PASS_LEN = 3.2;
  function flagRobot(states, t) {
    let q = -1, watching = false;
    for (const s of states) {
      if (s.tau >= S.home.t0 && s.tau < S.home.t0 + PASS_LEN) q = s.tau - S.home.t0;
      if (s.tau >= S.lift.t0 && s.tau < S.home.t0) watching = true;
    }
    const rs = rest(RF, t);
    let tg = rs, pressed = false;
    if (q >= 0 && q < 0.6) {
      const press = q > 0.2 && q < 0.42;
      tg = { x: BTN.x, y: BTN.y - 4 + (press ? 2.5 : -2) };
      pressed = press;
    } else if (watching) tg = { x: BTN.x, y: BTN.y - 9 + Math.sin(t * 3) };
    armTo(RF, tg.x, tg.y, 1);
    setC(el.btn, pressed ? 'h-btn down' : 'h-btn');
    el.btn.setAttribute('cy', pressed ? BTN.y + 0.8 : BTN.y);
    // flag height: 0 at the bottom, 1 at the top
    let h = 0;
    if (q >= 0) h = q < 0.35 ? 0 : q < 1.15 ? ease((q - 0.35) / 0.8) : q < PASS_LEN - 0.7 ? 1 : 1 - ease((q - (PASS_LEN - 0.7)) / 0.7);
    const top = lerp(POLE.bottom - 6, POLE.top, h);
    const wave = h > 0.9 ? Math.sin(t * 14) * 2 : 0;
    el.flag.setAttribute('points', `${POLE.x},${top.toFixed(1)} ${POLE.x + 12},${(top + 3 + wave).toFixed(1)} ${POLE.x},${(top + 6).toFixed(1)}`);
    setC(el.flag, h > 0.02 ? 'h-flag pass' : 'h-flag');
    if (q >= 0.35) label(el.test, 'TEST FLIGHT · PASS', 'pass');
    else label(el.test, 'TEST FLIGHT');
  }

  /* ---------- framing ----------
     Wide screens: the view box is refitted to the hero so the repair line is never cropped.
       Very wide windows trim the top of the map a little, then add margin at the sides;
       narrow windows keep the full width and leave room above.
     Phones and upright tablets: a follow camera. The line sits in a band at the bottom of the
       hero and the view tracks one drone from its crash through every bay to the test flight. */
  const home = document.getElementById('home');
  const camMQ = window.matchMedia ? window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1100px)') : null;
  const FIT = { cx: 810, span: 1380, top: 100, bottom: 872 };   // what must stay in view
  const CAM_H = 140;                                            // camera view height, in map units
  const STEPS = ['DIAGNOSIS', 'PARTS', 'REPAIR', 'TEST FLIGHT'];
  let camOn = false, cam = null, hud = null, box = { w: 0, h: 0 };
  const setVB = (x, y, w, h) => {
    const v = `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
    if (svg._vb !== v) { svg.setAttribute('viewBox', v); svg._vb = v; }
  };
  function frameWide() {
    const R = box.w / box.h;
    let h = clamp(1600 / R, FIT.bottom - FIT.top, FIT.bottom), w = h * R;
    if (w < FIT.span) { w = FIT.span; h = w / R; }
    setVB(FIT.cx - w / 2, FIT.bottom - h, w, h);
  }
  function buildHud() {
    hud = document.createElement('div');
    hud.className = 'hero-hud';
    hud.setAttribute('aria-hidden', 'true');
    const rail = document.createElement('span');
    rail.className = 'hud-rail';
    hud.fill = rail.appendChild(document.createElement('i'));
    hud.appendChild(rail);
    hud.steps = STEPS.map(n => {
      const e = document.createElement('span');
      e.className = 'hud-step';
      e.appendChild(document.createElement('b'));
      e.appendChild(document.createTextNode(n));
      return hud.appendChild(e);
    });
    home.appendChild(hud);
  }
  // which bay the followed drone is in: -2 still flying, -1 on the way in, 0..3 the stages, 4 passed
  const stageOf = tau => (tau < DMG ? -2 : tau < S.diag.t0 ? -1 : tau < S.parts.t0 - 1.6 ? 0 : tau < S.repair.t0 - 1.7 ? 1
    : tau < S.lift.t0 ? 2 : tau < S.home.t0 + 0.35 ? 3 : 4);
  function setStage(st) {
    if (!hud || hud._st === st) return;
    hud._st = st;
    hud.steps.forEach((e, i) => { e.className = 'hud-step' + (st === 4 || i < st ? ' done' : i === st ? ' on' : st === -1 && i === 0 ? ' next' : ''); });
    hud.fill.style.width = (clamp(st, 0, 3) / 3 * 100) + '%';
    hud.className = 'hero-hud' + (st === 4 ? ' pass' : st === -1 ? ' alert' : '');
  }
  // The camera stays with one drone from the last stretch of its mission through the crash, every bay,
  // the test flight and the landing. Then it jumps to the drone that is still out flying (two behind),
  // so each story starts at the beginning instead of halfway down the line.
  let star = -1, starPrev = 0;
  function pickStar(states) {
    if (star < 0 || states[star].tau < starPrev) {
      let best = null;
      // on page load, open on the drone that is being scanned in Bay 01
      if (star < 0) best = states.find(s => s.tau >= S.bounce.t0 && s.tau < S.parts.t0) || null;
      if (!best) for (const s of states) if (s.i !== star && s.tau < DMG && (!best || s.tau > best.tau)) best = s;
      star = reduce ? 0 : best ? best.i : 0;
    }
    starPrev = states[star].tau;
    return states[star];
  }
  function follow(states, dt) {
    if (!box.w || !box.h) return;
    const s = pickStar(states);
    const vw = CAM_H * box.w / box.h;
    const tx = clamp(s.P.x - vw / 2, 100, Math.max(100, 1520 - vw));
    const ty = Math.min(s.P.y - CAM_H * 0.58, 850 - CAM_H);
    if (!cam || !dt) cam = { x: tx, y: ty };
    else {
      const k = 1 - Math.exp(-dt * 3.2), lim = 1300 * dt;
      cam.x += clamp((tx - cam.x) * k, -lim, lim);
      cam.y += clamp((ty - cam.y) * k, -lim, lim);
    }
    setVB(cam.x, cam.y, vw, CAM_H);
    setStage(stageOf(s.tau));
  }
  function layout() {
    const on = !!(camMQ && camMQ.matches);
    if (on !== camOn) {
      camOn = on; cam = null;
      if (on && !hud) buildHud();
      home.classList.toggle('cam', on);
    }
    const r = svg.getBoundingClientRect();
    box = { w: r.width, h: r.height };
    if (box.w && box.h && !camOn) frameWide();
  }

  /* ---------- rotor wash during the test flight ----------
     WIND 1: streaks blown straight down from the rotors
     WIND 2: rings spreading across the floor under the drone, with dust
     WIND 3: curling gusts rolling out to both sides */
  const WIND = 2;
  const windG = mk('g', { class: 'h-wind' }, layer.fx);
  const wStreak = [], wRing = [], wCurl = [];
  for (let i = 0; i < 7; i++) wStreak.push(mk('line', { visibility: 'hidden' }, windG));
  for (let i = 0; i < 3; i++) wRing.push(mk('ellipse', { visibility: 'hidden' }, windG));
  for (let i = 0; i < 4; i++) wCurl.push(mk('path', { d: 'M0 0C7 0 13 1.5 13 5.5C13 8.6 9 8.8 9 6', visibility: 'hidden' }, windG));
  const frac = v => v - Math.floor(v);
  function wind(states, t, dt) {
    let st = null;
    for (const s of states) if (s.tau >= S.lift.t0 + 0.4 && s.tau < S.home.t0 + 0.7) st = s;
    const k = st ? clamp(Math.min((st.tau - S.lift.t0 - 0.4) / 0.5, (S.home.t0 + 0.7 - st.tau) / 0.6), 0, 1) : 0;
    wStreak.forEach((e, i) => {
      const on = WIND === 1 && k > 0; show(e, on); if (!on) return;
      const p = frac(t * 1.9 + i * 0.37), x = st.P.x + (i - 3) * 4.6 + Math.sin(i * 7.1) * 1.5 + (i - 3) * 2.2 * p;
      const y = st.P.y + 7 + p * 34, len = 4 + 5 * (1 - p);
      line(e, x, y, x + (i - 3) * 0.25, y + len);
      e.setAttribute('opacity', (k * 0.75 * Math.sin(Math.PI * p)).toFixed(2));
    });
    wRing.forEach((e, i) => {
      const on = WIND === 2 && k > 0; show(e, on); if (!on) return;
      const p = frac(t * 0.9 + i / 3), rx = 5 + 30 * p;
      e.setAttribute('cx', st.P.x.toFixed(1)); e.setAttribute('cy', FLOOR - 1.5);
      e.setAttribute('rx', rx.toFixed(1)); e.setAttribute('ry', (rx * 0.16).toFixed(1));
      e.setAttribute('opacity', (k * 0.7 * (1 - p)).toFixed(2));
    });
    if (WIND === 2 && k > 0 && dt && chance(9, dt)) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      spawn({ cls: 'hp-smoke', x: st.P.x + dir * (4 + Math.random() * 6), y: FLOOR - 2, vx: dir * (26 + Math.random() * 20), vy: -5 - Math.random() * 6,
        life: 0.8 + Math.random() * 0.4, r0: 1, r1: 3.5, o0: 0.3 });
    }
    wCurl.forEach((e, i) => {
      const on = WIND === 3 && k > 0; show(e, on); if (!on) return;
      const dir = i % 2 ? 1 : -1, p = frac(t * 0.8 + i * 0.25), d = 8 + 26 * p;
      e.setAttribute('transform', `translate(${(st.P.x + dir * d).toFixed(1)} ${(st.P.y + 10 + 9 * p + (i > 1 ? 7 : 0)).toFixed(1)}) scale(${(dir * (0.7 + 0.6 * p)).toFixed(2)} ${(0.7 + 0.6 * p).toFixed(2)})`);
      e.setAttribute('opacity', (k * 0.85 * Math.sin(Math.PI * p)).toFixed(2));
    });
  }

  /* ---------- main loop ---------- */
  // wide screens: the first drone is 9 s from trouble when the page opens
  // phones: the page opens on a drone that has just reached Bay 01 and is about to be scanned
  const OFF = camMQ && camMQ.matches ? S.diag.t0 : S.route.t0 + 21;
  let simT = reduce ? tIn(S.repair, 0.5) - OFF : 0;

  function update(dt) {
    const states = drones.map((D, i) => {
      const abs = simT + OFF + (i * CYCLE) / NDR;
      const tau = ((abs % CYCLE) + CYCLE) % CYCLE;
      const cyc = Math.floor(abs / CYCLE);
      const ri = Math.floor(rnd(i, cyc) * 4);
      const ai = (ri + 1 + Math.floor(rnd(i + 11, cyc) * 3)) % 4;
      return { D, i, tau, P: pose(tau), dg: damage(tau), ri, ai };
    });
    for (const s of states) renderDrone(s.D, s.P, s.dg, s.ri, s.ai, simT, s.tau);

    const inDwell = g => states.find(s => s.tau >= g.t0 && s.tau < g.t0 + g.dur);
    diagnosis(inDwell(S.diag), simT);
    parts(inDwell(S.parts), simT);
    repair(inDwell(S.repair), simT, dt);
    flagRobot(states, simT);
    wind(states, simT, dt);
    for (const R of [RD, RP, RR, RW, RF]) idleTouches(R, simT);

    if (dt > 0) {
      for (const s of states) {
        const { D, P, tau, dg } = s;
        if (D.prev != null) for (const [tt, fn] of EVENTS) if (crossed(D.prev, tau, tt)) fn(s);
        D.prev = tau;
        const n = P.s.name;
        if (n === 'limp' && chance(10, dt)) smoke(P.x, P.y, 1);
        if (n === 'sputter') { if (chance(24, dt)) smoke(P.x, P.y, 1, 0.32); if (chance(6, dt)) sparks(P.x, P.y, 2, 40); }
        if (dg.bent && (n === 'dwell' || n === 'move') && chance(2.5, dt)) smoke(P.x, P.y - 2, 1, 0.16);
      }
    }
    stepFx(dt);
    if (camOn) follow(states, dt);
  }

  let raf = 0;
  layout();
  const relayout = () => { layout(); if (reduce || !raf) update(0); };
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(home);
  else window.addEventListener('resize', relayout);

  if (reduce) { update(0); return; }

  let last = 0, onScreen = true;
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
