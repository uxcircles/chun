/* ------------------------------------------------------------------
   Static site builder for chunchuanlin.design rebuild.
   Reads content/*.json, writes index.html + work/<slug>.html
   Run:  node build.mjs
------------------------------------------------------------------ */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = decodeURIComponent(path.dirname(new URL(import.meta.url).pathname));
const C = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, "content", p), "utf8"));

// content-hash query param so a redeploy always busts browser caches for CSS/JS
const fileHash = (relPath) => {
  const buf = fs.readFileSync(path.join(ROOT, relPath));
  return crypto.createHash("md5").update(buf).digest("hex").slice(0, 8);
};
const CSS_V = fileHash("assets/css/style.css");
const JS_V = fileHash("assets/js/main.js");
const BOOK_CSS_V = fileHash("assets/css/book.css");
const SHELF_JS_V = fileHash("assets/js/shelf.js");

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const IMG = (name, base) => `${base}assets/img/${name}`;
const ARROW = `<span class="arrow" aria-hidden="true">&rarr;</span>`;
const isVideo = (name) => /\.(mp4|webm|mov)$/i.test(name);
const MEDIA = (name, base) => {
  if (!isVideo(name)) return `<img src="${IMG(name, base)}" alt="" loading="lazy">`;
  const posterName = `poster-${name.replace(/\.(mp4|webm|mov)$/i, "")}.webp`;
  const poster = fs.existsSync(path.join(ROOT, "assets/img", posterName)) ? ` poster="${IMG(posterName, base)}"` : "";
  return `<video src="${base}assets/video/${name}" autoplay muted loop playsinline preload="metadata"${poster}></video>`;
};

// wrap each word of a heading in <span> for staggered blur-in animation
const splitWords = (s = "") =>
  esc(s)
    .split(/(\s+)/)
    .map((w) => (/^\s+$/.test(w) ? w : `<span class="w">${w}</span>`))
    .join("");

const SITE = "Chun-Chuan Lin";
const EMAIL = "designlcc@gmail.com";
const SITE_URL = "https://chunchuanlin.design";
const OG_IMAGE = "VFbImBTynQh7F0MmkZp4YDalEAE.webp";

// small line icons (Feather-style, 24×24, inherit stroke colour)
const ICON = {
  vault: `<path d="M3 21h18M4 21V8l8-4 8 4v13"/><circle cx="12" cy="12" r="3"/><path d="M12 15v3"/>`,
  users: `<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>`,
  smile: `<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>`,
  book: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>`,
  compass: `<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>`,
  scale: `<path d="M12 3v18M3 7h18M6 7l-3.5 7a3 3 0 0 0 6 0zM18 7l-3.5 7a3 3 0 0 0 6 0z"/>`,
  folder: `<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>`,
  shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
  flag: `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>`,
  link: `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`,
  target: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
  briefcase: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
  clock: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  lock: `<path d="M16 12h1.4a.6.6 0 01.6.6v6.8a.6.6 0 01-.6.6H6.6a.6.6 0 01-.6-.6v-6.8a.6.6 0 01.6-.6H8m8 0V8c0-1.333-.8-4-4-4S8 6.667 8 8v4m8 0H8"/>`,
  "trending-up": `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`,
  "alert-triangle": `<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  "check-circle": `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
  layers: `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
  eye: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`,
  "message-circle": `<path d="M21 11.5a8.38 8.38 0 0 1-8.6 8.5 8.5 8.5 0 0 1-4-.9L3 21l1.9-5.4A8.38 8.38 0 0 1 3.5 11 8.5 8.5 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5z"/>`,
  smartphone: `<rect x="6" y="2" width="12" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/>`,
  "bar-chart": `<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>`,
  zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  sliders: `<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>`,
  map: `<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>`,
  image: `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>`,
  pound: `<path d="M9 21h9M8 21c1.5 0 2-1 2-2.5V8a3.5 3.5 0 0 1 6.5-1.9M6 13h8"/>`,
  gauge: `<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M12 3a9 9 0 0 0-8.75 11.16M12 3a9 9 0 0 1 8.75 11.16M5 19.5a9 9 0 0 0 14 0"/><line x1="12" y1="12" x2="15.5" y2="7.5"/>`,
};

// keyword → icon fallback for item cards that have no leading emoji marker
// (checked in order — first match wins), so Challenge/Solution/Outcome cards
// across every case study get a relevant icon even without hand-authored emoji
const KEYWORD_ICON = [
  [/satisfaction|csat|reassur|delight/i, "smile"],
  [/feedback|user stor|stakeholder|interview/i, "message-circle"],
  [/discoverab|search/i, "eye"],
  [/confus|unclear|debts|fragmented|lacks|isn.t obvious|no wrapper|no financial context|flat|problem/i, "alert-triangle"],
  [/faster|reduced|efficien|speed|quick|streamlin/i, "zap"],
  [/time|switching|schedul/i, "clock"],
  [/wrapper|architecture|ia\b|platform|unified|standardis|introduced/i, "layers"],
  [/accessib|visualisation|visib|clarity|transparent/i, "eye"],
  [/risk|complian|regulat|governance|mandate|accountab|security/i, "shield"],
  [/growth|return|higher|improv|trending/i, "trending-up"],
  [/mobile|app|screen|smartphone/i, "smartphone"],
  [/business impact|revenue|cost|£|financial/i, "pound"],
  [/outcome|success|achieve|clearer|complete data|predictable/i, "check-circle"],
  [/goal|target|action/i, "target"],
  [/memories|illustration|photo|image/i, "image"],
  [/option|setting|customi/i, "sliders"],
  [/journey|trip|navigat|route|where (to|they)/i, "map"],
  [/overview|transaction|account|data/i, "bar-chart"],
  [/health|score|gauge/i, "gauge"],
  [/workflow|complex/i, "compass"],
];
function pickCardIcon(title) {
  for (const [re, name] of KEYWORD_ICON) if (re.test(title)) return name;
  return "check-circle";
}

