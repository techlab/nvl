/* ==========================================================================
   NAVIN & LEKSHMY — ROYAL WEDDING INVITATION
   Main script — Redesigned
   --------------------------------------------------------------------------
   Modules:
     0. Config
     1. Particles (gold motes on splash screen)
     2. Intro Splash (progress bar)
     3. Bottom Navigation (scrollspy)
     4. Countdown
     5. Calendar + Map links
     6. Ambient Music Toggle
     7. Boot
   ========================================================================== */

'use strict';

/* ==========================================================================
   0. CONFIG
   ========================================================================== */

const WEDDING_CONFIG = {
  coupleInitials: 'N & L',
  weddingDateISO: '2026-12-12T10:00:00',

  events: {
    ceremony: {
      title: 'Wedding Ceremony — Navin & Lekshmy',
      venue: 'The Grand Palace Hall',
      address: '12 Cathedral Avenue, Kochi, Kerala, India',
      start: '2026-12-12T10:00:00',
      end:   '2026-12-12T12:00:00',
      description: 'Wedding ceremony of Navin & Lekshmy.'
    },
    reception: {
      title: 'Wedding Reception — Navin & Lekshmy',
      venue: 'The Royal Garden Pavilion',
      address: '45 Marine Drive, Kochi, Kerala, India',
      start: '2026-12-12T19:00:00',
      end:   '2026-12-12T23:00:00',
      description: 'Wedding reception of Navin & Lekshmy.'
    }
  },

  audioSrc: 'assets/audio/ambience.mp3'
};


/* ==========================================================================
   1. PARTICLES — tiny drifting gold motes behind the splash screen
   ========================================================================== */

const Particles = (() => {
  let canvas, ctx, particles, rafId, width, height;
  let running = false;

  function resize() {
    width  = canvas.width  = canvas.offsetWidth  * devicePixelRatio;
    height = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }

  function makeParticle() {
    return {
      x:       Math.random() * width,
      y:       Math.random() * height,
      r:       (Math.random() * 1.6 + 0.4) * devicePixelRatio,
      vy:      (Math.random() * 0.18 + 0.05) * devicePixelRatio,
      vx:      (Math.random() - 0.5) * 0.06 * devicePixelRatio,
      a:       Math.random() * 0.55 + 0.15,
      flicker: Math.random() * 0.02 + 0.005
    };
  }

  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y -= p.vy;
      p.x += p.vx;
      p.a += (Math.random() - 0.5) * p.flicker;
      p.a  = Math.max(0.08, Math.min(0.7, p.a));

      if (p.y < -10)          { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10)          p.x = width + 10;
      if (p.x > width + 10)   p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle   = `rgba(212, 175, 55, ${p.a})`;
      ctx.shadowColor = 'rgba(231, 200, 115, 0.8)';
      ctx.shadowBlur  = 6 * devicePixelRatio;
      ctx.fill();
    });

    rafId = requestAnimationFrame(tick);
  }

  function init(canvasEl, count = 70) {
    canvas = canvasEl;
    ctx    = canvas.getContext('2d');
    resize();
    particles = Array.from({ length: count }, makeParticle);
    running   = true;
    tick();
    window.addEventListener('resize', resize);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  return { init, stop };
})();


/* ==========================================================================
   2. INTRO SPLASH — Progress bar
   ========================================================================== */

const IntroSplash = (() => {
  const DURATION_MS = 2800; // total splash duration

  function init() {
    const splash   = document.getElementById('intro-splash');
    const progress = document.getElementById('splash-progress');
    const canvas   = document.getElementById('particle-canvas');

    if (!splash) return;

    // Skip intro if already seen this session
    if (sessionStorage.getItem('splashSeen') === 'true') {
      splash.classList.add('is-hidden');
      document.body.classList.remove('splash-open');
      BottomNav.show();
      return;
    }

    document.body.classList.add('splash-open');
    if (canvas) Particles.init(canvas, 80);

    // Animate the progress bar
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const pct     = Math.min(100, (elapsed / DURATION_MS) * 100);
      if (progress) progress.style.width = pct + '%';

      if (pct < 100) {
        requestAnimationFrame(step);
      } else {
        // Slight pause at 100% before hiding
        window.setTimeout(done, 300);
      }
    }

    requestAnimationFrame(step);

    function done() {
      splash.classList.add('is-hidden');
      document.body.classList.remove('splash-open');
      Particles.stop();
      sessionStorage.setItem('splashSeen', 'true');
      BottomNav.show();
      MusicToggle.autoStart();
    }
  }

  return { init };
})();


