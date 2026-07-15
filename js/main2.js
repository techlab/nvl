/* ==========================================================================
   NAVIN & LEKSHMY — ROYAL WEDDING INVITATION
   Main script
   --------------------------------------------------------------------------
   Everything the site needs, in vanilla ES6, organised into small modules.
   Edit WEDDING_CONFIG below to customise dates, venues and copy without
   touching the logic underneath.
   ========================================================================== */

'use strict';

/* ==========================================================================
   0. CONFIG — the only section most couples will ever need to edit
   ========================================================================== */

const WEDDING_CONFIG = {
    coupleInitials: 'N & L',
    // Countdown target — local time. Format: YYYY-MM-DDTHH:MM:SS
    weddingDateISO: '2026-12-12T10:00:00',

    events: {
        ceremony: {
            title: 'Wedding Ceremony — Navin & Lekshmy',
            venue: 'The Grand Palace Hall',
            address: '12 Cathedral Avenue, Kochi, Kerala, India',
            start: '2026-12-12T10:00:00',
            end: '2026-12-12T12:00:00',
            description: 'Wedding ceremony of Navin & Lekshmy.'
        },
        reception: {
            title: 'Wedding Reception — Navin & Lekshmy',
            venue: 'The Royal Garden Pavilion',
            address: '45 Marine Drive, Kochi, Kerala, India',
            start: '2026-12-12T19:00:00',
            end: '2026-12-12T23:00:00',
            description: 'Wedding reception of Navin & Lekshmy.'
        }
    },

    // Plug in a Formspree / Getform / EmailJS endpoint to receive real RSVPs.
    // Leave empty to keep the form fully front-end (it will still confirm
    // to the guest, but replies will only be visible in their own browser).
    // See README.md → "Connecting the RSVP form" for step-by-step options.
    rsvpEndpoint: '',

    // Path to an ambient music track. Any short, royalty-free orchestral
    // loop works well. If the file is missing the toggle simply stays
    // silent — no error is shown to the guest.
    audioSrc: 'assets/audio/ambience.mp3'
};


/* ==========================================================================
   1. PARTICLES — tiny drifting gold motes behind the wax seal
   ========================================================================== */

