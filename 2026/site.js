/* Cete Studio 2026 — curseur, loader, roulette, page projet, modal contact et transitions Barba.js
   Chargé depuis Webflow (code global du site, pied de page), après barba.umd.js */

/* ---------- Curseur personnalisé (cercle + point, mode différence) ---------- */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return; // pas de curseur sur tactile
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PLAY = 'https://cdn.prod.website-files.com/6acf743eb4f622a1815188f4/6acf78fbe4ae41a4c2e44959_play.svg';
  var c = document.createElement('div');
  c.className = 'c-cursor';
  c.setAttribute('aria-hidden', 'true');
  c.innerHTML = '<div class="c-cursor__ring"></div><div class="c-cursor__dot"></div>' +
    '<div class="c-cursor__label"><div class="c-cursor__label-in"><img src="' + PLAY + '" alt=""><span>Lire le showreel</span></div></div>' +
    // Lecture / pause au survol de la vidéo du showreel (maquette Figma « Play/Pause »)
    '<div class="c-cursor__media"><svg class="c-cursor__icon" viewBox="0 0 60 60" fill="none" stroke="#fff" stroke-width="1">' +
      '<circle cx="30" cy="30" r="29.5"/>' +
      '<g class="c-cursor__pause"><path d="M27.5 25v10M32.5 25v10"/></g>' +
      '<g class="c-cursor__play"><path d="M27.5 24.9v10.4l8.4-5.2z" stroke-linejoin="round"/></g></svg></div>';
  document.body.appendChild(c);
  document.documentElement.classList.add('has-cursor');
  var ring = c.querySelector('.c-cursor__ring'), dot = c.querySelector('.c-cursor__dot'), label = c.querySelector('.c-cursor__label');
  var media = c.querySelector('.c-cursor__media'), over = null;   // vidéo survolée
  var mx = -100, my = -100, rx = mx, ry = my;
  var LINKS = 'a, button, [role="button"], input[type="submit"], label, select';

  window.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!c.classList.contains('is-visible')) { rx = mx; ry = my; c.classList.add('is-visible'); }
  });
  document.addEventListener('mouseleave', function () { c.classList.remove('is-visible'); });
  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest ? e.target : null;
    var video = !!(t && t.closest('.showreel'));
    over = t && t.closest('.sr-video');
    c.classList.toggle('is-video', video);
    c.classList.toggle('is-hover', !video && !over && !!(t && t.closest(LINKS)));
    mediaState();
  });
  function mediaState() {
    c.classList.toggle('is-media', !!over);
    c.classList.toggle('is-paused', !!over && over.paused);
  }
  // L'icône suit l'état réel de la vidéo (clic, Espace, fin de lecture…)
  ['play', 'pause', 'ended'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (e.target === over) mediaState(); }, true);
  });

  (function loop() {
    rx += (mx - rx) * (reduce ? 1 : 0.18);   // le cercle suit avec une légère inertie
    ry += (my - ry) * (reduce ? 1 : 0.18);
    dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    label.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    media.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    requestAnimationFrame(loop);
  })();
})();