/* ==========================================================================
   3. BOTTOM NAVIGATION — scrollspy
   ========================================================================== */

const BottomNav = (() => {
  let nav, items;
  const SECTIONS = ['home', 'invitation', 'events', 'families'];

  function show() {
    if (nav) nav.classList.add('is-visible');
  }

  function updateActive() {
    const scrollY  = window.scrollY;
    const viewH    = window.innerHeight;
    let   current  = SECTIONS[0];

    SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= viewH * 0.4) current = id;
    });

    items.forEach(a => {
      const isActive = a.getAttribute('data-section') === current;
      a.classList.toggle('active', isActive);
    });
  }

  function init() {
    nav   = document.getElementById('bottom-nav');
    items = nav ? nav.querySelectorAll('.bnav-item') : [];
    if (!nav) return;

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();

    // Smooth scroll on click
    items.forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const targetId = a.getAttribute('href').replace('#', '');
        const el       = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  return { init, show };
})();


/* ==========================================================================
   4. COUNTDOWN
   ========================================================================== */

const Countdown = (() => {
  let timer;

  function render(target) {
    const els = {
      days:  document.getElementById('cd-days'),
      hours: document.getElementById('cd-hours'),
      mins:  document.getElementById('cd-mins'),
      secs:  document.getElementById('cd-secs')
    };
    if (!els.days) return;

    const pad = n => String(n).padStart(2, '0');

    const tick = () => {
      const now  = new Date();
      let diff   = Math.max(0, target - now);

      const day  = Math.floor(diff / 86400000); diff -= day  * 86400000;
      const hour = Math.floor(diff / 3600000);  diff -= hour * 3600000;
      const min  = Math.floor(diff / 60000);    diff -= min  * 60000;
      const sec  = Math.floor(diff / 1000);

      els.days.textContent  = pad(day);
      els.hours.textContent = pad(hour);
      els.mins.textContent  = pad(min);
      els.secs.textContent  = pad(sec);

      if (target - now <= 0) window.clearInterval(timer);
    };

    tick();
    timer = window.setInterval(tick, 1000);
  }

  function init() {
    const target = new Date(WEDDING_CONFIG.weddingDateISO);
    if (!isNaN(target)) render(target);
  }

  return { init };
})();


/* ==========================================================================
   5. CALENDAR + MAP LINKS
   ========================================================================== */

const EventLinks = (() => {
  function toICSDate(iso) {
    return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  function buildICS(evt) {
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0',
      'PRODID:-//Navin & Lekshmy Wedding//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${evt.title}`,
      `DTSTART:${toICSDate(evt.start)}`,
      `DTEND:${toICSDate(evt.end)}`,
      `LOCATION:${evt.address}`,
      `DESCRIPTION:${evt.description}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${evt.venue.replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function init() {
    document.querySelectorAll('[data-calendar]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-calendar');
        const evt = WEDDING_CONFIG.events[key];
        if (evt) buildICS(evt);
      });
    });

    document.querySelectorAll('[data-map]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-map');
        const evt = WEDDING_CONFIG.events[key];
        if (evt) {
          window.open(
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evt.address)}`,
            '_blank', 'noopener'
          );
        }
      });
    });
  }

  return { init };
})();


/* ==========================================================================
   6. AMBIENT MUSIC TOGGLE
   ========================================================================== */

const MusicToggle = (() => {
  let audio, btn, userMuted = false;

  function updateUI(playing) {
    if (btn) btn.classList.toggle('is-playing', playing);
  }

  function autoStart() {
    if (!audio || userMuted) return;
    audio.volume = 0.35;
    audio.play().then(() => updateUI(true)).catch(() => updateUI(false));
  }

  function init() {
    btn = document.getElementById('music-toggle');
    if (!btn) return;

    audio      = new Audio(WEDDING_CONFIG.audioSrc);
    audio.loop = true;
    audio.addEventListener('error', () => {
      console.info('No ambient audio file found at', WEDDING_CONFIG.audioSrc);
    });

    btn.classList.add('is-active');

    btn.addEventListener('click', () => {
      if (audio.paused) {
        userMuted = false;
        audio.play().then(() => updateUI(true)).catch(() => {});
      } else {
        userMuted = true;
        audio.pause();
        updateUI(false);
      }
    });
  }

  return { init, autoStart };
})();


/* ==========================================================================
   BOOT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialise AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 900,
      easing:   'ease-out-quart',
      once:     true,
      offset:   60
    });
  }

  BottomNav.init();
  Countdown.init();
  EventLinks.init();
  MusicToggle.init();
  IntroSplash.init(); // last — activates nav after splash
});
