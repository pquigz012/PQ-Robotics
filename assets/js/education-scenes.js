/* PQ Robotics Education hero: four small scenes around the headline.
   Part 107 test prep (upper left), classroom (lower left), build lab (upper right),
   flight training (lower right). The drone finished in the build lab flies down to the
   training field, where a student flies it through hover, box, figure 8 and landing.
   Everything is drawn into the hero SVG; nothing here changes page text. */
(() => {
  const svg = document.querySelector('#top .hero-route');
  const root = svg && svg.querySelector('#edu');
  if (!root) return;

  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = id => root.querySelector('#' + id);
  const setC = (e, c) => { if (e._c !== c) { e.setAttribute('class', c); e._c = c; } };
  const show = (e, on) => { const v = on ? 'visible' : 'hidden'; if (e._v !== v) { e.setAttribute('visibility', v); e._v = v; } };
  const op = (e, v) => { const s = v.toFixed(2); if (e._o !== s) { e.setAttribute('opacity', s); e._o = s; } };
  const text = (e, t) => { if (e._t !== t) { e.textContent = t; e._t = t; } };
  const tf = (e, t) => { if (e._tf !== t) { e.setAttribute('transform', t); e._tf = t; } };
  const line = (e, x1, y1, x2, y2) => {
    e.setAttribute('x1', x1.toFixed(1)); e.setAttribute('y1', y1.toFixed(1));
    e.setAttribute('x2', x2.toFixed(1)); e.setAttribute('y2', y2.toFixed(1));
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const ease = u => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const rnd = (a, b) => {
    let h = (Math.imul(a + 1, 374761393) + Math.imul(b + 7, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
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

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fallback = svg.querySelector('.drone');
  if (fallback) fallback.remove();

  /* ---------- particles ---------- */
  const fxLayer = $('e-fx');
  const pool = [];
  for (let i = 0; i < 50; i++) pool.push({ c: mk('circle', { r: 0 }, fxLayer), live: false });
  const spawn = o => {
    const p = pool.find(q => !q.live);
    if (!p) return;
    Object.assign(p, { live: true, age: 0, vx: 0, vy: 0, g: 0, r0: 1, r1: 1, o0: 1 }, o);
    setC(p.c, o.cls);
  };
  const stepFx = dt => {
    for (const p of pool) {
      if (!p.live) continue;
      p.age += dt;
      const k = p.age / p.life;
      if (k >= 1) { p.live = false; p.c.setAttribute('r', 0); continue; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      p.c.setAttribute('cx', p.x.toFixed(1)); p.c.setAttribute('cy', p.y.toFixed(1));
      p.c.setAttribute('r', lerp(p.r0, p.r1, k).toFixed(2));
      p.c.setAttribute('opacity', (p.o0 * (1 - k)).toFixed(2));
    }
  };
  const smoke = (x, y) => spawn({ cls: 'fx-smoke', x: x + (Math.random() - 0.5) * 3, y, vx: (Math.random() - 0.5) * 6, vy: -10 - Math.random() * 8, life: 1.2, r0: 1, r1: 4, o0: 0.25 });
  const spark = (x, y) => {
    const a = Math.random() * Math.PI * 2, v = 25 + Math.random() * 30;
    spawn({ cls: 'fx-spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 15, g: 160, life: 0.3, r0: 0.9, r1: 0.3, o0: 1 });
  };
  const ring = (x, y, r1) => spawn({ cls: 'fx-ring', x, y, life: 0.8, r0: 2, r1, o0: 0.8 });
  const chance = (rate, dt) => Math.random() < rate * dt;

  /* ---------- robots (same family as the home page Drone Hospital robots) ---------- */
  function makeRobot(back, front, rx, ry, m, k) {
    const R = { rx, ry, m, k, phase: Math.random() * 6 };
    R.back = mk('g', {}, back);
    const body = mk('g', {}, R.back);
    mk('rect', { class: 'kf', x: -11, y: -6, width: 22, height: 6, rx: 3 }, body);
    mk('circle', { class: 'k', cx: -6, cy: -3, r: 1.6 }, body);
    mk('circle', { class: 'k', cx: 6, cy: -3, r: 1.6 }, body);
    mk('rect', { class: 'kf', x: -9, y: -23, width: 18, height: 16, rx: 3 }, body);
    mk('path', { class: 'red', d: 'M-1 -18h2v2h2v2h-2v2h-2v-2h-2v-2h2z' }, body);
    R.head = mk('g', {}, body);
    mk('path', { class: 'k', d: 'M0 -23V-26' }, R.head);
    mk('rect', { class: 'kf', x: -8, y: -35, width: 16, height: 9, rx: 2.5 }, R.head);
    mk('rect', { class: 'hr-visor', x: -7, y: -33, width: 9, height: 4.5, rx: 1.5 }, R.head);
    mk('circle', { class: 'red', cx: -4.5, cy: -30.75, r: 1.1 }, R.head);
    mk('path', { class: 'k', d: 'M3 -35L5 -40' }, R.head);
    R.tip = mk('circle', { class: 'red', cx: 5, cy: -41, r: 1.5 }, R.head);
    R.front = mk('g', {}, front);
    R.upper = mk('line', { class: 'hr-arm' }, R.front);
    R.fore = mk('line', { class: 'hr-arm' }, R.front);
    R.j1 = mk('line', { class: 'hr-jaw' }, R.front);
    R.j2 = mk('line', { class: 'hr-jaw' }, R.front);
    mk('circle', { class: 'kf', cx: -9, cy: -18, r: 2 }, R.front);
    R.place = x => {
      R.rx = x;
      const t = `translate(${x.toFixed(1)} ${R.ry}) scale(${R.m * R.k} ${R.k})`;
      tf(R.back, t); tf(R.front, t);
    };
    R.place(rx);
    R.look = false;
    return R;
  }
  function robotArm(R, wx, wy, open) {
    const lx = (wx - R.rx) * R.m / R.k, ly = (wy - R.ry) / R.k;
    const sx = -9, sy = -18, A = 15, B = 14;
    const d = clamp(Math.hypot(lx - sx, ly - sy), 2, A + B - 0.2);
    const th = Math.atan2(ly - sy, lx - sx);
    const al = Math.acos(clamp((A * A + d * d - B * B) / (2 * A * d), -1, 1));
    const ea = { x: sx + A * Math.cos(th + al), y: sy + A * Math.sin(th + al) };
    const eb = { x: sx + A * Math.cos(th - al), y: sy + A * Math.sin(th - al) };
    const e = ea.y < eb.y ? ea : eb;
    const w = { x: sx + d * Math.cos(th), y: sy + d * Math.sin(th) };
    line(R.upper, sx, sy, e.x, e.y); line(R.fore, e.x, e.y, w.x, w.y);
    const ux = (w.x - e.x) / B, uy = (w.y - e.y) / B, px = -uy, py = ux, o = open == null ? 1.6 : open;
    line(R.j1, w.x, w.y, w.x + ux * 3.5 + px * o, w.y + uy * 3.5 + py * o);
    line(R.j2, w.x, w.y, w.x + ux * 3.5 - px * o, w.y + uy * 3.5 - py * o);
    R.wrist = { x: R.rx + w.x * R.m * R.k, y: R.ry + w.y * R.k };
    R.dir = { x: ux * R.m, y: uy };
  }
  const robotShoulder = R => ({ x: R.rx - 9 * R.m * R.k, y: R.ry - 18 * R.k });
  function robotIdle(R, t) {
    tf(R.head, `translate(0 ${(Math.sin(t * 1.4 + R.phase) * 0.5).toFixed(2)})${R.look ? ' scale(-1 1)' : ''}`);
    op(R.tip, Math.sin(t * 2.6 + R.phase * 2) > 0.55 ? 1 : 0.35);
  }

  /* ---------- people, side view (facing right when m = 1) ---------- */
  const HAIR = ['M-5.5 -50Q-6.5 -59 1 -58.5Q6.5 -58 7.2 -53', 'M-6 -48Q-7 -59 1 -58.5Q7 -58 7.2 -54M-6 -48l-2 7',
    'M-5.5 -50Q-6 -60 2 -58.5Q6 -57.5 7 -55h3', 'M-5.8 -51Q-5 -59 1.5 -58.5Q6.5 -58 7 -53M-7.5 -53a2 2 0 1 0 0.1 0'];
  function makePerson(back, front, x, floor, m, k, style) {
    const P = { x, floor, m, k };
    const t = `translate(${x} ${floor}) scale(${m * k} ${k})`;
    P.back = mk('g', { transform: t }, back);
    P.farArm = mk('polyline', { class: 'hu-arm', 'stroke-opacity': 0.45 }, P.back);
    mk('path', { class: 'k', d: 'M-3 0L-1 -24M3 0L1 -24' }, P.back);
    mk('rect', { class: 'kf', x: -6.5, y: -44, width: 13, height: 21, rx: 4.5 }, P.back);
    P.head = mk('g', {}, P.back);
    mk('circle', { class: 'kf', cx: 1, cy: -51, r: 6.5 }, P.head);
    mk('path', { class: 'hair', d: HAIR[style % HAIR.length] }, P.head);
    mk('circle', { class: 'ink', cx: 4.3, cy: -51.5, r: 0.9 }, P.head);
    P.front = mk('g', { transform: t }, front);
    P.nearArm = mk('polyline', { class: 'hu-arm' }, P.front);
    P.hand = mk('circle', { class: 'kf', r: 1.9 }, P.front);
    P.farHand = { x, y: floor };
    return P;
  }
  // two-link human arm, shoulder at (0,-40), elbow hangs down
  function personArm(P, which, wx, wy) {
    const lx = (wx - P.x) * P.m / P.k, ly = (wy - P.floor) / P.k;
    const sx = 0, sy = -40, A = 14, B = 13;
    const d = clamp(Math.hypot(lx - sx, ly - sy), 3, A + B - 0.2);
    const th = Math.atan2(ly - sy, lx - sx);
    const al = Math.acos(clamp((A * A + d * d - B * B) / (2 * A * d), -1, 1));
    const ea = { x: sx + A * Math.cos(th + al), y: sy + A * Math.sin(th + al) };
    const eb = { x: sx + A * Math.cos(th - al), y: sy + A * Math.sin(th - al) };
    const e = ea.y > eb.y ? ea : eb;
    const w = { x: sx + d * Math.cos(th), y: sy + d * Math.sin(th) };
    const pts = `${sx},${sy} ${e.x.toFixed(1)},${e.y.toFixed(1)} ${w.x.toFixed(1)},${w.y.toFixed(1)}`;
    if (which === 'near') {
      P.nearArm.setAttribute('points', pts);
      P.hand.setAttribute('cx', w.x.toFixed(1)); P.hand.setAttribute('cy', w.y.toFixed(1));
      P.handW = { x: P.x + w.x * P.m * P.k, y: P.floor + w.y * P.k };
    } else {
      P.farArm.setAttribute('points', pts);
      P.farHand = { x: P.x + w.x * P.m * P.k, y: P.floor + w.y * P.k };
    }
  }
  const personShoulder = P => ({ x: P.x, y: P.floor - 40 * P.k });

  /* ---------- side-view drone ---------- */
  function makeGlyph(parent) {
    const G = { g: mk('g', {}, parent) };
    G.blur = [mk('ellipse', { class: 'gl-blur', cx: -18, cy: -11.5, rx: 12, ry: 1.8 }, G.g), mk('ellipse', { class: 'gl-blur', cx: 18, cy: -11.5, rx: 12, ry: 1.8 }, G.g)];
    G.frame = mk('rect', { class: 'kf', x: -21, y: -4, width: 42, height: 3.4, rx: 1.2 }, G.g);
    G.esc = mk('path', { class: 'gl-esc', d: 'M-12 -4.6H12' }, G.g);
    G.motors = [mk('rect', { class: 'kf', x: -21, y: -10, width: 6, height: 6, rx: 1 }, G.g), mk('rect', { class: 'kf', x: 15, y: -10, width: 6, height: 6, rx: 1 }, G.g)];
    G.fc = mk('rect', { class: 'gl-fc', x: -5, y: -8.5, width: 10, height: 4, rx: 0.8 }, G.g);
    G.batt = mk('rect', { class: 'gl-batt', x: -8, y: -14.5, width: 16, height: 6, rx: 1.2 }, G.g);
    G.props = [mk('line', { class: 'gl-prop', x1: -29, y1: -11.5, x2: -7, y2: -11.5 }, G.g), mk('line', { class: 'gl-prop', x1: 7, y1: -11.5, x2: 29, y2: -11.5 }, G.g)];
    G.led = mk('circle', { class: 'gl-led', cx: 21.5, cy: -2.5, r: 1.2 }, G.g);
    return G;
  }
  // parts: {frame, motorL, motorR, esc, fc, batt, propL, propR, led}, spin: props turning
  function glyphSet(G, parts, spin, t) {
    show(G.frame, parts.frame); show(G.esc, parts.esc);
    show(G.motors[0], parts.motorL); show(G.motors[1], parts.motorR);
    show(G.fc, parts.fc); show(G.batt, parts.batt);
    const pr = [parts.propL, parts.propR];
    G.props.forEach((p, i) => {
      show(p, pr[i]);
      if (pr[i]) {
        const cx = i ? 18 : -18, half = spin ? 11 * Math.abs(Math.sin(t * 40 + i)) : 11;
        p.setAttribute('x1', cx - half); p.setAttribute('x2', cx + half);
      }
      show(G.blur[i], pr[i] && spin);
    });
    show(G.led, parts.led && (Math.sin(t * 9) > -0.3));
  }
  const ALL = { frame: 1, motorL: 1, motorR: 1, esc: 1, fc: 1, batt: 1, propL: 1, propR: 1, led: 1 };

  /* ======================================================================
     PART 107 TEST PREP (upper left)
     ====================================================================== */
  const T = (() => {
    const g = $('s-test');
    const stu = $('t-student');
    // seated student, profile facing the monitor
    const sB = mk('g', {}, stu);
    mk('path', { class: 'k', d: 'M66 431L88 431L90 461' }, sB);
    mk('rect', { class: 'kf', x: 59.5, y: 404, width: 13, height: 28, rx: 4.5, transform: 'rotate(6 66 430)' }, sB);
    const head = mk('g', {}, sB);
    mk('circle', { class: 'kf', cx: 71, cy: 396, r: 6.5 }, head);
    mk('path', { class: 'hair', d: 'M64.5 397Q63.5 388 71 388.5Q76.5 389 77.2 393' }, head);
    mk('circle', { class: 'ink', cx: 74.3, cy: 395.5, r: 0.9 }, head);
    const arm = mk('polyline', { class: 'hu-arm' }, sB);
    const hand = mk('circle', { class: 'kf', r: 1.9 }, sB);
    const arm2 = mk('polyline', { class: 'hu-arm' }, sB);
    const hand2 = mk('circle', { class: 'kf', r: 1.9 }, sB);
    const R = makeRobot($('t-robot'), $('t-robot'), 236, 462, 1, 1.4);
    const sign = mk('g', { visibility: 'hidden' }, $('t-robot'));
    mk('rect', { class: 'kf', x: -11, y: -9, width: 22, height: 11, rx: 1.5 }, sign);
    mk('text', { class: 'mono6 pass', x: -9, y: -1.5 }, sign).textContent = 'PASS';
    const clip = mk('rect', { class: 'kf', width: 7, height: 9, rx: 1 }, $('t-robot'));
    const el = { s1: $('t-s1'), s2: $('t-s2'), s3: $('t-s3'), bar: $('t-bar'), hr: $('t-hr'), mn: $('t-min') };
    const hl = mk('rect', { class: 'hl', y: 373.5, width: 6, height: 7, rx: 1 }, g);
    g.insertBefore(hl, el.s3);
    const CT = 22;
    const armTo = (A, H, sx, sy, tx, ty) => { // simple 2-link, elbow down
      const L1 = 12, L2 = 11, d = clamp(Math.hypot(tx - sx, ty - sy), 3, L1 + L2 - 0.2);
      const th = Math.atan2(ty - sy, tx - sx), al = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
      const e1 = { x: sx + L1 * Math.cos(th + al), y: sy + L1 * Math.sin(th + al) }, e2 = { x: sx + L1 * Math.cos(th - al), y: sy + L1 * Math.sin(th - al) };
      const e = e1.y > e2.y ? e1 : e2, w = { x: sx + d * Math.cos(th), y: sy + d * Math.sin(th) };
      A.setAttribute('points', `${sx},${sy} ${e.x.toFixed(1)},${e.y.toFixed(1)} ${w.x.toFixed(1)},${w.y.toFixed(1)}`);
      H.setAttribute('cx', w.x.toFixed(1)); H.setAttribute('cy', w.y.toFixed(1));
    };
    let cycle = -1, score = 87;
    return (t, abs) => {
      const c = Math.floor(abs / CT);
      if (c !== cycle) { cycle = c; score = 78 + Math.floor(rnd(c, 3) * 19); }
      // exam clock
      const a1 = t * 1.2, a2 = t * 0.1;
      line(el.mn, 214, 300, 214 + Math.sin(a1) * 7.5, 300 - Math.cos(a1) * 7.5);
      line(el.hr, 214, 300, 214 + Math.sin(a2) * 5, 300 - Math.cos(a2) * 5);
      const answering = t < 12, scoring = t >= 12 && t < 13.6, pass = t >= 13.6 && t < 20.5;
      // student
      const cheer = t > 14.2 && t < 17.8;
      const sh = { x: 68, y: 409 };
      if (cheer) {
        const w = Math.sin(t * 9) * 2;
        armTo(arm, hand, sh.x, sh.y, sh.x + 6 + w, sh.y - 22);
        armTo(arm2, hand2, sh.x - 1, sh.y, sh.x - 6 - w, sh.y - 21);
      } else {
        const typing = answering ? Math.abs(Math.sin(t * 16)) * -1.5 : 0;
        armTo(arm, hand, sh.x, sh.y, 104 + (answering ? Math.sin(t * 5) * 4 : 0), 406 + typing);
        armTo(arm2, hand2, sh.x - 1, sh.y, 98, 407);
      }
      tf(head, `translate(0 ${(answering ? Math.sin(t * 0.8) * 0.6 : cheer ? -1 : 0).toFixed(2)})`);
      // screen
      let q = Math.min(60, 1 + Math.floor((t / 12) * 60));
      if (answering) {
        text(el.s1, 'FAA PART 107'); setC(el.s1, 'mono6');
        text(el.s2, `Q ${String(q).padStart(2, '0')}/60`);
        text(el.s3, 'A  B  C  D');
        show(hl, true);
        hl.setAttribute('x', 121 + 9 * (Math.floor(rnd(q, c) * 4)));
        el.bar.setAttribute('width', (46 * q / 60).toFixed(1)); setC(el.bar, 'h-bar');
      } else if (scoring) {
        text(el.s1, 'SCORING'); setC(el.s1, 'mono6');
        text(el.s2, 'Q 60/60'); text(el.s3, '');
        show(hl, false);
        el.bar.setAttribute('width', (46 * seg(t, 12, 13.6)).toFixed(1)); setC(el.bar, 'h-bar');
      } else if (pass) {
        text(el.s1, 'PASS'); setC(el.s1, 'mono6 pass');
        text(el.s2, `SCORE ${score}%`); text(el.s3, 'REMOTE PILOT');
        show(hl, false);
        el.bar.setAttribute('width', 46); setC(el.bar, 'h-bar pass');
      } else {
        text(el.s1, 'NEXT STUDENT'); setC(el.s1, 'mono6');
        text(el.s2, ''); text(el.s3, ''); show(hl, false);
        el.bar.setAttribute('width', 0);
      }
      // proctor: clipboard while the exam runs, PASS sign after
      const up = t > 14 && t < 19.5;
      const sh2 = robotShoulder(R);
      let tg;
      if (up) tg = { x: sh2.x - 10, y: sh2.y - 34 + Math.sin(t * 6) * 1.2 };
      else tg = { x: sh2.x - 15, y: sh2.y + 4 + (answering && Math.sin(t * 0.9) > 0.7 ? Math.sin(t * 20) : 0) };
      robotArm(R, tg.x, tg.y, 0.6);
      show(sign, up); show(clip, !up);
      sign.setAttribute('transform', `translate(${(R.wrist.x).toFixed(1)} ${(R.wrist.y - 4).toFixed(1)})`);
      clip.setAttribute('x', (R.wrist.x - 6).toFixed(1)); clip.setAttribute('y', (R.wrist.y - 3).toFixed(1));
      robotIdle(R, t);
      return { pass: t >= 13.6 && t < 13.7 };
    };
  })();

  /* ======================================================================
     CLASSROOM (lower left)
     ====================================================================== */
  const C = (() => {
    const tLayer = $('c-teacher'), sLayer = $('c-students');
    const R = makeRobot(tLayer, tLayer, 170, 640, -1, 1.25);
    const pointer = mk('line', { class: 'pointer' }, tLayer);
    const phases = [$('c-A'), $('c-B'), $('c-C')];
    const labelsA = [$('c-a1'), $('c-a2'), $('c-a3'), $('c-a4')];
    const labelsC = [$('c-f1'), $('c-f2'), $('c-f3'), $('c-f4')];
    const title = $('c-title'), dot = $('c-dot');
    const PTS_A = [{ x: 291, y: 542 }, { x: 285, y: 578 }, { x: 251, y: 566 }, { x: 249, y: 557 }];
    const PTS_C = [{ x: 255, y: 536 }, { x: 255, y: 586 }, { x: 306, y: 562 }, { x: 204, y: 562 }];
    const TITLES = ['HOW A DRONE FLIES', 'BOX PATTERN', 'FOUR FORCES'];
    // students, rear view, three rows of three
    const ROWS = [{ y: 664, s: 0.8, xs: [178, 255, 332] }, { y: 718, s: 0.9, xs: [170, 255, 340] }, { y: 776, s: 1, xs: [162, 255, 348] }];
    const kids = [];
    let n = 0;
    for (const row of ROWS) {
      for (const x of row.xs) {
        const g = mk('g', { transform: `translate(${x} ${row.y}) scale(${row.s})` }, sLayer);
        mk('rect', { class: 'kf', x: -25, y: -7, width: 50, height: 5, rx: 1 }, g);
        const dg = mk('g', {}, g);
        const G = makeGlyph(dg);
        tf(G.g, 'translate(16 -7) scale(0.36)');
        const handArm = mk('path', { class: 'hu-arm', d: 'M9 -1L13 -27', visibility: 'hidden' }, g);
        const handDot = mk('circle', { class: 'kf', cx: 13.5, cy: -29.5, r: 2.6, visibility: 'hidden' }, g);
        mk('path', { class: 'kf', d: 'M-12 15V4Q-12 -6 0 -6Q12 -6 12 4V15Z' }, g);
        const head = mk('g', {}, g);
        mk('circle', { class: 'kf', cx: 0, cy: -15, r: 7.5 }, head);
        const style = n % 4;
        const hair = ['M-7.4 -13Q-8.5 -24 0 -23.5Q8.5 -24 7.4 -13', 'M-7.4 -13Q-8.5 -24 0 -23.5Q8.5 -24 7.4 -13M0 -8.5v5',
          'M-7.4 -14Q-7 -24 0 -23.5Q7 -24 7.4 -14M-4 -23l8 0', 'M-7.4 -13Q-8.5 -24 0 -23.5Q8.5 -24 7.4 -13M0 -25.5a2.5 2.5 0 1 0 0.1 0'][style];
        mk('path', { class: 'hair', d: hair }, head);
        mk('rect', { class: 'kf', x: -10, y: 4, width: 20, height: 12, rx: 2 }, g);
        kids.push({ x, y: row.y, s: row.s, head, G, dg, handArm, handDot, i: n });
        n++;
      }
    }
    const CC = 24;
    let pointT = { x: 300, y: 545 };
    return (t, abs, dt) => {
      const ph = t < 8 ? 0 : t < 16 ? 1 : 2;
      const pt = t - ph * 8;
      const c = Math.floor(abs / CC);
      phases.forEach((p, i) => op(p, i === ph ? clamp(pt / 0.5, 0, 1) * clamp((8 - pt) / 0.35, 0, 1) : 0));
      text(title, TITLES[ph]);
      op(title, clamp(pt / 0.4, 0, 1) * clamp((8 - pt) / 0.35, 0, 1));
      // where the pointer goes
      let target = null, turn = false;
      if (ph === 0) {
        const k = Math.floor((pt - 1.4) / 1.6);
        labelsA.forEach((l, i) => { op(l, pt > 1.4 + i * 1.6 ? 1 : 0); setC(l, 'cl' + (i === k ? ' on' : '')); });
        if (k >= 0 && k < 4) target = PTS_A[k];
      } else if (ph === 1) {
        // chalk drone goes round the box
        const u = seg(pt, 1, 7);
        const per = 80 * 2 + 54 * 2, d = u * per;
        let x, y;
        if (d < 54) { x = 215; y = 586 - d; } else if (d < 134) { x = 215 + (d - 54); y = 532; }
        else if (d < 188) { x = 295; y = 532 + (d - 134); } else { x = 295 - (d - 188); y = 586; }
        dot.setAttribute('cx', x.toFixed(1)); dot.setAttribute('cy', y.toFixed(1));
        if (pt > 1 && pt < 7) target = { x, y };
      } else {
        const k = Math.floor((pt - 0.5) / 1.5);
        labelsC.forEach((l, i) => { op(l, pt > 0.5 + i * 1.5 ? 1 : 0); setC(l, 'cl' + (i === k && k < 4 ? ' on' : '')); });
        if (k >= 0 && k < 4) target = PTS_C[k];
        if (pt > 5.6 && pt < 7.4) turn = true;
      }
      // teacher rolls along the front of the board
      const want = target ? clamp(target.x - 34, 150, 345) : 300;
      R.place(R.rx + (want - R.rx) * Math.min(1, (dt || 0.016) * 2.2));
      R.look = turn;
      if (target) pointT = { x: lerp(pointT.x, target.x, Math.min(1, (dt || 0.016) * 8)), y: lerp(pointT.y, target.y, Math.min(1, (dt || 0.016) * 8)) };
      const sh = robotShoulder(R);
      let tip = target ? pointT : { x: sh.x + 16, y: sh.y + 14 };
      if (turn) tip = { x: sh.x + 10, y: sh.y - 26 };
      const dx = tip.x - sh.x, dy = tip.y - sh.y, d = Math.hypot(dx, dy) || 1, L = 22;
      const reach = Math.max(4, d - L);
      robotArm(R, sh.x + dx / d * reach, sh.y + dy / d * reach, 0.4);
      line(pointer, R.wrist.x, R.wrist.y, R.wrist.x + dx / d * L, R.wrist.y + dy / d * L);
      robotIdle(R, t);
      // students: heads follow the teacher, desk drones hop together in the box lesson,
      // one student raises a hand during the forces lesson
      const asker = Math.floor(rnd(c, 9) * 9);
      const hop = ph === 1 ? seg(pt, 2.5, 3.1) * (1 - seg(pt, 5.2, 5.8)) : 0;
      for (const k of kids) {
        const look = clamp((R.rx - k.x) / 60, -2, 2) + Math.sin(t * 0.7 + k.i) * 0.4;
        tf(k.head, `translate(${look.toFixed(2)} ${(Math.sin(t * 1.1 + k.i * 1.7) * 0.4).toFixed(2)})`);
        const up = hop * (8 + Math.sin(t * 5 + k.i) * 1.2);
        tf(k.dg, `translate(0 ${(-up).toFixed(2)})`);
        glyphSet(k.G, ALL, hop > 0.05 || (ph === 1 && pt > 2.1 && pt < 6), t + k.i);
        const raised = ph === 2 && k.i === asker && pt > 4.6 && pt < 7.6;
        show(k.handArm, raised); show(k.handDot, raised);
      }
    };
  })();

  /* ======================================================================
     BUILD LAB (upper right) + FLIGHT TRAINING (lower right)
     ====================================================================== */
  const B = (() => {
    const back = $('b-back'), front = $('b-front');
    const R = makeRobot(back, front, 1400, 410, -1, 1.4);
    const S = makePerson(back, front, 1484, 424, -1, 1, 2);
    const held = mk('g', {}, front);
    const hFrame = mk('rect', { class: 'kf', x: -10, y: -2, width: 20, height: 3, rx: 1 }, held);
    const hBox = mk('rect', { class: 'kf', x: -3, y: -3, width: 6, height: 6, rx: 1 }, held);
    const hFc = mk('rect', { class: 'gl-fc', x: -4, y: -2, width: 8, height: 4, rx: 0.8 }, held);
    const hBatt = mk('rect', { class: 'gl-batt', x: -6, y: -3, width: 12, height: 5, rx: 1 }, held);
    const hProp = mk('line', { class: 'gl-prop', x1: -8, y1: 0, x2: 8, y2: 0 }, held);
    const iron = mk('line', { class: 'h-iron' }, front);
    const ironRest = $('b-iron-rest');
    const sHeld = mk('g', {}, front);
    const sMotor = mk('rect', { class: 'kf', x: -3, y: -3, width: 6, height: 6, rx: 1 }, sHeld);
    const sProp = mk('line', { class: 'gl-prop', x1: -8, y1: 0, x2: 8, y2: 0 }, sHeld);
    const sTx = mk('g', {}, front);
    mk('rect', { class: 'kf', x: -5, y: -3, width: 10, height: 6, rx: 1.5 }, sTx);
    mk('path', { class: 'k', d: 'M-3 -3l-1 -6M3 -3l1 -6' }, sTx);
    // checklist
    const list = $('b-list');
    const ITEMS = ['FRAME', 'MOTORS', 'ESC + FC', 'PROPS', 'TEST'];
    const checks = ITEMS.map((w, i) => {
      const box = mk('rect', { class: 'chk', x: 1320, y: 282 + i * 10, width: 4.5, height: 4.5, rx: 1 }, list);
      const tx = mk('text', { class: 'mono6', x: 1329, y: 286.2 + i * 10 }, list);
      tx.textContent = w;
      return { box, tx };
    });
    // flight training
    const fBack = $('f-back'), fFront = $('f-front');
    const FS = makePerson(fBack, fFront, 1182, 800, 1, 1, 0);
    const FR = makeRobot(fBack, fFront, 1238, 800, -1, 1.25);
    const fTx = mk('g', {}, fFront);
    mk('rect', { class: 'kf', x: -5, y: -3, width: 10, height: 6, rx: 1.5 }, fTx);
    mk('path', { class: 'k', d: 'M-3 -3l-1 -6M3 -3l1 -6' }, fTx);
    const rTx = mk('g', {}, fFront);
    mk('rect', { class: 'kf', x: -5, y: -3, width: 10, height: 6, rx: 1.5 }, rTx);
    mk('path', { class: 'k', d: 'M3 -3l1 -6' }, rTx);
    const cable = $('f-cable');
    const fTitle = $('f-title');
    const FITEMS = ['HOVER', 'BOX', 'FIGURE 8', 'LANDING'];
    const fChecks = FITEMS.map((w, i) => {
      const box = mk('rect', { class: 'chk', x: 1282, y: 623 + i * 11, width: 4.5, height: 4.5, rx: 1 }, $('f-list'));
      const tx = mk('text', { class: 'mono6', x: 1291, y: 627.2 + i * 11 }, $('f-list'));
      tx.textContent = w;
      return { box, tx };
    });
    // the drones (two alive at most: one on the bench, one at the field)
    const dLayer = $('e-drones');
    const drones = [makeGlyph(dLayer), makeGlyph(dLayer)];

    const CB = 26, LIFE = 46.5;
    const BIN = { x: 1389, y: 389 }, TRAY = { x: 1509, y: 392 }, IRON = { x: 1376, y: 388 };
    const DC = { x: 1440, y: 400 }; // drone origin on the bench
    const STEPS = [
      { who: 'R', part: 'frame', src: BIN, dst: { x: 1440, y: 397 }, t0: 0.6, t1: 3.0 },
      { who: 'R', part: 'motorL', src: BIN, dst: { x: 1422, y: 391 }, t0: 3.2, t1: 5.4 },
      { who: 'S', part: 'motorR', src: TRAY, dst: { x: 1458, y: 391 }, t0: 3.4, t1: 5.6 },
      { who: 'R', part: 'esc', src: IRON, dst: { x: 1438, y: 393 }, t0: 5.8, t1: 9.4, tool: true },
      { who: 'R', part: 'fc', src: BIN, dst: { x: 1440, y: 392 }, t0: 9.6, t1: 11.6 },
      { who: 'R', part: 'batt', src: BIN, dst: { x: 1440, y: 386 }, t0: 11.8, t1: 13.8 },
      { who: 'R', part: 'propL', src: BIN, dst: { x: 1422, y: 388 }, t0: 14.0, t1: 16.0 },
      { who: 'S', part: 'propR', src: TRAY, dst: { x: 1458, y: 388 }, t0: 14.2, t1: 16.4 },
    ];
    const CHECK_AT = [3.0, 5.6, 11.6, 16.4, 20];
    const PAD = { x: 1330, y: 798 };
    const FLY = 0.7;

    // where a drone is at time t of its life
    function dronePose(t) {
      if (t < 18.2) return { x: DC.x, y: DC.y, s: 1, rot: 0, where: 'bench' };
      if (t < 21) { // lift off the bench and hover
        const u = ease(seg(t, 18.2, 19));
        return { x: DC.x, y: DC.y - 34 * u + Math.sin(t * 6) * 1.2 * u, s: 1, rot: Math.sin(t * 4) * 3 * u, where: 'bench' };
      }
      if (t < 24.5) { // fly down to the training pad
        const u = ease(seg(t, 21, 24.5)), v = 1 - u;
        const p0 = { x: DC.x, y: DC.y - 34 }, c1 = { x: 1585, y: 470 }, p1 = { x: PAD.x, y: PAD.y };
        return { x: v * v * p0.x + 2 * v * u * c1.x + u * u * p1.x, y: v * v * p0.y + 2 * v * u * c1.y + u * u * p1.y, s: lerp(1, FLY, u), where: 'air' };
      }
      // the lesson
      const wob = 3.2 * (1 - seg(t, 25.5, 40));
      const jx = Math.sin(t * 7.3) * wob, jy = Math.sin(t * 5.1) * wob * 0.6;
      const H = { x: PAD.x, y: 740 };
      let x, y;
      if (t < 25.5) { x = PAD.x; y = PAD.y; }
      else if (t < 27) { const u = ease(seg(t, 25.5, 27)); x = PAD.x; y = lerp(PAD.y, H.y, u); }
      else if (t < 30) { x = H.x; y = H.y; }
      else if (t < 35) {
        const u = seg(t, 30, 35) * 4, k = Math.floor(Math.min(u, 3.999)), f = ease(u - k);
        const P = [[1330, 740], [1330, 640], [1500, 640], [1500, 740], [1330, 740]];
        x = lerp(P[k][0], P[k + 1][0], f); y = lerp(P[k][1], P[k + 1][1], f);
      } else if (t < 40) {
        const a = 2 * Math.PI * seg(t, 35, 40);
        x = 1415 - 85 * Math.cos(a); y = 740 - 35 * Math.sin(2 * a);
      } else if (t < 42) { const u = ease(seg(t, 40, 42)); x = PAD.x; y = lerp(H.y, PAD.y, u); }
      else if (t < 44) { x = PAD.x; y = PAD.y; }
      else { const u = ease(seg(t, 44, 46.5)); x = lerp(PAD.x, 1660, u); y = lerp(PAD.y, 560, Math.sqrt(u)); }
      const flying = t > 25.6 && t < 41.9 || t > 44;
      return { x: x + (flying && t < 42 ? jx : 0), y: y + (flying && t < 42 ? jy : 0), s: FLY, where: 'field', flying };
    }

    let prevBench = null;
    return (abs, dt) => {
      const k0 = Math.floor(abs / CB);
      let bench = null, field = null;
      for (let k = k0; k >= k0 - 1; k--) {
        const t = abs - k * CB;
        if (t < 0 || t >= LIFE) continue;
        if (t < 21) bench = { k, t }; else field = { k, t };
      }
      // draw drones
      drones.forEach((G, slot) => {
        const who = [bench, field].find(d => d && d.k % 2 === slot);
        show(G.g, !!who);
        if (!who) return;
        const t = who.t, P = dronePose(t);
        const parts = {};
        for (const st of STEPS) parts[st.part] = t >= st.t0 + 0.7 * (st.t1 - st.t0);
        parts.led = t > 16.8;
        const spin = t > 17.5 && !(t > 24.4 && t < 25.4) && !(t > 41.9 && t < 44);
        glyphSet(G, parts, spin, t + slot);
        let rot = P.rot || 0;
        if (P.where !== 'bench') {
          const Q = dronePose(t + 0.06);
          rot = clamp((Q.x - P.x) / 0.06 * 0.12, -22, 22);
        }
        tf(G.g, `translate(${P.x.toFixed(1)} ${P.y.toFixed(1)}) scale(${P.s.toFixed(3)}) rotate(${rot.toFixed(1)})`);
      });

      /* bench: robot and student */
      const bt = bench ? bench.t : 99;
      const rs = { x: 1418, y: 396 + Math.sin(abs * 1.4) }, ss = { x: 1472, y: 398 };
      let rT = rs, rOpen = 1.6, rHeld = null, sT = ss, sHeldPart = null, tool = false;
      for (const st of STEPS) {
        if (bt < st.t0 || bt > st.t1) continue;
        const u = (bt - st.t0) / (st.t1 - st.t0);
        const rest = st.who === 'R' ? rs : ss;
        const kp = st.tool
          ? keyPath(u, [[0, rest.x, rest.y], [0.15, st.src.x, st.src.y], [0.25, st.src.x, st.src.y], [0.35, st.dst.x, st.dst.y - 3], [0.85, st.dst.x, st.dst.y - 3], [0.92, st.src.x, st.src.y], [1, rest.x, rest.y]])
          : keyPath(u, [[0, rest.x, rest.y], [0.25, st.src.x, st.src.y], [0.35, st.src.x, st.src.y], [0.65, st.dst.x, st.dst.y - 3], [0.75, st.dst.x, st.dst.y - 3], [1, rest.x, rest.y]]);
        const holding = st.tool ? u > 0.2 && u < 0.9 : u > 0.3 && u < 0.7;
        if (st.who === 'R') {
          rT = kp; rOpen = holding ? 0.6 : 1.8;
          if (holding) { if (st.tool) tool = true; else rHeld = st.part; }
          if (st.tool && u > 0.38 && u < 0.84) {
            rT = { x: kp.x + Math.sin(abs * 30) * 0.6, y: kp.y };
            if (chance(5, dt)) smoke(st.dst.x - 2, st.dst.y - 4);
            if (chance(9, dt)) spark(st.dst.x - 2, st.dst.y - 2);
          }
        } else {
          sT = kp;
          if (holding) sHeldPart = st.part;
        }
      }
      // test: student holds the radio, robot gives a thumbs-up, everyone watches it fly off
      const testing = bt > 16.6 && bt < 21;
      if (testing) {
        sT = { x: 1470, y: 392 };
        if (bt > 19.2) rT = { x: 1416, y: 366 + Math.sin(abs * 8) * 1.5 };
      }
      robotArm(R, rT.x, rT.y, rOpen);
      personArm(S, 'near', sT.x, sT.y);
      personArm(S, 'far', testing ? 1468 : ss.x + 4, testing ? 394 : ss.y + 2);
      S.head && tf(S.head, `translate(0 ${(Math.sin(abs * 1.2) * 0.4).toFixed(2)})`);
      // held parts
      const RH = { frame: hFrame, motorL: hBox, fc: hFc, batt: hBatt, propL: hProp };
      for (const key in RH) show(RH[key], rHeld === key);
      tf(held, `translate(${(R.wrist.x + R.dir.x * 4).toFixed(1)} ${(R.wrist.y + R.dir.y * 4 + 2).toFixed(1)})`);
      show(iron, tool); show(ironRest, !tool);
      if (tool) line(iron, R.wrist.x, R.wrist.y, R.wrist.x + R.dir.x * 10, R.wrist.y + R.dir.y * 10 + 3);
      show(sMotor, sHeldPart === 'motorR'); show(sProp, sHeldPart === 'propR');
      tf(sHeld, `translate(${S.handW.x.toFixed(1)} ${(S.handW.y + 1).toFixed(1)})`);
      show(sTx, testing);
      tf(sTx, `translate(${S.handW.x.toFixed(1)} ${(S.handW.y).toFixed(1)})`);
      R.look = false;
      robotIdle(R, abs);
      checks.forEach((c, i) => {
        const on = bt >= CHECK_AT[i] && bt < 26;
        setC(c.box, on ? 'chk on' : 'chk');
        setC(c.tx, on ? 'mono6 done' : 'mono6');
      });
      if (bench && prevBench && bench.t >= 20 && prevBench < 20) ring(DC.x, DC.y - 40, 14);
      prevBench = bench ? bench.t : null;

      /* field: student, instructor, trainer cable */
      const ft = field ? field.t : -1;
      const FP = field ? dronePose(ft) : null;
      const ok = ft >= 42 && ft < 44.5;
      const sh = personShoulder(FS);
      const steer = FP && FP.flying ? clamp((dronePose(ft + 0.06).x - FP.x) / 0.06 * 0.02, -1.5, 1.5) : 0;
      if (ok) {
        const w = Math.sin(abs * 9) * 2;
        personArm(FS, 'near', sh.x + 8 + w, sh.y - 20);
        personArm(FS, 'far', sh.x + 2 - w, sh.y - 21);
      } else {
        personArm(FS, 'near', sh.x + 13 + steer, sh.y + 10);
        personArm(FS, 'far', sh.x + 11 - steer, sh.y + 11);
      }
      tf(fTx, `translate(${((FS.handW.x + FS.farHand.x) / 2).toFixed(1)} ${(Math.min(FS.handW.y, FS.farHand.y) + 1).toFixed(1)})`);
      show(fTx, !ok);
      const rsh = robotShoulder(FR);
      const point = FP && FP.flying && ft > 30 && ft < 40 && Math.sin(abs * 0.9) > 0.3;
      if (ok) robotArm(FR, rsh.x + 6, rsh.y - 30 + Math.sin(abs * 8) * 1.5, 0.5);
      else if (point) robotArm(FR, rsh.x + 22, rsh.y - 22, 0.5);
      else robotArm(FR, rsh.x + 12, rsh.y + 6, 0.5);
      tf(rTx, `translate(${(FR.wrist.x + 3).toFixed(1)} ${(FR.wrist.y + 1).toFixed(1)})`);
      show(rTx, !ok && !point);
      const a = { x: (FS.handW.x + FS.farHand.x) / 2, y: Math.min(FS.handW.y, FS.farHand.y) + 4 };
      const b = { x: FR.wrist.x + 3, y: FR.wrist.y + 4 };
      cable.setAttribute('d', `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${((a.x + b.x) / 2).toFixed(1)} ${(Math.max(a.y, b.y) + 16).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
      robotIdle(FR, abs);
      const FCHK = [30, 35, 40, 42];
      fChecks.forEach((c, i) => {
        const on = ft >= FCHK[i];
        setC(c.box, on ? 'chk on' : 'chk');
        setC(c.tx, on ? 'mono6 done' : 'mono6');
      });
      if (field) text(fTitle, `LESSON ${String((field.k % 9) + 1).padStart(2, '0')}`);
      else text(fTitle, 'FIELD OPEN');
      if (field && ft >= 42 && ft - dt < 42) ring(PAD.x, PAD.y - 4, 18);
    };
  })();

  /* ---------- main loop ---------- */
  let simT = reduce ? 15.2 : 0;
  function update(dt) {
    T(((simT + 3) % 22 + 22) % 22, simT + 3);
    C(((simT + 2) % 24 + 24) % 24, simT + 2, dt);
    B(simT + 30, dt);
    stepFx(dt);
  }
  if (reduce) { update(0.5); update(0); return; }

  let raf = 0, last = 0, onScreen = true;
  const phone = window.matchMedia('(max-width: 768px)'); // scenes are hidden on phones
  const frame = now => {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    if (!phone.matches) { simT += dt; update(dt); }
    raf = onScreen ? requestAnimationFrame(frame) : 0;
  };
  update(0);
  raf = requestAnimationFrame(frame);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      onScreen = entries[0].isIntersecting;
      if (onScreen && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    }).observe(document.getElementById('top'));
  }
  document.addEventListener('visibilitychange', () => { last = 0; });
})();
