/*
 * 蟬茶誌：讀後台「欄目：蟬茶誌」的已發布文章，排成「左邊大卡＋右邊兩張分割卡」，每三篇一列，下一列左右對調。
 * 還沒有蟬茶誌文章（或後端連不上）時，先放品牌故事的示意卡。
 */
document.addEventListener("DOMContentLoaded", async () => {
  const api = window.ZenteaCart ? window.ZenteaCart.apiBase : "";
  const rows = document.querySelector("[data-diary]");

  // 品牌故事示意（還沒有正式文章時顯示）
  const PLACEHOLDER = [
    {
      title: "自然農法：\n讓茶樹與小綠葉蟬共生",
      summary: "不使用農藥、不施化肥，讓茶樹與小綠葉蟬共生，產出天然的蜜果香氣。",
      eyebrow: "品牌理念",
      label: "茶園筆記",
      img: "assets/img/landscape-2.webp",
      illustration: true,
    },
    { title: "玉山自然茶園", eyebrow: "產地故事", label: "茶園走訪", img: "assets/img/tea-figure-1.webp", illustration: "wide" },
    { title: "全國製茶武林大賽・榮獲茶王", eyebrow: "榮譽紀事", label: "職人", img: "assets/img/idea-chan-crave.png", illustration: "icon" },
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function card(item, big, index) {
    const node = el(item.href ? "a" : "div", `jd-card ${big ? "jd-card--big" : "jd-card--split"}`);
    if (item.href) node.href = item.href;
    // 插畫：wide＝橫幅人物（鋪滿寬度）、icon＝圓形圖示（約一半寬）
    const kind = item.illustration ? ` is-illustration is-${item.illustration === true ? "wide" : item.illustration}` : "";
    const media = el("div", "jd-card__media" + kind);
    if (item.img) {
      const img = el("img");
      img.src = item.img;
      img.alt = "";
      img.loading = "lazy";
      media.append(img);
    }
    media.append(el("span", "jd-card__label", big ? `${item.label}・${String(index + 1).padStart(2, "0")}` : item.label));
    const body = el("div", "jd-card__body");
    body.append(el("p", "jd-card__eyebrow", item.eyebrow), el("h2", "jd-card__title", item.title));
    if (big && item.summary) body.append(el("p", "jd-card__summary", item.summary));
    body.append(el("span", "jd-card__link", item.href ? "讀這篇 →" : "即將推出"));
    node.append(media, body);
    return node;
  }

  function render(items) {
    const groups = [];
    for (let i = 0; i < items.length; i += 3) groups.push(items.slice(i, i + 3));
    rows.replaceChildren(
      ...groups.map((group, g) => {
        const row = el("section", "jd-row" + (g % 2 ? " is-flipped" : ""));
        const [first, ...rest] = group;
        row.append(card(first, true, g * 3));
        if (rest.length) {
          const side = el("div", "jd-side");
          rest.forEach((item, i) => side.append(card(item, false, g * 3 + i + 1)));
          row.append(side);
        }
        return row;
      })
    );
  }

  try {
    const res = await fetch(`${api}/api/articles/?section=journal&page_size=24`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    if (!data.articles.length) throw new Error("empty");
    render(
      data.articles.map((a) => ({
        title: a.title,
        summary: a.summary,
        eyebrow: `${a.category || "蟬茶誌"}・${a.read_minutes} MIN READ`,
        label: a.category || "蟬茶誌",
        img: a.cover_thumb || a.cover,
        href: `article.html?slug=${encodeURIComponent(a.slug)}`,
      }))
    );
  } catch (e) {
    render(PLACEHOLDER);
  }
});
