# Navin & Lekshmy — Royal Wedding Invitation

A single-page, cinematic wedding invitation site. Pure HTML5, CSS3 and
vanilla ES6 — no build step, no frameworks, no dependencies besides
Google Fonts. Ready to host on GitHub Pages as-is.

```
wedding-invitation/
├── index.html          ← all page content & structure
├── css/
│   └── style.css        ← every style, organised into 19 labelled sections
├── js/
│   └── main.js           ← seal intro, countdown, reveals, RSVP, gallery, music
├── assets/
│   ├── images/           ← put your real photos here
│   └── audio/             ← put an ambient music file here (optional)
└── README.md
```

---

## 1. Quick start

Just open `index.html` in a browser — everything runs client-side.

To preview it the way a browser normally serves a site (recommended, so
relative paths and the audio file behave correctly), run a tiny local
server from the project folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## 2. The most common edits

All of the content that changes per-couple lives in two places.

### A. `js/main.js` → `WEDDING_CONFIG`

At the very top of the file:

```js
const WEDDING_CONFIG = {
  weddingDateISO: '2026-12-12T10:00:00',   // powers the countdown
  events: {
    ceremony: { title, venue, address, start, end, description },
    reception: { title, venue, address, start, end, description }
  },
  rsvpEndpoint: '',                         // see section 4 below
  audioSrc: 'assets/audio/ambience.mp3'
};
```

Changing the dates/venues here automatically updates the countdown,
the "Add to Calendar" (.ics) downloads, and the "View Map" links.

### B. `index.html`

Search for these text blocks and replace them with your own copy:

| Section          | What to change                                   |
|-------------------|---------------------------------------------------|
| `#hero`            | Names, tagline, date line                        |
| `#verse`           | The blessing / quote                              |
| `#story`            | The three `.story-item` blocks (your own timeline) |
| `#events`            | Card copy (times/venues shown to guests — keep in sync with `WEDDING_CONFIG`) |
| `#schedule`           | The `.schedule-row` list — order of the day        |
| `#gallery`             | Replace placeholder `src`/`data-full` with real photo paths |
| `#rsvp`                 | Copy above the form, and the reply-by date          |
| `#site-footer`            | Closing note                                        |

The couple's initials appear inside the reusable crest symbol
(`<symbol id="crest-emblem">` near the top of `index.html`) as the text
`N &amp; L` — change that one line and every crest across the site
(seal, nav, hero, footer) updates together.

---

## 3. Adding your own photos

1. Drop image files into `assets/images/` (e.g. `photo-1.jpg`).
2. In `#gallery`, for each `.gallery-item`, replace both the `src` and
   `data-full` attributes on the `<img>` with your file path:

```html
<img src="assets/images/photo-1.jpg" data-full="assets/images/photo-1.jpg" alt="Describe the photo">
```

   Use a smaller/optimised file for `src` (grid thumbnail) and a larger
   version for `data-full` (lightbox) if you want the fastest load —
   or just use the same file for both to keep it simple.
3. Delete the `<div class="gallery-placeholder">…</div>` line inside
   that item once a real photo is in place (it's just a decorative
   frame icon for empty placeholders).

## 4. Connecting the RSVP form

GitHub Pages only serves static files, so the form can't send email by
itself. It already works out of the box (it confirms to the guest and
resets), but replies will only appear in that guest's own browser
unless you connect one of these free options:

**Option A — Formspree (easiest)**
1. Create a free form at [formspree.io](https://formspree.io).
2. Copy the endpoint URL it gives you (`https://formspree.io/f/xxxxxxx`).
3. Paste it into `rsvpEndpoint` in `js/main.js`.

**Option B — Getform, Basin, or any "form backend" service**
Same idea — paste the endpoint they give you into `rsvpEndpoint`.

**Option C — EmailJS**
Sends straight from the browser via your own email account. Their
docs (emailjs.com) show the few lines to drop into the `RSVP` module
in `js/main.js` in place of the `fetch()` call.

Until you connect one of these, treat the form as a nice interactive
preview rather than your only way of collecting replies — share a
phone number or email in the RSVP section too, just in case.

---

## 5. Adding ambient music

Add any short, royalty-free orchestral loop as:

```
assets/audio/ambience.mp3
```

The music toggle (bottom-right gold button) will pick it up
automatically once the seal is broken. If no file is present, the
button simply stays silent — no errors are shown to guests. Sites
like Pixabay Music or Free Music Archive have suitable royalty-free
tracks; check each track's licence before publishing.

---

## 6. Deploying to GitHub Pages

1. Create a new GitHub repository and push this folder's contents to
   the root of the `main` branch:

   ```bash
   git init
   git add .
   git commit -m "Royal wedding invitation"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. On GitHub: **Settings → Pages → Source → Deploy from a branch →
   `main` / `root`** → Save.
3. Your site goes live at:
   `https://<your-username>.github.io/<repo-name>/`

Custom domain? Add a `CNAME` file at the project root containing your
domain, then point its DNS at GitHub Pages per GitHub's docs.

---

## 7. Design tokens (colors & fonts)

Everything visual is driven by CSS custom properties at the top of
`css/style.css`, under `:root`:

```css
--royal-navy:      #081B3A;
--dark-navy:       #051224;
--gold:            #D4AF37;
--champagne-gold:  #E7C873;
--ivory:           #F9F8F4;
```

Change these five values to re-theme the entire site consistently —
every gradient, border and text-shimmer derives from them. Fonts are
declared just below:

```css
--font-display: 'Cormorant Garamond', serif;  /* headings */
--font-script:  'Great Vibes', cursive;        /* names */
--font-body:    'Libre Baskerville', serif;    /* body copy */
```

---

## 8. Notes on structure

- **No build tooling.** Open `index.html` directly, or serve it
  statically — nothing to compile.
- **One shared SVG sprite** (top of `index.html`) holds the crest and
  icons, reused via `<use href="#crest-emblem">` everywhere the crest
  appears, so you only edit the monogram once.
- **`js/main.js`** is split into small self-contained modules
  (`Particles`, `SealIntro`, `Nav`, `ScrollReveal`, `Countdown`,
  `EventLinks`, `Gallery`, `RSVP`, `MusicToggle`) — each can be read,
  edited or removed independently.
- **Accessibility:** focus states are visible on every interactive
  element, the RSVP form uses real `<label>`s, and all animation
  respects `prefers-reduced-motion`.
- **Performance:** no external JS libraries, no web fonts beyond the
  three specified, and all ornamental art is inline SVG (crisp at any
  size, no image requests).

Enjoy the wedding. 🤍