(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.16,1,.3,1)';     // expo.out : entrées
  var INOUT = 'cubic-bezier(.65,0,.35,1)';   // power3.inOut : rideaux, sorties, déplacements
  var LOADER_LOGO = 'https://cdn.prod.website-files.com/6acf743eb4f622a1815188f4/6acf8869d90e9eb863d5e204_logo-cete-loader.svg';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function sideW() { var s = $('.side-bar'); return s ? s.offsetWidth : 68; }
  function setSide() { root.style.setProperty('--side', sideW() + 'px'); }
  setSide();
  window.addEventListener('resize', setSide);

  /* ---------- Outils : masques ---------- */
  function maskText(el, axis) {
    if (!el) return null;
    var inner = document.createElement('span');
    while (el.firstChild) inner.appendChild(el.firstChild);
    el.appendChild(inner);
    if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
    el.style.overflow = 'hidden';
    el.style.padding = axis === 'x' ? '0 .15em' : '.15em 0';
    el.style.margin = axis === 'x' ? '0 -.15em' : '-.15em 0';
    inner.style.display = 'block';
    inner.dataset.axis = axis || 'y';
    hide(inner);
    return inner;
  }
  function hide(el) {
    el.style.transition = 'none';
    el.style.transform = el.dataset.axis === 'x' ? 'translateX(170%)' : 'translateY(170%)';
  }
  function reveal(list, delay, stagger, dur) {
    list.filter(Boolean).forEach(function (el, i) {
      setTimeout(function () {
        el.style.transition = 'transform ' + (dur || 1000) + 'ms ' + EASE;
        el.style.transform = 'none';
      }, delay + i * (stagger || 0));
    });
  }
  function conceal(list, delay, stagger, dur) {
    list.filter(Boolean).forEach(function (el, i) {
      setTimeout(function () {
        el.style.transition = 'transform ' + (dur || 500) + 'ms ' + INOUT;
        el.style.transform = el.dataset.axis === 'x' ? 'translateX(-170%)' : 'translateY(-170%)';
      }, delay + i * (stagger || 0));
    });
  }

  /* =====================================================================
     ACCUEIL : loader (1re visite), titre en masque, roulette pilotée au scroll
     ===================================================================== */
  function Home(container, opts) {
    var first = opts.first;
    var ac = new AbortController();
    function on(t, type, fn, o) { o = o || {}; o.signal = ac.signal; t.addEventListener(type, fn, o); }
    var alive = true, leaving = false;
    var track = $('.home-track', container);
    if (!track) return null;

    /* ---- 1. Titre : chaque ligne monte depuis un masque ---- */
    var titleLines = [], titleReady = false, titleWanted = false;
    function splitTitle() {
      if (titleReady || !alive) return;
      titleReady = true;
      var h = $('.hero-title', track);
      if (!h) return;
      var words = h.textContent.trim().split(/\s+/);
      h.textContent = '';
      var spans = words.map(function (w, i) {
        var s = document.createElement('span');
        s.textContent = w;
        s.style.display = 'inline-block';
        h.appendChild(s);
        if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
        return s;
      });
      var lines = [], top = null;
      spans.forEach(function (s) {
        if (s.offsetTop !== top) { lines.push([]); top = s.offsetTop; }
        lines[lines.length - 1].push(s.textContent);
      });
      h.textContent = '';
      h.setAttribute('aria-label', words.join(' '));
      lines.forEach(function (l) {
        var mask = document.createElement('span');
        mask.setAttribute('aria-hidden', 'true');
        mask.style.cssText = 'display:block;overflow:hidden;padding-bottom:.08em;margin-bottom:-.08em';
        var inner = document.createElement('span');
        inner.textContent = l.join(' ');
        inner.style.cssText = 'display:block;transform:translateY(110%)';
        mask.appendChild(inner);
        h.appendChild(mask);
        titleLines.push(inner);
      });
      root.classList.remove('is-intro');
      if (titleWanted) revealTitle();
    }
    function revealTitle() {
      titleWanted = true;
      if (!titleReady) return;
      titleLines.forEach(function (s, i) {
        s.style.transition = 'transform 1100ms ' + EASE + ' ' + (i * 90) + 'ms';
        s.style.transform = 'translateY(0)';
      });
    }
    function concealTitle() {
      titleLines.forEach(function (s, i) {
        s.style.transition = 'transform 650ms ' + INOUT + ' ' + (i * 60) + 'ms';
        s.style.transform = 'translateY(-110%)';
      });
    }
    if (reduce) { root.classList.remove('is-intro'); }
    else if (first && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(splitTitle);
      setTimeout(splitTitle, 1500); // filet de sécurité
    } else { splitTitle(); }

    /* ---- 2. Roulette ---- */
    var wheel = $('.wheel', track);
    var base = $$('.wheel-card', wheel);
    var N = base.length;
    if (!N) return null;

    // Chaque carte vient de la collection CMS « Works » : lien vers la page du projet (/works/slug)
    base.forEach(function (c) {
      var slug = c.getAttribute('data-slug');
      if (slug) c.setAttribute('href', '/works/' + slug);
    });
    // On triple la série pour que la boucle se fasse hors écran
    for (var r = 0; r < 2; r++) {
      base.forEach(function (c) {
        var cl = c.cloneNode(true);
        cl.setAttribute('aria-hidden', 'true');
        cl.setAttribute('tabindex', '-1');
        wheel.appendChild(cl);
      });
    }
    var cards = $$('.wheel-card', wheel);
    var M = cards.length;

    var info = $('.wheel-info', track);
    var num = $('.wheel-num', track);
    var title = $('.wheel-title', track);
    var arrow = $('.wheel-arrow', track);

    var START = 0;            // projet affiché à la fin de l'intro (0 = 01)
    var INTRO_DEG = 5;        // l'intro part déjà sur 01 / Naostage et tourne de 5° maximum
    var INTRO_MS = 1600;
    var INTRO_FROM = -0.5;    // recalculé dans geo() : INTRO_DEG / écart angulaire
    var intro = !reduce, introGo = false;
    var cur = intro ? INTRO_FROM : START, target = START, active = -1, g = {}, dirty = true;
    var timer, snapTimer, lock = 0, t0 = null;

    function geo() {
      var W = window.innerWidth, H = window.innerHeight, m = W < 768;
      var k = m ? W / 390 : W / 1440;   // maquette desktop 1440 × 867
      g = {
        step: m ? 12.5 : 14,              // écart angulaire entre deux photos
        R:    m ? 520 * k : 640 * k,      // rayon de la roue
        px:   m ? W * 1.75 : 1880 * k,    // pivot, hors écran à droite
        py:   m ? H * 0.62 : H / 2,
        sc:   m ? 1.18 : 1.423,           // photo active : 560 px de large sur la maquette
        n1:   m ? 0.95 : 0.973,           // taille des photos voisines
        fall: m ? 0.12 : 0.157,           // réduction de taille par cran supplémentaire
        sh:   m ? 0 : -179 * k,           // décalage vers la gauche de la photo active
        gap:  m ? 20 : 40 * k,
        w: cards[0].offsetWidth,
        h: cards[0].offsetHeight
      };
      INTRO_FROM = START - INTRO_DEG / g.step;
      if (intro && !introGo) cur = INTRO_FROM;
      dirty = true;
    }
    function smooth(t) { return t * t * (3 - 2 * t); }
    function easeIntro(t) { return t >= 1 ? 1 : 1 - Math.pow(1 - t, 4); }   // quart.out
    function dist(j) { var d = j - cur; d = ((d % M) + M) % M; if (d >= M / 2) d -= M; return d; }

    // Infos du projet : numéro, titre et flèche dans des masques
    var OFF = '170%';
    function masked(el) {
      el.style.display = 'block';
      el.style.overflow = 'hidden';
      el.style.padding = '.15em 0';
      el.style.margin = '-.15em 0';
      var s = el.querySelector('img') || document.createElement('span');
      if (!s.parentNode) { s.textContent = el.textContent; el.textContent = ''; el.appendChild(s); }
      s.style.display = 'block';
      s.style.transform = 'translateY(' + OFF + ')';
      return s;
    }
    var numIn = masked(num), titleIn = masked(title), arrowIn = masked(arrow);
    var parts = [numIn, titleIn, arrowIn];
    function hideInfo() {
      parts.forEach(function (el, i) {
        el.style.transition = 'transform 380ms ' + INOUT + ' ' + (i * 40) + 'ms';
        el.style.transform = 'translateY(-' + OFF + ')';
      });
    }
    function showInfo() {
      parts.forEach(function (el) { el.style.transition = 'none'; el.style.transform = 'translateY(' + OFF + ')'; });
      info.offsetHeight;
      parts.forEach(function (el, i) {
        el.style.transition = 'transform 900ms ' + EASE + ' ' + (i * 70) + 'ms';
        el.style.transform = 'translateY(0)';
      });
    }
    function apply(i) {
      var c = cards[i], h = c.getAttribute('href');
      numIn.textContent = c.getAttribute('data-num');
      titleIn.textContent = c.getAttribute('data-title');
      title.setAttribute('href', h);
      arrow.setAttribute('href', h);
    }
    function setActive(i, instant) {
      active = i;
      if (instant || reduce) {
        apply(i);
        parts.forEach(function (el) { el.style.transition = 'none'; el.style.transform = 'translateY(0)'; });
        return;
      }
      hideInfo();
      clearTimeout(timer);
      timer = setTimeout(function () { if (!leaving) { apply(active); showInfo(); } }, 400);
    }

    function render() {
      for (var j = 0; j < M; j++) {
        var d = dist(j), ad = Math.abs(d);
        var a = -d * g.step;              // les projets suivants arrivent par le bas
        var f = smooth(Math.max(0, 1 - ad));
        var rad = a * Math.PI / 180;
        var x = g.px - g.R * Math.cos(rad) + g.sh * f;
        var y = g.py - g.R * Math.sin(rad);
        var s = ad < 1 ? g.n1 + (g.sc - g.n1) * f : Math.max(0.55, g.n1 - g.fall * (ad - 1));
        var c = cards[j];
        c.style.transform = 'translate3d(' + (x - g.w / 2) + 'px,' + (y - g.h / 2) + 'px,0) rotate(' + a + 'deg) scale(' + s + ')';
        c.style.zIndex = String(100 - Math.round(ad * 10));
        c.style.filter = 'grayscale(' + (1 - f).toFixed(3) + ')';   // noir et blanc derrière, couleur devant
        c.style.visibility = ad > 6.5 ? 'hidden' : 'visible';
      }
      var aw = g.w * g.sc, ah = g.h * g.sc;
      info.style.left = (g.px - g.R + g.sh - aw / 2) + 'px';
      info.style.top = (g.py + ah / 2 + g.gap) + 'px';
      if (intro) return;
      var i = ((Math.round(cur) % N) + N) % N;
      if (i !== active) setActive(i, active === -1);
    }

    /* ---- 3. Entrées : molette, tactile, clavier (la page ne défile jamais) ---- */
    var dir = 0;
    function blocked() { return intro || leaving || root.classList.contains('is-menu') || root.classList.contains('is-reel'); }
    function snapLater() {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(function () {
        target = dir > 0 ? Math.ceil(target - 0.2) : Math.floor(target + 0.2);
      }, 140);
    }
    function stepBy(n) { target = Math.round(target) + n; }

    on(window, 'wheel', function (e) {
      e.preventDefault();
      if (blocked()) return;
      var dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      if (reduce) {
        var now = Date.now();
        if (Math.abs(dy) > 4 && now - lock > 450) { lock = now; stepBy(dy > 0 ? 1 : -1); }
        return;
      }
      dy = Math.max(-120, Math.min(120, dy));
      if (dy) dir = dy > 0 ? 1 : -1;
      target += dy / 450;
      snapLater();
    }, { passive: false });

    var ty = null;
    on(window, 'touchstart', function (e) { ty = e.touches[0].clientY; }, { passive: true });
    on(window, 'touchmove', function (e) {
      if (ty === null) return;
      e.preventDefault();
      if (blocked()) return;
      var y = e.touches[0].clientY;
      if (ty !== y) dir = ty > y ? 1 : -1;
      target += (ty - y) / 220;
      ty = y;
    }, { passive: false });
    on(window, 'touchend', function () {
      ty = null;
      if (blocked()) return;
      target = dir > 0 ? Math.ceil(target - 0.2) : Math.floor(target + 0.2);
    });
    on(window, 'keydown', function (e) {
      var t = e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || blocked()) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); stepBy(1); }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); stepBy(-1); }
    });
    base.forEach(function (c, i) {
      on(c, 'focus', function () {
        var diff = ((i - Math.round(target)) % N + N) % N;
        if (diff > N / 2) diff -= N;
        target = Math.round(target) + diff;
      });
    });

    function tick(now) {
      if (!alive || leaving) return;     // la roue s'arrête pendant la transition vers un projet
      if (intro) {
        if (introGo) {
          if (t0 === null) t0 = now;
          var p = Math.min((now - t0) / INTRO_MS, 1);
          cur = INTRO_FROM + (START - INTRO_FROM) * easeIntro(p);
          dirty = true;
          if (active === -1 && p >= 0.85) {  // 01 / Naostage apparaît en masque une fois la roue posée
            active = ((START % N) + N) % N;
            apply(active);
            showInfo();
          }
          if (p >= 1) { intro = false; cur = target = START; }
        }
      } else if (reduce) {
        if (cur !== target) { cur = target; dirty = true; }
      } else if (Math.abs(target - cur) > 0.0005) {
        cur += (target - cur) * 0.1;
        dirty = true;
      } else if (cur !== target) {
        cur = target; dirty = true;
      }
      if (dirty) { render(); dirty = false; }
      requestAnimationFrame(tick);
    }

    window.scrollTo(0, 0);
    on(window, 'resize', geo);
    geo();
    render();
    requestAnimationFrame(tick);

    /* ---- 4. État initial caché (titre, tags, showreel, roulette) ---- */
    var tagsBox = $('.hero-tags', track);
    var tags = tagsBox ? $$('.hero-tag', tagsBox) : [];
    var showreel = $('.showreel', track);
    var video = $('.showreel-video', track);
    // Extrait du showreel en boucle (vidéo native dans le Designer) :
    // régler data-start (début, en s) et data-length (durée) dans les attributs de l'élément
    if (video) {
      video.muted = true;
      if (reduce) { video.removeAttribute('autoplay'); video.pause(); }
      else {
        var vs = +video.getAttribute('data-start') || 0, vl = +video.getAttribute('data-length') || 15;
        var restart = function () {
          if (root.classList.contains('is-reel')) return;   // en pause pendant la modal showreel
          video.currentTime = vs; var p = video.play(); if (p && p.catch) p.catch(function () {});
        };
        on(video, 'loadedmetadata', function () { if (video.currentTime < vs) video.currentTime = vs; });
        on(video, 'timeupdate', function () { if (video.currentTime >= vs + vl) restart(); });
        on(video, 'pause', function () { if (video.currentTime >= vs + vl - 0.4) restart(); });
        on(video, 'ended', restart);
        var pv = video.play(); if (pv && pv.catch) pv.catch(function () {});
      }
    }

    var api = {
      destroy: function () { alive = false; ac.abort(); clearTimeout(timer); clearTimeout(snapTimer); },
      leaveTo: leaveTo
    };
    if (reduce) { root.classList.remove('is-loading'); intro = false; return api; }

    if (tagsBox) { tagsBox.style.overflow = 'hidden'; tagsBox.style.paddingBottom = '2px'; }
    tags.forEach(function (t) { t.dataset.axis = 'y'; hide(t); });
    if (showreel) showreel.style.clipPath = 'inset(100% 0 0 0 round 5px)';
    wheel.style.opacity = '0';

    // Retour sur l'accueil depuis une autre page : pas de loader, entrée directe (étapes 6 à 8)
    if (!first) {
      setTimeout(function () {
        revealTitle();
        reveal(tags, 450, 70, 900);
      }, 100);
      setTimeout(function () {
        wheel.style.transition = 'opacity 900ms ease';
        wheel.style.opacity = '1';
        introGo = true;
      }, 500);
      setTimeout(function () {
        if (showreel) { showreel.style.transition = 'clip-path 1100ms ' + EASE; showreel.style.clipPath = 'inset(0 0 0 0 round 5px)'; }
      }, 1500);
      return api;
    }

    /* ---- 5. Loader (1re visite, étapes 1 à 8 de la maquette) ---- */
    var sideContact = maskText($('.side-contact'), 'x');
    var sideCopy = maskText($('.side-copy'), 'x');
    var burger = $$('.burger-line');
    burger.forEach(function (b) { b.style.transformOrigin = 'right center'; b.style.transform = 'scaleX(0)'; });
    var navLinks = $$('.home-nav .nav-link', track).map(function (a) { return maskText(a); });
    var socials = $$('.home-socials .nav-link', track).map(function (a) { return maskText(a); });
    var logo = $('.home-logo', track);
    var logoImg = $('.home-logo img', track);
    if (logo && logoImg) { logo.style.overflow = 'hidden'; logoImg.dataset.axis = 'y'; hide(logoImg); }

    var side = $('.side-bar');
    var L = document.createElement('div');
    L.setAttribute('aria-hidden', 'true');
    L.style.cssText = 'position:fixed;top:0;right:0;bottom:0;width:100vw;z-index:9998;background:#f0f0f0;overflow:hidden;' +
      'transition:background-color 700ms ' + INOUT + ', width 1100ms ' + INOUT;
    var grp = document.createElement('div');
    grp.style.cssText = 'position:absolute;left:50vw;top:50%;width:min(626px, 86vw);transform:translate(-50%,-50%);display:flex;' +
      'justify-content:space-between;align-items:center;mix-blend-mode:difference;color:#fff;pointer-events:none';
    // logo « cete » (SVG vertical tourné de 90°), révélé par un masque qui s'ouvre de gauche à droite
    var lMask = document.createElement('div');
    lMask.style.cssText = 'position:relative;width:55px;height:21px;flex:none;transition:transform 1100ms ' + EASE;
    var lIn = document.createElement('div');
    lIn.style.cssText = 'position:relative;width:55px;height:21px;clip-path:inset(-8px calc(100% + 8px) -8px -8px)';
    var lImg = document.createElement('img');
    lImg.src = LOADER_LOGO; lImg.alt = '';
    lImg.style.cssText = 'position:absolute;left:50%;top:50%;width:17.09px;height:55px;max-width:none;transform:translate(-50%,-50%) rotate(90deg)';
    lIn.appendChild(lImg); lMask.appendChild(lIn);
    // SVG injecté avec overflow visible : une image <img> tournée rognait les bords du logo de 1-2 px
    fetch(LOADER_LOGO).then(function (res) { return res.text(); }).then(function (txt) {
      var box = document.createElement('div');
      box.innerHTML = txt;
      var svg = box.querySelector('svg');
      if (!svg || !lImg.parentNode) return;
      svg.setAttribute('width', '17.09');
      svg.setAttribute('height', '55');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = lImg.style.cssText + ';overflow:visible;display:block';
      lIn.replaceChild(svg, lImg);
    }).catch(function () {});
    var tMask = document.createElement('div');
    tMask.style.cssText = 'overflow:hidden;padding:.15em 0;font-size:20px;line-height:1;letter-spacing:-.03em;text-transform:uppercase;white-space:nowrap';
    var tIn = document.createElement('div');
    tIn.textContent = 'Studio de design digital.';
    tIn.dataset.axis = 'y';
    tMask.appendChild(tIn);
    grp.appendChild(lMask); grp.appendChild(tMask);
    L.appendChild(grp);
    document.body.appendChild(L);
    hide(tIn);
    lMask.style.transform = 'translateX(' + (grp.offsetWidth / 2 - 27.5) + 'px)';   // étape 1 : logo centré
    root.classList.remove('is-loading');      // le loader prend le relais du cache CSS

    var T = 0;
    function at(ms, fn) { setTimeout(fn, ms); }
    // Étape 1 : « cete » apparaît au centre
    at(T += 250, function () {
      lIn.style.transition = 'clip-path 900ms ' + EASE;
      lIn.style.clipPath = 'inset(-8px -8px -8px -8px)';
    });
    // Étape 2 : le logo glisse à gauche, la baseline apparaît à droite
    at(T += 1000, function () { lMask.style.transform = 'translateX(0)'; reveal([tIn], 300, 0, 1000); });
    // Étape 3 : le fond passe au noir (le texte s'inverse grâce au mode différence)
    at(T += 1500, function () { L.style.backgroundColor = '#000'; });
    // Étape 4 : les textes sortent, le fond se réduit à droite pour devenir la barre latérale
    at(T += 1000, function () {
      lIn.style.transition = 'clip-path 550ms ' + INOUT;
      lIn.style.clipPath = 'inset(-8px -8px -8px calc(100% + 8px))';
      conceal([tIn], 60, 0, 550);
    });
    at(T += 550, function () { L.style.width = (side ? side.offsetWidth : 68) + 'px'; });
    // Étape 5 : contenu de la barre latérale
    at(T += 1100, function () {
      L.remove();
      reveal([sideContact, sideCopy], 0, 120, 900);
      burger.forEach(function (b, i) {
        setTimeout(function () { b.style.transition = 'transform 800ms ' + EASE; b.style.transform = 'scaleX(1)'; }, 80 + i * 70);
      });
    });
    // Étape 6 : logo, navigation, titre et tags
    at(T += 350, function () {
      reveal([logoImg], 0, 0, 1000);
      reveal(navLinks, 80, 70, 1000);
      revealTitle();
      reveal(tags, 450, 70, 900);
    });
    // Étape 7 : la roulette apparaît en fondu, le projet 01 glisse doucement à sa place
    at(T += 600, function () {
      wheel.style.transition = 'opacity 900ms ease';
      wheel.style.opacity = '1';
      introGo = true;
    });
    // Étape 8 : showreel et réseaux
    at(T += 1500, function () {
      if (showreel) { showreel.style.transition = 'clip-path 1100ms ' + EASE; showreel.style.clipPath = 'inset(0 0 0 0 round 5px)'; }
      reveal(socials, 150, 80, 900);
    });
    return api;

    /* ---- Transition vers un projet : tout disparaît sauf la photo, qui se centre ---- */
    function leaveTo(path) {
      // Carte du projet ciblé : la plus proche du centre parmi les copies de la roue
      var best = null, bd = 1e9;
      cards.forEach(function (c, j) {
        if (c.getAttribute('href') !== path) return;
        var ad = Math.abs(dist(j));
        if (ad < bd) { bd = ad; best = c; }
      });
      if (!best) return Promise.resolve(null);
      leaving = true;
      intro = false;
      clearTimeout(timer);
      root.classList.add('is-leaving');                 // le zoom de survol se relâche pendant le centrage
      concealTitle();
      tags.forEach(function (t) { t.dataset.axis = 'y'; });
      conceal(tags, 0, 40, 500);
      if (showreel) { showreel.style.transition = 'clip-path 650ms ' + INOUT; showreel.style.clipPath = 'inset(0 0 100% 0 round 5px)'; }
      hideInfo();
      cards.forEach(function (c) {
        if (c === best) return;
        c.style.transition = 'opacity 500ms ease';
        c.style.opacity = '0';
      });
      return wait(350).then(function () {
        // La photo se centre dans la fenêtre, droite et à sa taille de photo active
        best.style.zIndex = '200';
        best.style.transition = 'transform 1000ms ' + INOUT + ', filter 600ms ease';
        best.style.transform = 'translate3d(' + (window.innerWidth / 2 - g.w / 2) + 'px,' + (g.py - g.h / 2) + 'px,0) rotate(0deg) scale(' + g.sc + ')';
        best.style.filter = 'grayscale(0)';
        return wait(1050);
      }).then(function () {
        return { card: best, radius: 4 * g.sc };
      });
    }
  }

  /* =====================================================================
     PAGE PROJET : photo plein écran, titre en masque (mode différence), puis réduction à 50 %
     ===================================================================== */
  // Découpe un paragraphe en lignes, chacune dans son masque
  function splitLines(el) {
    var txt = el.textContent.trim(), words = txt.split(/\s+/);
    el.textContent = '';
    var spans = words.map(function (w, i) {
      var s = document.createElement('span');
      s.textContent = w;
      s.style.display = 'inline-block';
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      return s;
    });
    var lines = [], top = null;
    spans.forEach(function (s) {
      if (s.offsetTop !== top) { lines.push([]); top = s.offsetTop; }
      lines[lines.length - 1].push(s.textContent);
    });
    el.textContent = '';
    el.setAttribute('aria-label', txt);
    return lines.map(function (l) {
      var m = document.createElement('span');
      m.setAttribute('aria-hidden', 'true');
      m.style.cssText = 'display:block;overflow:hidden;padding-bottom:.1em;margin-bottom:-.1em';
      var s = document.createElement('span');
      s.textContent = l.join(' ');
      s.style.cssText = 'display:block;transform:translateY(110%)';
      m.appendChild(s);
      el.appendChild(m);
      return s;
    });
  }

  function Work(container, opts) {
    var media = $('.work-media', container);
    var img = $('.work-img', container);
    var heading = $('.work-heading', container);
    var tagsBox = $('.work-tags', container);
    var tags = tagsBox ? $$('.hero-tag', tagsBox) : [];
    var text = $('.work-text', container);
    if (!media || !heading) { root.classList.remove('is-wintro'); return null; }
    if (img) { img.loading = 'eager'; img.decoding = 'async'; }
    if (text && !text.textContent.trim()) text.style.display = 'none';

    // Titre dans un masque : le texte monte depuis le bas
    var hIn = document.createElement('span');
    while (heading.firstChild) hIn.appendChild(heading.firstChild);
    heading.appendChild(hIn);
    hIn.style.transform = reduce ? 'none' : 'translateY(110%)';
    if (!reduce) {
      // Étapes 2-3 : le titre est centré dans la fenêtre ; à l'étape 4 il rejoint sa place, sous la photo et aligné à gauche
      var hr = heading.getBoundingClientRect();
      heading.style.transform = 'translate(' + (window.innerWidth / 2 - (hr.left + hr.width / 2)) + 'px,' +
        (window.innerHeight / 2 - (hr.top + hr.height / 2)) + 'px)';
      if (tagsBox) { tagsBox.style.overflow = 'hidden'; tagsBox.style.padding = '2px 0'; }
      tags.forEach(function (t) { t.dataset.axis = 'y'; hide(t); });
      if (text) text.style.visibility = 'hidden';
    }
    root.classList.remove('is-wintro');
    // Réseaux en bas à gauche : présents aux étapes 1 à 3, ils sortent en masque à l'étape 4
    var socials = $$('.home-socials .nav-link', container).map(function (a) {
      var s = maskText(a);
      if (!reduce) s.style.transform = 'none';
      return s;
    });

    // Étape 4 : le titre glisse sous la photo vers la gauche, les catégories puis l'introduction apparaissent en masque
    function settle(delay) {
      return wait(delay).then(function () {
        conceal(socials, 0, 50, 500);
        heading.style.transition = 'transform 1100ms ' + INOUT;
        heading.style.transform = 'translate(0,0)';
        reveal(tags, 550, 70, 900);
        if (text && text.style.display !== 'none') {
          var lines = splitLines(text);
          text.style.visibility = '';
          text.offsetHeight;   // les lignes partent bien de leur masque (sinon elles s'affichent d'un coup)
          lines.forEach(function (s, i) {
            s.style.transition = 'transform 1100ms ' + EASE + ' ' + (750 + i * 80) + 'ms';
            s.style.transform = 'translateY(0)';
          });
        }
        return wait(1150);
      }).then(function () {
        heading.style.transition = '';
        heading.style.transform = '';
      });
    }

    var PROPS = ['left', 'top', 'width', 'height', 'border-radius'];
    function full() { return { left: 0, top: 0, width: window.innerWidth - sideW(), height: window.innerHeight }; }
    function place(r, radius) {
      media.style.left = r.left + 'px'; media.style.top = r.top + 'px';
      media.style.width = r.width + 'px'; media.style.height = r.height + 'px';
      media.style.borderRadius = (radius || 0) + 'px';
    }
    function showTitle(delay) {
      setTimeout(function () {
        hIn.style.transition = 'transform 1200ms ' + EASE;
        hIn.style.transform = 'translateY(0)';
      }, delay);
    }
    function shrink(delay) {   // étape 4 : la photo se réduit à 50 % de la hauteur
      return wait(delay).then(function () {
        media.style.transition = 'clip-path 1100ms ' + INOUT;
        media.style.clipPath = 'inset(0 0 50% 0)';
        return wait(1150);
      }).then(function () {
        media.style.transition = '';
        media.style.clipPath = '';
        PROPS.forEach(function (p) { media.style.removeProperty(p); });
      });
    }

    var api = {
      // Transition depuis l'accueil : la photo part exactement de la carte centrée
      fromCard: function (card, radius) {
        var cImg = card.querySelector('img');
        var r = card.getBoundingClientRect();
        media.style.transition = 'none';
        media.style.clipPath = 'inset(0 0 0% 0)';
        place(r, radius);
        if (!img || !cImg) return Promise.resolve();
        // Même fichier que la carte (déjà en cache) : aucun flash au moment du relais
        var srcset = img.getAttribute('srcset');
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
        img.src = cImg.currentSrc || cImg.src;
        if (srcset) {   // version haute définition chargée en fond, échangée une fois prête
          var hi = new Image();
          hi.sizes = '100vw'; hi.srcset = srcset;
          (hi.decode ? hi.decode() : Promise.resolve()).then(function () {
            img.sizes = '100vw'; img.srcset = srcset;
          }).catch(function () {});
        }
        var ready = img.decode ? img.decode().catch(function () {}) : Promise.resolve();
        return Promise.race([ready, wait(1200)]);
      },
      // Étapes 2 à 4
      play: function () {
        media.offsetWidth;
        media.style.transition = PROPS.map(function (p) { return p + ' 1100ms ' + INOUT; }).join(',');
        place(full(), 0);
        showTitle(700);
        // Étapes 3 et 4 en même temps : la photo se réduit pendant que le titre descend
        settle(1900);
        return shrink(1900);
      }
    };

    if (opts.transition) return api;
    if (reduce) { media.style.clipPath = ''; return api; }
    // Arrivée directe sur la page (ou retour) : photo plein écran, titre en masque, réduction, puis étape 4
    media.style.transition = 'none';
    media.style.clipPath = 'inset(0 0 0% 0)';
    showTitle(250);
    shrink(1400);
    settle(1400);
    return api;
  }

  /* =====================================================================
     MODAL CONTACT : le fond noir s'étend depuis la barre latérale, le contenu apparaît en masque
     ===================================================================== */
  var CONTACT = {
    email: 'cetestudio.pro@gmail.com',
    phone: '0658026687',
    phoneLink: '+33658026687',
    social: [['Instagram', '#'], ['Awwwards', '#'], ['Dribbble', '#']],
    menu: [['Works', '#'], ['Services', '#'], ['Studio', '#']],
    legal: [['Cookies', '#'], ['Données', '#'], ['Mentions légales', '#']]
  };
  var Menu = (function () {
    var isOpen = false, busy = false, lastFocus = null, timers = [];
    function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function clearLater() { timers.forEach(clearTimeout); timers = []; }
    function col(title, items) {
      return '<div class="cm-col"><p class="cm-head">' + title + '</p>' + items.map(function (it) {
        return '<a class="cm-link" href="' + it[1] + '">' + it[0] + '</a>';
      }).join('') + '</div>';
    }
    var bg = document.createElement('div');
    bg.className = 'cm-bg';
    bg.setAttribute('aria-hidden', 'true');
    // Bande de gauche : la page reste visible derrière un effet verre (clic = fermer)
    var glass = document.createElement('div');
    glass.className = 'cm-glass';
    glass.setAttribute('aria-hidden', 'true');
    var pageLogo = $('.home-logo-img');
    function panelW() { return window.innerWidth - glass.offsetWidth; }
    var box = document.createElement('div');
    box.className = 'cm';
    box.id = 'contact-modal';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Contact');
    box.innerHTML =
      '<div class="cm-cols">' + col('Social', CONTACT.social) + col('Menu', CONTACT.menu) + col('Légal', CONTACT.legal) + '</div>' +
      '<div class="cm-main"><p class="cm-title">Discutons de votre projet</p><div class="cm-coords">' +
        '<a class="cm-coord" href="mailto:' + CONTACT.email + '">' + CONTACT.email + '</a>' +
        '<a class="cm-coord" href="tel:' + CONTACT.phoneLink + '">' + CONTACT.phone + '</a></div></div>' +
      '<button type="button" class="cm-close">Fermer</button>' +
      '<div class="cm-logo" aria-hidden="true"><img src="' + LOADER_LOGO + '" alt=""></div>' +
      (pageLogo ? '<a class="cm-mark" href="/" aria-label="Cete Studio — accueil"><img src="' + (pageLogo.currentSrc || pageLogo.src) + '" alt=""></a>' : '');
    document.body.appendChild(glass);
    document.body.appendChild(bg);
    document.body.appendChild(box);
    glass.addEventListener('click', function () { shut(); });

    // Chaque texte dans son masque (même système que le loader et l'accueil)
    var heads = $$('.cm-head', box).map(function (el) { return maskText(el); });
    var links = $$('.cm-link', box).map(function (el) { return maskText(el); });
    var title = maskText($('.cm-title', box));
    var coords = $$('.cm-coord', box).map(function (el) { return maskText(el); });
    var close = maskText($('.cm-close', box));
    var logo = $('.cm-logo', box);
    var cols = [];   // ordre d'apparition : colonne par colonne
    $$('.cm-col', box).forEach(function (c) { cols = cols.concat($$('span[data-axis]', c)); });
    var all = cols.concat([title], coords, [close]);

    function burger(open) {
      $$('.burger-line').forEach(function (b) { b.style.transform = ''; b.style.transformOrigin = ''; b.style.transition = ''; });
      $$('.side-burger').forEach(function (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    }
    function open() {
      if (isOpen || busy) return;
      isOpen = true; busy = true; clearLater();
      lastFocus = document.activeElement;
      root.classList.add('is-menu');
      burger(true);
      all.forEach(hide);
      logo.style.transition = 'none';
      logo.style.clipPath = 'inset(-2% 102% -2% -2%)';
      box.style.visibility = 'visible';
      box.offsetHeight;
      if (reduce) { bg.style.transition = 'none'; bg.style.width = panelW() + 'px'; all.forEach(function (el) { el.style.transform = 'none'; }); logo.style.clipPath = 'inset(-2% -2% -2% -2%)'; busy = false; $('.cm-close', box).focus(); return; }
      // 1. Le fond noir de la barre latérale s'étend vers la gauche, jusqu'à la bande en verre
      bg.style.transition = 'width 1000ms ' + INOUT;
      bg.style.width = panelW() + 'px';
      // 2. Les textes montent depuis leur masque, colonne par colonne
      reveal(cols, 650, 35, 900);
      reveal([title], 800, 0, 1100);
      reveal(coords, 900, 80, 1000);
      reveal([close], 950, 0, 900);
      // 3. Le grand logo se révèle de gauche à droite
      later(900, function () { logo.style.transition = 'clip-path 1400ms ' + EASE; logo.style.clipPath = 'inset(-2% -2% -2% -2%)'; });
      later(1000, function () { busy = false; $('.cm-close', box).focus({ preventScroll: true }); });
    }
    function shut(fast) {
      if (!isOpen) return Promise.resolve();
      isOpen = false; busy = true; clearLater();
      burger(false);
      var out = reduce || fast ? 0 : 450;
      if (out) {
        conceal(all, 0, 15, 450);
        logo.style.transition = 'clip-path 550ms ' + INOUT;
        logo.style.clipPath = 'inset(-2% -2% -2% 102%)';
      }
      return new Promise(function (res) {
        later(out, function () {
          if (!out) box.style.visibility = 'hidden';
          bg.style.transition = out ? 'width 900ms ' + INOUT : 'none';
          bg.style.width = '';
          root.classList.remove('is-menu');
          later(out ? 950 : 0, function () {
            box.style.visibility = 'hidden';
            busy = false;
            if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
            res();
          });
        });
      });
    }
    // Ouverture : « Contact » ou le burger ; fermeture : « Fermer », le burger (croix) ou Échap
    document.addEventListener('click', function (e) {
      // Logo de la modal sur l'accueil : on referme simplement la modal
      if (e.target.closest && e.target.closest('.cm-mark') && root.getAttribute('data-page') === 'home') { e.preventDefault(); e.stopPropagation(); shut(); return; }
      var t = e.target.closest && e.target.closest('.side-contact, .side-burger, .cm-close');
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      if (t.classList.contains('cm-close') || isOpen) shut(); else open();
    }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) shut(); });
    window.addEventListener('resize', function () { if (isOpen) { bg.style.transition = 'none'; bg.style.width = panelW() + 'px'; } });
    $$('.side-burger').forEach(function (b) { b.setAttribute('aria-controls', 'contact-modal'); b.setAttribute('aria-expanded', 'false'); });
    return { open: open, close: shut, isOpen: function () { return isOpen; } };
  })();

  /* =====================================================================
     MODAL SHOWREEL : le fond noir monte du bas de l'écran, puis la vidéo apparaît en fondu
     Vidéo muette ; lecture / pause au clic sur la vidéo (icône dans le curseur), Entrée ou Espace
     ===================================================================== */
  var REEL_SRC = 'https://cetestudio.b-cdn.net/Cete/Showreel_2026.mp4';
  var Reel = (function () {
    var isOpen = false, busy = false, lastFocus = null, timers = [], shown = false;
    function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function clearLater() { timers.forEach(clearTimeout); timers = []; }

    var box = document.createElement('div');
    box.className = 'sr';
    box.id = 'showreel-modal';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Showreel');
    box.innerHTML =
      '<div class="sr-bg"></div>' +
      '<div class="sr-mark" aria-hidden="true"></div>' +
      '<nav class="sr-nav" aria-label="Menu"></nav>' +
      '<div class="sr-zone"><div class="sr-frame">' +
        '<video class="sr-video" muted loop playsinline preload="none" tabindex="0" role="button" aria-label="Pause"></video>' +
        '<div class="sr-state" aria-hidden="true"><svg viewBox="0 0 60 60" fill="none" stroke="#fff" stroke-width="1"><circle cx="30" cy="30" r="29.5"/><path d="M27.5 24.9v10.4l8.4-5.2z" stroke-linejoin="round"/></svg></div>' +
        '<div class="sr-bar">' +
          '<button type="button" class="sr-close" aria-label="Fermer le showreel"><span></span><span></span></button>' +
        '</div>' +
      '</div></div>';
    document.body.appendChild(box);

    var bg = $('.sr-bg', box), mark = $('.sr-mark', box), nav = $('.sr-nav', box);
    var frame = $('.sr-frame', box), video = $('.sr-video', box);
    var texts = [];
    video.muted = true;
    video.loop = true;   // le showreel tourne en boucle
    var closeBtn = $('.sr-close', box);
    var preview = null;   // extrait en boucle de l'accueil, mis en pause pendant la lecture

    // Logo et navigation repris de la page, en blanc
    function fillChrome() {
      var logo = $('.home-logo-img');
      mark.innerHTML = logo ? '<img src="' + (logo.currentSrc || logo.src) + '" alt="">' : '';
      nav.innerHTML = '';
      $$('.home-nav .nav-link').forEach(function (a) {
        var l = document.createElement('a');
        l.className = 'sr-link';
        l.href = a.getAttribute('href') || '#';
        l.textContent = a.textContent.trim();
        nav.appendChild(l);
      });
      return $$('.sr-link', nav).map(function (l) { return maskText(l); });
    }
    var links = [];

    function sync() {
      video.setAttribute('aria-label', video.paused ? 'Lecture' : 'Pause');
      frame.classList.toggle('is-paused', video.paused);
    }
    function toggle() {
      if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      else video.pause();
    }
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    video.addEventListener('click', toggle);
    video.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); toggle(); } });

    function open() {
      if (isOpen || busy) return;
      isOpen = true; busy = true; shown = false; clearLater();
      lastFocus = document.activeElement;
      root.classList.add('is-reel');
      links = fillChrome();
      preview = $('.showreel-video');
      if (preview) preview.pause();
      // Chargement lancé dès le clic : la vidéo se met en mémoire pendant que le fond noir monte
      if (!video.src) { video.preload = 'auto'; video.src = REEL_SRC; }
      links.concat(texts).forEach(hide);
      frame.style.transition = 'none';
      frame.style.opacity = '0';
      mark.style.transition = 'none';
      mark.style.opacity = '0';
      closeBtn.classList.remove('is-in');
      bg.style.transition = 'none';
      bg.style.clipPath = 'inset(100% 0 0 0)';
      box.style.visibility = 'visible';
      box.offsetHeight;
      sync();
      if (reduce) {
        bg.style.clipPath = 'inset(0)'; frame.style.opacity = '1'; mark.style.opacity = '1';
        links.concat(texts).forEach(function (el) { el.style.transform = 'none'; });
        closeBtn.classList.add('is-in');
        shown = true; video.currentTime = 0; toggle(); sync();
        busy = false; closeBtn.focus({ preventScroll: true });
        return;
      }
      // 1. Le fond noir monte depuis le bas
      bg.style.transition = 'clip-path 1000ms ' + INOUT;
      bg.style.clipPath = 'inset(0 0 0 0)';
      // 2. Une fois le fond en place : la vidéo apparaît en fondu et démarre
      later(1000, function () {
        shown = true;
        try { video.currentTime = 0; } catch (e) {}
        if (video.paused) toggle();
        frame.style.transition = 'opacity 900ms ease';
        frame.style.opacity = '1';
        mark.style.transition = 'opacity 600ms ease';
        mark.style.opacity = '1';
      });
      // 3. Navigation et contrôles en masque
      reveal(links, 1100, 60, 900);
      reveal(texts, 1300, 80, 900);
      later(1300, function () { closeBtn.classList.add('is-in'); });
      later(1300, function () { busy = false; closeBtn.focus({ preventScroll: true }); });
    }

    function shut(fast) {
      if (!isOpen) return Promise.resolve();
      isOpen = false; busy = true; clearLater();
      var out = reduce || fast ? 0 : 450;
      if (out) {
        conceal(links.concat(texts), 0, 20, 450);
        closeBtn.classList.remove('is-in');
        frame.style.transition = 'opacity 450ms ease';
        frame.style.opacity = '0';
        mark.style.transition = 'opacity 400ms ease';
        mark.style.opacity = '0';
      }
      return new Promise(function (res) {
        later(out, function () {
          video.pause();
          // Le fond noir repart vers le haut et découvre la page
          bg.style.transition = out ? 'clip-path 900ms ' + INOUT : 'none';
          bg.style.clipPath = 'inset(0 0 100% 0)';
          later(out ? 950 : 0, function () {
            box.style.visibility = 'hidden';
            root.classList.remove('is-reel');
            if (preview && document.contains(preview) && !reduce) { var p = preview.play(); if (p && p.catch) p.catch(function () {}); }
            busy = false;
            if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
            res();
          });
        });
      });
    }

    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('.showreel, .sr-close');
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      if (t.classList.contains('sr-close')) shut(); else open();
    }, true);
    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); shut(); }
      else if (e.key === ' ' && e.target === document.body || (e.key === ' ' && e.target === video)) { e.preventDefault(); toggle(); }
    });
    // Molette et gestes ne font pas tourner la roulette derrière la modal
    ['wheel', 'touchmove'].forEach(function (ev) {
      box.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true });
    });
    return { open: open, close: shut, isOpen: function () { return isOpen; } };
  })();

  /* =====================================================================
     NAVIGATION : Barba.js
     ===================================================================== */
  var page = null, prev = null;
  function initPage(container, opts) {
    var ns = container.getAttribute('data-barba-namespace');
    root.setAttribute('data-page', ns);
    if (ns === 'home') page = Home(container, opts);
    else if (ns === 'work') page = Work(container, opts);
    else page = null;
    return page;
  }
  // Les <script> d'une page chargée par Barba ne s'exécutent pas seuls (ex. boucle du showreel)
  function runScripts(container) {
    $$('script', container).forEach(function (s) {
      var n = document.createElement('script');
      [].forEach.call(s.attributes, function (a) { n.setAttribute(a.name, a.value); });
      n.textContent = s.textContent;
      s.parentNode.replaceChild(n, s);
    });
  }
  // Webflow : réinitialise ses modules sur la nouvelle page
  function resetWebflow(data) {
    try {
      var doc = new DOMParser().parseFromString(data.next.html, 'text/html');
      var id = doc.documentElement.getAttribute('data-wf-page');
      if (id) root.setAttribute('data-wf-page', id);
      if (window.Webflow && Webflow.destroy) {
        Webflow.destroy();
        Webflow.ready();
        var ix = Webflow.require && Webflow.require('ix2');
        if (ix && ix.init) ix.init();
      }
    } catch (e) {}
  }
  function fixed(c, on) {
    if (on) c.style.cssText += ';position:fixed;top:0;left:0;width:100%;height:100vh;z-index:30;overflow:hidden';
    else ['position', 'top', 'left', 'width', 'height', 'z-index', 'overflow', 'visibility'].forEach(function (p) { c.style.removeProperty(p); });
  }

  if (!window.barba) {   // Barba indisponible : la page fonctionne seule
    var c0 = $('[data-barba="container"]');
    if (c0) initPage(c0, { first: true });
    return;
  }

  var leaveData = null;
  barba.hooks.before(function () {   // un lien d'une modal la ferme avant la transition
    if (Reel.isOpen()) return Reel.close(true);
    if (Menu.isOpen()) return Menu.close(true);
  });   // un lien du menu ferme la modal
  barba.hooks.beforeLeave(function () { prev = page; });
  barba.hooks.afterLeave(function () { if (prev && prev.destroy) prev.destroy(); });
  barba.hooks.after(function (data) {
    root.classList.remove('is-leaving');
    resetWebflow(data);
  });

  barba.init({
    preventRunning: true,
    timeout: 10000,
    prevent: function (o) { return o.el && (o.el.closest('.w-editor') || o.el.getAttribute('href') === '#'); },
    transitions: [
      {
        name: 'accueil-vers-projet',
        from: { namespace: ['home'] },
        to: { namespace: ['work'] },
        leave: function (data) {
          leaveData = null;
          if (reduce || !page || !page.leaveTo) return;
          return page.leaveTo(data.next.url.path).then(function (res) { leaveData = res; });
        },
        beforeEnter: function (data) {
          runScripts(data.next.container);
          fixed(data.next.container, true);            // la page projet se pose au-dessus de l'accueil
          data.next.container.style.visibility = 'hidden';
          initPage(data.next.container, { transition: !!leaveData });
          root.setAttribute('data-page', 'home');      // garde le défilement bloqué pendant la transition
        },
        enter: function (data) {
          var c = data.next.container, w = page;
          if (!leaveData || !w) { c.style.visibility = ''; return; }
          return w.fromCard(leaveData.card, leaveData.radius).then(function () {
            c.style.visibility = '';                   // relais invisible : même photo, même position
            return w.play();
          });
        },
        after: function (data) {
          fixed(data.next.container, false);
          root.setAttribute('data-page', 'work');
          window.scrollTo(0, 0);
        }
      },
      {
        name: 'defaut',
        leave: function (data) {
          var c = data.current.container;
          if (reduce) { c.style.display = 'none'; return; }
          c.style.transition = 'opacity 450ms ease';
          c.style.opacity = '0';
          return wait(460).then(function () { c.style.display = 'none'; });
        },
        beforeEnter: function (data) {
          window.scrollTo(0, 0);
          var ns = data.next.container.getAttribute('data-barba-namespace');
          if (ns === 'home' && !reduce) root.classList.add('is-intro');
          runScripts(data.next.container);
          initPage(data.next.container, { first: false });
        }
      }
    ]
  });

  // Première page affichée
  initPage($('[data-barba="container"]'), { first: true });
})();
