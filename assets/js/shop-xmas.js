/* PQ Robotics shop: Christmas extras. Runs only when <html data-season="christmas">.
   String lights, light snow, a drone flying a present across the top, a Santa hat on the logo,
   a bow and gift tag on the A1, and the days-to-Christmas count. All of it is decoration:
   the page reads and works the same without it. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (root.getAttribute('data-season') !== 'christmas') return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  // Days to Christmas
  var now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var days = Math.round((new Date(now.getFullYear(), 11, 25) - today) / 864e5);
  var cd = document.getElementById('xmas-days');
  if (cd) cd.textContent = days > 1 ? days + ' days to Christmas' : days === 1 ? 'Christmas is tomorrow' : days === 0 ? 'Merry Christmas!' : 'Happy holidays';

  // North Pole meadow behind the top of the page
  var topEl = document.getElementById('top');
  if (topEl) {
    var pine = function (x, y, h, c, snow) {
      var s = '', w = h * 0.42;
      [[0, 1], [0.3, 0.8], [0.56, 0.58]].forEach(function (t) {
        var ty = y - h * t[0], th = h * 0.5, ww = w * t[1];
        s += '<path d="M' + x + ' ' + (ty - th) + 'L' + (x - ww) + ' ' + ty + 'H' + (x + ww) + 'Z" fill="' + c + '"/>';
        if (snow) s += '<path d="M' + x + ' ' + (ty - th) + 'L' + (x - ww * .45) + ' ' + (ty - th * .55) + 'Q' + x + ' ' + (ty - th * .42) + ' ' + (x + ww * .45) + ' ' + (ty - th * .55) + 'Z" fill="#fff"/>' +
          '<path d="M' + (x - ww) + ' ' + ty + 'Q' + (x - ww * .5) + ' ' + (ty - 5) + ' ' + x + ' ' + (ty - 2) + 'Q' + (x + ww * .5) + ' ' + (ty - 6) + ' ' + (x + ww) + ' ' + ty + 'Z" fill="#fff" opacity=".9"/>';
      });
      return s + '<rect x="' + (x - h * .04) + '" y="' + y + '" width="' + (h * .08) + '" height="' + (h * .1) + '" fill="#5a3a22"/>';
    };
    var m = '<svg class="x-meadow" viewBox="0 20 2000 420" preserveAspectRatio="xMidYMid meet" aria-hidden="true">';
    // far mountains
    m += '<path d="M0 240 L120 140 L210 190 L330 80 L450 200 L560 120 L700 230 L820 150 L930 220 L1060 110 L1180 210 L1300 130 L1420 220 L1540 90 L1660 200 L1780 120 L1900 210 L2000 160 V300 H0Z" fill="#d3e0f0"/>';
    m += '<path d="M330 80 L372 116 L352 112 L338 126 L318 108 L298 118Z M1060 110 L1100 144 L1080 140 L1064 152 L1046 138 L1024 146Z M1540 90 L1584 128 L1562 122 L1546 136 L1526 120 L1504 130Z M560 120 L594 150 L576 146 L560 158 L544 146 L528 150Z M1780 120 L1812 148 L1796 144 L1782 154 L1766 144 L1750 148Z" fill="#fff"/>';
    // rolling snow hills
    m += '<path d="M0 250 Q200 196 420 236 T860 228 T1280 222 T1700 230 T2000 214 V320 H0Z" fill="#eef4fb"/>';
    // far pines along the horizon
    for (var i = 0; i < 22; i++) { var fx = 40 + i * 92 + (i % 3) * 17; m += pine(fx, 246 + (i % 4) * 4, 34 + (i % 5) * 7, '#7fa293', false); }
    // the snowfield
    m += '<path d="M0 268 Q300 236 620 262 T1240 256 T2000 250 V800 H0Z" fill="#fff"/>';
    m += '<path d="M0 330 Q400 300 800 324 T1600 318 T2000 330" fill="none" stroke="#dde7f3" stroke-width="3"/>';
    m += '<path d="M0 420 Q500 392 1000 414 T2000 408" fill="none" stroke="#e6eef7" stroke-width="3"/>';
    // left: Santa's workshop with lit windows and chimney smoke
    m += '<g transform="translate(600 170)">' +
      '<rect x="128" y="-6" width="26" height="54" fill="#8e2a24"/><path d="M124 -4 Q141 -16 158 -4 V2 H124Z" fill="#fff"/>' +
      '<g class="x-smoke"><circle cx="141" cy="-20" r="8"/><circle cx="150" cy="-44" r="11"/><circle cx="162" cy="-72" r="14"/></g>' +
      '<rect x="20" y="70" width="180" height="120" fill="#c0392b"/>' +
      '<path d="M20 92H200M20 116H200M20 140H200M20 164H200" stroke="#a83226" stroke-width="2"/>' +
      '<path d="M0 78 L110 6 L220 78Z" fill="#7a2420"/>' +
      '<path d="M-6 80 L110 0 L226 80 Q214 90 202 80 Q190 92 176 81 Q162 92 148 81 Q134 92 120 81 Q106 92 92 81 Q78 92 64 81 Q50 92 36 81 Q22 90 10 82 Z" fill="#fff"/>' +
      '<rect x="36" y="104" width="44" height="38" rx="3" fill="#ffd66b"/><path d="M58 104V142M36 123H80" stroke="#7a2420" stroke-width="4"/><rect x="32" y="142" width="52" height="7" rx="3" fill="#fff"/>' +
      '<rect x="118" y="112" width="54" height="78" rx="4" fill="#5a2a1c"/><rect x="124" y="118" width="42" height="34" rx="3" fill="#ffd66b" opacity=".9"/><circle cx="160" cy="160" r="3.5" fill="#f2b632"/>' +
      '<path d="M140 98 a10 10 0 1 1 .1 0" fill="none" stroke="#1f6b4a" stroke-width="7"/><circle cx="140" cy="108" r="4" fill="#d6312b"/>' +
      '<rect x="44" y="44" width="132" height="26" rx="4" fill="#fffdf6" stroke="#7a2420" stroke-width="3"/>' +
      '<text x="110" y="63" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-weight="800" font-size="17" letter-spacing="2" fill="#14233f">WORKSHOP</text>' +
      '<path d="M-20 196 Q60 176 140 192 T260 192 V210 H-20Z" fill="#fbfdff"/></g>';
    m += pine(540, 380, 150, '#1f5a3f', true) + pine(880, 384, 116, '#24654a', true) + pine(470, 320, 84, '#2c6e52', true) + pine(960, 336, 80, '#2c6e52', true) + pine(150, 360, 110, '#24654a', true) + pine(300, 330, 80, '#2c6e52', true) + pine(60, 320, 70, '#2c6e52', true);
    // right: the striped North Pole with its sign, a snowman and more pines
    m += '<g transform="translate(1230 150)"><defs><clipPath id="x-pc"><rect x="0" y="0" width="16" height="230" rx="3"/></clipPath></defs>' +
      '<g clip-path="url(#x-pc)"><rect width="16" height="230" fill="#fff"/>';
    for (var y = -16; y < 240; y += 22) m += '<path d="M-2 ' + (y + 12) + 'L18 ' + y + 'V' + (y + 10) + 'L-2 ' + (y + 22) + 'Z" fill="#d6312b"/>';
    m += '</g><circle cx="8" cy="-6" r="13" fill="#f2b632"/><circle cx="4" cy="-10" r="4" fill="#fff" opacity=".7"/>' +
      '<g transform="translate(16 40) rotate(-6)"><path d="M0 0 H118 L134 16 L118 32 H0Z" fill="#fffdf6" stroke="#14233f" stroke-width="3"/>' +
      '<text x="60" y="22" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-weight="800" font-size="15" letter-spacing="1.5" fill="#d6312b">NORTH POLE</text></g>' +
      '<path d="M-30 236 Q8 216 46 234 Z" fill="#fbfdff"/></g>';
    m += '<g transform="translate(1470 300)"><circle cx="0" cy="62" r="40" fill="#fff" stroke="#d5e0ee" stroke-width="3"/><circle cx="0" cy="4" r="29" fill="#fff" stroke="#d5e0ee" stroke-width="3"/>' +
      '<circle cx="0" cy="-40" r="21" fill="#fff" stroke="#d5e0ee" stroke-width="3"/><circle cx="-7" cy="-44" r="3" fill="#14233f"/><circle cx="7" cy="-44" r="3" fill="#14233f"/>' +
      '<path d="M0 -38 L22 -34 L0 -32Z" fill="#f08a24"/><path d="M-22 -22 Q0 -12 22 -22 L20 -14 Q0 -4 -20 -14Z" fill="#d6312b"/><path d="M12 -16 L20 12 L10 12Z" fill="#d6312b"/>' +
      '<rect x="-20" y="-70" width="40" height="8" rx="2" fill="#14233f"/><rect x="-13" y="-96" width="26" height="28" rx="3" fill="#14233f"/><rect x="-13" y="-78" width="26" height="5" fill="#d6312b"/>' +
      '<circle cx="0" cy="-2" r="3" fill="#14233f"/><circle cx="0" cy="12" r="3" fill="#14233f"/><path d="M-26 0 L-60 -22 M-48 -14 L-56 -30 M26 0 L58 -26" stroke="#6b4426" stroke-width="4" stroke-linecap="round"/></g>';
    m += pine(1120, 384, 120, '#1f5a3f', true) + pine(1590, 392, 150, '#24654a', true) + pine(1670, 330, 90, '#2c6e52', true) + pine(1800, 372, 120, '#1f5a3f', true) + pine(1930, 330, 84, '#2c6e52', true);
    // little gifts in the snow by the pole
    m += '<g transform="translate(1280 372)"><rect x="0" y="0" width="34" height="28" rx="2" fill="#1f8a4c"/><rect x="14" width="6" height="28" fill="#f2b632"/><rect x="40" y="8" width="26" height="20" rx="2" fill="#2f6fd6"/><rect x="50" y="8" width="5" height="20" fill="#fff"/></g>';
    m += '</svg>';
    var heroEl = topEl.querySelector('.hero');
    if (heroEl) heroEl.insertAdjacentHTML('afterend', m); else topEl.insertAdjacentHTML('afterbegin', m);
    var meadow = topEl.querySelector('.x-meadow');
    var frame = function () { meadow.setAttribute('viewBox', window.innerWidth < 700 ? '520 40 1060 400' : '0 20 2000 420'); };
    frame(); window.addEventListener('resize', frame);
  }

  // Santa hat on the logo
  var logo = document.querySelector('nav .nav-logo');
  if (logo) logo.insertAdjacentHTML('afterbegin',
    '<svg class="x-hat" viewBox="0 0 60 48" aria-hidden="true"><path d="M8 38 C14 14 30 4 46 10 C52 13 54 22 52 30 L48 30 C47 24 44 20 40 20 C32 22 26 30 22 38 Z" fill="#d6312b"/>' +
    '<rect x="4" y="34" width="34" height="10" rx="5" fill="#fff" stroke="#e2e6ee"/><circle cx="51" cy="33" r="6" fill="#fff" stroke="#e2e6ee"/></svg>');

  // String lights across the top of the page
  var top = document.getElementById('top');
  if (top) {
    var lights = document.createElement('div');
    lights.className = 'x-lights'; lights.setAttribute('aria-hidden', 'true');
    top.insertBefore(lights, top.firstChild);
    var colors = ['#d6312b', '#1f8a4c', '#f2b632', '#2f6fd6'];
    var drawLights = function () {
      var w = lights.clientWidth || window.innerWidth, gap = w < 700 ? 44 : 58, n = Math.ceil(w / gap) + 1, sag = 16;
      var svg = '<svg width="' + w + '" height="56" viewBox="0 0 ' + w + ' 56">';
      var d = 'M0 6';
      for (var i = 0; i < n; i++) d += ' Q' + (i * gap + gap / 2) + ' ' + (6 + sag * 2) + ' ' + ((i + 1) * gap) + ' 6';
      svg += '<path d="' + d + '" fill="none" stroke="#14233f" stroke-width="2"/>';
      for (var j = 0; j < n; j++) {
        var x = j * gap + gap / 2, y = 6 + sag, c = colors[j % 4];
        svg += '<g class="x-bulb" style="animation-delay:' + ((j * 0.37) % 2.4).toFixed(2) + 's" transform="translate(' + x + ' ' + y + ') rotate(' + (j % 2 ? 8 : -8) + ')">' +
          '<rect x="-4" y="0" width="8" height="7" rx="1.5" fill="#14233f"/>' +
          '<path d="M0 6 C7 10 8 20 0 27 C-8 20 -7 10 0 6 Z" fill="' + c + '"/>' +
          '<ellipse cx="-2.5" cy="14" rx="1.6" ry="4" fill="#fff" opacity=".55"/></g>';
      }
      lights.innerHTML = svg + '</svg>';
    };
    drawLights();
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(drawLights, 150); });

    // Drone flying a present across the hero
    var fly = document.createElement('div');
    fly.className = 'x-fly'; fly.setAttribute('aria-hidden', 'true');
    fly.innerHTML = '<div class="x-bob"><svg viewBox="0 0 150 130" width="150" height="130">' +
      '<g class="x-prop"><ellipse cx="22" cy="18" rx="20" ry="3" fill="#14233f" opacity=".35"/><ellipse cx="128" cy="18" rx="20" ry="3" fill="#14233f" opacity=".35"/></g>' +
      '<rect x="19" y="18" width="6" height="8" rx="2" fill="#14233f"/><rect x="125" y="18" width="6" height="8" rx="2" fill="#14233f"/>' +
      '<path d="M22 26 L60 34 M128 26 L90 34" stroke="#14233f" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="52" y="26" width="46" height="20" rx="9" fill="#14233f"/><circle cx="75" cy="36" r="4" fill="#f2b632"/>' +
      '<rect x="66" y="45" width="18" height="7" rx="3" fill="#2a3a5c"/>' +
      '<path d="M68 52 L60 76 M82 52 L90 76" stroke="#8a93a6" stroke-width="1.5"/>' +
      '<g transform="translate(52 76)"><rect width="46" height="40" rx="3" fill="#d6312b"/><rect x="19" width="8" height="40" fill="#f2b632"/>' +
      '<rect y="15" width="46" height="8" fill="#f2b632"/><rect width="46" height="9" rx="3" fill="#b8241f"/><rect x="19" width="8" height="9" fill="#e0a21f"/>' +
      '<path d="M23 0 C12 -12 4 -6 10 0 Z M23 0 C34 -12 42 -6 36 0 Z" fill="#f2b632" stroke="#e0a21f"/></g>' +
      '</svg></div>';
    top.appendChild(fly);

    // Light snow behind the hero and the A1 banner
    if (!reduce) {
      var cv = document.createElement('canvas');
      cv.className = 'x-snow'; cv.setAttribute('aria-hidden', 'true');
      top.insertBefore(cv, top.firstChild);
      var ctx = cv.getContext('2d'), flakes = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), running = true;
      var size = function () {
        W = top.clientWidth; H = top.clientHeight;
        cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var want = Math.round(W * H / 13000);
        while (flakes.length < want) flakes.push({ x: Math.random() * W, y: Math.random() * H, r: 1.2 + Math.random() * 2.8, s: .3 + Math.random() * .8, w: Math.random() * 6.28 });
        flakes.length = Math.min(flakes.length, want);
      };
      size(); window.addEventListener('resize', size);
      var tick = function () {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.lineCap = 'round';
        for (var i = 0; i < flakes.length; i++) {
          var f = flakes[i];
          f.y += f.s; f.w += .012; f.x += Math.sin(f.w) * .35;
          if (f.y > H + 12) { f.y = -12; f.x = Math.random() * W; }
          if (f.r > 2.6) {           // bigger ones are six-point flakes that turn as they fall
            var R = f.r * 2.2, a0 = f.w * .6; ctx.lineWidth = 1.3; ctx.beginPath();
            for (var k = 0; k < 6; k++) { var a = a0 + k * 1.0472; ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + Math.cos(a) * R, f.y + Math.sin(a) * R); }
            ctx.stroke();
          } else { ctx.beginPath(); ctx.arc(f.x, f.y, f.r * .8, 0, 6.283); ctx.fill(); }
        }
        requestAnimationFrame(tick);
      };
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) { var was = running; running = e[0].isIntersecting; if (running && !was) tick(); }).observe(top);
      }
      tick();
    }
  }

  // Bow and gift tag on the A1 banner
  var feat = document.querySelector('.feature');
  if (feat) feat.insertAdjacentHTML('beforeend',
    '<span class="x-ribbon" aria-hidden="true"></span>' +
    '<svg class="x-bow" viewBox="0 0 120 70" aria-hidden="true">' +
    '<path d="M60 38 C40 4 6 6 12 30 C16 44 40 44 60 38 Z" fill="#d6312b"/><path d="M60 38 C80 4 114 6 108 30 C104 44 80 44 60 38 Z" fill="#d6312b"/>' +
    '<path d="M60 38 C46 22 26 18 24 28 C30 34 44 38 60 38 Z M60 38 C74 22 94 18 96 28 C90 34 76 38 60 38 Z" fill="#b8241f"/>' +
    '<path d="M56 40 L40 68 L48 66 L52 70 L60 44 Z M64 40 L80 68 L72 66 L68 70 L60 44 Z" fill="#b8241f"/>' +
    '<ellipse cx="60" cy="38" rx="10" ry="9" fill="#e8463f"/></svg>' +
    '<span class="x-tag" aria-hidden="true"><i></i>To: You<br>From: PQ</span>');
})();
