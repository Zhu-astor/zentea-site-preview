/*
 * 首頁「認識茶」：用 js/teas.js 的資料產生六張茶卡，點卡片打開深入介紹（產地、製程、香氣、口感、故事、多知道一點）。
 */
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("[data-kt-grid]");
  const dialog = document.querySelector("[data-kt-dialog]");
  const TEAS = window.ZENTEA_TEAS;
  if (!grid || !dialog || !TEAS) return;
  const $ = (sel) => dialog.querySelector(sel);

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

  function open(key) {
    const tea = TEAS[key];
    $("[data-kt-media]").replaceChildren(media(tea));
    $("[data-kt-mood]").textContent = tea.mood;
    $("[data-kt-name]").textContent = tea.name;
    $("[data-kt-facts]").replaceChildren(
      ...[["產地", tea.origin], ["製程", tea.process], ["香氣", tea.aroma], ["口感", tea.taste]].map(([k, v]) => {
        const row = el("div");
        row.append(el("dt", "", k), el("dd", "", v));
        return row;
      })
    );
    $("[data-kt-story]").replaceChildren(...tea.story.map((t) => el("p", "", t)));
    $("[data-kt-more]").textContent = tea.more;
    const link = $("[data-kt-link]");
    link.hidden = !tea.shop;
    if (tea.shop) link.href = `product.html?slug=${encodeURIComponent(tea.shop)}`;
    $("[data-kt-soon]").hidden = !!tea.shop;
    dialog.showModal();
    dialog.scrollTop = 0;
  }

  grid.replaceChildren(
    ...Object.entries(TEAS).map(([key, tea], i) => {
      const card = el("button", "kt-card");
      card.type = "button";
      card.style.transitionDelay = `${(i % 3) * 0.06}s`;
      card.setAttribute("data-reveal", "");
      const m = el("div", "kt-card__media");
      m.append(media(tea));
      if (!tea.shop) m.append(el("span", "kt-card__badge", "即將上架"));
      const notes = el("dl", "kt-card__notes");
      [["香氣", tea.aroma], ["口感", tea.taste]].forEach(([k, v]) => {
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
        el("span", "kt-card__more", "深入認識 →")
      );
      card.addEventListener("click", () => open(key));
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

  $("[data-kt-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => e.target === dialog && dialog.close());
});
