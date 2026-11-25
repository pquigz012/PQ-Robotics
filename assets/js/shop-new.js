/* PQ Robotics shop (white redesign preview).
   One product list, three ways to open details:
   data-detail="modal" (popup), "inline" (opens under the row), "drawer" (slides in from the right).
   Reserve buttons pick the item in the order form (#f-item) and scroll to it. */
(function () {
  'use strict';
  var IMG = 'assets/images/shop/';
  var V = '?v=20261125d';   // change this when a photo is replaced, so browsers load the new one
  var P = [
    { id: 'a1', anchor: 'bundle', cat: 'Drones', name: 'Antigravity A1', sub: '8K 360 drone, Essential Bundle', price: 1450, was: 1650, cond: 'New', tag: 'Holiday deal',
      img: IMG + 'a1-hero.jpg', gallery: ['a1-hero.jpg', 'a1-trio.jpg', 'a1-bundle.jpg', 'a1-grip.jpg', 'a1-goggles.jpg', 'a1-flying.jpg'],
      fits: [], blurb: 'Fly with goggles and a point-to-fly grip. Everything you need is in the box.',
      stats: [['8K', '360° video'], ['<249 g', 'No FAA registration for fun'], ['24 min', 'Per battery, 2 included'], ['10 km', 'Video link']],
      box: [['drone', 'A1 drone'], ['goggles', 'Vision goggles'], ['grip', 'Motion grip'], ['battery', '2 batteries'], ['hub', 'Charging hub'], ['props', 'Spare props'],
            ['case', 'Drone case'], ['bag', 'Sling bag'], ['pad', 'Landing pad'], ['vbatt', 'Goggle battery'], ['lens', 'Lens kit'], ['sd', '256 GB card']],
      opts: [['a1', 'Essential Bundle', 1450]],
      notes: ['14-day returns, unopened', 'Antigravity warranty, we help with claims'] },
    { id: 'rc2', anchor: 'item-rc2', cat: 'Controllers', name: 'DJI RC 2 Controller', price: 399, cond: 'Used', img: IMG + 'used/rc2.jpg',
      fits: ['Mini 4 Pro', 'Air 3', 'Air 3S', 'Neo'], blurb: 'Built-in screen. No phone needed.', opts: [['rc2', 'RC 2', 399]] },
    { id: 'rc-n', anchor: 'item-rc-n', cat: 'Controllers', name: 'DJI RC-N Controller', price: 145, cond: 'Used', img: IMG + 'used/rc-n.jpg',
      fits: ['Mini 3', 'Mini 3 Pro', 'Mini 4 Pro', 'Mini 5 Pro'], blurb: 'Uses your phone as the screen. Pick the one for your drone.',
      opts: [['rc-n1', 'RC-N1 · Mini 3, Mini 3 Pro', 145], ['rc-n2', 'RC-N2 · Mini 4 Pro', 145], ['rc-n3', 'RC-N3 · Mini 4 Pro, Mini 5 Pro', 145]] },
    { id: 'm4arms', anchor: 'item-mini4pro-arms', cat: 'Arms', name: 'DJI Mini 4 Pro Arms', price: 59, cond: 'Used', img: IMG + 'used/mini4pro-arms.jpg',
      fits: ['Mini 4 Pro'], blurb: 'Motor included. Priced per arm.',
      opts: [['mini4pro-arm-front-left', 'Front left', 59], ['mini4pro-arm-front-right', 'Front right', 59], ['mini4pro-arm-rear-left', 'Rear left', 59], ['mini4pro-arm-rear-right', 'Rear right', 59]] },
    { id: 'm5arms', anchor: 'item-mini5pro-arms', cat: 'Arms', name: 'DJI Mini 5 Pro Arms', price: 95, from: true, cond: 'Used', img: IMG + 'used/mini5pro-arms.jpg',
      fits: ['Mini 5 Pro'], blurb: 'Motor included. Priced per arm.',
      opts: [['mini5pro-arm-front-left', 'Front left', 110], ['mini5pro-arm-front-right', 'Front right', 110], ['mini5pro-arm-rear-left', 'Rear left', 95], ['mini5pro-arm-rear-right', 'Rear right', 95]] },
    { id: 'm3arms', anchor: 'item-mini3-arms', cat: 'Arms', name: 'DJI Mini 3 Pro Arms', price: 49, from: true, cond: 'Used', img: IMG + 'used/mini3-arms.jpg',
      fits: ['Mini 3 Pro'], blurb: 'Motor included. Mini 3 Pro only, not the plain Mini 3.',
      opts: [['mini3pro-arm-front-left', 'Front left', 69], ['mini3pro-arm-front-right', 'Front right', 69], ['mini3pro-arm-rear-left', 'Rear left', 49], ['mini3pro-arm-rear-right', 'Rear right', 49]] },
    { id: 'batt', anchor: 'item-mini4pro-batteries', cat: 'Power & cases', name: 'DJI Mini 4 Pro Batteries', price: 119, from: true, cond: 'Used', img: IMG + 'used/mini4pro-batteries.jpg',
      fits: ['Mini 4 Pro', 'Mini 3 Pro'], blurb: 'Single battery, or the full set with the charging hub.',
      opts: [['mini4pro-battery', '1 battery', 119], ['mini4pro-batteries', '2 batteries + hub', 299]] },
    { id: 'case', anchor: 'item-mini4pro-case', cat: 'Power & cases', name: 'DJI Mini 4 Pro Hard Case', price: 100, cond: 'Used', img: IMG + 'used/mini4pro-case.jpg',
      fits: ['Mini 4 Pro'], blurb: 'HPRC 2300. Holds the drone, controller, batteries and hub.', opts: [['mini4pro-case', 'HPRC 2300', 100]] },
    { id: 'springs', anchor: 'item-axis-springs', cat: 'Small parts', name: 'Arm Axis Springs', price: 20, from: true, cond: 'Used', img: IMG + 'used/axis-springs.jpg',
      fits: ['Mini 3', 'Mini 3 Pro', 'Mini 4 Pro'], blurb: 'Front arm hinge shaft and spring.',
      opts: [['axis-springs', '1 axis', 20], ['axis-springs-kit', 'Kit: 2 axes + tools', 39]] },
    { id: 'dampers', anchor: 'item-gimbal-dampers', cat: 'Small parts', name: 'Gimbal Dampers', price: 15, cond: 'New', img: IMG + 'used/gimbal-dampers.jpg',
      fits: ['Mini 3', 'Mini 3 Pro', 'Mini 4 Pro'], blurb: 'The rubber mounts that keep the camera steady. Left and right pair.',
      opts: [['gimbal-dampers', 'Pair', 15]] }
  ];
  var BY = {}; P.forEach(function (p) { BY[p.id] = p; });
  var money = function (n) { return '$' + n.toLocaleString('en-US'); };
  var priceLabel = function (p) { return (p.from ? 'From ' : '') + money(p.price); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  var root = document.documentElement;
  var mode = root.getAttribute('data-detail') || 'modal';
  var grid = document.getElementById('grid');
  if (!grid) return;
  var grouped = grid.hasAttribute('data-grouped');

  function card(p) {
    return '<button type="button" class="card' + (p.price <= 39 ? ' small-gift' : '') + '"' + (p.anchor ? ' id="' + p.anchor + '"' : '') + ' data-id="' + p.id + '" data-fits="' + p.fits.join('|') + '" aria-haspopup="dialog">' +
      '<span class="card-ph"><img src="' + p.img + V + '" alt="" loading="lazy"></span>' +
      '<span class="card-tx"><span class="card-tag' + (p.cond === 'New' ? ' new' : '') + '">' + (p.tag || p.cond) + '</span>' +
      '<span class="card-name">' + esc(p.name) + '</span>' +
      '<span class="card-price">' + priceLabel(p) + (p.was ? ' <s>' + money(p.was) + '</s>' : '') + '</span></span>' +
      '<span class="card-more" aria-hidden="true">Details <i>&rsaquo;</i></span></button>';
  }

  // Render the cards (flat or grouped by category)
  if (grouped) {
    var cats = [];
    P.forEach(function (p) { if (cats.indexOf(p.cat) < 0) cats.push(p.cat); });
    grid.innerHTML = cats.map(function (c) {
      return '<div class="aisle" data-cat="' + c + '"><h2 class="aisle-t">' + c + '</h2><div class="cards">' +
        P.filter(function (p) { return p.cat === c; }).map(card).join('') + '</div></div>';
    }).join('');
  } else {
    grid.innerHTML = P.filter(function (p) { return !grid.hasAttribute('data-skip-a1') || p.id !== 'a1'; }).map(card).join('');
  }

  // Detail content
  function detail(p) {
    var gal = p.gallery ? '<div class="d-thumbs">' + p.gallery.map(function (g, i) {
      return '<button type="button" class="d-th' + (i ? '' : ' on') + '" data-src="' + IMG + g + V + '"><img src="' + IMG + g + V + '" alt=""></button>';
    }).join('') + '</div>' : '';
    var opts = p.opts.length > 1 ? '<div class="d-lbl">Choose</div><div class="d-opts">' + p.opts.map(function (o, i) {
      return '<button type="button" class="d-opt' + (i ? '' : ' on') + '" data-v="' + o[0] + '" data-p="' + o[2] + '">' + esc(o[1]) +
        (p.from ? ' <b>' + money(o[2]) + '</b>' : '') + '</button>';
    }).join('') + '</div>' : '';
    var fits = p.fits.length ? '<div class="d-lbl">Fits</div><div class="d-fits">' + p.fits.map(function (f) { return '<span>' + f + '</span>'; }).join('') + '</div>' : '';
    var stats = p.stats ? '<div class="d-stats">' + p.stats.map(function (s) { return '<div><b>' + s[0] + '</b><span>' + s[1] + '</span></div>'; }).join('') + '</div>' : '';
    var box = p.box ? '<div class="d-lbl">In the box</div><div class="d-box">' + p.box.map(function (b) {
      return '<figure><img src="' + IMG + 'box/' + b[0] + '.jpg' + V + '" alt="" loading="lazy"><figcaption>' + b[1] + '</figcaption></figure>';
    }).join('') + '</div>' : '';
    var notes = p.notes ? '<ul class="d-notes">' + p.notes.map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul>' : '';
    return '<div class="d-wrap" data-id="' + p.id + '">' +
      '<button type="button" class="d-x" aria-label="Close">&times;</button>' +
      '<div class="d-media"><div class="d-big"><img src="' + p.img + V + '" alt="' + esc(p.name) + '"></div>' + gal + '</div>' +
      '<div class="d-info"><span class="card-tag' + (p.cond === 'New' ? ' new' : '') + '">' + p.cond + ' · In stock</span>' +
      '<h3 class="d-name">' + esc(p.name) + '</h3>' + (p.sub ? '<p class="d-sub">' + esc(p.sub) + '</p>' : '') +
      '<div class="d-price"><b>' + money(p.opts[0][2]) + '</b>' + (p.was ? ' <s>' + money(p.was) + '</s> <em>Save ' + money(p.was - p.price) + '</em>' : '') + '</div>' +
      '<p class="d-blurb">' + esc(p.blurb) + '</p>' + stats + opts + fits +
      '<button type="button" class="btn d-go">Reserve it</button>' +
      '<p class="d-fine">Nothing to pay now. Pick up at the shop.</p>' + notes + '</div>' + box + '</div>';
  }

  // Containers per mode
  var host, scrim, openCard = null;
  if (mode === 'inline') {
    host = document.createElement('div'); host.className = 'inline-detail';
  } else {
    scrim = document.createElement('div'); scrim.className = 'scrim';
    host = document.createElement('div'); host.className = mode === 'drawer' ? 'drawer' : 'modal';
    host.setAttribute('role', 'dialog'); host.setAttribute('aria-modal', 'true');
    document.body.appendChild(scrim); document.body.appendChild(host);
    scrim.addEventListener('click', close);
  }

  function rowEnd(btn) {
    var cards = Array.prototype.slice.call(btn.parentNode.querySelectorAll('.card')).filter(function (c) { return c.offsetParent; });
    var top = btn.offsetTop, last = btn;
    cards.forEach(function (c) { if (Math.abs(c.offsetTop - top) < 4) last = c; });
    return last;
  }

  function open(id, btn) {
    var p = BY[id]; if (!p) return;
    if (mode === 'inline' && openCard === btn) { close(); return; }
    host.innerHTML = detail(p);
    wire(p);
    if (mode === 'inline') {
      if (openCard) openCard.classList.remove('open');
      var end = rowEnd(btn);
      end.parentNode.insertBefore(host, end.nextSibling);
      host.classList.remove('show'); void host.offsetWidth; host.classList.add('show');
      btn.classList.add('open'); openCard = btn;
      var y = btn.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      openCard = btn;
      host.classList.add('show'); scrim.classList.add('show');
      document.body.classList.add('lock');
      host.scrollTop = 0;
      var x = host.querySelector('.d-x'); if (x) x.focus({ preventScroll: true });
    }
  }
  function close() {
    if (mode === 'inline') {
      if (host.parentNode) host.parentNode.removeChild(host);
      if (openCard) openCard.classList.remove('open');
    } else {
      host.classList.remove('show'); scrim.classList.remove('show');
      document.body.classList.remove('lock');
      if (openCard) openCard.focus({ preventScroll: true });
    }
    openCard = null;
  }

  function wire(p) {
    var chosen = p.opts[0][0];
    host.querySelector('.d-x').addEventListener('click', close);
    Array.prototype.forEach.call(host.querySelectorAll('.d-opt'), function (b) {
      b.addEventListener('click', function () {
        host.querySelectorAll('.d-opt').forEach(function (o) { o.classList.remove('on'); });
        b.classList.add('on'); chosen = b.getAttribute('data-v');
        host.querySelector('.d-price b').textContent = money(+b.getAttribute('data-p'));
      });
    });
    Array.prototype.forEach.call(host.querySelectorAll('.d-th'), function (b) {
      b.addEventListener('click', function () {
        host.querySelectorAll('.d-th').forEach(function (o) { o.classList.remove('on'); });
        b.classList.add('on'); host.querySelector('.d-big img').src = b.getAttribute('data-src');
      });
    });
    host.querySelector('.d-go').addEventListener('click', function () {
      pick(chosen); close();
      var f = document.getElementById('order'); if (f) f.scrollIntoView({ behavior: 'smooth' });
    });
  }

  document.addEventListener('click', function (e) {
    var c = e.target.closest('.card, [data-open]');
    if (!c) return;
    open(c.getAttribute('data-id') || c.getAttribute('data-open'), c.classList.contains('card') ? c : document.querySelector('.card[data-id="' + c.getAttribute('data-open') + '"]') || c);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openCard) close();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.hasAttribute && e.target.hasAttribute('data-open')) { e.preventDefault(); e.target.click(); }
  });

  // Shop-by-drone chips
  Array.prototype.forEach.call(document.querySelectorAll('.chips button'), function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      document.querySelectorAll('.chips button').forEach(function (o) { o.classList.toggle('on', o === b); });
      if (mode === 'inline' && openCard) close();
      document.querySelectorAll('.card').forEach(function (c) {
        var fits = c.getAttribute('data-fits').split('|');
        c.hidden = !(f === 'all' || fits.indexOf(f) >= 0 || (f === 'A1' && c.getAttribute('data-id') === 'a1'));
      });
      document.querySelectorAll('.aisle').forEach(function (a) { a.hidden = !a.querySelector('.card:not([hidden])'); });
    });
  });

  // Links like #item-rc2 (Google Shopping) open that product's details
  function fromHash() {
    var h = decodeURIComponent(location.hash.slice(1)); if (!h) return;
    var hit = null; P.forEach(function (p) { if (p.anchor === h) hit = p; });
    if (!hit) return;
    var el = document.getElementById(h);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center' });
    setTimeout(function () { open(hit.id, document.querySelector('.card[data-id="' + hit.id + '"]') || el); }, 250);
  }
  window.addEventListener('hashchange', fromHash);
  if (document.readyState === 'complete') fromHash(); else window.addEventListener('load', fromHash);

  // Order form
  var sel = document.getElementById('f-item'), qty = document.getElementById('f-qty'), tot = document.getElementById('f-total'), hid = document.getElementById('f-total-hidden');
  function total() {
    if (!sel || !tot) return;
    var o = sel.options[sel.selectedIndex], pr = +(o && o.getAttribute('data-price')) || 0, n = +(qty && qty.value) || 1;
    tot.textContent = pr ? money(pr * n) : 'We quote it';
    if (hid) hid.value = tot.textContent;
  }
  function pick(v) { if (sel) { sel.value = v; total(); sel.closest('form').classList.add('picked'); } }
  if (sel) { sel.addEventListener('change', total); if (qty) qty.addEventListener('change', total); total(); }

  var form = document.getElementById('shop-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var st = form.querySelector('.form-status'), b = form.querySelector('button[type=submit]');
    b.disabled = true; st.textContent = 'Sending...';
    fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
      .then(function (r) { return r.json(); })
      .then(function (j) { st.textContent = j.success ? 'Got it. We will text or email you shortly.' : 'That did not go through. Call (404) 408-9063.'; if (j.success) form.reset(); total(); })
      .catch(function () { st.textContent = 'That did not go through. Call (404) 408-9063.'; })
      .then(function () { b.disabled = false; });
  });
})();
