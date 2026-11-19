/* PQ Robotics holiday shop: hero scenes and shelf robots.
   The robots are the home page Drone Hospital crew (tank tracks, pincher arm,
   red cross on the chest), dressed for the holidays. Same body as drawRobot in
   drone-hospital-line.js (published B1 version).
   Four looks, picked with ?look=1|2|3|4 (set on <html data-look> in the page head):
   4 North Pole parts yard (default), 1 Workshop (Bay 04 gift wrap line),
   2 Spec sheet (drawing + garland), 3 Snow globe. */
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
    const lug = mk('rect', { class: 'k thin lug', x: -12.9, y: -8.9, width: 25.8, height: 9.8, rx: 4.9 }, g);
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
    if (o.elf) mk('path', { class: 'kf ear', d: 'M8.2 -36.6L15.2 -41.6L11.2 -33.4L8.2 -32.2Z' }, head);
    mk('circle', { class: 'kf', cx: 8.6, cy: -34.2, r: 1.8 }, head);
    mk('circle', { class: 'ink', cx: 8.9, cy: -34.2, r: 0.55 }, head);
    mk('rect', { class: 'kf', x: -8.5, y: -39.2, width: 17, height: 10, rx: 3 }, head);
    const visor = mk('rect', { class: 'visor', x: -7.3, y: -36.8, width: 10.5, height: 4.8, rx: 2.2 }, head);
    mk('circle', { class: 'red eye', cx: -4.4, cy: -34.4, r: 1.15 }, head);
    mk('path', { class: 'k thin', d: 'M-1.6 -35.8h3.4M4.6 -36.7v4.6M6.2 -36.7v4.6M-6 -30.6h4' }, head);
    if (o.elf) {
      const c = o.elf === 'r' ? ['elf-r', 'elf-g'] : ['elf-g', 'elf-r'];
      mk('path', { class: 'elfhat ' + c[0], d: 'M-8.2 -40.6C-6.5 -46.5 -2.5 -51.5 4 -55C8 -57 12.6 -56.8 15.4 -54.2C12 -54.4 9 -52.6 7.2 -49.6C6 -46.8 6.8 -43.4 8.2 -40.6Z' }, head);
      mk('path', { class: 'elfband ' + c[1], d: 'M-9.2 -43.2H9.2V-40.8L7.4 -38.6L5.6 -40.8L3.7 -38.6L1.9 -40.8L0 -38.6L-1.9 -40.8L-3.7 -38.6L-5.6 -40.8L-7.4 -38.6L-9.2 -40.8Z' }, head);
      mk('circle', { class: 'bell', cx: 15.8, cy: -53.4, r: 1.9 }, head);
    } else if (o.hat) {
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
    if (o.elf) {
      const c = o.elf === 'r' ? 'elf-g' : 'elf-r';
      mk('path', { class: 'collar ' + c, d: 'M-6.4 -29.9H6.4L5.4 -27L4 -28.8L2.6 -26.4L1.3 -28.6L0 -26.2L-1.3 -28.6L-2.6 -26.4L-4 -28.8L-5.4 -27Z' }, g);
      mk('rect', { class: 'elfbelt', x: -9, y: -14.3, width: 18, height: 2.6 }, g);
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
    const R = { x, y, s, f, g, fr, lug, head, visor, upper, fore, j1, j2, elbow, w: { x: 0, y: 0 }, u: { x: 1, y: 0 } };
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
  function place(R, x, f) {     // drive along the ground; the track lugs roll
    R.roll = (R.roll || 0) - ((x - R.x) * f) / R.s;
    R.lug.style.strokeDashoffset = R.roll.toFixed(2);
    R.x = x; R.f = f;
    const tf = `translate(${x.toFixed(1)} ${R.y}) scale(${f * R.s} ${R.s})`;
    R.g.setAttribute('transform', tf); R.fr.setAttribute('transform', tf);
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
  function part(parent, kind) {           // origin at the bottom centre
    const g = mk('g', { class: 'part' }, parent);
    if (kind === 'a1') carton(g, 28, 22);
    else if (kind === 'gift') gift(g, 24, 16, 'g-red');
    else if (kind === 'gift2') gift(g, 22, 18, 'g-gold');
    else if (kind === 'prop') {
      mk('path', { class: 'p-prop', d: 'M-15 -3C-9 -7 -3 -5 0 -3.5C3 -2 9 0 15 -4C11 1 4 1 0 -0.6C-3 -2 -9 -2 -15 -3Z' }, g);
      mk('circle', { class: 'p-hub', cx: 0, cy: -2.2, r: 2.4 }, g);
    } else if (kind === 'batt') {
      mk('rect', { class: 'p-batt', x: -9, y: -22, width: 18, height: 22, rx: 2.5 }, g);
      mk('rect', { class: 'p-batt', x: -4, y: -24.5, width: 8, height: 3, rx: 1 }, g);
      mk('path', { class: 'p-bolt', d: 'M1.5 -18L-3.5 -10H0.5L-1.5 -4L4 -12.5H0Z' }, g);
    } else {
      mk('rect', { class: 'p-motor', x: -8, y: -16, width: 16, height: 16, rx: 1.5 }, g);
      mk('ellipse', { class: 'p-motor', cx: 0, cy: -16, rx: 8, ry: 2.6 }, g);
      mk('path', { class: 'p-coil', d: 'M-6 -12.5H6M-6 -9H6M-6 -5.5H6' }, g);
      mk('path', { class: 'p-shaft', d: 'M0 -18.6V-22' }, g);
    }
    return g;
  }


  // Santa's sleigh: red body with gold scrollwork and snowflakes, curled front and back,
  // gold runners with curls, a sack and a pile of presents. Faces left. Origin at the runner bottom centre.
  function snowflake(p, x, y, r, cls) {
    let d = '';
    for (let a = 0; a < 3; a++) {
      const c = Math.cos(a * Math.PI / 3), sn = Math.sin(a * Math.PI / 3);
      d += `M${(x - c * r).toFixed(1)} ${(y - sn * r).toFixed(1)}L${(x + c * r).toFixed(1)} ${(y + sn * r).toFixed(1)}`;
      for (const k of [-1, 1]) {
        const bx = x + k * c * r * 0.6, by = y + k * sn * r * 0.6, b = r * 0.32;
        for (const t of [-0.6, 0.6]) {
          const ang = Math.atan2(k * sn, k * c) + Math.PI + t;
          d += `M${bx.toFixed(1)} ${by.toFixed(1)}l${(Math.cos(ang) * b).toFixed(1)} ${(Math.sin(ang) * b).toFixed(1)}`;
        }
      }
    }
    mk('path', { class: cls || 'flk', d }, p);
  }
  function fancySleigh(back, body, x, y, s) {
    const tf = `translate(${x} ${y}) scale(${s})`;
    const B = mk('g', { transform: tf }, back), F = mk('g', { class: 'fsl', transform: tf }, body);
    // what's already aboard: blanket, sack and presents
    mk('path', { class: 'blanket', d: 'M30 -58C34 -76 54 -84 66 -78C76 -74 74 -62 70 -58Z' }, B);
    mk('path', { class: 'sack', d: 'M-44 -56C-56 -86 -40 -114 -16 -116C-6 -128 14 -126 16 -114C34 -104 36 -76 26 -56Z' }, B);
    mk('path', { class: 'sack-fold', d: 'M-26 -64C-32 -84 -26 -100 -14 -108M4 -62C8 -80 6 -96 12 -106' }, B);
    mk('path', { class: 'sack-tie', d: 'M-14 -112Q0 -106 14 -112' }, B);
    const box = (bx, by, w, h, tone, rot) => { const g = mk('g', { transform: `translate(${bx} ${by}) rotate(${rot || 0})` }, B); gift(g, w, h, tone); };
    box(-4, -116, 16, 13, 'g-teal', -6); box(16, -112, 13, 11, 'g-red', 8); box(-24, -110, 12, 10, 'g-gold', -10);
    box(52, -58, 20, 24, 'g-white'); box(40, -56, 14, 12, 'g-teal', 4);
    box(-70, -60, 14, 12, 'g-green', -4);
    box(54, -87, 13, 10, 'g-red', -6); box(70, -64, 12, 16, 'g-gold', 3);
    box(-50, -60, 15, 13, 'g-teal', 3); box(-32, -58, 17, 11, 'g-white', -2); box(26, -60, 13, 14, 'g-gold', -4);
    // body
    mk('path', { class: 'fs-body', d: 'M74 -30H-62C-88 -30 -104 -50 -104 -72C-104 -92 -90 -103 -77 -101C-63 -99 -61 -85 -69 -79L-64 -58H44C50 -78 63 -95 81 -97C97 -98 105 -84 99 -74C95 -67 87 -67 85 -73L93 -50C95 -38 88 -30 74 -30Z' }, F);
    mk('path', { class: 'fs-shade', d: 'M-62 -30H74C88 -30 95 -38 93 -50L91 -44C86 -38 80 -36 72 -36H-58C-80 -36 -96 -50 -100 -66C-100 -48 -84 -30 -62 -30Z' }, F);
    // gold trim and scrolls
    mk('path', { class: 'fs-gold', d: 'M-69 -79L-64 -58H44C50 -78 63 -95 81 -97M-64 -58C-64 -50 -60 -42 -52 -40H80' }, F);
    mk('path', { class: 'fs-gold', d: 'M-69 -79C-61 -85 -63 -99 -77 -101C-91 -103 -104 -91 -104 -72C-104 -50 -88 -30 -62 -30H74C88 -30 95 -38 93 -50L85 -73C87 -67 95 -67 99 -74C105 -84 97 -98 81 -97' }, F);
    mk('path', { class: 'fs-gold thin', d: 'M-80 -88C-74 -94 -66 -88 -70 -82C-73 -78 -80 -80 -78 -85M86 -86C92 -90 98 -84 94 -79C91 -76 86 -78 88 -82' }, F);
    mk('path', { class: 'fs-gold thin', d: 'M-90 -60C-84 -72 -74 -70 -76 -62C-77 -57 -84 -58 -82 -63M60 -46C66 -56 76 -54 74 -46M-40 -46C-30 -54 -18 -54 -12 -46M4 -46C14 -54 26 -54 32 -46' }, F);
    for (const [fx, fy, r] of [[-84, -46, 6], [-58, -48, 4.2], [-26, -40, 5.5], [10, -40, 4.6], [44, -42, 5.5], [76, -60, 4.2], [-92, -80, 3.6]]) snowflake(F, fx, fy, r, 'fs-flk');
    // runners with curls, and scroll struts
    mk('path', { class: 'fs-run', d: 'M-92 -6H82C98 -6 106 -16 101 -25C97 -32 88 -30 90 -23C91 -19 96 -20 96 -23M-92 -6C-106 -6 -114 -18 -108 -26C-103 -32 -95 -28 -97 -22C-98 -18 -103 -19 -103 -22' }, F);
    for (const sx of [-62, -10, 42]) mk('path', { class: 'fs-strut', d: `M${sx} -30C${sx - 12} -28 ${sx - 12} -16 ${sx - 3} -15C${sx + 3} -14 ${sx + 3} -21 ${sx - 2} -21M${sx - 3} -15C${sx + 6} -12 ${sx + 8} -8 ${sx + 6} -6` }, F);
    mk('path', { class: 'fs-strut', d: 'M-36 -30C-30 -22 -22 -22 -18 -28M16 -30C22 -22 30 -22 34 -28M66 -30C70 -24 76 -22 80 -24' }, F);
    return { x, y, s };
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


  /* ---------- look 4: North Pole parts yard (default) ---------- */
  function northPole(svg) {
    svg.setAttribute('viewBox', '0 0 640 440');
    svg.setAttribute('aria-label', 'North Pole parts yard: Drone Hospital robots dressed as elves carry drone parts and gifts from a snowy building marked North Pole and load them onto a sleigh, while an Antigravity A1 drone hovers above with the price tag.');
    const defs = mk('defs', {}, svg);
    const bl = mk('filter', { id: 'soft', x: '-20%', y: '-60%', width: '140%', height: '220%' }, defs);
    mk('feGaussianBlur', { stdDeviation: 9 }, bl);
    const dg = mk('linearGradient', { id: 'doorglow', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    mk('stop', { offset: 0, 'stop-color': '#5a3410' }, dg); mk('stop', { offset: 1, 'stop-color': '#f6c25a' }, dg);
    const pc = mk('clipPath', { id: 'poleclip' }, defs); mk('rect', { x: 10, y: 226, width: 11, height: 170, rx: 2 }, pc);
    const L = {};
    for (const n of ['sky', 'far', 'ground', 'house', 'roll', 'items', 'elfA', 'elfB', 'sback', 'load', 'sleigh', 'drone', 'fx', 'near']) L[n] = mk('g', {}, svg);
    const FA = 396, FB = 410;
    // sky: aurora, moon, stars
    const au = mk('g', { class: 'aurora', filter: 'url(#soft)' }, L.sky);
    mk('path', { class: 'au1', d: 'M-20 70C80 30 150 96 250 58S420 20 520 64S640 40 680 52' }, au);
    mk('path', { class: 'au2', d: 'M-20 104C90 76 170 126 280 92S450 70 560 100S650 86 680 90' }, au);
    mk('path', { class: 'moon', d: 'M404 40a20 20 0 1 0 16 31a16 16 0 1 1 -16 -31z' }, L.sky);
    for (let i = 0; i < 26; i++) { const st = mk('circle', { class: 'star', cx: rnd(10, 630).toFixed(0), cy: rnd(10, 170).toFixed(0), r: rnd(0.5, 1.3).toFixed(2) }, L.sky); st.style.animationDelay = (-rnd(0, 4)).toFixed(2) + 's'; }
    // far pines
    const pine = (x, y, h, cls) => {
      const g = mk('g', { class: 'pine ' + (cls || '') }, L.far);
      for (const [k, w] of [[0, 0.42], [0.3, 0.34], [0.56, 0.25]]) {
        const ty = y - h * k, th = h * 0.5;
        mk('path', { d: `M${x} ${ty - th}L${x - h * w} ${ty}H${x + h * w}Z` }, g);
        mk('path', { class: 'pine-snow', d: `M${x} ${ty - th}L${x - h * w * 0.4} ${ty - th * 0.6}Q${x} ${ty - th * 0.5} ${x + h * w * 0.4} ${ty - th * 0.6}Z` }, g);
      }
    };
    pine(340, 372, 70, 'dim'); pine(300, 376, 46, 'dim'); pine(424, 366, 60, 'dim'); pine(630, 384, 110);
    // snow ground
    mk('path', { class: 'snowfield', d: 'M0 382Q70 372 150 384T320 380T470 388T640 378V440H0Z' }, L.ground);
    mk('path', { class: 'snow-shade', d: 'M0 410Q120 400 250 414T520 412T640 404V440H0Z' }, L.ground);
    // the North Pole building
    const H = mk('g', { transform: 'translate(30 46) scale(.88)' }, L.house);
    mk('rect', { class: 'chim', x: 156, y: 204, width: 22, height: 44 }, H);
    mk('path', { class: 'roof-snow', d: 'M152 206Q167 196 182 206V211H152Z' }, H);
    mk('rect', { class: 'wall', x: 28, y: 258, width: 182, height: 132 }, H);
    for (let y = 272; y < 390; y += 13) mk('path', { class: 'plank', d: `M28 ${y}H210` }, H);
    mk('path', { class: 'roof', d: 'M12 264L119 190L226 264Z' }, H);
    mk('path', { class: 'roof-snow', d: 'M8 266L119 186L230 266Q222 272 214 266Q205 276 196 268Q186 277 176 268Q164 276 154 267Q143 276 132 267Q121 275 110 267Q98 276 88 267Q77 275 66 267Q55 276 44 267Q33 274 24 267Q16 272 8 266ZM119 196L38 256Q119 218 200 256Z' }, H);
    lights(H, 22, 216, 268, 7, 9);
    // sign
    mk('rect', { class: 'sign', x: 46, y: 282, width: 146, height: 30, rx: 3 }, H);
    const sg = mk('text', { class: 'sign-t', x: 119, y: 302, 'text-anchor': 'middle' }, H); sg.textContent = 'NORTH POLE';
    mk('path', { class: 'sign-snow', d: 'M44 283Q60 276 80 282Q100 275 122 282Q146 276 168 281Q182 276 194 283Z' }, H);
    const sd = mk('text', { class: 'lbl small dark', x: 119, y: 326, 'text-anchor': 'middle' }, H); sd.textContent = 'DRONE PARTS DEPT.';
    // window and the open door with shelves inside
    mk('rect', { class: 'win-glow', x: 42, y: 334, width: 44, height: 34, rx: 2 }, H);
    mk('path', { class: 'mullion', d: 'M64 334V368M42 351H86' }, H);
    mk('path', { class: 'sill', d: 'M38 370H90' }, H);
    mk('rect', { class: 'door', x: 124, y: 334, width: 64, height: 56 }, H);
    for (const yy of [350, 368]) mk('path', { class: 'shelf', d: `M128 ${yy}H184` }, H);
    for (const [bx, by, bw, bh] of [[132, 350, 9, 7], [144, 350, 6, 10], [158, 350, 12, 6], [173, 350, 7, 9], [134, 368, 12, 8], [151, 368, 8, 5], [166, 368, 10, 9]]) mk('rect', { class: 'shelf-box', x: bx, y: by - bh, width: bw, height: bh }, H);
    mk('rect', { class: 'doorframe', x: 124, y: 334, width: 64, height: 56 }, H);
    // striped North Pole post, on the left of the house
    const pole = mk('g', { 'clip-path': 'url(#poleclip)' }, L.house);
    mk('rect', { class: 'pole-w', x: 10, y: 226, width: 11, height: 170 }, pole);
    for (let y = 216; y < 400; y += 15) mk('path', { class: 'pole-r', d: `M8 ${y + 8}L23 ${y}V${y + 7}L8 ${y + 15}Z` }, pole);
    mk('circle', { class: 'pole-ball', cx: 15.5, cy: 220, r: 7.5 }, L.house);
    mk('path', { class: 'roof-snow', d: 'M8 224Q15.5 216 23 224V228H8Z' }, L.house);
    mk('path', { class: 'snowfield', d: 'M0 394Q16 384 34 392Z' }, L.house);
    // roller ramp out of the door
    const RT = 362;
    mk('rect', { class: 'kf', x: 168, y: RT, width: 104, height: 6, rx: 2 }, L.roll);
    for (let x = 173; x <= 268; x += 9) mk('circle', { class: 'roller', cx: x, cy: RT + 3, r: 2.2 }, L.roll);
    for (const lx of [214, 264]) { mk('rect', { class: 'kf', x: lx - 2, y: RT + 6, width: 4, height: 392 - RT - 6 }, L.roll); mk('rect', { class: 'kf', x: lx - 6, y: 390, width: 12, height: 3, rx: 1 }, L.roll); }
    // Santa's sleigh, loaded with presents; elves add to the pile
    fancySleigh(L.sback, L.sleigh, 520, 410, 1);
    const SLOTS = [[466, 352], [488, 350], [534, 350], [556, 352], [476, 332], [544, 330]];
    const yl = mk('text', { class: 'lbl', x: 52, y: 32 }, L.fx); yl.textContent = 'NORTH POLE · PARTS YARD';
    const sl = mk('text', { class: 'lbl dim', x: 52, y: 48 }, L.fx);
    // near snow drifts (in front of everything)
    mk('path', { class: 'snowfield', d: 'M0 432Q40 420 90 430Q130 424 170 434V440H0Z' }, L.near);
    mk('path', { class: 'snowfield', d: 'M600 432Q620 424 640 428V440H600Z' }, L.near);
    // the A1 hovering with its tag
    const dr = mk('g', {}, L.drone);
    a1Side(dr, 2.2);
    const swing = mk('g', {}, dr);
    mk('path', { class: 'string', d: 'M0 22V44' }, swing);
    tag(mk('g', { transform: 'translate(0 44)' }, swing), '$1,450', '$1,650');
    // two elves on tracks, at different depths so they pass each other
    const mkElf = (layer, F, s, kind, off) => {
      const back = mk('g', {}, layer), hold = mk('g', {}, layer), front = mk('g', {}, layer);
      const R = robot(back, front, 286, F, s, { elf: kind });
      R.hold = hold; R.off = off; R.item = null; R.next = null;
      return R;
    };
    const EA = mkElf(L.elfA, FA, 2.5, 'g', 0), EB = mkElf(L.elfB, FB, 2.7, 'r', 5);
    const PX = 286, LX = 382, CYC = 10, END = 264;
    const KINDS = ['a1', 'prop', 'gift', 'batt', 'a1', 'motor', 'gift2', 'prop'];
    let k = 0, sleighNo = 1, loaded = 0, clearAt = 0, puffT = 0;
    const rolling = [], falling = [], resting = [], puffs = [], sparks = [];
    const label = () => { sl.textContent = `SLEIGH ${String(sleighNo).padStart(2, '0')} · LOADED ${loaded}/${SLOTS.length}`; };
    label();
    const newItem = (layer) => ({ g: part(layer, KINDS[k++ % KINDS.length]), x: 172, y: RT, t: 0 });
    // elf A starts at the ramp with a part waiting, elf B starts at the sleigh with a part in hand
    EA.next = newItem(L.items); EA.next.x = END; EA.next.t = 1;
    EB.item = newItem(EB.hold);
    function cycle(E, tc, t) {
      const s = E.s;
      const holdAt = () => { const p = tipWorld(E, 5.4); E.item.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${(p.y + 3).toFixed(1)})`); };
      if (tc < 1.0) {                                  // reach down and pinch the part at the end of the ramp
        place(E, PX, 1);
        const it = E.next;
        reach(E, END + 1, RT - 18, tc < 0.7 ? 2.2 : 0.2);
        if (tc >= 0.72 && it && it.t >= 1 && !E.item) { E.item = it; E.next = null; E.hold.appendChild(it.g); }
        if (E.item) holdAt();
      } else if (tc < 1.6) {                           // lift it overhead and turn round
        const u = ease((tc - 1.0) / 0.6);
        place(E, PX, tc < 1.3 ? 1 : -1);
        armTo(E, lerp(-26, -4, u), lerp(-12, -46, u), 0.2);
        if (E.item) holdAt();
      } else if (tc < 5.0) {                           // drive to the sleigh
        place(E, lerp(PX, LX, ease((tc - 1.6) / 3.4)), -1);
        armTo(E, -4 + Math.sin(t * 6) * 0.8, -46 + Math.abs(Math.sin(t * 6)) * 1.2, 0.2);
        if (E.item) holdAt();
      } else if (tc < 6.2) {                           // reach over the side and let go
        place(E, LX, -1);
        const u = ease(clamp((tc - 5.0) / 0.7, 0, 1));
        armTo(E, lerp(-4, -27, u), lerp(-46, -30, u), tc < 5.75 ? 0.2 : 2.2);
        if (E.item && tc < 5.75) holdAt();
        else if (E.item) {
          const p = tipWorld(E, 5.4), sl = SLOTS[loaded % SLOTS.length];
          L.load.appendChild(E.item.g);
          falling.push({ g: E.item.g, x0: p.x, y0: p.y + 3, x1: sl[0], y1: sl[1], t: 0 });
          loaded++; E.item = null;
        }
      } else if (tc < 9.6) {                           // drive back for the next part
        place(E, lerp(LX, PX, ease((tc - 6.2) / 3.4)), 1);
        armTo(E, -15 + Math.sin(t * 3) * 1.5, -6, 1.4);
      } else { place(E, PX, 1); armTo(E, -18, -8, 2); }
      // order the next part when heading back, so it rolls out of the door in time
      if (tc >= 6.4 && !E.next && !E.ordered) { E.ordered = true; const it = newItem(L.items); E.next = it; rolling.push(it); }
      if (tc < 6.4) E.ordered = false;
      E.visor.classList.toggle('on', tc > 0.5 && tc < 1.2 || tc > 5.4 && tc < 6);
      tilt(E, tc < 1 ? -8 : tc > 5 && tc < 6.2 ? -6 : 3 * Math.sin(t * 2 + E.off));
    }
    return function step(dt, t) {
      for (let i = rolling.length - 1; i >= 0; i--) {   // parts roll out of the door to the end of the ramp
        const it = rolling[i]; it.t = Math.min(1, it.t + dt / 2.6);
        it.x = lerp(172, END, ease(it.t));
        it.g.setAttribute('transform', `translate(${it.x.toFixed(1)} ${RT})`);
        if (it.t >= 1) rolling.splice(i, 1);
      }
      if (EA.next && EA.next.t >= 1 && !rolling.includes(EA.next)) EA.next.g.setAttribute('transform', `translate(${END} ${RT})`);
      cycle(EA, (t + EA.off) % CYC, t);
      cycle(EB, (t + EB.off) % CYC, t);
      for (let i = falling.length - 1; i >= 0; i--) {   // parts drop into the sleigh
        const f = falling[i]; f.t = Math.min(1, f.t + dt / 0.55);
        const x = lerp(f.x0, f.x1, f.t), y = lerp(f.y0, f.y1, f.t * f.t) - 26 * Math.sin(Math.PI * f.t);
        f.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(10 * Math.sin(Math.PI * f.t)).toFixed(1)})`);
        if (f.t >= 1) {
          falling.splice(i, 1); resting.push(f.g); sparkle(L.fx, sparks, f.x1, f.y1 - 14); label();
          if (loaded >= SLOTS.length) clearAt = t + 2.2;
        }
      }
      if (clearAt && t > clearAt) {                     // sleigh full: it leaves, a new one is loaded
        clearAt = 0; resting.splice(0).forEach(g => { g.classList.add('leaving'); setTimeout(() => g.remove(), 700); });
        loaded = 0; sleighNo++; label();
      }
      puffT -= dt;                                      // chimney smoke
      if (puffT <= 0) { puffT = 0.7; puffs.push({ el: mk('circle', { class: 'smoke', cx: 177, cy: 220, r: 4 }, L.house), t: 0, x: rnd(-2, 2) }); }
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i]; p.t += dt;
        if (p.t > 4.5) { p.el.remove(); puffs.splice(i, 1); continue; }
        p.el.setAttribute('cx', (177 + p.x + p.t * 9 + Math.sin(p.t * 1.5) * 3).toFixed(1));
        p.el.setAttribute('cy', (220 - p.t * 22).toFixed(1));
        p.el.setAttribute('r', (4 + p.t * 3).toFixed(1));
        p.el.style.opacity = (0.3 * (1 - p.t / 4.5)).toFixed(2);
      }
      const hx = 560 + 6 * Math.sin(t * 0.5), hy = 138 + 6 * Math.sin(t * 1.4);
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
    const kinds = [{ elf: 'g' }, { hat: true }, { elf: 'r', flip: true }, { antlers: true }, { elf: 'g', flip: true }, { scarf: true, flip: true }, { elf: 'r' }, { hat: true, flip: true }, { elf: 'g' }];
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
  const step = look === '2' ? spec(svg) : look === '3' ? snowGlobe(svg) : look === '1' ? workshop(svg) : northPole(svg);
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