// cursor-follow circular badge: spinning text ring around a centre icon,
// shown in place of the plain dot while hovering a trigger element
function spinBadge(id, text, iconName) {
  // Keep this deliberately plain: no textLength/lengthAdjust (renders
  // inconsistently on a textPath), an explicit arc radius rather than the
  // "A 1 1" auto-scaled-radius trick, and never more text than the ring can
  // hold — text that runs past the end of a closed path can be redrawn over
  // the start of the ring instead of being dropped, which is what turned the
  // label into an unreadable overlapping smear.
  // sweep-flag 0 runs the ring anticlockwise, so the label reads the right way
  // up along the bottom of the circle — matching chunchuanlin.design, whose
  // path is "A 1 1 0 1 0 ..." with dominant-baseline Hanging on the textPath
  const radius = 50; // the ring sits at the edge of the viewBox, as on the real site
  const circumference = 2 * Math.PI * radius;
  const fontSize = 17, avgCharWidth = fontSize * 0.48;
  const unit = `${text} | `;
  const reps = Math.max(1, Math.floor((circumference * 0.9) / (unit.length * avgCharWidth)));
  const t = unit.repeat(reps);
  return `<div class="cursor-badge" id="${id}">
  <svg viewBox="0 0 100 100" overflow="visible">
    <defs><path id="${id}-path" d="M 0,50 A 50,50 0 1,0 100,50 A 50,50 0 1,0 0,50"/></defs>
    <text><textPath href="#${id}-path" startOffset="0" dominant-baseline="hanging">${esc(t)}</textPath></text>
  </svg>
  ${iconName ? `<span class="cursor-badge-center">${icon(iconName, "cursor-badge-icon")}</span>` : ""}
</div>`;
}
const icon = (name, cls = "stat-icon") =>
  ICON[name]
    ? `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`
    : "";

// map a leading emoji marker (as used in the original site's cards) to a line icon
const EMOJI_ICON = {
  "🧑‍🤝‍🧑": "users",
  "🧭": "compass",
  "⚖️": "scale",
  "📂": "folder",
  "🧑‍⚖️": "shield",
  "🚦": "flag",
  "🔗": "link",
  "🎯": "target",
  "🧳": "briefcase",
  "🕰️": "clock",
  "📈": "trending-up",
  "📊": "bar-chart",
  "🧩": "layers",
  "🏦": "vault",
  "🎚️": "sliders",
  "💷": "pound",
};
function stripEmojiIcon(title) {
  const m = String(title).match(/^(\S+)\s+(.*)$/su);
  if (m && EMOJI_ICON[m[1]]) return { iconName: EMOJI_ICON[m[1]], text: m[2] };
  return { iconName: null, text: title };
}

/* ---------- case study registry (order = prev/next) ---------- */
const STUDIES = [
  { slug: "provider-redesign",        file: "cs1-provider-redesign.json",        card: "Redesigned a £9B platform for UHNW clients", img: "VFbImBTynQh7F0MmkZp4YDalEAE.webp", locked: true },
  { slug: "home-redesign",            file: "cs2-home-redesign.json",            card: "Improved mobile app CSAT to 89%", img: "YumomZDwZKkCPeDbRDVu0XXveg.webp", locked: true },
  { slug: "client-portal",            file: "cs3-client-portal.json",            card: "Simplified onboarding via a client portal", img: "cqkEi4mZ536VQZQC6X23w6QmEs.webp" },
  { slug: "wealth-management-system", file: "cs4-wealth-management-system.json", card: "A governed rebalancing system for wealth advisors", img: "E0ivBHq7jXSnA6J9aW9na1RmKs.webp" },
  { slug: "portfolio-health",         file: "cs5-portfolio-health.json",         card: "Portfolio health for a regulated investment app", img: "9iO2ZGM4p4TnNoXjsiRvFTovY58.webp" },
  { slug: "trip-memories",            file: "cs6-trip-memories.json",            card: "Revolut home redesign concept", img: "TrorWvIDo5zv1eS2h04sgSZOtJ8.webp" },
  { slug: "save-journey-redesign",    file: "cs7-save-journey-redesign.json",    card: "Redesigned the Save journey, boosting Autosave volume 5–6×", img: "cs7-hero.webp", locked: true },
  { slug: "rightmove-partners",       file: "cs8-rightmove-partners.json",       card: "Designed a trust layer for a two-sided marketplace", img: "cs8-hero.webp" },
];

