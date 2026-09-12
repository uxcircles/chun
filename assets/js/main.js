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

/* ---------- custom cursor (mouse only, replaces the native pointer) ---------- */
if (!reduce && matchMedia("(pointer:fine)").matches) {
  const dot = document.querySelector(".cursor-dot");
  if (dot) {
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, shown = false;
    addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { x = tx; y = ty; shown = true; document.documentElement.classList.add("has-cursor"); dot.classList.add("visible"); }
    }, { passive: true });
    const tick = () => {
      x += (tx - x) * 0.22; y += (ty - y) * 0.22;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    document.addEventListener("pointerover", (e) => {
      dot.classList.toggle("hover", !!e.target.closest("a, button, .project, .article, input"));
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
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  });
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
    { rootMargin: "120px 0px 80px 0px", threshold: 0 }
  );
  revealEls.forEach((el) => io.observe(el));
  setTimeout(() => revealEls.forEach((el) => el.classList.add("in")), 3000);
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

