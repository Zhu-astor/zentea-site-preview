/*
 * 購物車（前台）
 *
 * 購物車內容只存在這台瀏覽器的 localStorage：{ sku: 數量 }。
 * 價格、品名、庫存一律向後端（zentea-backend）即時查詢，不相信這裡存的任何數字——
 * 顧客就算自己改了 localStorage，送去試算時後端也會用資料庫的價格重算。
 *
 * localStorage 在無痕模式或被封鎖時可能讀寫失敗，這時退回只存在記憶體裡
 * （重新整理頁面就會清空），但加入購物車、看購物車的功能照常可用。
 */
(function () {
  const STORAGE_KEY = "zentea_cart_v1";
  const MAX_QTY = 99;

  // 後端網址：預設跟頁面同網域，走相對路徑 /api/（開發預覽由 Django 一起提供頁面，
  // 正式上線也是前後台同網域）。前台放在別的網址時，在載入本檔之前設定
  // window.ZENTEA_API_BASE = "https://後端網址" 覆蓋，並在後端 CORS_ALLOWED_ORIGINS 加入前台網址。
  const API_BASE = window.ZENTEA_API_BASE !== undefined ? window.ZENTEA_API_BASE : "";

  let memoryCart = {};

  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return data && typeof data === "object" && !Array.isArray(data) ? data : {};
    } catch (e) {
      return { ...memoryCart };
    }
  }

  function write(cart) {
    memoryCart = { ...cart };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      /* 無痕模式等情況：只保留在記憶體 */
    }
    updateBadges();
  }

  function clampQty(qty) {
    const n = Math.floor(Number(qty));
    if (!Number.isFinite(n) || n < 1) return 0;
    return Math.min(n, MAX_QTY);
  }

  function add(sku, qty = 1) {
    const cart = read();
    cart[sku] = clampQty((cart[sku] || 0) + qty);
    write(cart);
  }

  function setQty(sku, qty) {
    const cart = read();
    const n = clampQty(qty);
    if (n === 0) delete cart[sku];
    else cart[sku] = n;
    write(cart);
  }

  function remove(sku) {
    setQty(sku, 0);
  }

  function items() {
    return Object.entries(read())
      .filter(([sku, qty]) => typeof sku === "string" && clampQty(qty) > 0)
      .map(([sku, qty]) => ({ sku, quantity: clampQty(qty) }));
  }

  function count() {
    return items().reduce((sum, item) => sum + item.quantity, 0);
  }

  function updateBadges() {
    const n = count();
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = n;
      el.hidden = n === 0;
    });
  }

  async function api(path, options) {
    const res = await fetch(API_BASE + (window.ZT ? window.ZT.api(path) : path), options); // 英文頁加 ?lang=en
    if (!res.ok) throw new Error(`API ${path} 回應 ${res.status}`);
    return res.json();
  }

  function fetchProducts() {
    return api("/api/products/");
  }

  function quote() {
    return api("/api/cart/quote/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items() }),
    });
  }

  let toastTimer;
  function toast(message) {
    let el = document.querySelector(".cart-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "cart-toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2200);
  }

  function formatPrice(n) {
    return "NT$" + Number(n).toLocaleString("zh-TW");
  }

  // 其他分頁改了購物車時同步數字
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) updateBadges();
  });
  document.addEventListener("DOMContentLoaded", updateBadges);

  window.ZenteaCart = {
    add, setQty, remove, items, count, quote, fetchProducts, toast, formatPrice, updateBadges,
    MAX_QTY,
    apiBase: API_BASE,
  };
})();
