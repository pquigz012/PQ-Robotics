/* PQ Robotics holiday shop: hero scenes and shelf robots.
   The robots are the home page Drone Hospital crew (tank tracks, pincher arm,
   red cross on the chest), dressed for the holidays. Same body as drawRobot in
   drone-hospital-line.js (published B1 version).
   Three looks, picked with ?look=1|2|3 (set on <html data-look> in the page head):
   1 Workshop (Bay 04 gift wrap line), 2 Spec sheet (drawing + garland), 3 Snow globe. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a, p) => { const e = document.createElementNS(NS, t); if (a) for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const cross = (x, y, s) => `M${x - s / 2} ${y - 1.5 * s}h${s}v${s}h${s}v${s}h${-s}v${s}h${-s}v${-s}h${-s}v${-s}h${s}z`;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const look = document.documentElement.getAttribute('data-look') || '1';
  const line = (el, x1, y1, x2, y2) => { el.setAttribute('x1', x1.toFixed(2)); el.setAttribute('y1', y1.toFixed(2)); el.setAttribute('x2', x2.toFixed(2)); el.setAttribute('y2', y2.toFixed(2)); };

  /* ---------- the robot ---------- */
  // o: { flip, hat, antlers, scarf }. Faces left unless flipped. Ground at y = 0.
  function robot(back, front, x, y, s, o) {
    o = o || {};
    const f = o.flip ? -1 : 1, tf = `translate(${x} ${y}) scale(${f * s} ${s})`;
    const g = mk('g', { class: 'bot', transform: tf }, back);
    const top = -26, cy = -18.3;
    // tank track
    mk('rect', { class: 'k thin lug', x: -12.9, y: -8.9, width: 25.8, height: 9.8, rx: 4.9 }, g);
    mk('rect', { class: 'kf', x: -12, y: -8, width: 24, height: 8, rx: 4 }, g);
    mk('path', { class: 'k thin', d: 'M-8 -4H8' }, g);
    for (const cx of [-8, 0, 8]) { mk('circle', { class: 'k thin', cx, cy: -4, r: 2.3 }, g); mk('circle', { class: 'ink', cx, cy: -4, r: 0.75 }, g); }
    // battery pack and its cable
    mk('rect', { class: 'kf', x: 9, y: top + 2, width: 4, height: 11, rx: 1.2 }, g);
    mk('path', { class: 'k thin', d: `M10 ${top + 5}h2M10 ${top + 7.5}h2M10 ${top + 10}h2` }, g);
    mk('rect', { class: 'kf', x: 10.2, y: top + 0.6, width: 1.6, height: 1.4, rx: 0.4 }, g);
    mk('path', { class: 'k thin', d: `M11 ${top + 0.6}Q11 ${top - 2.2} 6 ${top - 0.2}` }, g);
    // turntable and chest
    mk('rect', { class: 'kf', x: -5.5, y: -10.8, width: 11, height: 2.6, rx: 1 }, g);
    mk('path', { class: 'k thin', d: 'M-3 -10.8v2.6M0 -10.8v2.6M3 -10.8v2.6' }, g);
    mk('rect', { class: 'kf', x: -9, y: top, width: 18, height: 16, rx: 3.5 }, g);
    mk('path', { class: 'red', d: cross(0, cy, 2.3) }, g);
    mk('path', { class: 'k thin', d: 'M-7.4 -12.6h3M-7.4 -11.4h3M4.4 -12.6h3M4.4 -11.4h3' }, g);
    for (const bx of [-7.1, 7.1]) mk('circle', { class: 'ink', cx: bx, cy: top + 1.9, r: 0.55 }, g);
    mk('path', { class: 'k thin', d: `M-9 ${top + 3}H9` }, g);
    // head on a ribbed neck
    const head = mk('g', {}, g);
    mk('rect', { class: 'kf', x: -2.4, y: top - 3.2, width: 4.8, height: 3.4, rx: 0.8 }, head);
    mk('path', { class: 'k thin', d: `M-2.4 ${top - 1.5}h4.8` }, head);
    mk('circle', { class: 'kf', cx: 8.6, cy: -34.2, r: 1.8 }, head);
    mk('circle', { class: 'ink', cx: 8.9, cy: -34.2, r: 0.55 }, head);
    mk('rect', { class: 'kf', x: -8.5, y: -39.2, width: 17, height: 10, rx: 3 }, head);
    const visor = mk('rect', { class: 'visor', x: -7.3, y: -36.8, width: 10.5, height: 4.8, rx: 2.2 }, head);
    mk('circle', { class: 'red eye', cx: -4.4, cy: -34.4, r: 1.15 }, head);
    mk('path', { class: 'k thin', d: 'M-1.6 -35.8h3.4M4.6 -36.7v4.6M6.2 -36.7v4.6M-6 -30.6h4' }, head);
    if (o.hat) {
      mk('path', { class: 'hat', d: 'M-7.6 -40.4C-7 -48 -2.5 -53.5 3 -53.5C7.8 -53.5 11.2 -50.2 12.6 -45.6C10.4 -47.6 8.2 -48 6.8 -46.6C7.4 -44.6 7.8 -42.4 7.9 -40.4Z' }, head);
      mk('rect', { class: 'trim', x: -9.2, y: -42, width: 18.4, height: 3.6, rx: 1.8 }, head);
      mk('circle', { class: 'trim', cx: 13, cy: -44.4, r: 2.3 }, head);
    } else if (o.antlers) {
      mk('path', { class: 'antler', d: 'M-4.5 -39.2L-6.5 -45.5L-6 -49.5M-6.5 -45.5L-10.2 -47.6M-5.6 -42.4L-9 -43.2M4.5 -39.2L6.5 -45.5L6 -49.5M6.5 -45.5L10.2 -47.6M5.6 -42.4L9 -43.2' }, head);
    } else {
      mk('rect', { class: 'kf', x: 2.9, y: -40.2, width: 2.6, height: 1.2, rx: 0.4 }, head);
      mk('path', { class: 'k', d: 'M4.2 -40.2L6 -44.4' }, head);
      mk('circle', { class: 'red tip', cx: 6.2, cy: -45.2, r: 1.4 }, head);
    }
    if (o.scarf) {
      mk('path', { class: 'scarf', d: 'M2.6 -27.4l3.2 8.2l-3.4 0.7l-2 -8.4z' }, g);
      mk('rect', { class: 'scarf', x: -5, y: -29.8, width: 10, height: 3.4, rx: 1.4 }, g);
      mk('path', { class: 'scarf-s', d: 'M-2.4 -29.8v3.4M0.6 -29.8v3.4M3.6 -24.6l2.6 -0.5M4.6 -22.2l2.4 -0.5' }, g);
    }
    // the arm, drawn in front so it can reach over things
    const fr = mk('g', { class: 'bot', transform: tf }, front || g);
    const upper = mk('line', { class: 'arm' }, fr);
    const fore = mk('line', { class: 'arm' }, fr);
    const j1 = mk('polyline', { class: 'jaw' }, fr);
    const j2 = mk('polyline', { class: 'jaw' }, fr);
    mk('circle', { class: 'kf', cx: -9, cy: -18, r: 2.5 }, fr);
    const elbow = mk('circle', { class: 'kf', r: 1.5 }, fr);
    const R = { x, y, s, f, g, fr, head, visor, upper, fore, j1, j2, elbow, w: { x: 0, y: 0 }, u: { x: 1, y: 0 } };
    armTo(R, -16, -5);
    return R;
  }

  // two-link arm, shoulder at (-9,-18) in robot space, elbow kept up (same as the home page)
  function armTo(R, lx, ly, open) {
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
    const P = (t, n) => `${(w.x + ux * t + px * n).toFixed(2)},${(w.y + uy * t + py * n).toFixed(2)}`;
    R.j1.setAttribute('points', `${P(0, 0)} ${P(2.6, 1.2 + o)} ${P(5.4, 0.9 + o * 0.6)} ${P(6.4, 0.1 + o * 0.3)}`);
    R.j2.setAttribute('points', `${P(0, 0)} ${P(2.6, -1.2 - o)} ${P(5.4, -0.9 - o * 0.6)} ${P(6.4, -0.1 - o * 0.3)}`);
    R.elbow.setAttribute('cx', e.x.toFixed(2)); R.elbow.setAttribute('cy', e.y.toFixed(2));
    R.w = w; R.u = { x: ux, y: uy };
  }
  const reach = (R, wx, wy, open) => armTo(R, (wx - R.x) / (R.f * R.s), (wy - R.y) / R.s, open);
  const tipWorld = (R, t) => ({ x: R.x + (R.w.x + R.u.x * t) * R.f * R.s, y: R.y + (R.w.y + R.u.y * t) * R.s });
  const eyeWorld = R => ({ x: R.x + -4.4 * R.f * R.s, y: R.y + -34.4 * R.s });
  const tilt = (R, deg) => R.head.setAttribute('transform', `rotate(${deg.toFixed(2)} 0 -28)`);

  /* ---------- props ---------- */
  function gift(parent, w, h, tone) {      // origin at the bottom centre
    const g = mk('g', { class: 'gift ' + (tone || 'g-red') }, parent);
    mk('rect', { class: 'gb', x: -w / 2, y: -h, width: w, height: h, rx: 1.5 }, g);
    mk('rect', { class: 'gr', x: -w * 0.09, y: -h, width: w * 0.18, height: h }, g);
    mk('rect', { class: 'gl', x: -w / 2 - 2, y: -h - 5, width: w + 4, height: 6, rx: 1.5 }, g);
    mk('rect', { class: 'gr', x: -w * 0.09, y: -h - 5, width: w * 0.18, height: 6 }, g);
    const b = h + 5;
    mk('path', { class: 'gbow', d: `M0 ${-b}c-2.5 -7 -11 -8 -9.5 -2.2c.8 2.6 5.5 2.2 9.5 2.2zM0 ${-b}c2.5 -7 11 -8 9.5 -2.2c-.8 2.6 -5.5 2.2 -9.5 2.2z` }, g);
    return g;
  }
  function carton(parent, w, h) {
    const g = mk('g', { class: 'carton' }, parent);
    mk('rect', { class: 'cb', x: -w / 2, y: -h, width: w, height: h, rx: 1 }, g);
    mk('path', { class: 'ct', d: `M${-w / 2} ${-h + 4}H${w / 2}M0 ${-h}v4` }, g);
    const t = mk('text', { class: 'cl', x: 0, y: -h / 2 + 5, 'text-anchor': 'middle' }, g);
    t.textContent = 'A1';
    return g;
  }
  // The A1, side on: compact body, 360 lens on top and bottom, folding arms
  function a1Side(parent, s) {
    const g = mk('g', { class: 'a1' }, parent);
    const i = mk('g', { transform: `scale(${s})` }, g);
    mk('path', { class: 'a1-arm', d: 'M-8 -1L-25 -5M8 -1L25 -5' }, i);
    for (const x of [-25, 25]) {
      mk('rect', { class: 'a1-motor', x: x - 3.2, y: -9.5, width: 6.4, height: 4.5, rx: 1.2 }, i);
      mk('ellipse', { class: 'a1-prop', cx: x, cy: -10.8, rx: 12, ry: 1.2 }, i);
    }
    mk('circle', { class: 'a1-lens', cx: 0, cy: -6.4, r: 3.8 }, i);
    mk('circle', { class: 'a1-lens', cx: 0, cy: 6.4, r: 3.8 }, i);
    mk('rect', { class: 'a1-body', x: -12, y: -4.5, width: 24, height: 9, rx: 4.5 }, i);
    mk('circle', { class: 'a1-glass', cx: -1, cy: -7.4, r: 1.5 }, i);
    mk('circle', { class: 'a1-glass', cx: -1, cy: 7.4, r: 1.5 }, i);
    mk('path', { class: 'a1-line', d: 'M-8 0H4' }, i);
    mk('circle', { class: 'a1-led', cx: 8, cy: 0, r: 1.1 }, i);
    return g;
  }
  // The A1 from above, for the spec sheet
  function a1Top(parent, s) {
    const g = mk('g', { class: 'a1 top' }, parent);
    const i = mk('g', { transform: `scale(${s})` }, g);
    for (const [x, y] of [[-34, -30], [34, -30], [-34, 30], [34, 30]]) {
      mk('path', { class: 'a1-arm', d: `M${Math.sign(x) * 8} ${Math.sign(y) * 10}L${x} ${y}` }, i);
      mk('circle', { class: 'a1-disc', cx: x, cy: y, r: 21 }, i);
      const hub = mk('g', { transform: `translate(${x} ${y})` }, i);
      const spin = mk('g', { class: 'spin' }, hub);
      mk('path', { class: 'a1-bl', d: 'M-19 0C-11 -3.4 -4 -2 0 0C4 2 11 3.4 19 0' }, spin);
      mk('circle', { class: 'a1-motor', cx: x, cy: y, r: 4.2 }, i);
    }
    mk('rect', { class: 'a1-body', x: -14, y: -22, width: 28, height: 44, rx: 12 }, i);
    mk('path', { class: 'a1-line', d: 'M-9 -16h18M-9 16h18' }, i);
    mk('circle', { class: 'a1-lens', cx: 0, cy: 0, r: 8.5 }, i);
    mk('circle', { class: 'a1-glass', cx: 0, cy: 0, r: 5 }, i);
    mk('circle', { class: 'a1-shine', cx: -1.8, cy: -1.8, r: 1.6 }, i);
    mk('circle', { class: 'a1-led', cx: 0, cy: -19, r: 1.2 }, i);
    return g;
  }
  function tag(parent, big, small) {        // price tag hanging from its hole at (0,0)
    const g = mk('g', { class: 'ptag' }, parent);
    mk('path', { class: 'pt-card', d: 'M-36 6L-24 -2H24L36 6V54H-36Z' }, g);
    mk('circle', { class: 'pt-hole', cx: 0, cy: 4, r: 2.4 }, g);
    const a = mk('text', { class: 'pt-big', x: 0, y: 32, 'text-anchor': 'middle' }, g); a.textContent = big;
    const b = mk('text', { class: 'pt-small', x: 0, y: 48, 'text-anchor': 'middle' }, g); b.textContent = small;
    mk('path', { class: 'pt-strike', d: 'M-19 44H19' }, g);
    return g;
  }
  function sparkle(layer, list, x, y) {
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2 + rnd(-0.3, 0.3);
      const el = mk('path', { class: 'spark s' + (k % 3), d: 'M0 -4L1 -1L4 0L1 1L0 4L-1 1L-4 0L-1 -1Z' }, layer);
      list.push({ el, x, y, vx: Math.cos(a) * rnd(40, 90), vy: Math.sin(a) * rnd(40, 90) - 30, t: 0 });
    }
  }
  function stepSparks(list, dt) {
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i]; p.t += dt;
      if (p.t > 0.7) { p.el.remove(); list.splice(i, 1); continue; }
      p.vy += 160 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      p.el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${(1 - p.t / 0.7).toFixed(2)})`);
    }
  }
  function lights(parent, x0, x1, y0, sag, n) {
    const cat = x => y0 + sag * (1 - Math.pow((x - (x0 + x1) / 2) / ((x1 - x0) / 2), 2));
    let d = '';
    for (let x = x0; x <= x1 + 0.1; x += 8) d += (d ? 'L' : 'M') + x.toFixed(1) + ' ' + cat(x).toFixed(1);
    mk('path', { class: 'wire', d }, parent);
    for (let i = 0; i < n; i++) {
      const x = x0 + ((i + 0.5) * (x1 - x0)) / n, y = cat(x);
      const b = mk('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, parent);
      mk('rect', { class: 'cap', x: -2.4, y: -1, width: 4.8, height: 4.5, rx: 1 }, b);
      const gl = mk('ellipse', { class: 'glow b' + (i % 4), cx: 0, cy: 9.5, rx: 3.8, ry: 6.2 }, b);
      gl.style.animationDelay = (-Math.random() * 3).toFixed(2) + 's';
    }
  }

  /* ---------- look 1: Bay 04 gift wrap line ---------- */
  function workshop(svg) {
    svg.setAttribute('viewBox', '0 0 640 440');
    svg.setAttribute('aria-label', 'Holiday workshop: Drone Hospital robots in Santa hats and antlers wrap Antigravity A1 boxes on a conveyor and load them onto a sleigh while an A1 drone hovers with the price tag.');
    const L = {};
    for (const n of ['bg', 'lights', 'belt', 'boxes', 'back', 'front', 'sleigh', 'drone', 'fx']) L[n] = mk('g', {}, svg);
    const FLOOR = 412, BELT = 362, SPEED = 46;
    // floor, label and counter
    mk('path', { class: 'k faint', d: `M16 ${FLOOR}H624` }, L.bg);
    for (const [x, w] of [[40, 40], [300, 60], [600, 30]]) mk('path', { class: 'drift', d: `M${x - w} ${FLOOR}Q${x} ${FLOOR - 9} ${x + w} ${FLOOR}Z` }, L.bg);
    const lb = mk('text', { class: 'lbl', x: 140, y: 112 }, L.bg); lb.textContent = 'BAY 04 · GIFT WRAP';
    const ct = mk('text', { class: 'lbl dim', x: 140, y: 128 }, L.bg);
    lights(L.lights, 4, 636, 14, 44, 15);
    // belt on stands, like the repair line on the home page
    mk('rect', { class: 'kf', x: 62, y: BELT, width: 410, height: 12, rx: 6 }, L.belt);
    mk('path', { class: 'belt-run', d: `M70 ${BELT + 6}H464` }, L.belt);
    for (const cx of [70, 464]) { mk('circle', { class: 'kf', cx, cy: BELT + 6, r: 5 }, L.belt); mk('circle', { class: 'ink', cx, cy: BELT + 6, r: 1.2 }, L.belt); }
    for (const sx of [100, 190, 280, 370, 446]) {
      mk('rect', { class: 'kf', x: sx - 6, y: BELT + 12, width: 12, height: 4, rx: 1 }, L.belt);
      mk('rect', { class: 'kf', x: sx - 2.5, y: BELT + 16, width: 5, height: FLOOR - BELT - 20, rx: 1 }, L.belt);
      mk('circle', { class: 'ink', cx: sx, cy: BELT + 24, r: 0.9 }, L.belt);
      mk('circle', { class: 'ink', cx: sx, cy: BELT + 36, r: 0.9 }, L.belt);
      mk('rect', { class: 'kf', x: sx - 7, y: FLOOR - 4, width: 14, height: 4, rx: 1 }, L.belt);
    }
    // order chute, drawn in front so boxes slide out of it
    mk('path', { class: 'kf', d: 'M70 96H132L121 114H81Z' }, L.front);
    mk('rect', { class: 'kf', x: 84, y: 114, width: 34, height: 208 }, L.front);
    for (const by of [150, 230, 306]) mk('rect', { class: 'kf', x: 81, y: by, width: 40, height: 6, rx: 1.5 }, L.front);
    const oi = mk('text', { class: 'lbl small', x: 101, y: 88, 'text-anchor': 'middle' }, L.front); oi.textContent = 'ORDERS';
    // robots stand in front of the belt, as on the home page
    const R1 = robot(L.back, L.front, 236, FLOOR, 2.8, { hat: true });
    const R2 = robot(L.back, L.front, 398, FLOOR, 2.8, { antlers: true, scarf: true });
    const beam = mk('polygon', { class: 'beam', points: '0,0 0,0 0,0' }, L.fx);
    beam.style.display = 'none';
    // sleigh
    mk('path', { class: 'sleigh', d: 'M492 334H508V356H582C600 356 606 346 610 336C614 326 626 328 624 340C621 362 606 384 584 384H500C494 384 492 378 492 372Z' }, L.sleigh);
    mk('path', { class: 'sleigh-trim', d: 'M500 371H590' }, L.sleigh);
    mk('path', { class: 'runner', d: 'M486 404H604C622 404 630 394 628 384M506 384V404M546 384V404M584 384V404' }, L.sleigh);
    const SLOTS = [[524, 372], [552, 372], [578, 372], [538, 346], [566, 346]];
    // the A1, hovering with its tag
    const dr = mk('g', {}, L.drone);
    a1Side(dr, 2.2);
    const swing = mk('g', {}, dr);
    mk('path', { class: 'string', d: 'M0 22V44' }, swing);
    const tg = mk('g', { transform: 'translate(0 44)' }, swing);
    tag(tg, '$1,450', '$1,650');

    const sparks = [], boxes = [], tones = ['g-red', 'g-green', 'g-gold', 'g-white'];
    let spawnT = 0.4, done = 0, slot = 0, clearAt = 0;
    const count = () => { ct.textContent = 'WRAPPED THIS VISIT ' + String(done).padStart(3, '0'); };
    count();
    function spawn() {
      const g = mk('g', {}, L.boxes);
      const c = carton(g, 30, 24), w = gift(g, 30, 22, tones[(done + boxes.length) % 4]);
      w.style.display = 'none';
      const chk = mk('g', { class: 'chk', transform: 'translate(12 -30)' }, g);
      mk('circle', { r: 6 }, chk); mk('path', { d: 'M-3 0L-1 2.4L3.2 -2.4' }, chk);
      chk.style.display = 'none';
      boxes.push({ g, c, w, chk, x: 101, y: 250, vy: 0, st: 'drop', wrapped: false, checked: false, rot: 0 });
    }
    return function step(dt, t) {
      spawnT -= dt;
      if (spawnT <= 0) { spawn(); spawnT = 4.4; }
      let wrapBox = null, scanBox = null;
      for (let i = boxes.length - 1; i >= 0; i--) {
        const b = boxes[i];
        if (b.st === 'drop') {
          b.vy += 900 * dt; b.y += b.vy * dt;
          if (b.y >= BELT) { b.y = BELT; if (b.vy > 140) b.vy = -b.vy * 0.25; else { b.vy = 0; b.st = 'ride'; } }
        } else if (b.st === 'ride') {
          b.x += SPEED * dt;
          if (!b.wrapped && b.x > 138 && b.x < 184) wrapBox = b;
          if (!b.wrapped && b.x >= 176) { b.wrapped = true; b.c.style.display = 'none'; b.w.style.display = ''; sparkle(L.fx, sparks, b.x, BELT - 20); }
          if (b.wrapped && !b.checked && b.x > 300) scanBox = b;
          if (!b.checked && b.x >= 352) { b.checked = true; b.chk.style.display = ''; }
          if (b.x >= 466) {
            const s = SLOTS[slot % SLOTS.length]; slot++;
            Object.assign(b, { st: 'fly', t: 0, x0: b.x, y0: BELT, x1: s[0], y1: s[1] });
          }
        } else if (b.st === 'fly') {
          b.t += dt / 0.75;
          const u = Math.min(1, b.t), e = ease(u);
          b.x = lerp(b.x0, b.x1, e); b.y = lerp(b.y0, b.y1, u) - 46 * Math.sin(Math.PI * u); b.rot = 14 * Math.sin(Math.PI * u);
          if (u >= 1) { b.st = 'rest'; b.rot = 0; done++; count(); if (slot % SLOTS.length === 0) clearAt = t + 2.4; }
        } else if (b.st === 'gone') {
          b.t += dt; b.g.style.opacity = Math.max(0, 1 - b.t / 0.6).toFixed(2);
          if (b.t > 0.6) { b.g.remove(); boxes.splice(i, 1); continue; }
        }
        b.g.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${b.rot.toFixed(1)})`);
      }
      if (clearAt && t > clearAt) { clearAt = 0; for (const b of boxes) if (b.st === 'rest') { b.st = 'gone'; b.t = 0; } }
      // R1 wraps: pinchers follow the box lid and snap shut
      if (wrapBox) { reach(R1, wrapBox.x + 2, BELT - 27, wrapBox.x < 168 ? 2.4 : 0.3); R1.visor.classList.add('on'); tilt(R1, -7); }
      else { reach(R1, 208 + 3 * Math.sin(t * 1.3), 388, 1.4); R1.visor.classList.remove('on'); tilt(R1, 2 * Math.sin(t * 0.9)); }
      // R2 checks the wrapping with the red scan beam
      if (scanBox && scanBox.x < 352) {
        const e = eyeWorld(R2), bx = scanBox.x, by = BELT - 30;
        beam.setAttribute('points', `${e.x.toFixed(1)},${e.y.toFixed(1)} ${(bx - 17).toFixed(1)},${by + 8} ${(bx + 17).toFixed(1)},${by + 8}`);
        beam.style.display = ''; R2.visor.classList.add('scan'); tilt(R2, -9);
        reach(R2, bx + 20, BELT - 44, 1);
      } else {
        beam.style.display = 'none'; R2.visor.classList.remove('scan'); tilt(R2, 2 * Math.sin(t * 0.8 + 1));
        reach(R2, 370 + 3 * Math.sin(t * 1.1 + 2), 388, 1.4);
      }
      // drone hovers over the sleigh, tag swings under it
      const hx = 552 + 8 * Math.sin(t * 0.5), hy = 196 + 6 * Math.sin(t * 1.4);
      dr.setAttribute('transform', `translate(${hx.toFixed(1)} ${hy.toFixed(1)}) rotate(${(3 * Math.cos(t * 0.5)).toFixed(2)})`);
      swing.setAttribute('transform', `rotate(${(6 * Math.sin(t * 1.4 + 0.7)).toFixed(2)})`);
      stepSparks(sparks, dt);
    };
  }

  /* ---------- look 2: spec sheet with a garland ---------- */
  function spec(svg) {
    svg.setAttribute('viewBox', '0 0 640 480');
    svg.setAttribute('aria-label', 'Holiday spec sheet: a technical drawing of the Antigravity A1 from above with callouts, and two Drone Hospital robots holding a garland with the price tag.');
    const defs = mk('defs', {}, svg);
    const pat = mk('pattern', { id: 'grid', width: 20, height: 20, patternUnits: 'userSpaceOnUse' }, defs);
    mk('path', { class: 'gridline', d: 'M20 0H0V20' }, pat);
    mk('rect', { x: 0, y: 0, width: 640, height: 480, fill: 'url(#grid)' }, svg);
    const t1 = mk('text', { class: 'lbl', x: 18, y: 26 }, svg); t1.textContent = 'DWG HOL-26 · A1 ESSENTIAL BUNDLE';
    const t2 = mk('text', { class: 'lbl dim', x: 622, y: 26, 'text-anchor': 'end' }, svg); t2.textContent = 'TOP VIEW · NOT TO SCALE';
    const CX = 320, CY = 186, S = 2;
    // dimension line across the props
    const dim = mk('g', { class: 'dim' }, svg);
    const xl = CX - 55 * S, xr = CX + 55 * S;
    mk('path', { d: `M${xl} ${CY - 30 * S - 6}V62M${xr} ${CY - 30 * S - 6}V62M${xl} 70H${xr}` }, dim);
    mk('path', { class: 'arrow', d: `M${xl} 70l8 -3v6zM${xr} 70l-8 -3v6z` }, dim);
    const dl = mk('text', { class: 'lbl', x: CX, y: 62, 'text-anchor': 'middle' }, svg); dl.textContent = '8K 360° VIDEO';
    a1Top(mk('g', { transform: `translate(${CX} ${CY})` }, svg), S);
    // callouts
    const call = (px, py, ex, ey, tx, txt, end) => {
      mk('path', { class: 'leader', d: `M${px} ${py}L${ex} ${ey}H${tx}` }, svg);
      mk('circle', { class: 'leader-dot', cx: px, cy: py, r: 2.6 }, svg);
      const t = mk('text', { class: 'lbl', x: end ? tx - 6 : tx + 6, y: ey + 4, 'text-anchor': end ? 'end' : 'start' }, svg); t.textContent = txt;
    };
    call(CX + 8, CY - 8, 470, 112, 478, 'TWIN 360 LENSES');
    call(CX - 12, CY - 30, 196, 112, 186, 'UNDER 249 g', true);
    call(CX - 10, CY + 34, 196, 300, 186, '2 × 24 MIN FLIGHT', true);
    call(CX + 12, CY + 30, 452, 300, 460, '10 km VIDEO LINK');
    // robots and the garland
    const back = mk('g', {}, svg), gar = mk('g', {}, svg), front = mk('g', {}, svg);
    const R1 = robot(back, front, 92, 466, 2.1, { flip: true, hat: true });
    const R2 = robot(back, front, 548, 466, 2.1, { scarf: true });
    const rope = mk('path', { class: 'garland' }, gar);
    const leaves = mk('path', { class: 'garland-leaf' }, gar);
    const bulbs = [];
    for (let i = 0; i < 9; i++) { const b = mk('circle', { class: 'orn b' + (i % 4), r: 4.2 }, gar); bulbs.push(b); }
    const hang = mk('g', {}, gar);
    mk('path', { class: 'string', d: 'M0 0V14' }, hang);
    tag(mk('g', { transform: 'translate(0 14)' }, hang), '$1,450', '$1,650');
    const q = (a, c, b, u) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * c + u * u * b;
    return function step(dt, t) {
      const ly = 384 + 6 * Math.sin(t * 1.6), ry = 384 + 6 * Math.sin(t * 1.6 + Math.PI);
      reach(R1, 148, ly, 0.2); reach(R2, 492, ry, 0.2);
      const A = tipWorld(R1, 4.5), B = tipWorld(R2, 4.5), C = { x: CX, y: 446 + 4 * Math.sin(t * 1.6 + 1.2) };
      const d = `M${A.x.toFixed(1)} ${A.y.toFixed(1)}Q${C.x} ${C.y.toFixed(1)} ${B.x.toFixed(1)} ${B.y.toFixed(1)}`;
      rope.setAttribute('d', d); leaves.setAttribute('d', d);
      bulbs.forEach((b, i) => { const u = (i + 1) / 10; b.setAttribute('cx', q(A.x, C.x, B.x, u).toFixed(1)); b.setAttribute('cy', (q(A.y, C.y, B.y, u) + 5).toFixed(1)); });
      const mx = q(A.x, C.x, B.x, 0.5), my = q(A.y, C.y, B.y, 0.5);
      hang.setAttribute('transform', `translate(${mx.toFixed(1)} ${(my + 2).toFixed(1)}) rotate(${(7 * Math.sin(t * 1.6 + 0.4)).toFixed(2)})`);
      tilt(R1, 4 + 3 * Math.sin(t * 0.9)); tilt(R2, 4 + 3 * Math.sin(t * 0.9 + 1.5));
    };
  }

  /* ---------- look 3: snow globe ---------- */
  function snowGlobe(svg) {
    svg.setAttribute('viewBox', '0 0 520 600');
    svg.setAttribute('aria-label', 'Snow globe: inside, an Antigravity A1 drone flies loops over a snowy Atlanta skyline while two Drone Hospital robots, one in a Santa hat, wave and hold up a gift. Tap to shake the snow.');
    const GX = 260, GY = 250, GR = 210, GROUND = 398;
    const defs = mk('defs', {}, svg);
    const sky = mk('radialGradient', { id: 'gsky', cx: '50%', cy: '30%', r: '75%' }, defs);
    mk('stop', { offset: '0', class: 'sky0' }, sky); mk('stop', { offset: '1', class: 'sky1' }, sky);
    const cp = mk('clipPath', { id: 'gclip' }, defs); mk('circle', { cx: GX, cy: GY, r: GR - 3 }, cp);
    const glass = mk('g', { class: 'globe' }, svg);
    const inside = mk('g', { 'clip-path': 'url(#gclip)' }, glass);
    mk('rect', { x: GX - GR, y: GY - GR, width: GR * 2, height: GR * 2, fill: 'url(#gsky)' }, inside);
    for (let i = 0; i < 46; i++) {
      const s = mk('circle', { class: 'star', cx: rnd(60, 460).toFixed(1), cy: rnd(50, 300).toFixed(1), r: rnd(0.5, 1.5).toFixed(2) }, inside);
      s.style.animationDelay = (-rnd(0, 4)).toFixed(2) + 's';
    }
    mk('path', { class: 'moon', d: 'M372 96a22 22 0 1 0 18 34a18 18 0 1 1 -18 -34z' }, inside);
    // a made-up skyline, low and wide
    const city = mk('g', { class: 'city' }, inside);
    const B = [[56, 34, 62], [90, 26, 98], [116, 34, 80], [150, 20, 138], [170, 30, 112], [200, 28, 86], [228, 42, 126], [270, 22, 100], [292, 36, 156], [328, 26, 112], [354, 32, 84], [386, 24, 122], [410, 40, 92], [450, 30, 70]];
    for (const [x, w, h] of B) {
      mk('rect', { x, y: GROUND - h, width: w, height: h }, city);
      for (let wy = GROUND - h + 8; wy < GROUND - 10; wy += 11)
        for (let wx = x + 5; wx < x + w - 5; wx += 8) if (Math.random() < 0.32) {
          const win = mk('rect', { class: 'win', x: wx, y: wy, width: 3, height: 4 }, city);
          win.style.animationDelay = (-rnd(0, 9)).toFixed(2) + 's';
        }
    }
    mk('path', { d: 'M302 236V224M160 212V200', class: 'spire' }, city);
    mk('path', { class: 'snowfield', d: `M40 ${GROUND + 2}Q150 ${GROUND - 20} 260 ${GROUND - 8}Q370 ${GROUND + 4} 480 ${GROUND - 14}V480H40Z` }, inside);
    // tree with presents
    const tree = mk('g', { class: 'tree' }, inside);
    mk('rect', { class: 'trunk', x: 394, y: GROUND - 14, width: 8, height: 14 }, tree);
    for (const [ty, w, h] of [[GROUND - 12, 30, 44], [GROUND - 40, 25, 40], [GROUND - 66, 19, 34]]) mk('path', { d: `M398 ${ty - h}L${398 - w} ${ty}H${398 + w}Z` }, tree);
    mk('path', { class: 'star-gold', d: 'M398 314l3 6.4 7 .8-5.2 4.8 1.4 7-6.2-3.6-6.2 3.6 1.4-7-5.2-4.8 7-.8z' }, tree);
    for (const [ox, oy, c] of [[388, 352, 'b0'], [408, 362, 'b2'], [396, 374, 'b1'], [380, 380, 'b3'], [414, 384, 'b0'], [400, 340, 'b3']]) mk('circle', { class: 'orn ' + c, cx: ox, cy: oy, r: 3 }, tree);
    gift(mk('g', { transform: `translate(372 ${GROUND + 2})` }, inside), 22, 15, 'g-red');
    gift(mk('g', { transform: `translate(426 ${GROUND - 2}) scale(.8)` }, inside), 22, 16, 'g-gold');
    // robots and the flying A1
    const back = mk('g', {}, inside), front = mk('g', {}, inside);
    const R1 = robot(back, front, 168, GROUND + 2, 2.3, { flip: true, hat: true });
    const R2 = robot(back, front, 292, GROUND - 4, 2.3, { scarf: true });
    const held = mk('g', {}, front);
    gift(held, 26, 18, 'g-green');
    const dr = mk('g', {}, inside);
    a1Side(dr, 2.3);
    // snow inside the globe
    const flakes = [];
    for (let i = 0; i < 80; i++) {
      const el = mk('circle', { class: 'flake', r: rnd(0.9, 2.6).toFixed(2) }, inside);
      const a = rnd(0, Math.PI * 2), r = Math.sqrt(Math.random()) * (GR - 12);
      flakes.push({ el, x: GX + r * Math.cos(a), y: GY + r * Math.sin(a), vx: 0, vy: rnd(10, 30), p: rnd(0, 6.3) });
    }
    // glass, shine and the base
    mk('circle', { class: 'glass', cx: GX, cy: GY, r: GR }, glass);
    mk('path', { class: 'shine', d: `M${GX - 150} ${GY - 92}A176 176 0 0 1 ${GX - 40} ${GY - 186}` }, glass);
    mk('path', { class: 'shine thin', d: `M${GX + 154} ${GY + 60}A170 170 0 0 1 ${GX + 116} ${GY + 128}` }, glass);
    const base = mk('g', { class: 'base' }, svg);
    mk('path', { class: 'base-body', d: 'M94 432C150 460 370 460 426 432L456 524C380 552 140 552 64 524Z' }, base);
    mk('ellipse', { class: 'base-top', cx: GX, cy: 432, rx: 166, ry: 22 }, base);
    mk('path', { class: 'base-band', d: 'M72 512C150 538 370 538 448 512' }, base);
    mk('rect', { class: 'plaque', x: 186, y: 470, width: 148, height: 42, rx: 5 }, base);
    mk('path', { class: 'red', d: cross(206, 491, 4) }, base);
    const p1 = mk('text', { class: 'plq', x: 270, y: 488, 'text-anchor': 'middle' }, base); p1.textContent = 'PQ ROBOTICS';
    const p2 = mk('text', { class: 'plq small', x: 270, y: 503, 'text-anchor': 'middle' }, base); p2.textContent = 'HOLIDAY 2026 · ATL';
    const hint = mk('text', { class: 'lbl dim', x: GX, y: 584, 'text-anchor': 'middle' }, svg); hint.textContent = reduce ? 'SNOW GLOBE · PQ HOLIDAY SHOP' : 'TAP THE GLOBE TO SHAKE IT';
    function shake() {
      for (const f of flakes) { f.vy = -rnd(120, 360); f.vx = rnd(-220, 220); }
      glass.classList.remove('wobble'); void glass.getBBox(); glass.classList.add('wobble');
    }
    svg.addEventListener('click', shake);
    svg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); shake(); } });
    svg.setAttribute('tabindex', '0');
    let first = true;
    return function step(dt, t) {
      if (first && t > 0.6 && !reduce) { first = false; shake(); }
      const w = 0.55, x = GX + 112 * Math.sin(w * t), y = 172 + 36 * Math.sin(2 * w * t);
      const bank = clamp(112 * w * Math.cos(w * t) * 0.14, -12, 12);
      dr.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${bank.toFixed(2)})`);
      // R1 holds up a present, R2 waves at the drone
      reach(R1, 214 + 3 * Math.sin(t * 1.2), 302 + 6 * Math.sin(t * 1.2), 0.2);
      const tp = tipWorld(R1, 3);
      held.setAttribute('transform', `translate(${tp.x.toFixed(1)} ${(tp.y + 2).toFixed(1)}) rotate(${(4 * Math.sin(t * 1.2)).toFixed(2)})`);
      armTo(R2, -13 + 5 * Math.sin(t * 5), -40, 1.6);
      const gaze = R => clamp(Math.atan2(R.y - 90 * R.s - y, Math.abs(x - R.x) + 40) * 40, 0, 24);
      tilt(R1, gaze(R1)); tilt(R2, gaze(R2));
      for (const f of flakes) {
        f.vy += (22 - f.vy) * Math.min(1, 1.6 * dt); f.vx *= 1 - Math.min(1, 1.8 * dt);
        f.x += (f.vx + 10 * Math.sin(t * 0.9 + f.p)) * dt; f.y += f.vy * dt;
        const dx = f.x - GX, dy = f.y - GY, dd = Math.hypot(dx, dy);
        if (dd > GR - 8) { f.x = GX + (dx / dd) * (GR - 9); f.y = GY + (dy / dd) * (GR - 9); f.vx *= -0.3; if (f.y > GY) f.vy = Math.min(f.vy, 0); }
        if (f.y > GROUND + 6 + 6 * Math.sin(f.p) && f.vy > 0) { f.y = GY - GR + rnd(10, 60); f.x = GX + rnd(-140, 140); }
        f.el.setAttribute('cx', f.x.toFixed(1)); f.el.setAttribute('cy', f.y.toFixed(1));
      }
    };
  }

  /* ---------- shelf: robots peeking out of the coming-soon boxes ---------- */
  function shelf() {
    const tones = ['g-red', 'g-green', 'g-gold', 'g-white'];
    const kinds = [{ hat: true }, { antlers: true }, { scarf: true }, {}, { hat: true, flip: true }, { antlers: true, flip: true }, { scarf: true, flip: true }, { hat: true, scarf: true }, { flip: true }];
    document.querySelectorAll('.peek').forEach((el, i) => {
      const s = mk('svg', { viewBox: '0 0 120 100', class: 'scene mini', 'aria-hidden': 'true' }, el);
      const back = mk('g', {}, s), front = mk('g', {}, s);
      const R = robot(back, front, 60, 94, 1.5, kinds[i % kinds.length]);
      armTo(R, -22, -27, 1.2);
      tilt(R, [-6, 4, 8, -3, 6, -8, 3, 5, -5][i % 9]);
      const bx = mk('g', { transform: 'translate(60 98)' }, s);
      gift(bx, 72, 38, tones[i % 4]);
      s.appendChild(front);
      R.visor.style.animationDelay = (-i * 0.7).toFixed(1) + 's';
    });
  }

  /* ---------- snow over the hero ---------- */
  function snowfall(cv) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, fl = [];
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() {
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((W * H) / 7000);
      fl = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: rnd(0.6, 2.4), v: rnd(14, 42), p: rnd(0, 6.3) }));
    }
    size();
    window.addEventListener('resize', size);
    return function (dt, t) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      for (const f of fl) {
        f.y += f.v * dt; f.x += Math.sin(t * 0.7 + f.p) * 10 * dt;
        if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
        ctx.globalAlpha = 0.25 + f.r * 0.2;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
  }

  /* ---------- run ---------- */
  const svg = document.getElementById('scene');
  const hero = document.getElementById('top');
  shelf();
  if (!svg) return;
  const step = look === '2' ? spec(svg) : look === '3' ? snowGlobe(svg) : workshop(svg);
  const cv = document.getElementById('snow');
  const snow = cv && look !== '2' ? snowfall(cv) : null;
  if (reduce) {                 // still frame: run the line forward a little, then stop
    for (let i = 0; i < 380; i++) step(1 / 30, i / 30);
    if (snow) snow(0, 0);
    return;
  }
  let T = 0, last = 0, raf = 0, on = true;
  function frame(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now; T += dt;
    step(dt, T);
    if (snow) snow(dt, T);
    raf = on ? requestAnimationFrame(frame) : 0;
  }
  raf = requestAnimationFrame(frame);
  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(es => {
      on = es[0].isIntersecting;
      if (on && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    }).observe(hero);
  }
})();
