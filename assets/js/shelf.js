(() => {
  const dataEl = document.getElementById("books-data");
  const dlg = document.getElementById("reader");
  if (!dataEl || !dlg || typeof dlg.showModal !== "function") return;

  const books = JSON.parse(dataEl.textContent);
  const ob = document.getElementById("ob");
  const front = document.getElementById("ob-front");
  const back = document.getElementById("ob-back");
  const page = document.getElementById("ob-page");
  const shelfBtns = [...document.querySelectorAll(".book")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const LOCK = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="7" width="10" height="7.5" rx="1.6" fill="currentColor"/></svg>';

  let cur = 0;
  let opener = null;
  let timer = 0;

  function fill(i) {
    const b = books[i];
    ob.style.setProperty("--bb", b.bg);
    ob.style.setProperty("--bi", b.ink);
    ob.style.setProperty("--ba", b.acc);
    front.innerHTML = b.cover;
    back.innerHTML = `<p class="lp-k">Chapter</p><p class="lp-n">${b.ch}</p>
      <p class="lp-t">${esc(b.short)}</p><p class="lp-o">${esc(b.outcome)}</p><p class="lp-sig">Chun-Chuan Lin</p>`;
    page.innerHTML = `<img class="pg-img" src="${esc(b.img)}" alt="">
      <div class="pg-body">
        <p class="pg-ch">Chapter ${b.ch} &middot; ${esc(b.year)}</p>
        <h2>${esc(b.title)}</h2>
        <p class="pg-desc">${esc(b.desc)}</p>
        <div class="pg-foot">
          <a class="pg-read" href="${esc(b.href)}">Read chapter <span aria-hidden="true">&rarr;</span></a>
          ${b.locked ? `<span class="pg-lock">${LOCK} Passcode</span>` : ""}
        </div>
      </div>
      <span class="pg-folio">${b.ch}</span>`;
    dlg.setAttribute("aria-label", `Chapter ${b.ch}: ${b.title}`);
  }

  function open(i, btn) {
    cur = i;
    opener = btn || null;
    fill(i);
    dlg.classList.remove("is-in", "is-open");
    if (!dlg.open) dlg.showModal();
    clearTimeout(timer);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      dlg.classList.add("is-in");
      timer = setTimeout(() => dlg.classList.add("is-open"), reduce ? 0 : 520);
    }));
    page.querySelector(".pg-read")?.focus({ preventScroll: true });
  }

  function turn(step) {
    clearTimeout(timer);
    dlg.classList.remove("is-open");
    timer = setTimeout(() => {
      cur = (cur + step + books.length) % books.length;
      fill(cur);
      timer = setTimeout(() => dlg.classList.add("is-open"), reduce ? 0 : 60);
    }, reduce ? 0 : 900);
  }

  shelfBtns.forEach((btn) => btn.addEventListener("click", () => open(+btn.dataset.i, btn)));
  dlg.querySelector(".rd-close").addEventListener("click", () => dlg.close());
  dlg.querySelector(".rd-prev").addEventListener("click", () => turn(-1));
  dlg.querySelector(".rd-next").addEventListener("click", () => turn(1));
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") turn(1);
    if (e.key === "ArrowLeft") turn(-1);
  });
  dlg.addEventListener("close", () => {
    clearTimeout(timer);
    dlg.classList.remove("is-in", "is-open");
    opener?.focus({ preventScroll: true });
  });
})();
