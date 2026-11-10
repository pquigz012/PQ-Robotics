/* PQ Robotics Education hero: two matching panels either side of the headline.
   Left, Classroom: a robot teacher works through three lessons on the chalkboard while
   a grid of students with desk drones follows along.
   Right, Flight Training: the lesson board ticks off hover, box, figure 8 and landing while
   a student flies with a robot instructor on a trainer cable.
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
  const ring = (x, y, r1) => spawn({ cls: 'fx-ring', x, y, life: 0.8, r0: 2, r1, o0: 0.8 });

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
     CLASSROOM (left panel)
     ====================================================================== */
  // the board, its lessons and the teacher are drawn at 0.8 scale inside #c-board
  const BOARD = { x: 30, y: 220, s: 0.8, ox: 130, oy: 508 };
  const boardToWorldX = x => BOARD.x + (x - BOARD.ox) * BOARD.s;
  const C = (() => {
    const R = makeRobot($('c-teacher'), $('c-teacher'), 300, 640, -1, 1.25);
    const pointer = mk('line', { class: 'pointer' }, $('c-teacher'));
    const phases = [$('c-A'), $('c-B'), $('c-C')];
    const labelsA = [$('c-a1'), $('c-a2'), $('c-a3'), $('c-a4')];
    const labelsC = [$('c-f1'), $('c-f2'), $('c-f3'), $('c-f4')];
    const title = $('c-title'), dot = $('c-dot');
    const PTS_A = [{ x: 291, y: 542 }, { x: 285, y: 578 }, { x: 251, y: 566 }, { x: 249, y: 557 }];
    const PTS_C = [{ x: 255, y: 536 }, { x: 255, y: 586 }, { x: 306, y: 562 }, { x: 204, y: 562 }];
    const TITLES = ['HOW A DRONE FLIES', 'BOX PATTERN', 'FOUR FORCES'];
    // students: an even grid, five rows of three, everyone facing the board
    const COLS = [64, 130, 196], ROWS = [368, 453, 538, 623, 708], SC = 1.1;
    const HAIRS = ['M-7.4 -13Q-8.5 -24 0 -23.5Q8.5 -24 7.4 -13', 'M-7.4 -13Q-8.5 -24 0 -23.5Q8.5 -24 7.4 -13M0 -8.5v5',
      'M-7.4 -14Q-7 -24 0 -23.5Q7 -24 7.4 -14M-4 -23l8 0', 'M-7.4 -13Q-8.5 -24 0 -23.5Q8.5 -24 7.4 -13M0 -25.5a2.5 2.5 0 1 0 0.1 0'];
    const kids = [];
    let n = 0;
    for (const y of ROWS) {
      for (const x of COLS) {
        const g = mk('g', { transform: `translate(${x} ${y}) scale(${SC})` }, $('c-students'));
        mk('rect', { class: 'kf', x: -25, y: -7, width: 50, height: 5, rx: 1 }, g);
        const dg = mk('g', {}, g);
        const G = makeGlyph(dg);
        tf(G.g, 'translate(16 -7) scale(0.36)');
        const handArm = mk('path', { class: 'hu-arm', d: 'M9 -1L13 -27', visibility: 'hidden' }, g);
        const handDot = mk('circle', { class: 'kf', cx: 13.5, cy: -29.5, r: 2.6, visibility: 'hidden' }, g);
        mk('path', { class: 'kf', d: 'M-12 15V4Q-12 -6 0 -6Q12 -6 12 4V15Z' }, g);
        const head = mk('g', {}, g);
        mk('circle', { class: 'kf', cx: 0, cy: -15, r: 7.5 }, head);
        mk('path', { class: 'hair', d: HAIRS[(n * 7) % 4] }, head);
        mk('rect', { class: 'kf', x: -10, y: 4, width: 20, height: 12, rx: 2 }, g);
        kids.push({ x, y, head, G, dg, handArm, handDot, i: n });
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
      let target = null, turn = false;
      if (ph === 0) {
        const k = Math.floor((pt - 1.4) / 1.6);
        labelsA.forEach((l, i) => { op(l, pt > 1.4 + i * 1.6 ? 1 : 0); setC(l, 'cl' + (i === k ? ' on' : '')); });
        if (k >= 0 && k < 4) target = PTS_A[k];
      } else if (ph === 1) {
        const u = seg(pt, 1, 7), d = u * 268;
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
      const step = Math.min(1, (dt || 0.016) * 2.2);
      const want = target ? clamp(target.x - 34, 150, 345) : 300;
      R.place(R.rx + (want - R.rx) * step);
      R.look = turn;
      if (target) {
        const f = Math.min(1, (dt || 0.016) * 8);
        pointT = { x: lerp(pointT.x, target.x, f), y: lerp(pointT.y, target.y, f) };
      }
      const sh = robotShoulder(R);
      let tip = target ? pointT : { x: sh.x + 16, y: sh.y + 14 };
      if (turn) tip = { x: sh.x + 10, y: sh.y - 26 };
      const dx = tip.x - sh.x, dy = tip.y - sh.y, d = Math.hypot(dx, dy) || 1, L = 22;
      const reach = Math.max(4, d - L);
      robotArm(R, sh.x + dx / d * reach, sh.y + dy / d * reach, 0.4);
      line(pointer, R.wrist.x, R.wrist.y, R.wrist.x + dx / d * L, R.wrist.y + dy / d * L);
      robotIdle(R, t);
      // students look toward the teacher; desk drones hop together in the box lesson;
      // one student raises a hand during the forces lesson
      const teacherX = boardToWorldX(R.rx);
      const asker = Math.floor(rnd(c, 9) * kids.length);
      const hop = ph === 1 ? seg(pt, 2.5, 3.1) * (1 - seg(pt, 5.2, 5.8)) : 0;
      for (const k of kids) {
        const look = clamp((teacherX - k.x) / 50, -2, 2) + Math.sin(t * 0.7 + k.i) * 0.4;
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
     FLIGHT TRAINING (right panel)
     ====================================================================== */
  const F = (() => {
    const fBack = $('f-back'), fFront = $('f-front');
    const GROUND = 706;
    const FS = makePerson(fBack, fFront, 1392, GROUND, 1, 1, 0);
    const FR = makeRobot(fBack, fFront, 1444, GROUND, -1, 1.25);
    const fTx = mk('g', {}, fFront);
    mk('rect', { class: 'kf', x: -5, y: -3, width: 10, height: 6, rx: 1.5 }, fTx);
    mk('path', { class: 'k', d: 'M-3 -3l-1 -6M3 -3l1 -6' }, fTx);
    const rTx = mk('g', {}, fFront);
    mk('rect', { class: 'kf', x: -5, y: -3, width: 10, height: 6, rx: 1.5 }, rTx);
    mk('path', { class: 'k', d: 'M3 -3l1 -6' }, rTx);
    const cable = $('f-cable'), fTitle = $('f-title'), prog = $('f-prog');
    // lesson board: two columns of checks
    const FITEMS = ['HOVER', 'BOX', 'FIGURE 8', 'LANDING'];
    const fChecks = FITEMS.map((w, i) => {
      const x = i % 2 ? 1472 : 1380, y = i < 2 ? 246 : 263;
      const box = mk('rect', { class: 'chk', x, y: y - 5, width: 5.5, height: 5.5, rx: 1 }, $('f-list'));
      const tx = mk('text', { class: 'chalk', x: x + 10, y }, $('f-list'));
      tx.textContent = w;
      return { box, tx };
    });
    const G = makeGlyph($('e-drones'));
    const PAD = { x: 1520, y: GROUND - 2 }, H = { x: 1520, y: 630 }, FIG = { x: 1465, y: 420 }, S = 0.7;
    const FL = 22;
    const CHK = [5.5, 10.5, 15.5, 17.5];

    function pose(t) {
      let x = PAD.x, y = PAD.y;
      if (t < 1) { /* parked on the pad */ }
      else if (t < 2.5) y = lerp(PAD.y, H.y, ease(seg(t, 1, 2.5)));
      else if (t < 5.5) y = H.y;
      else if (t < 10.5) {
        const u = seg(t, 5.5, 10.5) * 4, k = Math.floor(Math.min(u, 3.999)), f = ease(u - k);
        const P = [[1520, 630], [1520, 500], [1415, 500], [1415, 630], [1520, 630]];
        x = lerp(P[k][0], P[k + 1][0], f); y = lerp(P[k][1], P[k + 1][1], f);
      } else if (t < 11.2) y = lerp(H.y, FIG.y, ease(seg(t, 10.5, 11.2)));
      else if (t < 15.5) {
        const a = 2 * Math.PI * seg(t, 11.2, 15.5);
        x = FIG.x + 55 * Math.cos(a); y = FIG.y - 45 * Math.sin(2 * a);
      } else if (t < 17.5) y = lerp(FIG.y, PAD.y, ease(seg(t, 15.5, 17.5)));
      const flying = t > 1.05 && t < 17.45;
      const wob = flying ? 3.2 * (1 - seg(t, 1, 15.5)) : 0;
      return { x: x + Math.sin(t * 7.3) * wob, y: y + Math.sin(t * 5.1) * wob * 0.6, flying };
    }

    const plans = [$('f-ghover'), $('f-gbox'), $('f-gfig')];
    let prevT = -1;
    return (abs) => {
      const t = ((abs % FL) + FL) % FL, lesson = Math.floor(abs / FL);
      const P = pose(t), Q = pose(Math.min(t + 0.06, FL - 0.01));
      glyphSet(G, ALL, P.flying || (t > 0.5 && t < 1.05), abs);
      const rot = P.flying ? clamp((Q.x - P.x) / 0.06 * 0.12, -22, 22) : 0;
      tf(G.g, `translate(${P.x.toFixed(1)} ${P.y.toFixed(1)}) scale(${S}) rotate(${rot.toFixed(1)})`);

      const ok = t >= 17.5 && t < 19.8;
      const sh = personShoulder(FS);
      const steer = P.flying ? clamp((Q.x - P.x) / 0.06 * 0.02, -1.5, 1.5) : 0;
      if (ok) {
        const w = Math.sin(abs * 9) * 2;
        personArm(FS, 'near', sh.x + 8 + w, sh.y - 20);
        personArm(FS, 'far', sh.x + 2 - w, sh.y - 21);
      } else {
        personArm(FS, 'near', sh.x + 13 + steer, sh.y + 10);
        personArm(FS, 'far', sh.x + 11 - steer, sh.y + 11);
      }
      tf(FS.head, `translate(0 0) rotate(${P.flying ? -8 : 0} 1 -51)`);
      tf(fTx, `translate(${((FS.handW.x + FS.farHand.x) / 2).toFixed(1)} ${(Math.min(FS.handW.y, FS.farHand.y) + 1).toFixed(1)})`);
      show(fTx, !ok);
      const rsh = robotShoulder(FR);
      const point = P.flying && t > 5.5 && t < 15.5 && Math.sin(abs * 0.9) > 0.3;
      if (ok) robotArm(FR, rsh.x + 6, rsh.y - 30 + Math.sin(abs * 8) * 1.5, 0.5);
      else if (point) robotArm(FR, rsh.x + 20, rsh.y - 24, 0.5);
      else robotArm(FR, rsh.x + 12, rsh.y + 6, 0.5);
      tf(rTx, `translate(${(FR.wrist.x + 3).toFixed(1)} ${(FR.wrist.y + 1).toFixed(1)})`);
      show(rTx, !ok && !point);
      const a = { x: (FS.handW.x + FS.farHand.x) / 2, y: Math.min(FS.handW.y, FS.farHand.y) + 4 };
      const b = { x: FR.wrist.x + 3, y: FR.wrist.y + 4 };
      cable.setAttribute('d', `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${((a.x + b.x) / 2).toFixed(1)} ${(Math.max(a.y, b.y) + 14).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
      robotIdle(FR, abs);
      let done = 0;
      fChecks.forEach((c, i) => {
        const on = t >= CHK[i] && t < 20.5;
        if (on) done++;
        setC(c.box, on ? 'chk on' : 'chk');
      });
      prog.setAttribute('width', (180 * (t < 20.5 ? seg(t, 1, 17.5) : 0)).toFixed(1));
      text(fTitle, `LESSON ${String((lesson % 9) + 1).padStart(2, '0')} · ${done}/4`);
      // the planned path for the current maneuver, drawn faintly in the cage
      const cur = t < 5.5 ? 0 : t < 10.5 ? 1 : t < 15.5 ? 2 : -1;
      plans.forEach((pl, i) => op(pl, i === cur && t > 0.6 ? 1 : 0));
      if (prevT >= 0 && prevT < 17.5 && t >= 17.5) ring(PAD.x, PAD.y - 4, 18);
      prevT = t;
    };
  })();

  /* ---------- main loop ---------- */
  let simT = reduce ? 4.5 : 0;
  function update(dt) {
    C(((simT + 2) % 24 + 24) % 24, simT + 2, dt);
    F(simT + 4);
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
