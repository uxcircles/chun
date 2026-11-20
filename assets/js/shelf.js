(() => {
  const dataEl = document.getElementById("books-data");
  const dlg = document.getElementById("reader");
  if (!dataEl || !dlg || typeof dlg.showModal !== "function") return;

  const books = JSON.parse(dataEl.textContent);
  const ob = document.getElementById("ob");
  const wrap = document.getElementById("ob-wrap");
  const count = document.getElementById("rd-count");
  const prevBtn = dlg.querySelector(".rd-prev");
  const nextBtn = dlg.querySelector(".rd-next");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = matchMedia("(max-width: 720px)");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const LOCK = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="7" width="10" height="7.5" rx="1.6" fill="currentColor"/></svg>';

  let book = null;   // current book data
  let leaves = [];   // leaf elements
  let n = 0;         // how many leaves are turned
  let opener = null;
  let timer = 0;

  const readLink = (b, label) => `<a class="pg-read" href="${esc(b.href)}">${label} <span aria-hidden="true">&rarr;</span></a>`;
  const titlePage = (b) => `<div class="pp pp-title"><p class="lp-k">Chapter</p><p class="lp-n">${b.ch}</p>
    <p class="lp-t">${esc(b.short)}</p><p class="lp-o">${esc(b.outcome)}</p><p class="lp-sig">Chun-Chuan Lin</p></div>`;
  const overview = (b) => `<div class="pp pp-over"><img class="pg-img" src="${esc(b.img)}" alt="">
    <div class="pg-body"><p class="pg-ch">Chapter ${b.ch} &middot; ${esc(b.year)}</p><h2>${esc(b.title)}</h2>
    <p class="pg-desc">${esc(b.desc)}</p>
    <div class="pg-foot">${readLink(b, "Read chapter")}${b.locked ? `<span class="pg-lock">${LOCK} Passcode</span>` : b.pages.length ? `<span class="pg-hint">or turn the page</span>` : ""}</div></div></div>`;
  const plate = (b, pg, i) => `<div class="pp pp-plate">${pg.img ? `<img src="${esc(pg.img)}" alt="" loading="lazy">` : `<span class="pp-big">${String(i + 1).padStart(2, "0")}</span>`}
    <span class="pp-fig">Fig. ${i + 1} &middot; ${esc(pg.t)}</span></div>`;
  const words = (b, pg, i, last) => `<div class="pp pp-text"><p class="pg-ch">${String(i + 1).padStart(2, "0")} / ${String(b.pages.length).padStart(2, "0")}</p>
    <h3>${esc(pg.t)}</h3><p class="pp-p">${esc(pg.text)}</p>
    ${pg.points.length ? `<ul>${pg.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
    <div class="pg-foot">${last ? readLink(b, "Read the full chapter") : `<a class="pp-more" href="${esc(b.href)}">Full chapter &rarr;</a>`}</div></div>`;
  const merged = (b, pg, i, last) => `<div class="pp pp-merged">${pg.img ? `<img class="mg-img" src="${esc(pg.img)}" alt="" loading="lazy">` : ""}${words(b, pg, i, last)}</div>`;
  const blank = `<div class="pp pp-blank"></div>`;

  function build(b) {
    const m = b.pages.length;
    const sides = []; // [front, back] per leaf
    if (narrow.matches) {
      sides.push([`<div class="cover">${b.cover}</div>`, blank]);
      sides.push([overview(b), blank]);
      b.pages.forEach((pg, i) => sides.push([merged(b, pg, i, i === m - 1), blank]));
    } else {
      sides.push([`<div class="cover">${b.cover}</div>`, titlePage(b)]);
      sides.push([overview(b), m ? plate(b, b.pages[0], 0) : blank]);
      b.pages.forEach((pg, i) => sides.push([words(b, pg, i, i === m - 1), i < m - 1 ? plate(b, b.pages[i + 1], i + 1) : blank]));
    }
    ob.innerHTML = sides
      .map(([f, k], i) => `<div class="leaf" data-i="${i}"><div class="lf front">${f}<span class="folio">${i ? i * 2 - 1 : ""}</span></div><div class="lf back">${k}</div></div>`)
      .join("");
    leaves = [...ob.querySelectorAll(".leaf")];
    ob.style.setProperty("--bb", b.bg);
    ob.style.setProperty("--bi", b.ink);
    ob.style.setProperty("--ba", b.acc);
  }

  const maxN = () => leaves.length - 1;

  function layout(moving) {
    const total = leaves.length;
    leaves.forEach((el, i) => {
      const flipped = i < n;
      el.classList.toggle("flipped", flipped);
      el.style.zIndex = i === moving ? total + 5 : flipped ? i + 1 : total - i;
      el.inert = narrow.matches ? i !== n : !(i === n || i === n - 1);
    });
    dlg.classList.toggle("is-open", n > 0);
    prevBtn.disabled = n === 0;
    nextBtn.disabled = n >= maxN();
    count.textContent = n === 0 ? "Cover" : `${n} / ${maxN()}`;
    if (moving != null) {
      clearTimeout(timer);
      timer = setTimeout(() => layout(), reduce ? 0 : 950);
    }
  }

  function turn(step) {
    const to = Math.max(0, Math.min(maxN(), n + step));
    if (to === n) return;
    const moving = step > 0 ? n : n - 1;
    n = to;
    layout(moving);
  }

  let hiddenSrc = null;
  function open(i, btn) {
    book = books[i];
    opener = btn || null;
    build(book);
    n = 0;
    dlg.classList.remove("is-in", "is-open");
    layout();
    if (!dlg.open) dlg.showModal();
    dlg.setAttribute("aria-label", `Chapter ${book.ch}: ${book.title}`);
    dlg.classList.add("is-in");
    const src = btn && btn.querySelector(".cover");
    const tgt = leaves[0] && leaves[0].querySelector(".front");
    if (reduce || !src || !tgt || !wrap.animate) { turn(1); return; }
    ob.style.transition = "none";
    void ob.offsetWidth;
    ob.style.transition = "";
    // fly the book from its spot on the shelf to the middle of the screen, then open it
    const s = src.getBoundingClientRect(), t = tgt.getBoundingClientRect(), w = wrap.getBoundingClientRect();
    const k = s.width / t.width;
    const dx = s.left - w.left - k * (t.left - w.left);
    const dy = s.top - w.top - k * (t.top - w.top);
    src.style.visibility = "hidden";
    hiddenSrc = src;
    const fly = wrap.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(${k})` }, { transform: "none" }],
      { duration: 650, easing: "cubic-bezier(.3,.7,.2,1)" }
    );
    fly.onfinish = () => { if (dlg.open) setTimeout(() => turn(1), 120); };
  }


  document.querySelectorAll(".book").forEach((btn) => btn.addEventListener("click", () => open(+btn.dataset.i, btn)));
  dlg.querySelector(".rd-close").addEventListener("click", () => dlg.close());
  prevBtn.addEventListener("click", () => turn(-1));
  nextBtn.addEventListener("click", () => turn(1));
  ob.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const side = e.target.closest(".lf");
    if (!side) return;
    turn(side.classList.contains("back") ? -1 : 1);
  });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") turn(1);
    if (e.key === "ArrowLeft") turn(-1);
  });
  dlg.addEventListener("close", () => {
    clearTimeout(timer);
    if (hiddenSrc) { hiddenSrc.style.visibility = ""; hiddenSrc = null; }
    wrap.getAnimations && wrap.getAnimations().forEach((x) => x.cancel());
    dlg.classList.remove("is-in", "is-open");
    ob.innerHTML = "";
    opener?.focus({ preventScroll: true });
  });
})();
