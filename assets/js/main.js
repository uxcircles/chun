const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasIO = "IntersectionObserver" in window;

/* ---------- passcode gate ---------- */
const GATE_KEY = "cc_portfolio_unlocked";
const GATE_PASS = "Chun";
const gateForm = document.getElementById("gate-form");
if (gateForm) {
  const input = document.getElementById("gate-input");
  const err = document.getElementById("gate-err");
  gateForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.trim().toLowerCase() === GATE_PASS.toLowerCase()) {
      try { localStorage.setItem(GATE_KEY, "1"); } catch {}
      document.body.classList.remove("locked");
    } else {
      err.textContent = "That's not quite right — try again.";
      input.value = "";
      input.focus();
    }
  });
}

/* ---------- cursor badge: close the text ring to the circle ----------
   The build only ever emits fewer characters than the ring can hold, because
   text running past the end of a closed path can be painted back over the
   start of the ring. Measuring here lets the gap be taken up with plain
   letter-spacing instead of textLength/lengthAdjust, which a textPath does
   not honour reliably. */
const fitBadgeText = () => {
  for (const badge of document.querySelectorAll(".cursor-badge")) {
    const textEl = badge.querySelector("text");
    const path = badge.querySelector("path");
    if (!textEl || !path) continue;
    const ring = path.getTotalLength();
    const chars = textEl.textContent.length;
    if (!chars) continue;
    textEl.style.letterSpacing = "0px";
    textEl.style.fontSize = "";
    // never let the label run past the end of the ring
    let size = parseFloat(getComputedStyle(textEl).fontSize);
    while (textEl.getComputedTextLength() > ring && size > 8) {
      size -= 0.5;
      textEl.style.fontSize = size + "px";
    }
    // close any small remainder with tracking, kept tight — the ring should
    // read as solid text, not widely spaced letters
    const room = ring * 0.98 - textEl.getComputedTextLength();
    if (room > 0) textEl.style.letterSpacing = Math.min(room / chars, 0.9) + "px";
  }
};
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitBadgeText);
else fitBadgeText();

/* ---------- custom cursor (mouse only, replaces the native pointer) ---------- */
if (!reduce && matchMedia("(pointer:fine)").matches) {
  const dot = document.querySelector(".cursor-dot");
  const badges = new Map([...document.querySelectorAll(".cursor-badge")].map((b) => [b.id, b]));
  if (dot) {
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, shown = false, activeBadge = null;
    addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { x = tx; y = ty; shown = true; document.documentElement.classList.add("has-cursor"); dot.classList.add("visible"); }
    }, { passive: true });
    const tick = () => {
      x += (tx - x) * 0.45; y += (ty - y) * 0.45;
      const t = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      dot.style.transform = t;
      if (activeBadge) activeBadge.style.transform = t;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    document.addEventListener("pointerover", (e) => {
      const trigger = e.target.closest("[data-cursor-badge]");
      const badge = trigger && badges.get(trigger.dataset.cursorBadge);
      if (badge !== activeBadge) {
        activeBadge?.classList.remove("show");
        activeBadge = badge || null;
        activeBadge?.classList.add("show");
      }
      dot.classList.toggle("hover", !!e.target.closest("a, button, .article, input") && !badge);
      dot.style.opacity = badge ? "0" : "";
    });
  }
}

/* ---------- nav state + mobile menu ---------- */
const nav = document.getElementById("nav");
const onNavScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 8);
onNavScroll();
addEventListener("scroll", onNavScroll, { passive: true });

const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
const backdrop = document.querySelector(".nav-backdrop");
if (toggle && links) {
  const setOpen = (open) => {
    links.classList.toggle("open", open);
    backdrop?.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setOpen(!links.classList.contains("open")));
  links.addEventListener("click", (e) => { if (e.target.tagName === "A") setOpen(false); });
  backdrop?.addEventListener("click", () => setOpen(false));
}

/* ---------- reveal + wipe on scroll ---------- */
const revealEls = [...document.querySelectorAll(".reveal, .split:not(.hero-title)")];
if (reduce || !hasIO) {
  revealEls.forEach((el) => el.classList.add("in"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }
    },
    // trigger only once an element is meaningfully inside the viewport (not
    // 80-120px early) so the blur/rise transition is actually visible as
    // the user scrolls, instead of having already finished off-screen
    { rootMargin: "0px 0px -10% 0px", threshold: 0 }
  );
  revealEls.forEach((el) => io.observe(el));
  // one-time safety net for content already on screen at load (some browsers
  // don't fire IO for elements intersecting before observe() is called) —
  // deliberately does NOT touch anything below the fold, so scroll reveals
  // for later sections are never short-circuited
  setTimeout(() => {
    revealEls.forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in");
    });
  }, 1200);
}

/* ---------- hero headline: resolve after fonts are ready ---------- */
const heroTitle = document.querySelector(".hero-title");
if (heroTitle) {
  const go = () => requestAnimationFrame(() => heroTitle.classList.add("in"));
  if (reduce) heroTitle.classList.add("in");
  else if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(go);
    setTimeout(go, 1200); // failsafe
  } else go();
}

/* ---------- count-up stats ---------- */
const stats = [...document.querySelectorAll(".stat b[data-count]")];
if (stats.length && !reduce && hasIO) {
  const parse = (raw) => {
    const m = String(raw).match(/^(\D*)([\d.,]+)(.*)$/);
    if (!m) return null;
    return { pre: m[1], num: parseFloat(m[2].replace(/,/g, "")), post: m[3], decimals: (m[2].split(".")[1] || "").length };
  };
  const run = (el) => {
    const p = parse(el.dataset.count);
    if (!p || p.num < 20) return; // tiny numbers tick too fast to read — leave them
    const dur = 1100, t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      const val = (p.num * eased).toFixed(p.decimals);
      el.textContent = p.pre + (p.decimals ? val : Math.round(p.num * eased)).toLocaleString() + p.post;
      if (k < 1) requestAnimationFrame(tick);
      else el.textContent = el.dataset.count;
    };
    requestAnimationFrame(tick);
  };
  const sio = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { run(e.target); sio.unobserve(e.target); } }),
    { threshold: 0.6 }
  );
  stats.forEach((s) => sio.observe(s));
}

/* ---------- video play only while visible ---------- */
const vids = document.querySelectorAll("video");
if (vids.length && hasIO) {
  const vio = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) e.target.play?.().catch(() => {});
      else e.target.pause?.();
    }),
    { threshold: 0.25 }
  );
  vids.forEach((v) => vio.observe(v));
}

/* ---------- case-study TOC active state ---------- */
const tocLinks = [...document.querySelectorAll(".toc a")];
if (tocLinks.length) {
  const map = new Map();
  tocLinks.forEach((a) => {
    const sec = document.querySelector(a.getAttribute("href"));
    if (sec) map.set(sec, a);
  });
  const spy = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        tocLinks.forEach((l) => l.classList.remove("active"));
        map.get(e.target)?.classList.add("active");
      }
    }),
    { rootMargin: "-20% 0px -70% 0px" }
  );
  map.forEach((_, sec) => spy.observe(sec));
}

/* ---------- scroll progress bar ---------- */
const bar = document.querySelector(".scroll-progress span");
if (bar) {
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  };
  update();
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
}

/* ---------- hero cursor glow ---------- */
const hero = document.querySelector(".hero");
if (hero && !reduce && matchMedia("(pointer:fine)").matches) {
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
    hero.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
  });
}

