/*
 * 茶知識「全部文章」：分類、月份、關鍵字篩選，最新／人氣／最多點閱排序，分頁。
 * 篩選條件同步到網址（?category=&month=&q=&sort=&page=），可以直接分享或從選單連過來。
 * 資料來自後端 /api/articles/（只有已發布的文章）。
 */
document.addEventListener("DOMContentLoaded", () => {
  const api = window.ZenteaCart ? window.ZenteaCart.apiBase : "";
  const $ = (sel) => document.querySelector(sel);
  const grid = $("[data-grid]");
  const PAGE_SIZE = 12;
  const NEW_DAYS = 7;
  const SORTS = ["latest", "popular", "views"];

  const params = new URLSearchParams(location.search);
  const state = {
    category: params.get("category") || "",
    month: params.get("month") || "",
    q: params.get("q") || "",
    sort: SORTS.includes(params.get("sort")) ? params.get("sort") : "latest",
    page: Math.max(parseInt(params.get("page"), 10) || 1, 1),
  };
  let facets = null;
  let requestId = 0;

  const EYE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
    '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const formatDate = (iso) => (iso ? iso.slice(0, 10).replaceAll("-", ".") : "");
  const formatMonth = (v) => `${v.slice(0, 4)} 年 ${parseInt(v.slice(5), 10)} 月`;
  const isNew = (iso) => iso && Date.now() - new Date(iso).getTime() < NEW_DAYS * 86400000;

  function card(a, rank, wide) {
    const link = el("a", "ax-card" + (wide ? " ax-card--wide" : ""));
    link.href = `article.html?slug=${encodeURIComponent(a.slug)}`;

    const media = el("div", "ax-card__media");
    const src = (wide ? a.cover : a.cover_thumb) || a.cover;
    if (src) {
      const img = el("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      media.append(img);
    }
    if (a.category) media.append(el("span", "ax-card__tag", a.category));
    const badges = el("div", "ax-card__badges");
    if (isNew(a.published_at)) badges.append(el("span", "ax-badge ax-badge--new", "NEW"));
    if (a.has_video) {
      const v = el("span", "ax-badge");
      v.innerHTML = PLAY;
      v.append("影片");
      badges.append(v);
    }
    if (badges.childElementCount) media.append(badges);
    if (rank) media.append(el("span", "ax-card__rank", String(rank).padStart(2, "0")));

    const body = el("div", "ax-card__body");
    const meta = el("p", "ax-card__meta");
    meta.append(el("span", "", formatDate(a.published_at)));
    const views = el("span", "ax-views");
    views.innerHTML = EYE;
    views.append(`閱讀 ${a.view_count.toLocaleString()}`);
    meta.append(views);
    body.append(meta, el("h2", "ax-card__title", a.title));
    if (a.summary) body.append(el("p", "ax-card__summary", a.summary));
    body.append(el("span", "ax-card__more", "閱讀全文 →"));

    link.append(media, body);
    return link;
  }

  function skeleton(n) {
    return Array.from({ length: n }, () => {
      const c = el("div", "ax-card ax-skeleton");
      const body = el("div", "ax-card__body");
      body.append(el("div", "ax-line ax-line--short"), el("div", "ax-line ax-line--title"), el("div", "ax-line"), el("div", "ax-line"));
      c.append(el("div", "ax-card__media"), body);
      return c;
    });
  }

  // ---------- 左側篩選欄 ----------
  function filterButton(label, count, active, onClick) {
    const li = el("li");
    const b = el("button", active ? "is-active" : "");
    b.type = "button";
    b.append(el("span", "", label), el("span", "ax-list__count", String(count)));
    b.setAttribute("aria-pressed", String(active));
    b.addEventListener("click", onClick);
    li.append(b);
    return li;
  }

  function renderFacets() {
    if (!facets) return;
    $("[data-categories]").replaceChildren(
      filterButton("全部分類", facets.total, !state.category, () => update({ category: "" })),
      ...facets.categories.map((c) =>
        filterButton(c.name, c.count, state.category === c.name, () => update({ category: c.name }))
      )
    );
    $("[data-months]").replaceChildren(
      filterButton("全部月份", facets.total, !state.month, () => update({ month: "" })),
      ...facets.months.map((m) =>
        filterButton(formatMonth(m.value), m.count, state.month === m.value, () => update({ month: m.value }))
      )
    );
  }

  function renderChips() {
    const chips = [];
    const chip = (label, reset) => {
      const b = el("button", "ax-chip");
      b.type = "button";
      b.append(label, el("span", "", "×"));
      b.setAttribute("aria-label", `移除篩選：${label}`);
      b.addEventListener("click", () => update(reset));
      chips.push(b);
    };
    if (state.category) chip(state.category, { category: "" });
    if (state.month) chip(formatMonth(state.month), { month: "" });
    if (state.q) chip(`「${state.q}」`, { q: "" });
    $("[data-chips]").replaceChildren(...chips);
  }

  function renderPager(page, pages) {
    const pager = $("[data-pager]");
    if (pages <= 1) {
      pager.replaceChildren();
      return;
    }
    const btn = (label, target, opts = {}) => {
      const b = el("button", opts.active ? "is-active" : "", label);
      b.type = "button";
      b.disabled = !!opts.disabled;
      if (opts.aria) b.setAttribute("aria-label", opts.aria);
      if (opts.active) b.setAttribute("aria-current", "page");
      b.addEventListener("click", () => update({ page: target }, true));
      return b;
    };
    const items = [btn("‹", page - 1, { disabled: page === 1, aria: "上一頁" })];
    // 頁數多時只顯示頭尾與目前頁附近
    let last = 0;
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - page) <= 1) {
        if (i - last > 1) items.push(el("span", "ax-pager__gap", "…"));
        items.push(btn(String(i), i, { active: i === page }));
        last = i;
      }
    }
    items.push(btn("›", page + 1, { disabled: page === pages, aria: "下一頁" }));
    pager.replaceChildren(...items);
  }

  function syncUrl() {
    const qs = new URLSearchParams();
    if (state.category) qs.set("category", state.category);
    if (state.month) qs.set("month", state.month);
    if (state.q) qs.set("q", state.q);
    if (state.sort !== "latest") qs.set("sort", state.sort);
    if (state.page > 1) qs.set("page", state.page);
    const query = qs.toString();
    history.replaceState(null, "", query ? `?${query}` : location.pathname);
  }

  function update(changes, keepPage) {
    Object.assign(state, changes);
    if (!keepPage) state.page = 1;
    load(true);
  }

  async function load(scroll) {
    const id = ++requestId;
    syncUrl();
    renderFacets();
    renderChips();
    document.querySelectorAll("[data-sort]").forEach((b) => {
      const active = b.dataset.sort === state.sort;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
    });
    $("[data-search-input]").value = state.q;
    $("[data-empty]").hidden = true;
    $("[data-error]").hidden = true;
    grid.replaceChildren(...skeleton(6));
    if (scroll) {
      const top = document.querySelector(".ax-wrap").getBoundingClientRect().top + window.scrollY - 16;
      if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
    }

    const qs = new URLSearchParams({ section: "knowledge", sort: state.sort, page: state.page, page_size: PAGE_SIZE });
    ["category", "month", "q"].forEach((k) => state[k] && qs.set(k, state[k]));
    try {
      const res = await fetch(`${api}/api/articles/?${qs}`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      if (id !== requestId) return; // 使用者已經又換了條件
      facets = data.facets;
      renderFacets();

      // 頁碼超出範圍（例如文章被下架）時回到最後一頁
      if (!data.articles.length && data.total && state.page > data.pages) {
        update({ page: data.pages }, true);
        return;
      }
      $("[data-count]").innerHTML = "";
      $("[data-count]").append("共", el("strong", "", String(data.total)), "篇文章");

      const ranked = state.sort !== "latest";
      const showWide = !ranked && state.page === 1 && !state.category && !state.month && !state.q;
      const offset = (state.page - 1) * PAGE_SIZE;
      grid.replaceChildren(
        ...data.articles.map((a, i) => card(a, ranked ? offset + i + 1 : 0, showWide && i === 0))
      );
      $("[data-empty]").hidden = data.articles.length > 0;
      renderPager(data.page, data.pages);
    } catch (e) {
      if (id !== requestId) return;
      grid.replaceChildren();
      $("[data-error]").hidden = false;
    }
  }

  document.querySelectorAll("[data-sort]").forEach((b) =>
    b.addEventListener("click", () => update({ sort: b.dataset.sort }))
  );
  $("[data-search]").addEventListener("submit", (e) => {
    e.preventDefault();
    update({ q: $("[data-search-input]").value.trim() });
  });
  // 清空搜尋框（按 × 或刪光）時直接回到沒有關鍵字的結果
  $("[data-search-input]").addEventListener("search", (e) => {
    if (!e.target.value && state.q) update({ q: "" });
  });
  $("[data-clear]").addEventListener("click", () => update({ category: "", month: "", q: "" }));

  load(false);
});
