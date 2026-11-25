/*
 * 中英文切換（英文版放在 /en/，頁面用 <base href="../"> 共用同一份 css、js、圖片）。
 *
 * - window.ZT.en：目前是不是英文頁（看 <html lang>）
 * - ZT.t("中文")：英文頁回傳對照的英文，沒有對照就照原文；中文頁一律回傳原文
 * - ZT.page("product.html?slug=x")：英文頁且這頁有英文版時，改連到 en/ 底下
 * - ZT.api("/api/products/")：英文頁在後端網址加上 ?lang=en，拿後台填的英文商品內容
 * - 自動在上方選單右側加「EN／中文」切換鈕，切換後停在同一頁的另一種語言；沒有英文版的頁面切到英文首頁
 *
 * 規則（2026-11-25）：品牌名、茶名、欄目名（蟬茶鋪、蟬茶誌…）等專有名詞英文版也保留中文，這裡不要翻。
 * 新增有英文版的頁面時，記得加進 EN_PAGES。
 */
(function () {
  const EN = (document.documentElement.lang || "").toLowerCase().startsWith("en");
  const EN_PAGES = ["index.html", "products.html", "product.html"];

  const DICT = {
    // 共用
    "加入收藏": "Add to favorites",
    "取消收藏": "Remove from favorites",
    "已加入收藏": "Added to favorites",
    "已取消收藏": "Removed from favorites",
    "加入購物車": "Add to cart",
    "了解更多": "Learn more",
    "選擇規格": "Choose options",
    "已售完": "Sold out",
    "暫不販售": "Not available",
    "即將上架": "Coming soon",
    " 起": "",
    "濃郁": "Rich",
    "均衡": "Balanced",
    "清爽": "Light",
    // 商品頁
    "暫時無法載入茶品資料，請稍後再重新整理頁面。": "We couldn't load this tea. Please refresh the page in a moment.",
    "茶乾照片準備中": "Dry leaf photo coming soon",
    "茶湯照片準備中": "Brewed tea photo coming soon",
    "茶園照片準備中": "Tea garden photo coming soon",
    "產地": "Origin",
    "製程": "Processing",
    "茶類": "Tea type",
    "商品形式": "Form",
    "水溫": "Water temp.",
    "茶水比": "Tea to water",
    "浸泡時間": "Steeping time",
    "包裝尺寸": "Package size",
    // 首頁「認識茶」
    "香氣": "Aroma",
    "口感": "Taste",
    "深入認識 →": "Learn more →",
  };

  const t = (s) => (EN && Object.prototype.hasOwnProperty.call(DICT, s) ? DICT[s] : s);
  const fileOf = (href) => href.split(/[?#]/)[0] || "index.html";
  const page = (href) => (EN && EN_PAGES.includes(fileOf(href)) ? `en/${href}` : href);
  const api = (path) => (EN ? `${path}${path.includes("?") ? "&" : "?"}lang=en` : path);
  // 價格：英文版寫「From NT$300」，中文版寫「NT$300 起」
  const fromPrice = (text) => (EN ? `From ${text}` : `${text} 起`);
  const addedToCart = (name, qty) =>
    EN ? `Added ${qty ? `${qty} × ` : ""}“${name}” to cart` : qty ? `已將 ${qty} 件「${name}」加入購物車` : `已將「${name}」加入購物車`;

  window.ZT = { en: EN, t, page, api, fromPrice, addedToCart };

  // 語言切換鈕
  document.addEventListener("DOMContentLoaded", () => {
    const icons = document.querySelector(".site-nav__icons");
    if (!icons) return;
    const file = location.pathname.split("/").pop() || "index.html";
    const rest = location.search + location.hash;
    const a = document.createElement("a");
    a.className = "site-nav__lang";
    if (EN) {
      a.href = file + rest; // 英文頁有 <base href="../">，這樣就是同一頁的中文版
      a.textContent = "中文";
      a.lang = "zh-Hant";
      a.setAttribute("aria-label", "切換到中文");
    } else {
      a.href = EN_PAGES.includes(file) ? `en/${file}${rest}` : "en/index.html";
      a.textContent = "EN";
      a.lang = "en";
      a.setAttribute("aria-label", "Switch to English");
    }
    icons.prepend(a);
  });
})();
