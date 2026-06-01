/* ============================================================
   Sifa & Tommy — shared site script (v2)
   ============================================================ */
(function () {
  "use strict";

  var EVENTS = {
    civil:     { date: "2026-10-30T11:00:00" },
    religious: { date: "2026-11-28T15:00:00" }
  };

  /* ---- Theme ---- */
  var THEME_KEY = "st-theme";
  function getTheme() { return localStorage.getItem(THEME_KEY) || "elegant"; }
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(THEME_KEY, t);
    document.querySelectorAll(".theme-switch button").forEach(function (b) {
      b.classList.toggle("on", b.dataset.theme === t);
    });
  }
  document.documentElement.setAttribute("data-theme", getTheme());

  var NAV = [
    { key: "home",     href: "index.html",    label: "Home" },
    { key: "story",    href: "story.html",    label: "Our Story" },
    { key: "details",  href: "details.html",  label: "The Day" },
    { key: "travel",   href: "travel.html",   label: "Travel & Stay" },
    { key: "gallery",  href: "gallery.html",  label: "Gallery" },
    { key: "registry", href: "registry.html", label: "Registry" },
    { key: "faq",      href: "faq.html",      label: "FAQ" },
    { key: "rsvp",     href: "rsvp.html",     label: "RSVP" }
  ];

  function buildHeader() {
    var page = document.body.dataset.page || "home";
    var links = NAV.map(function (n) {
      return '<li><a class="' + (n.key === page ? "active" : "") + '" href="' + n.href + '">' + n.label + "</a></li>";
    }).join("");

    var header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML =
      '<nav class="nav">' +
        '<a class="brand" href="index.html">' +
          '<span class="mono">S<span class="amp">&amp;</span>T</span>' +
          "<small>Sifa &amp; Tommy</small>" +
        "</a>" +
        '<ul class="nav-links">' + links + "</ul>" +
        '<div class="nav-right">' +
          '<div class="theme-switch" role="group" aria-label="Choose style">' +
            '<button data-theme="elegant" type="button">Elegant</button>' +
            '<button data-theme="dolce" type="button">Dolce&nbsp;Vita</button>' +
          "</div>" +
          '<button class="menu-btn" aria-label="Menu" type="button"><span></span></button>' +
        "</div>" +
      "</nav>";
    document.body.prepend(header);

    header.querySelectorAll(".theme-switch button").forEach(function (b) {
      b.addEventListener("click", function () { setTheme(b.dataset.theme); });
    });
    var mb = header.querySelector(".menu-btn");
    mb.addEventListener("click", function () { document.body.classList.toggle("menu-open"); });
    header.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("menu-open"); });
    });
    setTheme(getTheme());

    // scrolled state
    function onScroll(){ header.classList.toggle("scrolled", window.scrollY > 40); }
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }

  function buildFooter() {
    var f = document.createElement("footer");
    f.className = "site-footer";
    f.innerHTML =
      '<div class="wrap">' +
        '<div class="script reveal">Sifa <span class="amp">&amp;</span> Tommy</div>' +
        '<p class="dt reveal">Lubumbashi &middot; 30.10.2026 &nbsp;&mdash;&nbsp; Zanzibar &middot; 28.11.2026</p>' +
        '<div class="flinks reveal">' +
          '<a href="story.html">Our Story</a>' +
          '<a href="details.html">The Day</a>' +
          '<a href="travel.html">Travel &amp; Stay</a>' +
          '<a href="gallery.html">Gallery</a>' +
          '<a href="rsvp.html">RSVP</a>' +
        "</div>" +
        '<p class="credit reveal">With love, from our two homes to yours &middot; Avec amour.</p>' +
      "</div>";
    document.body.appendChild(f);
  }

  /* ---- Countdown ---- */
  function nextEvent() {
    var now = Date.now();
    var civ = new Date(EVENTS.civil.date).getTime();
    var rel = new Date(EVENTS.religious.date).getTime();
    if (now < civ) return { t: civ, label: "until we say <em>I do</em> in Lubumbashi", labelFr: "avant le \u00ab oui \u00bb \u00e0 Lubumbashi" };
    if (now < rel) return { t: rel, label: "until we say <em>I do</em> in Zanzibar", labelFr: "avant le \u00ab oui \u00bb \u00e0 Zanzibar" };
    return { t: rel, label: "we are married", labelFr: "nous sommes mari\u00e9s", done: true };
  }
  function initCountdown() {
    var el = document.querySelector("[data-countdown]");
    if (!el) return;
    var lbl = document.querySelector("[data-countdown-label]");
    function pad(n){ return (n<10?"0":"")+n; }
    function unit(v, l){ return '<div class="cd-unit"><b>' + v + "</b><span>" + l + "</span></div>"; }
    function tick() {
      var ev = nextEvent();
      var diff = Math.max(0, ev.t - Date.now());
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      el.innerHTML = unit(d, "Days") + unit(pad(h), "Hours") + unit(pad(m), "Min") + unit(pad(s), "Sec");
      if (lbl) lbl.innerHTML = ev.label + ' <span class="fr">&middot; ' + ev.labelFr + "</span>";
    }
    tick(); setInterval(tick, 1000);
  }

  /* ---- Reveal on scroll ---- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) { els.forEach(function(e){e.classList.add("in");}); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---- Parallax ---- */
  function initParallax() {
    var nodes = [].slice.call(document.querySelectorAll("[data-parallax]"));
    if (!nodes.length) return;
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      nodes.forEach(function (n) {
        var speed = parseFloat(n.dataset.parallax) || 0.15;
        var r = n.getBoundingClientRect();
        var offset = (r.top + r.height / 2 - vh / 2) * -speed;
        n.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---- Petals (hero only) ---- */
  function initPetals() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var hero = document.querySelector(".hero .petals");
    if (!hero) return;
    var N = 12;
    for (var i = 0; i < N; i++) {
      var p = document.createElement("span");
      p.className = "petal";
      var size = 7 + Math.random() * 13;
      p.style.width = size + "px";
      p.style.height = size * (0.7 + Math.random() * 0.5) + "px";
      p.style.left = (Math.random() * 100) + "%";
      var dur = 11 + Math.random() * 12;
      var delay = -Math.random() * dur;
      p.style.animation = "petalFall " + dur + "s linear " + delay + "s infinite";
      p.style.setProperty("--sway", (14 + Math.random() * 26) + "px");
      p.style.setProperty("--rot", (Math.random() * 360) + "deg");
      hero.appendChild(p);
    }
  }

  /* ---- FAQ ---- */
  function initFaq() {
    document.querySelectorAll(".faq-q").forEach(function (q) {
      q.addEventListener("click", function () {
        var item = q.closest(".faq-item");
        var a = item.querySelector(".faq-a");
        var open = item.classList.toggle("open");
        a.style.maxHeight = open ? a.scrollHeight + "px" : 0;
      });
    });
  }

  /* ---- RSVP ---- */
  function initRsvp() {
    var form = document.getElementById("rsvp-form");
    if (!form) return;
    var confirm = document.getElementById("rsvp-confirm");

    form.querySelectorAll(".seg[data-name] label").forEach(function (lab) {
      lab.addEventListener("click", function () {
        var seg = lab.closest(".seg");
        seg.querySelectorAll("label").forEach(function (l){ l.classList.remove("sel"); });
        lab.classList.add("sel");
        seg.dataset.value = lab.dataset.value;
        if (seg.dataset.name === "attending") {
          var declined = lab.dataset.value === "no";
          form.querySelectorAll("[data-when-attending]").forEach(function (f) { f.style.display = declined ? "none" : ""; });
        }
        var fld = seg.closest(".field"); if (fld) fld.classList.remove("error");
      });
    });

    form.querySelectorAll("input,select,textarea").forEach(function(i){
      i.addEventListener("input", function(){ var f=i.closest(".field"); if(f) f.classList.remove("error"); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      function fail(field){ ok=false; field.classList.add("error"); }

      var name = form.querySelector('[name="name"]');
      if (!name.value.trim()) fail(name.closest(".field"));
      var email = form.querySelector('[name="email"]');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) fail(email.closest(".field"));
      var attendSeg = form.querySelector('.seg[data-name="attending"]');
      if (!attendSeg.dataset.value) fail(attendSeg.closest(".field"));

      var attending = attendSeg.dataset.value !== "no";
      if (attending) {
        var guests = form.querySelector('[name="guests"]');
        if (!guests.value) fail(guests.closest(".field"));
        var which = form.querySelector('.seg[data-name="events"]');
        if (which && !which.dataset.value) fail(which.closest(".field"));
      }

      if (!ok) {
        var firstErr = form.querySelector(".field.error");
        if (firstErr) window.scrollTo({ top: firstErr.getBoundingClientRect().top + window.scrollY - 140, behavior: "smooth" });
        return;
      }

      var data = {
        name: name.value.trim(), email: email.value.trim(),
        attending: attendSeg.dataset.value,
        events: (form.querySelector('.seg[data-name="events"]') && form.querySelector('.seg[data-name="events"]').dataset.value) || "",
        guests: (form.querySelector('[name="guests"]') || {}).value || "",
        diet: (form.querySelector('[name="diet"]') || {}).value || "",
        message: (form.querySelector('[name="message"]') || {}).value || "",
        at: new Date().toISOString()
      };
      try {
        var all = JSON.parse(localStorage.getItem("st-rsvps") || "[]");
        all.push(data); localStorage.setItem("st-rsvps", JSON.stringify(all));
      } catch (err) {}

      var msg = data.attending === "no"
        ? { en: "Thank you for letting us know", fr: "Merci de nous avoir pr\u00e9venus.", sub: "We will miss you dearly \u2014 but we feel your love from afar." }
        : { en: "With all our joy", fr: "Avec toute notre joie \u2014 nous avons h\u00e2te de c\u00e9l\u00e9brer avec vous !", sub: "Your reply is saved. Watch your inbox for the official invitation." };
      confirm.querySelector("[data-c-en]").textContent = msg.en;
      confirm.querySelector("[data-c-fr]").textContent = msg.fr;
      confirm.querySelector("[data-c-sub]").textContent = msg.sub;
      form.hidden = true; confirm.hidden = false;
      requestAnimationFrame(function(){ confirm.querySelectorAll(".reveal").forEach(function(r){ r.classList.add("in"); }); });
      window.scrollTo({ top: confirm.getBoundingClientRect().top + window.scrollY - 160, behavior: "smooth" });
    });
  }

  /* ---- Parchment story scroll ---- */
  function initScroll() {
    var s = document.getElementById("storyScroll");
    if (!s) return;
    var paper = s.querySelector(".paper");
    var inner = s.querySelector(".paper-inner");
    var seal = s.querySelector(".wax-seal");
    var toggle = document.getElementById("storyToggle");
    function measure(){ return inner.scrollHeight + 44; }
    function open() {
      s.classList.add("is-open");
      paper.style.maxHeight = measure() + "px";
      if (seal) seal.setAttribute("aria-expanded", "true");
      if (toggle) toggle.innerHTML = "Roll it back up <span class=\"tg-secondary\">&middot; Refermer</span>";
    }
    function close() {
      s.classList.remove("is-open");
      paper.style.maxHeight = "0px";
      if (seal) seal.setAttribute("aria-expanded", "false");
      if (toggle) toggle.innerHTML = "Unseal our story <span class=\"tg-secondary\">&middot; Ouvrir</span>";
    }
    function tog() { s.classList.contains("is-open") ? close() : open(); }
    if (seal) seal.addEventListener("click", tog);
    if (toggle) toggle.addEventListener("click", tog);
    // keep height correct after content reflow / resize
    window.addEventListener("resize", function () {
      if (s.classList.contains("is-open")) paper.style.maxHeight = measure() + "px";
    });
  }

  /* ---- Page-transition veil (event-driven navigation) ---- */
  function initVeil() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var veil = document.createElement("div");
    veil.className = "page-veil";
    veil.innerHTML = '<span class="veil-mono">S<i>&amp;</i>T</span>';
    document.body.appendChild(veil);
    // fade out on arrival (rAF + timeout fallback so it never stays stuck)
    requestAnimationFrame(function(){ veil.classList.add("reveal-done"); });
    setTimeout(function(){ veil.classList.add("reveal-done"); }, 200);
    window.addEventListener("pageshow", function(){ veil.classList.add("reveal-done"); veil.classList.remove("active"); });
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || a.target === "_blank" || a.hasAttribute("download")) return;
      if (/^(https?:|mailto:|tel:)/i.test(href)) return;            // external / contact
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      veil.classList.remove("reveal-done");
      veil.classList.add("active");
      setTimeout(function(){ window.location.href = href; }, 520);
    });
  }

  /* ---- Scroll-progress hairline ---- */
  function initProgress() {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);
    var ticking = false;
    function upd() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? (h.scrollTop || window.scrollY) / max : 0) + ")";
      ticking = false;
    }
    upd();
    window.addEventListener("scroll", function(){ if(!ticking){ requestAnimationFrame(upd); ticking = true; } }, { passive: true });
    window.addEventListener("resize", upd);
  }

  /* ---- Count-up numbers on reveal ---- */
  function initCountUp() {
    var els = [].slice.call(document.querySelectorAll("[data-countup]"));
    if (!els.length) return;
    function run(el) {
      var target = parseFloat(el.dataset.countup);
      var dur = 1500, t0 = null;
      var prefix = el.dataset.prefix || "", suffix = el.dataset.suffix || "";
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function(ents){
      ents.forEach(function(en){ if(en.isIntersecting){ run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    els.forEach(function(e){ io.observe(e); });
  }

  /* ---- Envelope opener (Save the Date) ---- */
  function initEnvelope() {
    var env = document.getElementById("sd-envelope");
    if (!env) return;
    var btn = document.getElementById("sd-trigger");
    function toggle() {
      var open = env.classList.toggle("open");
      env.setAttribute("aria-expanded", open ? "true" : "false");
      if (btn) btn.textContent = open ? "Close the envelope" : "Open the envelope";
    }
    env.addEventListener("click", function(e){
      if (e.target.closest("a")) return;       // let links inside the card work
      toggle();
    });
    env.addEventListener("keydown", function(e){
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
    if (btn) btn.addEventListener("click", function(e){ e.stopPropagation(); toggle(); });
  }

  /* ---- Lightbox (gallery) ---- */
  function initLightbox() {
    var items = [].slice.call(document.querySelectorAll("[data-lightbox]"));
    if (!items.length) return;
    var box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = '<button class="lb-close" aria-label="Close">&times;</button>' +
      '<button class="lb-nav lb-prev" aria-label="Previous">&#8249;</button>' +
      '<figure class="lb-figure"><div class="lb-content"></div><figcaption class="lb-cap"></figcaption></figure>' +
      '<button class="lb-nav lb-next" aria-label="Next">&#8250;</button>';
    document.body.appendChild(box);
    var content = box.querySelector(".lb-content");
    var cap = box.querySelector(".lb-cap");
    var idx = 0;
    function render() {
      var el = items[idx];
      var img = el.querySelector("img");
      content.innerHTML = "";
      if (img) {
        var c = img.cloneNode(true); c.removeAttribute("style"); content.appendChild(c);
      } else {
        var ph = document.createElement("div");
        ph.className = "lb-ph";
        ph.textContent = el.getAttribute("data-label") || "Photo";
        content.appendChild(ph);
      }
      cap.textContent = (idx + 1) + " / " + items.length;
    }
    function open(i){ idx = i; render(); box.classList.add("open"); document.body.style.overflow = "hidden"; }
    function close(){ box.classList.remove("open"); document.body.style.overflow = ""; }
    function go(d){ idx = (idx + d + items.length) % items.length; render(); }
    items.forEach(function(el, i){ el.style.cursor = "zoom-in"; el.addEventListener("click", function(){ open(i); }); });
    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-prev").addEventListener("click", function(e){ e.stopPropagation(); go(-1); });
    box.querySelector(".lb-next").addEventListener("click", function(e){ e.stopPropagation(); go(1); });
    box.addEventListener("click", function(e){ if (e.target === box) close(); });
    document.addEventListener("keydown", function(e){
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    });
  }

  /* ---- Tilt on cards (subtle, pointer-driven) ---- */
  function initTilt() {
    if (window.matchMedia("(hover: none)").matches) return;
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 4;
        el.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-4px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* ---- init ---- */
  document.addEventListener("DOMContentLoaded", function () {
    buildHeader();
    buildFooter();
    initCountdown();
    initReveal();
    initParallax();
    initPetals();
    initFaq();
    initRsvp();
    initScroll();
    initVeil();
    initProgress();
    initCountUp();
    initEnvelope();
    initLightbox();
    initTilt();
    // Failsafe: ensure hero intro content is visible even if the entrance
    // animation never commits (e.g. throttled/offscreen rendering contexts).
    setTimeout(function () {
      document.querySelectorAll(".intro").forEach(function (e) {
        e.style.animation = "none";
        e.style.opacity = "1";
        e.style.transform = "none";
        e.style.filter = "none";
      });
    }, 3200);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ document.body.classList.add("loaded"); }); });
  });
  window.addEventListener("load", function(){ document.body.classList.add("loaded"); });
})();
