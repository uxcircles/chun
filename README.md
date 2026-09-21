# Chun-Chuan Lin — portfolio (rebuilt)

A static rebuild of **chunchuanlin.design** and the password-protected
Framer case studies, as plain HTML/CSS/JS you fully own. No build tools or
frameworks required to host it — but there's a tiny Node script to regenerate
the pages when you edit content.

## Structure

```
index.html              Home page (generated)
work/*.html              6 case-study pages (generated)
assets/
  css/style.css          All styling
  js/main.js             Nav, scroll reveal, case-study TOC highlighting
  img/                   All images, pulled from the original site
content/
  home.json              Home-page copy, stats, project list, testimonials…
  cs1…cs6-*.json          Case-study content (headings, text, image names)
build.mjs                Regenerates index.html + work/*.html from content/
```

## Editing content

1. Edit the relevant file in `content/` (all plain JSON — text, image
   filenames, section order).
2. Run `node build.mjs`
3. Refresh the page.

Image files live in `assets/img/`. To add one, drop the file in that folder
and reference it by filename in the JSON.

## Previewing locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly also works, but a local server matches
production behaviour.)

## Deploying

It's a static site — deploy the whole folder to any static host:

- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder, or point
  it at a repo. No build command needed (or `node build.mjs` if you want the
  host to regenerate).
- **GitHub Pages** — push the folder; enable Pages on the branch.
- Point the `chunchuanlin.design` domain at whichever host you pick.

## Notes / possible next steps

- Case studies are **not** password-protected in this version. If you want the
  gate back, most static hosts offer password protection at the hosting level
  (Netlify, Cloudflare Access), which is more robust than the client-side
  Framer one.
- Images were downloaded at ~1024–1600px wide (originals were up to 4500px).
  Total `assets/img/` is ~19 MB. Fine for a portfolio; could be squeezed
  further with WebP if you want.
- Theme: the landing page is dark (`body.theme-dark` in build.mjs); case-study
  pages are light. Palette tokens for both are at the top of `assets/css/style.css`.
- Videos: 4 case studies embed motion-design clips from the original site
  (`assets/video/`), autoplaying muted/looping and only while on screen. Poster
  frames are in `assets/img/poster-*.jpg`.
- Fonts: Merriweather (serif display) + IBM Plex Mono
  (metadata: dates, roles, tags, section indices, stat captions) + Inter (body),
  all from Google Fonts.
- Motion (all `prefers-reduced-motion` guarded, in `assets/js/main.js` + the
  POLISH block of `style.css`): hero headline blur-resolves word-by-word after
  fonts load; section headings blur-in on scroll; images reveal with a
  clip-path wipe; stat numbers count up; case-study pages have a teal scroll
  progress bar; hero CTAs are magnetic and the hero has a cursor-follow glow;
  the footer email copies to clipboard with a toast.
- The old Framer analytics / "Made in Framer" badge are gone.
- Client logos (ESG Book, AUO, Acer, Synology, Rolls-Royce, Y TREE) are the
  real brand marks pulled from the original site, in an auto-scrolling strip
  under the hero. Favicon + apple-touch-icon are the site's own icon files.
