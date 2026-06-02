/* ============================================================
   Sifa & Tommy, shared site script
   ============================================================ */
(function () {
  "use strict";

  var EVENTS = {
    civil:     { date: "2026-10-30T11:00:00" },
    religious: { date: "2026-11-28T15:00:00" }
  };

  var NAV = [
    { key: "home",     href: "index.html",    label: "Accueil" },
    { key: "story",    href: "story.html",    label: "Notre Histoire" },
    { key: "details",  href: "details.html",  label: "Les Célébrations" },
    { key: "travel",   href: "travel.html",   label: "Voyage & Séjour" },
    { key: "gallery",  href: "gallery.html",  label: "Galerie" },
    { key: "registry", href: "registry.html", label: "Cadeaux" },
    { key: "faq",      href: "faq.html",      label: "Questions" },
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
          '<button class="menu-btn" aria-label="Menu" type="button"><span></span></button>' +
        "</div>" +
      "</nav>";
    document.body.prepend(header);

    var mb = header.querySelector(".menu-btn");
    mb.addEventListener("click", function () { document.body.classList.toggle("menu-open"); });
    header.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("menu-open"); });
    });

    function onScroll(){ header.classList.toggle("scrolled", window.scrollY > 40); }
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }

  function buildFooter() {
    var f = document.createElement("footer");
    f.className = "site-footer";
    f.innerHTML =
      '<div class="wrap">' +
        '<div class="script reveal">Sifa <span class="amp">&amp;</span> Tommy</div>' +
        '<p class="dt reveal">Lubumbashi &middot; 30.10.2026 &nbsp;&middot;&nbsp; Zanzibar &middot; 28.11.2026</p>' +
        '<div class="flinks reveal">' +
          '<a href="story.html">Notre Histoire</a>' +
          '<a href="details.html">Les Célébrations</a>' +
          '<a href="travel.html">Voyage &amp; Séjour</a>' +
          '<a href="gallery.html">Galerie</a>' +
          '<a href="rsvp.html">RSVP</a>' +
        "</div>" +
        '<p class="credit reveal">Avec amour, de nos deux maisons à la vôtre.</p>' +
      "</div>";
    document.body.appendChild(f);
  }

  /* ---- Countdown ---- */
  function nextEvent() {
    var now = Date.now();
    var civ = new Date(EVENTS.civil.date).getTime();
    var rel = new Date(EVENTS.religious.date).getTime();
    if (now < civ) return { t: civ, label: "avant notre &laquo;&nbsp;oui&nbsp;&raquo; à Lubumbashi" };
    if (now < rel) return { t: rel, label: "avant notre &laquo;&nbsp;oui&nbsp;&raquo; à Zanzibar" };
    return { t: rel, label: "nous sommes mariés", done: true };
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
      el.innerHTML = unit(d, "Jours") + unit(pad(h), "Heures") + unit(pad(m), "Min") + unit(pad(s), "Sec");
      if (lbl) lbl.innerHTML = ev.label;
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

  /* ---- Parallax (desktop only) ---- */
  function initParallax() {
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.innerWidth < 860) return;
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
    var N = window.innerWidth < 768 ? 7 : 12;
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

      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Envoi en cours…"; }

      function showRsvpConfirm() {
        var msg = data.attending === "no"
          ? { title: "Merci de nous avoir prévenus", sub: "Vous nous manquerez, mais nous vous sentons proches de cœur.", note: "Votre réponse a été enregistrée." }
          : { title: "Avec toute notre joie", sub: "Nous avons hâte de célébrer avec vous !", note: "Votre réponse est enregistrée. Votre invitation officielle suivra bientôt." };
        confirm.querySelector("[data-c-title]").textContent = msg.title;
        confirm.querySelector("[data-c-sub]").textContent = msg.sub;
        confirm.querySelector("[data-c-note]").textContent = msg.note;
        form.hidden = true; confirm.hidden = false;
        requestAnimationFrame(function(){ confirm.querySelectorAll(".reveal").forEach(function(r){ r.classList.add("in"); }); });
        window.scrollTo({ top: confirm.getBoundingClientRect().top + window.scrollY - 160, behavior: "smooth" });
      }

      var SHEET_URL = "https://script.google.com/macros/s/AKfycbxA7R-Zfg2KLM8LFi8ndoc-HDDPiz_ZimbZ0txDv6htboVZQCY0TfOjFcUjfiRAiIg6/exec";

      var eventsLabel = {
        lubumbashi: "Lubumbashi — Cérémonie Civile (30 oct. 2026)",
        zanzibar:   "Zanzibar — Cérémonie Religieuse (28 nov. 2026)",
        both:       "Les deux célébrations (Lubumbashi + Zanzibar)"
      }[data.events] || data.events || "";

      var payload = {
        name:        data.name,
        email:       data.email,
        attending:   data.attending === "yes" ? "Yes" : "No",
        celebration: eventsLabel,
        guests:      data.guests || 0,
        diet:        data.diet || "",
        message:     data.message || ""
      };

      fetch(SHEET_URL, {
        method: "POST",
        body: JSON.stringify(payload)
      })
      .then(function(r) { return r.json(); })
      .then(function(result) {
        if (result.success) {
          showRsvpConfirm();
        } else {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Envoyer ma réponse"; }
          alert("Erreur lors de l'envoi. Veuillez réessayer.");
        }
      })
      .catch(function() {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Envoyer ma réponse"; }
        alert("Erreur de connexion. Veuillez réessayer.");
      });
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
      if (toggle) toggle.innerHTML = "Refermer le parchemin <span class=\"tg-secondary\">&middot; Fermer</span>";
    }
    function close() {
      s.classList.remove("is-open");
      paper.style.maxHeight = "0px";
      if (seal) seal.setAttribute("aria-expanded", "false");
      if (toggle) toggle.innerHTML = "Désceller notre histoire <span class=\"tg-secondary\">&middot; Ouvrir</span>";
    }
    function tog() { s.classList.contains("is-open") ? close() : open(); }
    if (seal) seal.addEventListener("click", tog);
    if (toggle) toggle.addEventListener("click", tog);
    window.addEventListener("resize", function () {
      if (s.classList.contains("is-open")) paper.style.maxHeight = measure() + "px";
    });
  }

  /* ---- Page-transition veil ---- */
  function initVeil() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var veil = document.createElement("div");
    veil.className = "page-veil";
    veil.innerHTML = '<span class="veil-mono">S<i>&amp;</i>T</span>';
    document.body.appendChild(veil);
    requestAnimationFrame(function(){ veil.classList.add("reveal-done"); });
    setTimeout(function(){ veil.classList.add("reveal-done"); }, 200);
    window.addEventListener("pageshow", function(){ veil.classList.add("reveal-done"); veil.classList.remove("active"); });
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || a.target === "_blank" || a.hasAttribute("download")) return;
      if (/^(https?:|mailto:|tel:)/i.test(href)) return;
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
      if (btn) btn.textContent = open ? "Fermer l’enveloppe" : "Ouvrir l’enveloppe";
    }
    env.addEventListener("click", function(e){
      if (e.target.closest("a")) return;
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
    box.innerHTML = '<button class="lb-close" aria-label="Fermer">&times;</button>' +
      '<button class="lb-nav lb-prev" aria-label="Précédent">&#8249;</button>' +
      '<figure class="lb-figure"><div class="lb-content"></div><figcaption class="lb-cap"></figcaption></figure>' +
      '<button class="lb-nav lb-next" aria-label="Suivant">&#8250;</button>';
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
    var swipeStartX = 0, swipeStartY = 0;
    box.addEventListener("touchstart", function(e) {
      swipeStartX = e.touches[0].clientX;
      swipeStartY = e.touches[0].clientY;
    }, { passive: true });
    box.addEventListener("touchend", function(e) {
      var dx = e.changedTouches[0].clientX - swipeStartX;
      var dy = e.changedTouches[0].clientY - swipeStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
        go(dx < 0 ? 1 : -1);
      } else if (dy > 72 && Math.abs(dx) < 44) {
        close();
      }
    }, { passive: true });
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
