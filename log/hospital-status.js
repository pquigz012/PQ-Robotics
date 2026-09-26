/* PQ Robotics — Drone Hospital status popup.
   Drop this on any page with a "Call (404) 408-9063" link. It intercepts the tap,
   shows the current hospital status, then offers Call and Text.
   Include with:  <script defer src="/log/hospital-status.js"></script>          */
(function () {
  "use strict";
  var PHONE = "+14044089063";
  var STATUS_URL = "/log/status.json";
  var TEXT_BODY = "Hi PQ Robotics — I've got a drone that needs a look. ";

  // Must match the app's schedule. staff = front desk in Suite 200 (takes drop-offs
  // and writes up the job). tech = Paul on site, so diagnosis happens.
  var SCHEDULE = [
    { staff: null,        tech: [780, 900] },   // Sun 1–3
    { staff: [540, 840],  tech: [900, 1110] },  // Mon 9–2, 3–6:30
    { staff: [540, 840],  tech: [900, 1110] },
    { staff: [540, 840],  tech: [900, 1110] },
    { staff: [540, 840],  tech: [900, 1110] },
    { staff: [540, 840],  tech: [900, 1050] },  // Fri closes 5:30
    { staff: null,        tech: [720, 960] },   // Sat 12–4
  ];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var COLORS = { open: "#6FAE86", staff: "#5A86D5", lunch: "#C9A45C", closed: "#B5503F" };

  function clock(m) {
    var h = Math.floor(m / 60) % 24, x = m % 60, ap = h >= 12 ? "PM" : "AM";
    return ((h + 11) % 12 + 1) + (x ? ":" + (x < 10 ? "0" + x : x) : "") + " " + ap;
  }
  function nextOpen(dow, m) {
    for (var i = 0; i < 8; i++) {
      var d = (dow + i) % 7, w = SCHEDULE[d], starts = [];
      if (w.staff) starts.push(w.staff[0]);
      if (w.tech) starts.push(w.tech[0]);
      starts.sort(function (a, b) { return a - b; });
      for (var j = 0; j < starts.length; j++)
        if (i > 0 || starts[j] > m) return { at: starts[j], when: i === 0 ? "today" : i === 1 ? "tomorrow" : DAYS[d] };
    }
    return null;
  }

  function state(mode) {
    var now = new Date(), dow = now.getDay(), m = now.getHours() * 60 + now.getMinutes(), w = SCHEDULE[dow];
    var staffNow = w.staff && m >= w.staff[0] && m < w.staff[1];
    var techNow = w.tech && m >= w.tech[0] && m < w.tech[1];
    var next = nextOpen(dow, m);
    var nextLine = next ? "Next open " + next.when + " at " + clock(next.at) + "." : "";

    if (mode === "closed")
      return { c: COLORS.closed, status: "Closed", body: "Nobody's in the shop right now. Send a text with your name and what's wrong and we'll get back to you. " + nextLine };
    if (mode === "client")
      return staffNow || techNow
        ? { c: COLORS.staff, status: "Out with a client", body: "The tech is out, but the front desk in Suite 200 is open and can take your drone in and write up the job. Text and we'll call you back about the repair." }
        : { c: COLORS.lunch, status: "Out with a client", body: "We'll miss the call right now. Send a text with your name and what's wrong and we'll ring you straight back." };
    if (mode === "open")
      return { c: COLORS.open, status: "Open", body: "Someone's here now. Walk in, no appointment needed." };

    if (techNow)
      return { c: COLORS.open, status: "Open — tech on site", body: "We're in until " + clock(w.tech[1]) + ", so you can get it looked at and quoted today. Walk in, no appointment needed." };
    if (staffNow)
      return { c: COLORS.staff, status: "Front desk open", body: "Our front desk in Suite 200 can take your drone in now and write up the job. The tech is in at " + clock(w.tech[0]) + " and will call you with a diagnosis." };
    if (w.staff && w.tech && m >= w.staff[1] && m < w.tech[0])
      return { c: COLORS.lunch, status: "Out to lunch", body: "Back at " + clock(w.tech[0]) + ". The safe mailbox upstairs in Suite 200 is open if you'd rather leave it now — add your name, number and what's wrong." };
    return { c: COLORS.closed, status: "Closed", body: "Send a text with your name and what's wrong and we'll get back to you when we're in. " + nextLine };
  }

  // The app publishes its override here. If it can't be read, fall back to the schedule.
  var mode = "auto";
  function loadMode() {
    try {
      var x = new XMLHttpRequest();
      x.open("GET", STATUS_URL + "?t=" + Date.now(), true);
      x.onload = function () {
        if (x.status < 200 || x.status >= 300) return;
        try {
          var d = JSON.parse(x.responseText);
          // An override only counts on the day it was set
          if (d.mode && d.mode !== "auto" && d.setAt && new Date(d.setAt).toDateString() === new Date().toDateString()) mode = d.mode;
          else mode = "auto";
        } catch (e) { /* leave it on auto */ }
      };
      x.send();
    } catch (e) { /* leave it on auto */ }
  }

  function css() {
    var s = document.createElement("style");
    s.textContent = [
      ".pqs-wrap{position:fixed;inset:0;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:20px;z-index:99999;font-family:inherit}",
      ".pqs-box{background:#141418;color:#F1F1F3;border:1px solid #2B2B31;border-top:4px solid #6FAE86;border-radius:12px;max-width:390px;width:100%;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.6)}",
      ".pqs-label{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.2em;color:#9B9BA3;text-transform:uppercase}",
      ".pqs-status{font-size:21px;font-weight:800;margin-top:5px;display:flex;align-items:center;gap:9px;line-height:1.2}",
      ".pqs-dot{width:11px;height:11px;border-radius:50%;flex:none}",
      ".pqs-body{color:#C7CBD0;font-size:14.5px;line-height:1.5;margin-top:10px}",
      ".pqs-btns{display:flex;gap:9px;margin-top:16px}",
      ".pqs-btn{flex:1;text-align:center;text-decoration:none;border-radius:6px;padding:13px 10px;font-weight:700;font-size:15.5px;display:block}",
      ".pqs-call{background:#B5503F;color:#fff}",
      ".pqs-text{border:1px solid rgba(255,255,255,.3);color:#fff}",
      ".pqs-close{width:100%;background:none;border:0;color:#9B9BA3;font-size:13.5px;margin-top:12px;padding:6px;cursor:pointer;font-family:inherit}",
    ].join("");
    document.head.appendChild(s);
  }

  function open() {
    var st = state(mode);
    var wrap = document.createElement("div");
    wrap.className = "pqs-wrap";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Drone Hospital status");
    wrap.innerHTML =
      '<div class="pqs-box" style="border-top-color:' + st.c + '">' +
        '<div class="pqs-label">Hospital status</div>' +
        '<div class="pqs-status"><span class="pqs-dot" style="background:' + st.c + '"></span><span></span></div>' +
        '<div class="pqs-body"></div>' +
        '<div class="pqs-btns">' +
          '<a class="pqs-btn pqs-call" href="tel:' + PHONE + '">Call</a>' +
          '<a class="pqs-btn pqs-text" href="sms:' + PHONE + '?&body=' + encodeURIComponent(TEXT_BODY) + '">Text</a>' +
        '</div>' +
        '<button class="pqs-close" type="button">Never mind</button>' +
      '</div>';
    wrap.querySelector(".pqs-status span:last-child").textContent = st.status;
    wrap.querySelector(".pqs-body").textContent = st.body;

    function shut() { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); document.removeEventListener("keydown", esc); }
    function esc(e) { if (e.key === "Escape") shut(); }
    wrap.addEventListener("click", function (e) { if (e.target === wrap) shut(); });
    wrap.querySelector(".pqs-close").addEventListener("click", shut);
    document.addEventListener("keydown", esc);
    document.body.appendChild(wrap);
  }

  function attach() {
    css();
    loadMode();
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
      if (!a || a.classList.contains("pqs-btn")) return;   // let the popup's own Call through
      e.preventDefault();
      open();
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attach);
  else attach();
})();
