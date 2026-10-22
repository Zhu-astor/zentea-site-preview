/*
 * 商品詳細頁：product.html?slug=fresh-oolong，內容全部來自後端 /api/products/<slug>/。
 * 三個入口都連到這裡：首頁測驗結果、首頁「認識茶」卡片、蟬茶鋪「了解更多」。
 * 文字一律用 textContent 填入（不用 innerHTML 放後台內容）；圖示是這支檔案自己的 SVG。
 * 「即將上架」的茶（coming_soon）照常顯示介紹，只是不能加入購物車。
 * 收藏先存在這台瀏覽器（localStorage），之後有會員收藏功能再接後端。
 */
(function () {
  const ICONS = {
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19c3-4 6-7 9-9"/>',
    sprout: '<path d="M12 21V11"/><path d="M12 13c0-4-3-6-7-6 0 4 3 6 7 6z"/><path d="M12 11c0-4 3-7 7-7 0 4-3 7-7 7z"/>',
    origin: '<path d="M6 19c0-7 4-12 12-13-1 8-5 12-12 13z"/><path d="M6 19c2.5-3.5 5-6 8-8"/><path d="M9 14.5l-2.5-1M11.5 12l-1-2.5"/>',
    cup: '<path d="M4 10h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17"/>',
    box: '<path d="M7 4h10l2 4v12H5V8z"/><path d="M5 8h14M9 4l-1 4M15 4l1 4"/>',
    fire: '<path d="M12 21c-3.9 0-6-2.6-6-5.6 0-3.4 2.6-5.3 3.6-8.4 1.9 1.6 2.2 3.3 2 4.6 1-.7 1.8-2 2-3.6 2 1.8 2.4 4.3 2.4 6 0 4-2.4 7-4 7z"/><path d="M12 21c-1.6 0-2.6-1.1-2.6-2.5 0-1.6 1.3-2.4 2-3.8 1.3 1.1 3.2 2.3 3.2 3.8 0 1.4-1 2.5-2.6 2.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
    laptop: '<rect x="4.5" y="5.5" width="15" height="10" rx="1"/><path d="M2.5 18.5h19"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11"/><path d="M12 9c-2-4-6-4-6-1.5S10 9 12 9c2 0 6-.5 6-1.5S14 5 12 9z"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    people: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9.5" r="2.4"/><path d="M3.5 19c.5-3.4 2.8-5.5 5.5-5.5s5 2.1 5.5 5.5"/><path d="M15 14.2c2.7-.6 5 1.2 5.5 4.3"/>',
    book: '<path d="M4 5.5c3-1 5.5-.5 8 1.5 2.5-2 5-2.5 8-1.5v13c-3-1-5.5-.5-8 1.5-2.5-2-5-2.5-8-1.5z"/><path d="M12 7v13"/>',
    thermo: '<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
    drop: '<path d="M12 3.5c3 4 6 7.2 6 10.5a6 6 0 0 1-12 0c0-3.3 3-6.5 6-10.5z"/>',
    clock: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2M10 3h4"/>',
    image: '<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l5-5 4 4 2.5-2.5L20 17"/>',
  };
  const svg = (key) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[key] || ICONS.leaf}</svg>`;
  const BAR_ICON = { 香氣: "leaf", 滋味厚度: "cup", 焙火程度: "fire", 發酵程度: "sprout" };
  const PLACEHOLDERS = ["茶乾照片準備中", "茶湯照片準備中", "茶園照片準備中"];
  const FAV_KEY = "zentea-favorites";

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function icon(key, extra) {
    const span = el("span", `pdx-icon${extra ? " " + extra : ""}`);
    span.innerHTML = svg(key);
    return span;
  }
  const readFavs = () => {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    } catch (e) {
      return [];
    }
  };

  document.addEventListener("DOMContentLoaded", async () => {
    const cart = window.ZenteaCart;
    const $ = (sel) => document.querySelector(sel);
    const field = (name) => document.querySelector(`[data-field="${name}"]`);
    const status = $("[data-product-status]");
    const article = $("[data-product]");
    const missing = $("[data-product-missing]");
    const qtyInput = $("[data-qty]");
    const addBtn = $("[data-add]");
    document.querySelectorAll("[data-icon]").forEach((n) => (n.innerHTML = svg(n.dataset.icon)));

    const slug = new URLSearchParams(location.search).get("slug");
    const showMissing = () => {
      status.hidden = true;
      missing.hidden = false;
    };
    if (!slug) return showMissing();

    let product;
    try {
      const res = await fetch(`${cart.apiBase}/api/products/${encodeURIComponent(slug)}/`);
      if (res.status === 404) return showMissing();
      if (!res.ok) throw new Error(res.status);
      product = await res.json();
    } catch (e) {
      status.textContent = "暫時無法載入茶品資料，請稍後再重新整理頁面。";
      return;
    }

    document.title = `${product.name} | 蟬吃茶 ZenEaTea`;
    field("crumb").textContent = product.name;
    field("name").textContent = product.name;
    field("summary").textContent = product.summary;
    $("[data-tags]").replaceChildren(...(product.tags || []).map((t) => el("span", "", t)));

    // ---------- 圖片輪播：沒有照片的位置放「準備中」 ----------
    const glyph = product.name.replace(/^蟬吃/, "").replace(/^手採/, "").charAt(0);
    const slides = (product.gallery || []).map((src) => ({ src }));
    if (!slides.length) slides.push({ glyph });
    PLACEHOLDERS.slice(0, Math.max(0, 4 - slides.length)).forEach((text) => slides.push({ text }));
    const stage = $("[data-stage]");
    const thumbs = $("[data-thumbs]");
    const dots = $("[data-dots]");
    let current = 0;
    slides.forEach((s, i) => {
      const slide = el("div", "pdx-slide");
      const thumb = el("button", "pdx-thumb");
      thumb.type = "button";
      thumb.setAttribute("role", "tab");
      thumb.setAttribute("aria-label", `第 ${i + 1} 張`);
      if (s.src) {
        const img = el("img");
        img.src = s.src;
        img.alt = i === 0 ? product.name : "";
        slide.append(img);
        thumb.append(Object.assign(el("img"), { src: s.src, alt: "" }));
      } else if (s.glyph) {
        slide.append(el("span", "pdx-slide__glyph", s.glyph));
        thumb.append(el("span", "pdx-slide__glyph", s.glyph));
        thumb.querySelector("span").style.fontSize = "26px";
      } else {
        const ph = el("div", "pdx-slide__ph");
        ph.append(icon("image", "pdx-icon--plain"), el("span", "", s.text));
        slide.append(ph);
        thumb.append(icon("image", "pdx-icon--plain"));
        thumb.querySelector(".pdx-icon").style.cssText = "width:26px;height:26px;margin:18px;color:#A9ADA6";
      }
      thumb.addEventListener("click", () => show(i));
      stage.append(slide);
      thumbs.append(thumb);
      dots.append(el("span"));
    });
    function show(i) {
      current = (i + slides.length) % slides.length;
      stage.querySelectorAll(".pdx-slide").forEach((n, k) => n.classList.toggle("is-active", k === current));
      thumbs.querySelectorAll(".pdx-thumb").forEach((n, k) => {
        n.classList.toggle("is-active", k === current);
        n.setAttribute("aria-selected", String(k === current));
      });
      dots.querySelectorAll("span").forEach((n, k) => n.classList.toggle("is-active", k === current));
    }
    $("[data-prev]").addEventListener("click", () => show(current - 1));
    $("[data-next]").addEventListener("click", () => show(current + 1));
    let touchX = null;
    stage.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
    }, { passive: true });
    show(0);

    // ---------- 價格與規格 ----------
    const priceText = (n) => {
      const frag = document.createDocumentFragment();
      frag.append(el("small", "", "NT$"), String(n.toLocaleString()));
      return frag;
    };
    const variantsBox = $("[data-variants]");
    let selectedSku = null;
    function selectVariant(sku) {
      selectedSku = sku;
      const v = product.variants.find((x) => x.sku === sku);
      variantsBox.querySelectorAll(".pdx-variant").forEach((b) => {
        const on = b.dataset.sku === sku;
        b.classList.toggle("is-selected", on);
        b.setAttribute("aria-checked", String(on));
      });
      field("price").replaceChildren(v ? priceText(v.price) : "");
      addBtn.disabled = !v || !v.in_stock;
    }
    if (product.coming_soon) {
      field("price").textContent = "即將上架";
      $("[data-variant-field]").hidden = true;
      addBtn.disabled = true;
      $("[data-add-label]").textContent = "即將上架";
      $("[data-soon-note]").hidden = false;
      document.querySelector(".pdx-qty").hidden = true;
    } else {
      product.variants.forEach((v) => {
        const b = el("button", "pdx-variant", v.in_stock ? v.name : `${v.name}（已售完）`);
        b.type = "button";
        b.dataset.sku = v.sku;
        b.setAttribute("role", "radio");
        b.disabled = !v.in_stock;
        b.addEventListener("click", () => selectVariant(v.sku));
        variantsBox.append(b);
      });
      const first = product.variants.find((v) => v.in_stock);
      if (first) selectVariant(first.sku);
      else {
        field("price").replaceChildren(product.min_price == null ? "" : priceText(product.min_price));
        addBtn.disabled = true;
        $("[data-add-label]").textContent = product.variants.length ? "已售完" : "暫不販售";
      }
      $("[data-variant-field]").hidden = product.variants.length === 0;
    }

    const clampQty = (value) => {
      const n = Math.floor(Number(value));
      return Math.min(Math.max(Number.isFinite(n) ? n : 1, 1), cart.MAX_QTY);
    };
    document.querySelectorAll(".pdx-qty [data-step]").forEach((b) =>
      b.addEventListener("click", () => (qtyInput.value = clampQty(Number(qtyInput.value) + Number(b.dataset.step))))
    );
    qtyInput.addEventListener("change", () => (qtyInput.value = clampQty(qtyInput.value)));
    addBtn.addEventListener("click", () => {
      if (!selectedSku || addBtn.disabled) return;
      const qty = clampQty(qtyInput.value);
      cart.add(selectedSku, qty);
      cart.toast(`已將 ${qty} 件「${product.name}」加入購物車`);
    });

    // ---------- 收藏（這台瀏覽器） ----------
    const fav = $("[data-fav]");
    const syncFav = () => {
      const on = readFavs().includes(product.slug);
      fav.setAttribute("aria-pressed", String(on));
      fav.setAttribute("aria-label", on ? "取消收藏" : "加入收藏");
    };
    fav.addEventListener("click", () => {
      const list = readFavs();
      const on = list.includes(product.slug);
      const next = on ? list.filter((s) => s !== product.slug) : [...list, product.slug];
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(next));
      } catch (e) {
        /* 無痕模式存不了 */
      }
      syncFav();
      cart.toast(on ? "已取消收藏" : "已加入收藏");
    });
    syncFav();

    // ---------- 四格基本資料 ----------
    const facts = [
      ["origin", "產地", product.origin],
      ["sprout", "製程", product.process],
      ["cup", "茶類", product.tea_type],
      ["box", "商品形式", product.product_form],
    ].filter(([, , v]) => v);
    $("[data-facts]").replaceChildren(
      ...facts.map(([ic, label, value]) => {
        const item = el("div", "pdx-fact");
        const text = el("div");
        text.append(el("p", "pdx-fact__label", label), el("p", "pdx-fact__value", value));
        item.append(icon(ic), text);
        return item;
      })
    );
    $("[data-facts]").hidden = facts.length === 0;

    // ---------- 風味輪廓（0～8 格，可以有半格） ----------
    $("[data-bars]").replaceChildren(
      ...(product.flavor_profile || []).map((b) => {
        const row = el("div", "pdx-bar");
        const text = el("div");
        text.append(el("p", "pdx-bar__label", b.label), el("p", "pdx-bar__note", b.note || ""));
        const meterWrap = el("div", "pdx-bar__meter");
        const meter = el("div", "pdx-meter");
        meter.setAttribute("role", "img");
        meter.setAttribute("aria-label", `${b.label}：8 格中的 ${b.level} 格`);
        for (let i = 0; i < 8; i++) {
          const seg = el("i");
          seg.style.setProperty("--fill", `${Math.max(0, Math.min(1, Number(b.level) - i)) * 100}%`);
          meter.append(seg);
        }
        const ends = el("div", "pdx-meter__ends");
        ends.append(el("span", "", b.low || ""), el("span", "", b.high || ""));
        meterWrap.append(meter, ends);
        row.append(icon(BAR_ICON[b.label] || "leaf"), text, meterWrap);
        return row;
      })
    );
    field("one_liner").textContent = product.one_liner || product.summary;

    // ---------- 適合時刻 ----------
    const moments = product.moments || [];
    $("[data-moments]").replaceChildren(
      ...moments.map((m) => {
        const item = el("div", "pdx-moment");
        item.append(icon(m.icon), el("p", "pdx-moment__title", m.title), el("p", "pdx-moment__sub", m.sub || ""));
        return item;
      })
    );
    $("[data-moments-section]").hidden = moments.length === 0;

    // ---------- 建議沖泡 ----------
    const brew = product.brew || {};
    const brewItems = [
      ["thermo", "水溫", brew.temp],
      ["drop", "茶水比", brew.ratio],
      ["clock", "浸泡時間", brew.time],
    ].filter(([, , v]) => v);
    $("[data-brew]").replaceChildren(
      ...brewItems.map(([ic, label, value]) => {
        const item = el("div", "pdx-brew__item");
        const text = el("div");
        text.append(el("p", "pdx-brew__label", label), el("p", "pdx-brew__value", value));
        item.append(icon(ic, "pdx-icon--plain"), text);
        return item;
      })
    );
    field("brew_tip").textContent = brew.tip || "";
    $("[data-tip-box]").hidden = !brew.tip;
    $("[data-brew-section]").hidden = brewItems.length === 0 && !brew.tip;

    // ---------- 茶品故事 ----------
    const paras = (product.story || product.description || "").split(/\n\s*\n/).filter((p) => p.trim());
    $("[data-story]").replaceChildren(...paras.map((p) => el("p", "", p.trim())));
    const media = $("[data-story-media]");
    if (product.story_image) media.style.backgroundImage = `url("${product.story_image.replace(/"/g, "")}")`;
    else media.hidden = true;
    const more = $("[data-story-link]");
    if (product.story_link) more.href = product.story_link;
    $("[data-story-section]").hidden = paras.length === 0;

    status.hidden = true;
    article.hidden = false;
  });
})();
