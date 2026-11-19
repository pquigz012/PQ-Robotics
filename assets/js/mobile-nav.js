/* Phone menu for PQ Robotics pages.
   When the page's own top menu is hidden (phones), a three-line button appears on the
   right of the top bar and opens the menu as a panel from the right side.
   The desktop menu is untouched, and buttons in the bar (like R&D Department) are not copied. */
(function () {
  'use strict';
  var list = document.querySelector('nav ul.nav-links') || document.querySelector('header.bar nav');
  if (!list) return;
  var host = list.tagName === 'UL' ? list.parentElement : list.closest('.wrap') || list.parentElement;
  var extras = [
    ['/part-107-drone-license-georgia.html', 'Part 107 Classes'],
    ['/drone-gift-certificates.html', 'Gift Certificates']
  ];

  var css = document.createElement('style');
  css.textContent = [
    '.mnav-btn{display:none;margin-left:12px;width:42px;height:42px;flex:none;align-items:center;justify-content:center;flex-direction:column;gap:5px;background:transparent;border:1px solid rgba(255,255,255,.18);border-radius:8px;cursor:pointer;padding:0}',
    '.mnav-btn span{display:block;width:20px;height:2px;border-radius:2px;background:#e8eaf0}',
    'html[data-look="2"] .mnav-btn{border-color:rgba(20,35,63,.3)} html[data-look="2"] .mnav-btn span{background:#14233f}',
    '.mnav-btn.show{display:inline-flex}',
    '.mnav-scrim{position:fixed;inset:0;background:rgba(3,6,14,.55);opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s;z-index:998}',
    '.mnav{position:fixed;top:0;right:0;bottom:0;width:min(82vw,320px);background:#0c172b;color:#e8eaf0;border-left:1px solid rgba(255,255,255,.1);box-shadow:-20px 0 50px rgba(0,0,0,.45);transform:translateX(100%);visibility:hidden;transition:transform .28s ease,visibility .28s;z-index:999;display:flex;flex-direction:column;font-family:Inter,system-ui,sans-serif}',
    '.mnav.open{transform:none;visibility:visible} .mnav-scrim.open{opacity:1;visibility:visible}',
    '.mnav-top{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08);font-family:"Exo 2",sans-serif;font-size:12px;font-weight:600;letter-spacing:.22em}',
    '.mnav-top b{color:#e53935;font-weight:600}',
    '.mnav-x{width:38px;height:38px;border:1px solid rgba(255,255,255,.15);border-radius:8px;background:transparent;color:#e8eaf0;font-size:22px;line-height:1;cursor:pointer}',
    '.mnav ul{list-style:none;margin:0;padding:8px 0;overflow-y:auto}',
    '.mnav li a{display:flex;align-items:center;gap:8px;padding:14px 22px;color:#cfd5e2;text-decoration:none;font-size:16px;font-weight:500;border-left:3px solid transparent}',
    '.mnav li a:hover,.mnav li a:focus-visible{background:rgba(255,255,255,.04);color:#fff}',
    '.mnav li a.here{color:#fff;border-left-color:#d63c35}',
    '.mnav li.sep{height:1px;background:rgba(255,255,255,.08);margin:8px 22px}',
    '.mnav li.sub a{font-size:14px;color:#8a9ab5;padding-top:10px;padding-bottom:10px}',
    '.mnav li a svg{width:16px;height:16px;color:#e53e3e;margin:0}',
    '.mnav-foot{margin-top:auto;padding:18px 22px;border-top:1px solid rgba(255,255,255,.08)}',
    '.mnav-foot a{display:block;text-align:center;padding:12px;border-radius:6px;background:#d63c35;color:#fff;text-decoration:none;font-weight:600;letter-spacing:.04em}',
    'body.mnav-lock{overflow:hidden}',
    '@media (max-width:820px){header.bar .wrap{flex-wrap:nowrap;gap:10px} header.bar .tel{font-size:.78rem;padding:8px 10px}}',
    '@media (max-width:360px){header.bar .tel{display:none}}',
    '@media (prefers-reduced-motion:reduce){.mnav,.mnav-scrim{transition:none}}'
  ].join('\n');
  document.head.appendChild(css);

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'mnav-btn';
  btn.setAttribute('aria-label', 'Open menu');
  btn.setAttribute('aria-controls', 'mnav');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  host.appendChild(btn);

  var scrim = document.createElement('div');
  scrim.className = 'mnav-scrim';
  var panel = document.createElement('aside');
  panel.className = 'mnav';
  panel.id = 'mnav';
  panel.setAttribute('aria-label', 'Site menu');
  panel.innerHTML = '<div class="mnav-top"><span>PQ <b>ROBOTICS</b></span><button type="button" class="mnav-x" aria-label="Close menu">&times;</button></div><ul></ul><div class="mnav-foot"><a href="tel:+14044089063">Call (404) 408-9063</a></div>';
  var ul = panel.querySelector('ul');
  var here = location.pathname.replace(/\/$/, '/index.html');
  var seen = {};
  Array.prototype.forEach.call(list.querySelectorAll('a'), function (a) {
    var li = document.createElement('li');
    var c = a.cloneNode(true);
    c.removeAttribute('style'); c.removeAttribute('class');
    var path = (c.pathname || '').replace(/\/$/, '/index.html');
    if (a.classList.contains('here') || (path === here && !c.hash)) c.className = 'here';
    seen[c.pathname] = 1;
    li.appendChild(c); ul.appendChild(li);
  });
  var sep = document.createElement('li'); sep.className = 'sep'; ul.appendChild(sep);
  extras.forEach(function (e) {
    if (seen[e[0]]) return;
    var li = document.createElement('li'); li.className = 'sub';
    var a = document.createElement('a'); a.href = e[0]; a.textContent = e[1];
    if (location.pathname === e[0]) a.className = 'here';
    li.appendChild(a); ul.appendChild(li);
  });
  document.body.appendChild(scrim);
  document.body.appendChild(panel);

  function open() {
    panel.classList.add('open'); scrim.classList.add('open');
    btn.setAttribute('aria-expanded', 'true'); document.body.classList.add('mnav-lock');
    var first = ul.querySelector('a'); if (first) first.focus({ preventScroll: true });
  }
  function close() {
    if (!panel.classList.contains('open')) return;
    panel.classList.remove('open'); scrim.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('mnav-lock');
  }
  btn.addEventListener('click', open);
  scrim.addEventListener('click', close);
  panel.querySelector('.mnav-x').addEventListener('click', function () { close(); btn.focus(); });
  ul.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); btn.focus(); } });

  // Show the button only while the page's own menu is hidden
  function sync() {
    var hidden = window.getComputedStyle(list).display === 'none';
    btn.classList.toggle('show', hidden);
    if (!hidden) close();
  }
  sync();
  window.addEventListener('resize', sync);
})();
