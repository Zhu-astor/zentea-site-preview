/*
 * 預覽站專用（GitHub Pages，沒有後端）：攔截 /api/articles/、商品、購物車、運費的請求，改讀 demo/ 裡匯出的快照，
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
    const section = params.get("section");
    const all = (await list()).filter((a) => !section || (a.section || "knowledge") === section);
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

  // ---------- 商品、購物車、結帳（預覽站：讀 demo/ 的商品快照，不能真的下單） ----------
  let productsPromise = null;
  const products = () => (productsPromise ||= realFetch("demo/products.json").then((r) => r.json()));

  async function quote(init) {
    const body = JSON.parse((init && init.body) || "{}");
    const variants = {};
    (await products()).products.forEach((p) =>
      p.variants.forEach((v) => (variants[v.sku] = { ...v, product: p }))
    );
    const items = (body.items || []).map(({ sku, quantity }) => {
      const v = variants[sku];
      if (!v) return { sku, quantity, product_name: "", variant_name: "", image: "", unit_price: 0, line_total: 0, problems: ["商品已下架"] };
      return {
        sku, quantity, product_name: v.product.name, variant_name: v.name, image: v.product.image,
        unit_price: v.price, line_total: v.price * quantity, problems: v.in_stock ? [] : ["已售完"],
      };
    });
    const ok = items.filter((i) => !i.problems.length);
    return json({
      items,
      subtotal: ok.reduce((n, i) => n + i.line_total, 0),
      item_count: ok.reduce((n, i) => n + i.quantity, 0),
      has_problems: items.length !== ok.length,
    });
  }

  async function shopApi(path, init) {
    if (path === "/api/products/") return json(await products());
    const detail = path.match(/^\/api\/products\/([^/]+)\/$/);
    if (detail) return realFetch(`demo/products/${detail[1]}.json`);
    if (path === "/api/cart/quote/") return quote(init);
    if (path === "/api/shipping/options/") return realFetch("demo/shipping.json");
    if (path === "/api/csrf/") return json({});
    if (path === "/api/orders/") return json({ error: "這是預覽站，無法真的下單付款；正式網站才會轉到綠界付款。" }, 503);
    return null;
  }

  // 選擇門市要連到綠界電子地圖，預覽站做不到，改成提示
  document.addEventListener("click", (e) => {
    if (e.target.closest && e.target.closest("[data-store-pick]")) {
      e.preventDefault();
      alert("這是預覽站，無法連到綠界選擇門市；正式網站會開啟超商電子地圖。");
    }
  }, true);

  window.fetch = async function (input, init) {
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    const shop = await shopApi(url.pathname.replace(/^.*(?=\/api\/)/, ""), init);
    if (shop) return shop;
    const m = url.pathname.match(/\/api\/articles\/(?:([^/]+)\/(view\/)?)?$/);
    if (!m) return realFetch(input, init);
    if (m[2]) return json({ counted: false });
    if (!m[1]) return articleList(url.searchParams);
    const slug = decodeURIComponent(m[1]);
    const card = (await list()).find((a) => a.slug === slug);
    return card ? realFetch(card.detail) : json({ error: "not found" }, 404);
  };
})();