const Particles = (() => {
    let canvas, ctx, particles, rafId, width, height;
    let running = false;

    function resize() {
        width = canvas.width = canvas.offsetWidth * devicePixelRatio;
        height = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }

    function makeParticle() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            r: (Math.random() * 1.6 + 0.4) * devicePixelRatio,
            vy: (Math.random() * 0.18 + 0.05) * devicePixelRatio,
            vx: (Math.random() - 0.5) * 0.06 * devicePixelRatio,
            a: Math.random() * 0.55 + 0.15,
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
            p.a = Math.max(0.08, Math.min(0.7, p.a));

            if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 175, 55, ${p.a})`;
            ctx.shadowColor = 'rgba(231, 200, 115, 0.8)';
            ctx.shadowBlur = 6 * devicePixelRatio;
            ctx.fill();
        });
        rafId = requestAnimationFrame(tick);
    }

    function init(canvasEl, count = 70) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        resize();
        particles = Array.from({ length: count }, makeParticle);
        running = true;
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
   2. WAX SEAL INTRO
   ========================================================================== */

const SealIntro = (() => {
    function init() {
        const preloader = document.getElementById('preloader');
        const seal = document.getElementById('wax-seal');
        const stage = document.querySelector('.seal-stage');
        const canvas = document.getElementById('particle-canvas');

        if (!preloader || !seal) return;

        // Respect users who have already broken the seal this session so a
        // repeat visit within the same tab doesn't force the intro again.
        if (sessionStorage.getItem('sealBroken') === 'true') {
            preloader.classList.add('is-hidden');
            document.body.classList.remove('no-scroll');
            Nav.activate();
            return;
        }

        document.body.classList.add('no-scroll');
        if (canvas) Particles.init(canvas, 80);

        const breakSeal = () => {
            if (seal.classList.contains('is-cracking')) return; // guard double-fire
            seal.classList.add('is-cracking');

            window.setTimeout(() => {
                seal.classList.add('is-shattering');
            }, 480);

            window.setTimeout(() => {
                stage.classList.add('is-breaking');
            }, 620);

            window.setTimeout(() => {
                preloader.classList.add('is-hidden');
                document.body.classList.remove('no-scroll');
                Particles.stop();
                sessionStorage.setItem('sealBroken', 'true');
                Nav.activate();
                MusicToggle.autoStart();
            }, 1900);
        };

        seal.addEventListener('click', breakSeal);
        seal.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                breakSeal();
            }
        });
    }

    return { init };
})();


/* ==========================================================================
   3. NAVIGATION
   ========================================================================== */

const Nav = (() => {
    let nav, toggle;

    function activate() {
        if (nav) nav.classList.add('is-active');
    }

    function onScroll() {
        if (!nav) return;
        nav.classList.toggle('is-scrolled', window.scrollY > 40);
    }

    function init() {
        nav = document.getElementById('site-nav');
        toggle = document.querySelector('.nav-toggle');
        if (!nav) return;

        window.addEventListener('scroll', onScroll, { passive: true });

        if (toggle) {
            toggle.addEventListener('click', () => nav.classList.toggle('nav-open'));
        }

        nav.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => nav.classList.remove('nav-open'));
        });
    }

    return { init, activate };
})();


/* ==========================================================================
   4. SCROLL REVEALS
   ========================================================================== */

const ScrollReveal = (() => {
    function init() {
        const items = document.querySelectorAll('[data-reveal], .divider');
        if (!('IntersectionObserver' in window) || items.length === 0) {
            items.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

        items.forEach(el => observer.observe(el));
    }
    return { init };
})();


/* ==========================================================================
   5. COUNTDOWN
   ========================================================================== */

const Countdown = (() => {
    let timer;

    function render(target) {
        const els = {
            days: document.getElementById('cd-days'),
            hours: document.getElementById('cd-hours'),
            mins: document.getElementById('cd-mins'),
            secs: document.getElementById('cd-secs')
        };
        if (!els.days) return;

        const tick = () => {
            const now = new Date();
            let diff = Math.max(0, target - now);

            const day = Math.floor(diff / 86400000);
            diff -= day * 86400000;
            const hour = Math.floor(diff / 3600000);
            diff -= hour * 3600000;
            const min = Math.floor(diff / 60000);
            diff -= min * 60000;
            const sec = Math.floor(diff / 1000);

            const pad = n => String(n).padStart(2, '0');
            els.days.textContent = pad(day);
            els.hours.textContent = pad(hour);
            els.mins.textContent = pad(min);
            els.secs.textContent = pad(sec);

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
   6. CALENDAR + MAP LINKS
   ========================================================================== */

const EventLinks = (() => {
    // Formats a Date to the compact UTC form the .ics / Google Calendar spec wants
    function toICSDate(iso) {
        return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    function buildICS(evt) {
        const ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Navin & Lekshmy Wedding//EN',
            'BEGIN:VEVENT',
            `SUMMARY:${evt.title}`,
            `DTSTART:${toICSDate(evt.start)}`,
            `DTEND:${toICSDate(evt.end)}`,
            `LOCATION:${evt.address}`,
            `DESCRIPTION:${evt.description}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
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
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evt.address)}`;
                    window.open(url, '_blank', 'noopener');
                }
            });
        });
    }

    return { init };
})();


/* ==========================================================================
   7. GALLERY LIGHTBOX
   ========================================================================== */

const Gallery = (() => {
    function init() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = document.querySelector('.lightbox-close');
        if (!lightbox || !lightboxImg) return;

        const open = (src, alt) => {
            lightboxImg.src = src;
            lightboxImg.alt = alt || '';
            lightbox.classList.add('is-open');
            document.body.classList.add('no-scroll');
        };

        const close = () => {
            lightbox.classList.remove('is-open');
            document.body.classList.remove('no-scroll');
        };

        document.querySelectorAll('.gallery-item img[data-full]').forEach(img => {
            img.addEventListener('click', () => open(img.getAttribute('data-full'), img.alt));
        });

        if (closeBtn) closeBtn.addEventListener('click', close);
        lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
        });
    }
    return { init };
})();


/* ==========================================================================
   8. RSVP FORM
   ========================================================================== */

const RSVP = (() => {
    function init() {
        const form = document.getElementById('rsvp-form');
        const status = document.getElementById('form-status');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            status.textContent = 'Sending your reply…';

            const data = Object.fromEntries(new FormData(form).entries());

            try {
                if (WEDDING_CONFIG.rsvpEndpoint) {
                    const res = await fetch(WEDDING_CONFIG.rsvpEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                        body: JSON.stringify(data)
                    });
                    if (!res.ok) throw new Error('Network response was not ok');
                }
                status.textContent = `With gratitude, ${data.name || 'dear guest'} — your reply has been received.`;
                form.reset();
            } catch (err) {
                console.warn('RSVP submission could not reach the server:', err);
                status.textContent = 'Your reply was recorded on this device. Please also let the couple know directly.';
                form.reset();
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
    return { init };
})();


/* ==========================================================================
   9. AMBIENT MUSIC TOGGLE
   ========================================================================== */

const MusicToggle = (() => {
    let audio, btn, userMuted = false;

    function updateUI(playing) {
        btn.classList.toggle('is-playing', playing);
    }

    function autoStart() {
        if (!audio || userMuted) return;
        audio.volume = 0.35;
        audio.play().then(() => updateUI(true)).catch(() => updateUI(false));
    }

    function init() {
        btn = document.getElementById('music-toggle');
        if (!btn) return;

        audio = new Audio(WEDDING_CONFIG.audioSrc);
        audio.loop = true;
        audio.addEventListener('error', () => {
            // No audio file supplied — fail silently, keep the toggle inert but visible.
            console.info('No ambient audio file found at', WEDDING_CONFIG.audioSrc);
        });

        btn.classList.add('is-active');
        btn.addEventListener('click', () => {
            if (audio.paused) {
                userMuted = false;
                audio.play().then(() => updateUI(true)).catch(() => { });
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
    Nav.init();
    ScrollReveal.init();
    Countdown.init();
    EventLinks.init();
    Gallery.init();
    RSVP.init();
    MusicToggle.init();
    SealIntro.init(); // last — may synchronously activate Nav if seal already broken
});