/* ---------- the shelf: each case study is a book ---------- */
const BOOKS = {
  "provider-redesign":        { short: "The £9B Platform",           outcome: "£9B in client assets",        bg: "#1f3b33", ink: "#ead9ae", acc: "#c9a868", style: "window", pos: "50% 45%", h: 312 },
  "save-journey-redesign":    { short: "One Tap to Save",            outcome: "5–6× Autosave volume",        bg: "#3a2470", ink: "#efe6ff", acc: "#b99bff", style: "bleed", pos: "50% 40%", h: 296 },
  "rightmove-partners":       { short: "The Trust Layer",            outcome: "Self-directed concept",       bg: "#0b1640", ink: "#eef3ff", acc: "#00deb6", style: "band", pos: "22% 50%", h: 304 },
  "home-redesign":            { short: "What Happened to My Money?", outcome: "89% mobile app CSAT",         bg: "#8b3a26", ink: "#f8e8dc", acc: "#f2b48c", style: "bleed", pos: "72% 50%", h: 318 },
  "client-portal":            { short: "The Client Portal",          outcome: "40% less onboarding effort",  bg: "#d29a3a", ink: "#23180a", acc: "#23180a", style: "band", pos: "35% 50%", h: 288 },
  "wealth-management-system": { short: "The Governed Rebalance",     outcome: "AI suggests, advisors decide", bg: "#2c4366", ink: "#e9eef7", acc: "#9fc1ff", style: "window", pos: "50% 55%", h: 308 },
  "portfolio-health":         { short: "Portfolio Health",           outcome: "Risk explained, no advice",   bg: "#5d6a33", ink: "#f2f1dc", acc: "#dfe39a", style: "bleed", pos: "58% 45%", h: 292 },
  "trip-memories":            { short: "Trip Memories",              outcome: "Revolut concept",             bg: "#e6e1d3", ink: "#1d1d24", acc: "#c4572d", style: "plate", pos: "50% 45%", h: 300 },
};
const bookLength = (file) => fs.readFileSync(path.join(ROOT, "content", file), "utf8").length;
const bookThickness = (file) => Math.round(Math.min(60, Math.max(30, 18 + bookLength(file) / 380)));

function coverHtml(b, chapter, year, img) {
  const pic = img ? `<span class="cv-pic"><img src="${img}" alt="" loading="lazy" style="object-position:${b.pos}"></span>` : "";
  const top = `<span class="cv-top"><span>Chun-Chuan Lin</span><span>${esc(year)}</span></span>`;
  const words = `<span class="cv-num">${chapter}</span><span class="cv-title">${esc(b.short)}</span><span class="cv-rule"></span><span class="cv-out">${esc(b.outcome)}</span>`;
  return `<span class="cv cv--${b.style}">${top}${pic}<span class="cv-words">${words}</span></span>`;
}

/* =================================================================
   PAGE SHELL
================================================================= */
const GATE_KEY = "cc_portfolio_unlocked";
const GATE_PASS = "Chun";

