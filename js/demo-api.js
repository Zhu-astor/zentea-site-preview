/*
 * 預覽站專用（GitHub Pages，沒有後端）：攔截 /api/articles/ 的請求，改讀 demo/ 裡匯出的文章快照，
 * 排序、篩選、分頁照後端的規則在瀏覽器裡算。正式網站不要載入這個檔案。
 */
(function () {
  const realFetch = window.fetch.bind(window);
  let listPromise = null;
  const list = () => (listPromise ||= realFetch("demo/articles.json").then((r) => r.json()));
  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
  const byDate = (a, b) => (b.published_at || "").localeCompare(a.published_at || "");

  async function articleList(params) {
    const all = await list();
    let items = all.slice();
    const category = params.get("category");
    const month = params.get("month");
    const q = (params.get("q") || "").trim();
    if (category) items = items.filter((a) => a.category === category);
    if (month) items = items.filter((a) => (a.published_at || "").slice(0, 7) === month);
    if (q) items = items.filter((a) => [a.title, a.summary, a.category].some((t) => (t || "").includes(q)));
    const sort = ["latest", "popular", "views"].includes(params.get("sort")) ? params.get("sort") : "latest";
    items.sort(sort === "latest" ? byDate : (a, b) => b.view_count - a.view_count || byDate(a, b));

    const size = Math.min(Math.max(parseInt(params.get("page_size"), 10) || 12, 1), 24);
    const page = Math.max(parseInt(params.get("page"), 10) || 1, 1);
    const count = (key) => {
      const m = new Map();
      all.forEach((a) => key(a) && m.set(key(a), (m.get(key(a)) || 0) + 1));
      return [...m];
    };
    const categories = count((a) => a.category).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
    const months = count((a) => (a.published_at || "").slice(0, 7)).sort((x, y) => y[0].localeCompare(x[0]));
    return json({
      articles: items.slice((page - 1) * size, page * size),
      sort,
      page,
      pages: Math.max(Math.ceil(items.length / size), 1),
      total: items.length,
      has_next: page * size < items.length,
      categories: categories.map(([name]) => name),
      facets: {
        total: all.length,
        categories: categories.map(([name, n]) => ({ name, count: n })),
        months: months.map(([value, n]) => ({ value, count: n })),
      },
    });
  }

  window.fetch = async function (input, init) {
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    const m = url.pathname.match(/\/api\/articles\/(?:([^/]+)\/(view\/)?)?$/);
    if (!m) return realFetch(input, init);
    if (m[2]) return json({ counted: false });
    if (!m[1]) return articleList(url.searchParams);
    const slug = decodeURIComponent(m[1]);
    const card = (await list()).find((a) => a.slug === slug);
    return card ? realFetch(card.detail) : json({ error: "not found" }, 404);
  };
})();
