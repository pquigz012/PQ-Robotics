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

  // Santa hat on the logo
  var logo = document.querySelector('nav .logo');
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
        ctx.strokeStyle = 'rgba(120,152,204,.7)'; ctx.fillStyle = 'rgba(150,178,220,.5)'; ctx.lineCap = 'round';
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
