/*
 * 全部茶品頁：用後端資料產生商品卡片，並處理搜尋、分類／風味篩選、排序、加入購物車。
 *
 * 後端連不上時，改用頁面上原本寫死的 4 張卡片當資料（價格照原本顯示），
 * 搜尋、風味篩選、排序照常可用；分類資訊只有後端有，這時勾分類會找不到結果。
 */
document.addEventListener("DOMContentLoaded", () => {
  const cart = window.ZenteaCart;
  const grid = document.querySelector("[data-product-grid]");
  const empty = document.querySelector("[data-product-empty]");
  const keywordInput = document.querySelector("[data-filter-keyword]");
  const sortSelect = document.querySelector("[data-filter-sort]");
  const flavorBoxes = [...document.querySelectorAll('input[name="flavor"]')];
  const categoryBoxes = [...document.querySelectorAll('input[name="category"]')];
  const pills = [...document.querySelectorAll(".p-pill[data-flavor]")];

  // 卡片上的愛心按鈕沿用原本的 SVG
  const wishSvg = grid.querySelector(".p-card__wish svg")?.outerHTML || "";
  const FLAVOR_LABELS = { rich: "濃郁", balance: "均衡", light: "清爽" };

  let products = readStaticCards();

  function readStaticCards() {
    return [...grid.querySelectorAll(".p-card[data-sku]")].map((card, index) => {
      const tag = card.querySelector(".p-card__tag");
      const flavor = Object.keys(FLAVOR_LABELS).find((f) => tag?.classList.contains(`p-card__tag--${f}`)) || "";
      const price = Number(card.querySelector(".p-card__price")?.textContent.replace(/[^\d]/g, "")) || null;
      const sku = card.dataset.sku;
      return {
        slug: new URL(card.href).searchParams.get("slug"),
        name: card.querySelector(".p-card__name")?.textContent || "",
        summary: card.querySelector(".p-card__desc")?.textContent || "",
        image: card.querySelector(".p-card__media img")?.getAttribute("src") || "",
        flavor,
        flavor_label: FLAVOR_LABELS[flavor] || "",
        category: "",
        min_price: price,
        in_stock: true,
        order: index,
        created_at: "",
        variants: [{ sku, price, in_stock: true }],
      };
    });
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderCard(p) {
    const variant = p.variants.find((v) => v.in_stock) || p.variants[0];
    const card = el("a", "p-card");
    card.href = `product.html?slug=${encodeURIComponent(p.slug)}`;
    card.dataset.slug = p.slug;
    if (variant) card.dataset.sku = variant.sku;

    if (p.flavor) card.append(el("span", `p-card__tag p-card__tag--${p.flavor}`, p.flavor_label));

    const wish = el("button", "p-card__wish");
    wish.type = "button";
    wish.setAttribute("aria-label", "加入收藏");
    wish.innerHTML = wishSvg; // 固定的圖示，不含後端資料
    card.append(wish);

    const media = el("div", "p-card__media");
    const img = el("img");
    img.src = p.image;
    img.alt = p.name;
    media.append(img);
    card.append(media);

    const body = el("div", "p-card__body");
    body.append(el("p", "p-card__desc", p.summary));
    body.append(el("h3", "p-card__name", p.name));
    // 多個規格時顯示最低價「起」
    const priceText = p.min_price == null ? "" : cart.formatPrice(p.min_price) + (p.variants.length > 1 ? " 起" : "");
    body.append(el("p", "p-card__price", priceText));

    const actions = el("div", "p-card__actions");
    actions.append(el("span", "p-card__cta", "了解更多"));
    const add = el("button", "p-card__add", "加入購物車");
    add.type = "button";
    if (!variant) {
      add.disabled = true;
      add.textContent = "暫不販售";
    } else if (!p.in_stock) {
      add.disabled = true;
      add.textContent = "已售完";
    } else if (p.variants.length > 1) {
      add.textContent = "選擇規格"; // 多規格要到商品頁選
      add.dataset.goto = "detail";
    }
    actions.append(add);
    body.append(actions);
    card.append(body);
    return card;
  }

  function selected(boxes) {
    return new Set(boxes.filter((b) => b.checked).map((b) => b.value));
  }

  function sortProducts(list) {
    const byOrder = (a, b) => a.order - b.order;
    const price = (p) => (p.min_price == null ? Infinity : p.min_price);
    switch (sortSelect.value) {
      case "price_asc":
        return list.sort((a, b) => price(a) - price(b) || byOrder(a, b));
      case "price_desc":
        return list.sort((a, b) => price(b) - price(a) || byOrder(a, b));
      case "newest":
        return list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "") || byOrder(a, b));
      default:
        return list.sort(byOrder);
    }
  }

  function render() {
    const keyword = keywordInput.value.trim().toLowerCase();
    const flavors = selected(flavorBoxes);
    const categories = selected(categoryBoxes);

    const visible = sortProducts(
      products.filter(
        (p) =>
          (!keyword || `${p.name} ${p.summary}`.toLowerCase().includes(keyword)) &&
          (flavors.size === 0 || flavors.has(p.flavor)) &&
          (categories.size === 0 || categories.has(p.category))
      )
    );

    grid.replaceChildren(...visible.map(renderCard));
    empty.hidden = visible.length > 0;
    pills.forEach((pill) => {
      const on = flavors.has(pill.dataset.flavor);
      pill.classList.toggle("is-active", on);
      pill.setAttribute("aria-pressed", on);
    });
  }

  // 加入購物車（卡片本身是連到商品頁的 <a>，按鈕要擋掉連結跳轉）
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".p-card__add, .p-card__wish");
    if (!btn) return;
    e.preventDefault();
    if (!btn.classList.contains("p-card__add") || btn.disabled) return;
    const card = btn.closest(".p-card");
    if (btn.dataset.goto === "detail") {
      location.href = card.href;
      return;
    }
    cart.add(card.dataset.sku, 1);
    cart.toast(`已將「${card.querySelector(".p-card__name").textContent}」加入購物車`);
  });

  // 篩選控制
  keywordInput.addEventListener("input", render);
  document.querySelector("[data-filter-search]").addEventListener("click", render);
  sortSelect.addEventListener("change", render);
  [...flavorBoxes, ...categoryBoxes].forEach((box) => box.addEventListener("change", render));
  pills.forEach((pill) =>
    pill.addEventListener("click", () => {
      const box = flavorBoxes.find((b) => b.value === pill.dataset.flavor);
      box.checked = !box.checked;
      render();
    })
  );
  document.querySelectorAll("[data-filter-clear]").forEach((btn) =>
    btn.addEventListener("click", () => {
      keywordInput.value = "";
      sortSelect.value = "featured";
      [...flavorBoxes, ...categoryBoxes].forEach((b) => (b.checked = false));
      render();
    })
  );

  render();

  cart
    .fetchProducts()
    .then((data) => {
      products = data.products.map((p, index) => ({ ...p, order: index }));
      render();
    })
    .catch(() => {
      /* 後端沒開：沿用頁面原本的卡片資料 */
    });
});