function shell({ title, desc, body, base, extraClass = "", progress = false, gated = false, cursorBadges = "", ogImage = OG_IMAGE, running = "", shelfJs = false, noNav = false }) {
  const bodyClass = gated ? `${extraClass} locked`.trim() : extraClass;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex, nofollow">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:image" content="${SITE_URL}/assets/img/${ogImage}">
<link rel="icon" type="image/png" href="${base}assets/img/YUZRlfmyi6MVquyru4w5qhSXo.png">
<link rel="apple-touch-icon" href="${base}assets/img/tBvzRdnmvt2RYUskQSvIiSIpaNc.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Caveat:wght@500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}assets/css/style.css?v=${CSS_V}">
<link rel="stylesheet" href="${base}assets/css/book.css?v=${BOOK_CSS_V}">
</head>
<body class="${bodyClass}">
<a class="skip-link" href="#main-content">Skip to content</a>
${gated ? `<script>try{if(localStorage.getItem(${JSON.stringify(GATE_KEY)})==="1")document.currentScript.parentElement.classList.remove("locked")}catch(e){}</script>
<div class="gate" id="gate">
  <div class="gate-box">
    <h2 class="serif">This case study is private</h2>
    <p>Enter the passcode to view it. Ask Chun if you don't have it.</p>
    <form id="gate-form" autocomplete="off">
      <input type="password" id="gate-input" placeholder="Passcode" autofocus>
      <button type="submit">Unlock</button>
    </form>
    <p class="err" id="gate-err"></p>
  </div>
</div>` : ""}
${progress ? `<div class="scroll-progress" aria-hidden="true"><span></span></div>` : ""}
<div class="cursor-dot" aria-hidden="true"></div>
${cursorBadges}
${noNav ? "" : nav(base, running)}
<main id="main-content">
${body}
</main>
${footer(base)}
<script src="${base}assets/js/main.js?v=${JS_V}" defer></script>
${shelfJs ? `<script src="${base}assets/js/shelf.js?v=${SHELF_JS_V}" defer></script>` : ""}
</body>
</html>`;
}

function nav(base, running = "") {
  return `<header class="nav" id="nav">
  <div class="nav-in">
    <a class="brand" href="${base}index.html">
      <img src="${base}assets/img/ZoILuZUUzq1dYKgV54Ge7Sz8FY.webp" alt="">
      <span>Chun-Chuan&nbsp;Lin</span>
    </a>
    ${running ? `<span class="nav-run">${running}</span>` : ""}
    <button class="nav-toggle" aria-label="Menu" aria-expanded="false">
      <span class="bar"></span><span class="bar"></span><span class="bar"></span>
    </button>
    <nav class="nav-links">
      <a href="${base}index.html#work">Shelf</a>
      <a href="https://drive.google.com/file/d/1oNs0wJNy0Ehd9rT3fSROXO7B89IPfbKE/view?usp=sharing" target="_blank" rel="noopener">CV</a>
      <a href="https://www.linkedin.com/in/chun-chuan-lin/" target="_blank" rel="noopener">LinkedIn</a>
      <a href="https://chunchuanlin.medium.com/" target="_blank" rel="noopener">Medium</a>
    </nav>
  </div>
  <div class="nav-backdrop"></div>
</header>`;
}

function footer(base) {
  return `<footer class="foot" id="contact">
  <div class="foot-in">
    <h2 class="serif reveal">Let&rsquo;s make something clear.</h2>
    <a class="mail reveal" href="mailto:${EMAIL}">${EMAIL}</a>
    <div class="row">
      <span>&copy; ${new Date().getFullYear()} Chun-Chuan Lin — London</span>
      <span class="socials">
        <a href="https://www.linkedin.com/in/chun-chuan-lin/" target="_blank" rel="noopener">LinkedIn</a>
        <a href="https://chunchuanlin.medium.com/" target="_blank" rel="noopener">Medium</a>
        <a href="https://www.behance.net/designlcc" target="_blank" rel="noopener">Behance</a>
        <a href="https://adplist.org/mentors/chun-chuan-lin" target="_blank" rel="noopener">ADPList</a>
      </span>
    </div>
  </div>
</footer>`;
}

/* =================================================================
   HOME
================================================================= */
function buildHome() {
  const d = C("home.json");
  const base = "";
  const h = d.hero;
  // split hero heading into animatable words, italicising the emphasis word
  const heroHead = esc(h.heading)
    .split(/(\s+)/)
    .map((w) => {
      if (/^\s+$/.test(w)) return w;
      const inner = w === esc(h.emphasisWord) ? `<em>${w}</em>` : w;
      return `<span class="w">${inner}</span>`;
    })
    .join("");

  const LOCK = `<svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="7" width="10" height="7.5" rx="1.6" fill="currentColor"/></svg>`;
  const shelfItems = d.featured.projects.map((p, i) => {
    const st = STUDIES.find((x) => x.slug === p.slug);
    const b = BOOKS[p.slug];
    const year = (p.meta.split("·").pop() || "").trim();
    const ch = String(i + 1).padStart(2, "0");
    return { p, st, b, year, ch, t: bookThickness(st.file), w: Math.round(b.h * 0.7) };
  });
  const books = shelfItems
    .map(({ p, st, b, year, ch, t, w }, i) => `<button class="book" type="button" data-i="${i}" style="--h:${b.h}px;--t:${t}px;--w:${w}px;--bb:${b.bg};--bi:${b.ink};--ba:${b.acc}" aria-label="Chapter ${i + 1}, ${esc(p.title)}. Open preview">
        <span class="b3d">
          <span class="spine"><span class="sp-num">${ch}</span><span class="sp-title">${esc(b.short)}</span><span class="sp-mark">${st.locked ? LOCK : "&#9679;"}</span></span>
          <span class="cover">${coverHtml(b, ch, year, IMG(p.img, base))}</span>
        </span>
      </button>`)
    .join("");
  const bookData = JSON.stringify(
    shelfItems.map(({ p, st, b, year, ch }) => ({
      ch, short: b.short, title: p.title, desc: p.desc, meta: p.meta, year, outcome: b.outcome,
      cover: coverHtml(b, ch, year, IMG(p.img, base)), img: IMG(p.img, base), href: `work/${p.slug}.html`, locked: !!st.locked, bg: b.bg, ink: b.ink, acc: b.acc,
    }))
  ).replace(/</g, "\\u003c");

  const NOTE = ["#fbe36a", "#ff9fb5", "#9fe0c2", "#a9d4ff", "#ffc56b", "#e3b8ff"];
  const TILT = [-3, 2.2, -1.2, 2.8, -2, 1.4];
  const notes = d.testimonials.items
    .map(([t, name, role, short], i) => `<details class="note reveal" style="--note:${NOTE[i % NOTE.length]};--tilt:${TILT[i % TILT.length]}deg;--dy:${[0, 26, 8, 30, 4, 22][i % 6]}px">
      <summary><q>${esc(short || t)}</q><span class="who"><b>${esc(name)}</b><span>${esc(role)}</span></span><span class="more">tap to read it all</span></summary>
      <p class="full">&ldquo;${esc(t)}&rdquo;</p>
    </details>`)
    .join("");

  const drafts = d.writing.items
    .map((a, i) => `<a class="draft reveal" href="${a.url}" target="_blank" rel="noopener" style="--tilt:${[-1.6, 1, -0.7][i % 3]}deg">
      <span class="tape ta" aria-hidden="true"></span><span class="tape tb" aria-hidden="true"></span>
      <span class="d-head"><span>Lin / draft ${i + 1}</span><span class="d-meta">${esc(a.meta)}</span></span>
      <span class="d-title">${esc(a.title)}</span>
      <span class="d-desc">${esc(a.desc)}</span>
      <span class="d-go">read the final version &rarr;</span>
    </a>`)
    .join("");

  const caps = d.beyond.captions || [];
  const polaroids = d.beyond.photos
    .map((ph, i) => `<figure class="polaroid reveal" style="--tilt:${[-3, 2.2, -1.4][i % 3]}deg"><span class="tape" aria-hidden="true"></span><img src="${IMG(ph, base)}" alt="${esc(caps[i] || "")}" loading="lazy"><figcaption>${esc(caps[i] || "")}</figcaption></figure>`)
    .join("");

  const POST = ["#1f6f5c", "#2f4a86", "#b4532f", "#5b2a6e"];
  const cards = d.track.stats
    .map((st, i) => `<div class="postcard reveal" style="--tilt:${[2.4, -1.8, -2.2, 1.6][i % 4]}deg;--stamp:${POST[i % 4]}">
      <div class="pc-msg"><b>${esc(st.value)}</b><span>${esc(st.label)}</span></div>
      <div class="pc-side" aria-hidden="true"><span class="stamp">${icon(st.icon, "stamp-ic")}<small>${["1st", "2nd", "1st", "Air"][i % 4]}</small></span><span class="postmark"></span><i></i><i></i><i></i></div>
    </div>`)
    .join("");

  const faceOut = shelfItems
    .map(({ p, st, b, year, ch }) => `<a class="fitem reveal" href="work/${p.slug}.html" style="--bb:${b.bg};--bi:${b.ink};--ba:${b.acc}">
      <span class="cover">${coverHtml(b, ch, year, IMG(p.img, base))}</span>
      <span class="lab"><b>${esc(p.title)}</b><span>${st.locked ? LOCK + " " : ""}${esc(b.outcome)}</span></span>
    </a>`)
    .join("");
  const facts = h.kicker.split("·").map((f) => `<span>${esc(f.trim())}</span>`).join("");

  const logoRow = h.clientLogos
    .map(([name, file]) => `<span class="logo logo--${slugify(name)}"><img src="${IMG(file, base)}" alt="${esc(name)}" decoding="async"></span>`)
    .join("");

  const body = `
<div class="wall">
  <section class="wall-top" aria-label="Introduction">
    <div class="wall-in">
      <div class="poster hero-gate">
        <span class="tape t1" aria-hidden="true"></span><span class="tape t2" aria-hidden="true"></span>
        <div class="p-art" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <h1 class="serif split hero-title">${heroHead}</h1>
        <p class="p-sub">${esc(h.sub)}</p>
        <p class="p-facts"><span>Chun-Chuan Lin</span>${facts}</p>
      </div>
      <div class="postcards">${cards}</div>
      <div class="card-biz reveal">
        <span class="pin" aria-hidden="true"></span>
        <img class="biz-logo" src="${IMG(d.nav.logo, base)}" alt="">
        <b>Chun-Chuan Lin</b>
        <a href="mailto:${EMAIL}">${EMAIL}</a>
        <span class="biz-links"><a href="${d.nav.links[0][1]}" target="_blank" rel="noopener">CV</a><a href="${d.nav.links[1][1]}" target="_blank" rel="noopener">LinkedIn</a><a href="${d.nav.links[2][1]}" target="_blank" rel="noopener">Medium</a></span>
      </div>
    </div>
    <div class="logo-strip reveal" aria-label="Selected clients"><span class="ls-k">Worked with</span>${logoRow}</div>
  </section>

  <section class="library" id="work" aria-label="Case studies">
    <div class="shelf">
      <div class="shelf-row" id="shelf">
        <span class="bookend" aria-hidden="true"></span>
        ${books}
        <span class="bookend r" aria-hidden="true"></span>
      </div>
      <div class="plank" aria-hidden="true"></div>
    </div>
    <div class="faceout" id="contents">${faceOut}</div>
    <p class="earlier-w reveal">${esc(d.featured.earlierNote).replace("→ Get in touch", `<a href="mailto:${EMAIL}">Get in touch &rarr;</a>`)}</p>
  </section>

  <section class="wall-sec" id="praise">
    <div class="wall-in">
      <h2 class="wall-h serif reveal">Notes left by people I&rsquo;ve worked with</h2>
      <div class="notes">${notes}</div>
    </div>
  </section>

  <section class="wall-sec" id="writing">
    <div class="wall-in">
      <h2 class="wall-h serif reveal">Drafts, taped up</h2>
      <p class="wall-p reveal">${esc(d.writing.intro)}</p>
      <div class="drafts">${drafts}</div>
    </div>
  </section>

  <section class="wall-sec" id="about">
    <div class="wall-in photos">
      <div class="photo-note reveal">
        <h2 class="wall-h serif">${esc(d.beyond.title)}</h2>
        <p>${esc(d.beyond.body)}</p>
      </div>
      <div class="polaroids">${polaroids}</div>
    </div>
  </section>
</div>

<dialog class="reader" id="reader" aria-label="Chapter preview">
  <button class="rd-btn rd-close" type="button" aria-label="Close">&times;</button>
  <button class="rd-btn rd-prev" type="button" aria-label="Previous chapter">&lsaquo;</button>
  <button class="rd-btn rd-next" type="button" aria-label="Next chapter">&rsaquo;</button>
  <div class="ob" id="ob">
    <div class="ob-page" id="ob-page"></div>
    <div class="ob-cover"><div class="ob-front cover" id="ob-front"></div><div class="ob-back" id="ob-back"></div></div>
  </div>
</dialog>
<script type="application/json" id="books-data">${bookData}</script>`;

  return shell({
    title: "Chun-Chuan Lin — Product designer for complex, regulated financial products",
    desc: h.sub,
    body,
    base,
    extraClass: "theme-dark home-shelf",
    shelfJs: true,
    noNav: true,
  });
}

/* =================================================================
   CASE STUDY
================================================================= */
const isH = (b, ...t) => b && typeof b.tag === "string" && t.includes(b.tag);

function splitHero(blocks) {
  // drop everything up to the first H1
  let i = blocks.findIndex((b) => isH(b, "H1"));
  if (i < 0) i = 0;
  const rest = blocks.slice(i);

  // title = leading consecutive H1s
  const titleParts = [];
  let j = 0;
  while (isH(rest[j], "H1")) { titleParts.push(rest[j].text); j++; }
  const title = titleParts.join(" ").replace(/\s+—\s*$/, "");

  // subtitle = following H5s
  const subParts = [];
  while (isH(rest[j], "H5")) { subParts.push(rest[j].text); j++; }

  // look ahead a few blocks for meta line + hero image + fallback summary
  let meta = "", heroImg = "", summary = "";
  let k = j, scanned = 0;
  while (k < rest.length && scanned < 5) {
    const b = rest[k];
    if (b.img && !heroImg) { heroImg = b.img; rest.splice(k, 1); scanned++; continue; }
    if (b.tag === "text" && /(\d{4}).*(design|Design|UX|Research)|\|/.test(b.text) && !meta) {
      meta = b.text; rest.splice(k, 1); scanned++; continue;
    }
    if (b.tag === "text" && !summary && subParts.length === 0) {
      summary = b.text; rest.splice(k, 1); scanned++; continue;
    }
    break;
  }
  const body = rest.slice(j);
  const sub = subParts.join(" ") || summary;
  return { title, sub, meta: meta.replace(/\s*\|\s*/g, " · "), heroImg, body };
}

function renderBlocks(body, base) {
  // group into sections by H1
  const sections = [];
  let cur = { title: "Overview", blocks: [] };
  for (const b of body) {
    if (isH(b, "H1")) {
      if (cur.blocks.length) sections.push(cur);
      cur = { title: b.text, blocks: [] };
    } else {
      cur.blocks.push(b);
    }
  }
  if (cur.blocks.length) sections.push(cur);

  const toc = [];
  const out = sections
    .map((sec, idx) => {
      const n = String(idx + 1).padStart(2, "0");
      const id = "sec-" + slugify(sec.title) + "-" + idx;
      toc.push({ id, title: sec.title });
      return `<section class="cs-section" id="${id}">
  <span class="num">${n}</span>
  <h2 class="divider serif split">${splitWords(sec.title)}</h2>
  ${renderInner(sec.blocks, base)}
</section>`;
    })
    .join("\n");

  return { html: out, toc };
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

function figrow(names, base) {
  if (names.length === 1)
    return `<figure class="reveal full"><img src="${IMG(names[0], base)}" alt="" loading="lazy"></figure>`;
  const cls = names.length === 2 ? "two" : "three";
  return `<div class="figrow ${cls} full reveal">${names
    .map((nm) => `<img src="${IMG(nm, base)}" alt="" loading="lazy">`)
    .join("")}</div>`;
}

// cards sitting under a heading about what went wrong get red icons, so a
// reader can tell problems from solutions and outcomes at a glance
const PROBLEM_HEADING = /problem|challenge|pain|issue|debt|risk|friction|barrier|blocker/i;

function renderInner(blocks, base) {
  const parts = [];
  let heading = "";
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];

    // a single portrait screenshot flagged layout:"side", immediately followed
    // by item cards — screen on the left, cards stacked to its right so they
    // can be cross-referenced against it
    if (b.img && !b.cap && b.layout === "side") {
      i++;
      const items = [];
      while (i < blocks.length && Array.isArray(blocks[i].item)) { items.push(blocks[i].item); i++; }
      const warn = PROBLEM_HEADING.test(heading) ? " warn" : "";
      parts.push(`<div class="screen-compare full reveal">
        <img src="${IMG(b.img, base)}" alt="" loading="lazy">
        <div class="callouts">${items
          .map(([t, s]) => {
            const stripped = stripEmojiIcon(t);
            const iconName = stripped.iconName || pickCardIcon(stripped.text);
            return `<div class="mini${warn}">${icon(iconName, "mini-icon")}<b>${esc(stripped.text)}</b><span>${esc(s)}</span></div>`;
          })
          .join("")}</div>
      </div>`);
      continue;
    }
    // run of images
    if (b.img && !b.cap) {
      const run = [];
      while (i < blocks.length && blocks[i].img && !blocks[i].cap) { run.push(blocks[i].img); i++; }
      parts.push(figrow(run, base));
      continue;
    }
    // run of item cards
    if (Array.isArray(b.item)) {
      const items = [];
      while (i < blocks.length && Array.isArray(blocks[i].item)) { items.push(blocks[i].item); i++; }
      const cls = items.length === 2 ? "c2" : items.length === 4 ? "c4" : "";
      const warn = PROBLEM_HEADING.test(heading) ? " warn" : "";
      parts.push(
        `<div class="cards ${cls} reveal">${items
          .map(([t, s]) => {
            const stripped = stripEmojiIcon(t);
            const iconName = stripped.iconName || pickCardIcon(stripped.text);
            return `<div class="mini${warn}">${icon(iconName, "mini-icon")}<b>${esc(stripped.text)}</b><span>${esc(s)}</span></div>`;
          })
          .join("")}</div>`
      );
      continue;
    }

    i++;

    if (b.video) {
      parts.push(
        `<figure class="reveal full${b.portrait ? " portrait" : ""}">
          <video src="${base}assets/video/${b.video}" autoplay muted loop playsinline preload="metadata"${b.poster ? ` poster="${IMG(b.poster, base)}"` : ""}></video>
          ${b.cap ? `<figcaption>${esc(b.cap)}</figcaption>` : ""}
        </figure>`
      );
      continue;
    }
    if (Array.isArray(b.cta)) {
      const [label, href] = b.cta;
      parts.push(
        `<p class="cta-row reveal"><a class="btn btn-solid" href="${esc(/^https?:/.test(href) ? href : base + href)}" target="_blank" rel="noopener">${esc(label)} <span class="arrow">→</span></a></p>`
      );
      continue;
    }
    if (b.cap && b.img) {
      parts.push(
        `<figure class="reveal full${b.portrait ? " portrait" : ""}"><img src="${IMG(b.img, base)}" alt="" loading="lazy"><figcaption>${esc(b.cap)}</figcaption></figure>`
      );
      continue;
    }
    if (Array.isArray(b.p)) { parts.push(b.p.map((t) => `<p class="text reveal">${esc(t)}</p>`).join("")); continue; }
    if (Array.isArray(b.bullets)) {
      parts.push(
        `<ul class="bullets reveal">${b.bullets.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` +
          (b.after ? `<p class="after-note reveal">${esc(b.after)}</p>` : "")
      );
      continue;
    }
    if (b.dd) {
      parts.push(`<div class="dd reveal"><b>Design decision</b><p>${esc(b.dd)}</p></div>`);
      continue;
    }
    if (Array.isArray(b.persona)) {
      const [name, img, q, pain] = b.persona;
      parts.push(`<div class="persona reveal">
        ${img ? `<img src="${IMG(img, base)}" alt="">` : `<span></span>`}
        <div><h4>${esc(name)}</h4><p class="q serif">${esc(q)}</p>${pain ? `<p class="pain">${esc(pain)}</p>` : ""}</div>
      </div>`);
      continue;
    }
    if (Array.isArray(b.quote)) {
      const [label, img, who, text, evidence] = b.quote;
      if (label) parts.push(`<h3 class="sub serif reveal">${esc(label)}</h3>`);
      parts.push(`<div class="persona${evidence ? " has-evidence" : ""} reveal">
        ${img ? `<img src="${IMG(img, base)}" alt="">` : `<span></span>`}
        <div>
          <p class="q serif">&ldquo;${esc(String(text).replace(/^[“"]|[”"]$/g, ""))}&rdquo;</p>
          <p class="pain">${esc(who)}</p>
        </div>
        ${evidence ? `<img class="evidence" src="${IMG(evidence, base)}" alt="">` : ""}
      </div>`);
      continue;
    }
    if (Array.isArray(b.insight)) {
      const [label, title, text, img] = b.insight;
      parts.push(`<p class="eyebrow reveal" style="margin:34px 0 0">${esc(label)}</p>
        <p class="lead reveal">${esc(title)}</p>
        ${text ? `<p class="text reveal">${esc(text)}</p>` : ""}
        ${img ? `<figure class="reveal full"><img src="${IMG(img, base)}" alt="" loading="lazy"></figure>` : ""}`);
      continue;
    }
    if (Array.isArray(b.duo)) {
      const [wide, narrow] = b.duo;
      parts.push(`<div class="duo full reveal">
        <img src="${IMG(wide, base)}" alt="" loading="lazy">
        <img class="narrow" src="${IMG(narrow, base)}" alt="" loading="lazy">
      </div>`);
      continue;
    }
    if (Array.isArray(b.compare)) {
      const [la, lb, ia, ib, mod] = b.compare;
      let cls = "", style = "";
      if (mod === "tall") {
        cls = " compare--tall";
      } else if (mod) {
        cls = " compare--ratio";
        style = ` style="--r1:${mod.split("-")[0]}fr;--r2:${mod.split("-")[1]}fr"`;
      }
      const splitCap = (s) => {
        const m = s.match(/^([^:]{1,24}):\s*(.+)$/s);
        return m ? { label: m[1], desc: m[2] } : { label: null, desc: s };
      };
      const fig = (img, raw) => {
        const { label, desc } = splitCap(raw);
        return `<figure>${label ? `<div class="compare-label">${esc(label)}</div>` : ""}${MEDIA(img, base)}<figcaption>${esc(desc)}</figcaption></figure>`;
      };
      parts.push(`<div class="compare full reveal${cls}"${style}>
        ${fig(ia, la)}
        ${fig(ib, lb)}
      </div>`);
      continue;
    }
    if (Array.isArray(b.wrappers)) {
      const cls = b.wrappers.length === 2 ? "two" : b.wrappers.length === 4 ? "four" : "three";
      parts.push(`<div class="figrow ${cls} full reveal">${b.wrappers
        .map(([nm, im]) => `<figure style="margin:0"><img src="${IMG(im, base)}" alt="${esc(nm)}" loading="lazy"><figcaption>${esc(nm)}</figcaption></figure>`)
        .join("")}</div>`);
      continue;
    }
    if (Array.isArray(b.feedback)) {
      const [title, lead, ...qs] = b.feedback;
      parts.push(`<h3 class="sub serif reveal">${esc(title)}</h3><p class="lead reveal">${esc(lead)}</p>`);
      for (const [img, who, text] of qs) {
        parts.push(`<div class="persona reveal">
          ${img ? `<img src="${IMG(img, base)}" alt="">` : `<span></span>`}
          <div><p class="q serif">&ldquo;${esc(String(text).replace(/^[“"]|[”"]$/g, ""))}&rdquo;</p><p class="pain">${esc(who)}</p></div>
        </div>`);
      }
      continue;
    }
    if (Array.isArray(b.section)) {
      const [title, lead, bl] = b.section;
      parts.push(`<h3 class="sub serif reveal">${esc(title)}</h3><p class="lead reveal">${esc(lead)}</p>
        <ul class="bullets reveal">${bl.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`);
      continue;
    }

    // plain typographic blocks
    if (isH(b, "H2")) { heading = b.text; parts.push(`<h3 class="sub serif reveal">${esc(b.text)}</h3>`); continue; }
    if (isH(b, "H3", "H5")) { parts.push(`<p class="lead reveal">${esc(b.text)}</p>`); continue; }
    if (isH(b, "H4")) { parts.push(`<h3 class="sub serif reveal" style="font-size:1.1rem">${esc(b.text)}</h3>`); continue; }
    if (b.tag === "text" || typeof b.text === "string") { parts.push(`<p class="text reveal">${esc(b.text)}</p>`); continue; }
  }
  return parts.join("\n");
}

function buildStudy(study, idx) {
  const base = "../";
  const blocks = C(study.file);
  const { title, sub, meta, heroImg, body } = splitHero(blocks);
  const { html, toc } = renderBlocks(body, base);

  const order = C("home.json").featured.projects;
  const pos = order.findIndex((p) => p.slug === study.slug);
  const chNum = String(pos + 1).padStart(2, "0");
  const book = BOOKS[study.slug];
  const nextP = order[(pos + 1) % order.length];
  const prevP = order[(pos - 1 + order.length) % order.length];
  const nb = BOOKS[nextP.slug];
  const nextCh = String(((pos + 1) % order.length) + 1).padStart(2, "0");
  const nextYear = (nextP.meta.split("·").pop() || "").trim();

  const tocHtml = toc
    .map((t) => `<li><a href="#${t.id}">${esc(t.title)}</a></li>`)
    .join("");

  const pageBody = `
<article class="chapter" style="--bb:${book.bg};--bi:${book.ink};--ba:${book.acc}">
  <header class="ch-open">
    <div class="ch-band" aria-hidden="true"></div>
    ${heroImg ? `<figure class="ch-plate hero-gate"><img src="${IMG(heroImg, base)}" alt=""></figure>` : ""}
    <div class="ch-title">
      <p class="ch-num hero-gate"><span>Chapter ${chNum}</span><span>${esc(book.short)}</span></p>
      <h1 class="serif split hero-title">${splitWords(title)}</h1>
      ${sub ? `<p class="sub hero-gate">${esc(sub)}</p>` : ""}
      ${meta ? `<p class="meta hero-gate">${esc(meta)}</p>` : ""}
    </div>
  </header>

  <div class="cs-body">
    <aside class="toc"><nav aria-label="Sections"><ol>${tocHtml}</ol></nav></aside>
    <div class="cs-content">
      ${html}
    </div>
  </div>

  <footer class="ch-end">
    <p class="ch-fin" aria-hidden="true">&#10086;</p>
    <a class="ch-next" href="${nextP.slug}.html" style="--h:300px;--w:210px;--bb:${nb.bg};--bi:${nb.ink};--ba:${nb.acc}">
      <span class="ch-next-book"><span class="cover">${coverHtml(nb, nextCh, nextYear, IMG(nextP.img, base))}</span></span>
      <span class="ch-next-txt">
        <span class="dir">Next chapter</span>
        <span class="serif t">${esc(nextP.title)}</span>
        <span class="o">${esc(nb.outcome)}</span>
      </span>
    </a>
    <p class="ch-links"><a href="${prevP.slug}.html">&larr; Previous chapter</a><a href="${base}index.html#work">Back to the shelf</a></p>
  </footer>
</article>`;

  return shell({
    title: `${title} — Chun-Chuan Lin`,
    desc: sub || title,
    body: pageBody,
    base,
    extraClass: "cs-page",
    progress: true,
    running: `Chapter ${chNum} &middot; ${esc(book.short)}`,
    gated: !!study.locked,
    ogImage: study.img,
  });
}

/* =================================================================
   WRITE
================================================================= */
fs.writeFileSync(path.join(ROOT, "index.html"), buildHome());
console.log("✓ index.html");

const workDir = path.join(ROOT, "work");
fs.mkdirSync(workDir, { recursive: true });
STUDIES.forEach((s, i) => {
  fs.writeFileSync(path.join(workDir, `${s.slug}.html`), buildStudy(s, i));
  console.log("✓ work/" + s.slug + ".html");
});
console.log("done.");
