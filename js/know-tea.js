/*
 * 首頁「認識茶」：用 js/teas.js 的資料產生六張茶卡，點卡片直接進該款茶的商品詳細頁（product.html?slug=…）。
 */
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("[data-kt-grid]");
  const TEAS = window.ZENTEA_TEAS;
  const ZT = window.ZT;
  if (!grid || !TEAS) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // 有商品照就放照片，沒有的用茶名字樣代替
  function media(tea) {
    if (tea.img) {
      const img = el("img");
      img.src = tea.img;
      img.alt = tea.name;
      img.loading = "lazy";
      return img;
    }
    return el("span", "tq-glyph", tea.glyph);
  }

  grid.replaceChildren(
    ...Object.values(TEAS).map((zhTea, i) => {
      const tea = ZT.en && zhTea.en ? { ...zhTea, ...zhTea.en } : zhTea; // 英文頁用 teas.js 裡的 en 欄位
      const card = el("a", "kt-card");
      card.href = ZT.page(`product.html?slug=${encodeURIComponent(tea.shop)}`);
      card.style.transitionDelay = `${(i % 3) * 0.06}s`;
      card.setAttribute("data-reveal", "");
      const m = el("div", "kt-card__media");
      m.append(media(tea));
      if (tea.soon) m.append(el("span", "kt-card__badge", ZT.t("即將上架")));
      const notes = el("dl", "kt-card__notes");
      [[ZT.t("香氣"), tea.aroma], [ZT.t("口感"), tea.taste]].forEach(([k, v]) => {
        const row = el("div");
        row.append(el("dt", "", k), el("dd", "", v));
        notes.append(row);
      });
      card.append(
        m,
        el("p", "kt-card__eyebrow", tea.process),
        el("h3", "kt-card__name", tea.name),
        el("p", "kt-card__summary", tea.summary),
        notes,
        el("span", "kt-card__more", ZT.t("深入認識 →"))
      );
      return card;
    })
  );

  // 新產生的卡片也要跟著捲動淡入
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  grid.querySelectorAll("[data-reveal]").forEach((c) => io.observe(c));
});
