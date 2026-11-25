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
  const EN_PAGES = [
    "index.html", "products.html", "product.html", "cart.html", "checkout.html", "order-complete.html", "order-lookup.html",
    "find-tea.html", "experience.html", "video.html", "journal.html", "knowledge.html", "articles.html", "article.html",
  ];

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
    // 購物車、結帳、訂單
    "免運": "Free",
    "暫時無法取得最新價格與庫存，請稍後再重新整理頁面。": "We couldn't get the latest prices and stock. Please refresh the page in a moment.",
    "前往付款 →": "Continue to payment →",
    "選擇配送方式後計算": "Choose a method",
    "尚未選擇取貨門市": "No pickup store selected",
    "重新選擇": "Change store",
    "選擇門市": "Choose a store",
    "即將開放": "Coming soon",
    "單價": "Unit price",
    "建立訂單中…": "Creating your order…",
    "資料有誤，請檢查後再試一次": "Please check your details and try again.",
    "前往綠界付款頁…": "Going to ECPay payment page…",
    "暫時無法連線，請稍後再試一次": "We couldn't connect. Please try again.",
    "部分商品目前無法購買，請回購物車調整": "Some items are unavailable. Please update your cart.",
    "找不到訂單資訊。如果已經完成付款，訂單確認信會寄到您的信箱。": "We couldn't find your order details. If you've paid, a confirmation email will be sent to you.",
    "付款確認中": "Confirming your payment",
    "正在等候綠界回傳付款結果，請稍候，不要關閉這個頁面。": "We're waiting for the payment result from ECPay. Please don't close this page.",
    "付款未完成": "Payment not completed",
    "這筆訂單沒有付款成功，不會出貨。購物車內容都還在，可以回購物車重新結帳。": "This order wasn't paid and won't be shipped. Your cart is still saved, so you can go back and check out again.",
    "回購物車": "Back to cart",
    "訂購完成，謝謝您": "Thank you for your order",
    "我們已收到您的付款，會盡快為您備貨出貨。": "We've received your payment and will prepare your order right away.",
    "出貨時會寄 Email 通知您寄貨編號；之後隨時可以到「訂單查詢」，用訂單編號和 Email 查看物流進度。": "We'll email you the tracking number when it ships. You can check delivery progress anytime on the Order Status page with your order number and email.",
    "查詢訂單": "Check order status",
    "繼續逛逛": "Continue shopping",
    "查不到這筆訂單。": "Order not found.",
    "還沒收到付款結果。如果您已經完成付款，請稍後重新整理這個頁面，或聯絡我們並提供訂單編號。": "We haven't received the payment result yet. If you've paid, please refresh this page later or contact us with your order number.",
    "暫時無法查詢訂單，請稍後重新整理這個頁面。": "We couldn't look up your order. Please refresh this page later.",
    "請填寫訂單編號與 Email": "Please enter your order number and email",
    "查詢失敗，請稍後再試": "Lookup failed. Please try again later.",
    "暫時無法連線，請稍後再試": "We couldn't connect. Please try again later.",
    // 選茶測驗
    "← 上一題": "← Back",
    "沒關係，換個簡單的方式。": "No problem. Let's try an easier way.",
    "喜好・補充": "Taste・Follow-up",
    "哪一組味道聞起來，你比較想靠近？": "Which of these sounds most appealing?",
    "看結果 ": "See results ",
    "下一題 ": "Next ",
    "先跳過這題": "Skip this question",
    "請選 1～2 個，或按「先跳過這題」。": "Pick 1 or 2, or skip this question.",
    "請先選一個最接近你的選項。": "Please pick the option closest to you.",
    "高信心推薦": "Our top pick for you",
    "很適合你的選擇": "A great match for you",
    "先從這款開始": "A good place to start",
    "了解更多 →": "Learn more →",
    "你跳過了大部分題目，先推薦最容易開始、多數人都喝得順的一款。": "You skipped most questions, so here's an easy one that most people enjoy.",
    "推薦冷泡": "Best cold brewed",
    "推薦熱泡": "Best brewed hot",
    "也可以熱泡": "Also good hot",
    "也可以冷泡": "Also good cold brewed",
    "為什麼推薦": "Why this tea",
    "茶的特色": "About the tea",
    "怎麼泡": "How to brew",
    "日常方便": "Easy everyday",
    "細緻品飲": "Careful savoring",
    "再測一次": "Take the quiz again",
    "第二推薦": "Second pick",
    "六款茶和你的相似度": "How well each tea matches you",
    "依你的答案與各款茶的香氣、焙火、茶湯厚度比對相似度；「感覺」題是喝茶情境，不代表茶的功效。": "Matches are based on your answers and each tea's aroma, roast and body. The “feeling” question describes the moment you enjoy tea in, not any effect of the tea.",
    // 文章、影音、蟬茶誌
    "影片即將上架": "Video coming soon",
    "泡茶、茶園與製茶的故事，正在拍攝整理中。": "Stories of brewing, tea gardens and tea making are being filmed.",
    "全部影片": "All videos",
    "品牌理念": "Our Philosophy",
    "茶園筆記": "Garden Notes",
    "產地故事": "Origins",
    "茶園走訪": "Garden Visit",
    "榮譽紀事": "Awards",
    "職人": "Craftsmanship",
    "讀這篇 →": "Read →",
    "即將推出": "Coming soon",
    "最新文章": "Latest Articles",
    "剛從茶山與茶桌帶回來的新篇章。": "New stories, fresh from the tea mountains and the tea table.",
    "人氣文章": "Popular Articles",
    "最近三十天，大家最常讀的幾篇。": "The most read articles in the last 30 days.",
    "最多點閱": "Most Read",
    "上線以來，被打開最多次的文章。": "The most opened articles of all time.",
    "精選文章": "Featured Articles",
    "把山林、茶香與生活裡的留白，慢慢寫下來。": "Mountains, tea and the quiet spaces of everyday life, written down slowly.",
    "閱讀全文 →": "Read more →",
    "影片": "Video",
    "全部分類": "All categories",
    "全部月份": "All months",
    "上一頁": "Previous page",
    "下一頁": "Next page",
    "找不到這篇文章。": "Article not found.",
    "找不到這篇文章，可能已經下架。": "Article not found. It may have been removed.",
    "暫時無法載入文章，請稍後再試。": "We couldn't load the article. Please try again later.",
    // 文章分類（顯示用，篩選值維持中文）
    "茶知識": "Tea Knowledge",
    "製茶工藝": "Tea Making",
    "沖泡與保存": "Brewing & Storage",
    "茶器與品飲": "Teaware & Tasting",
    "產地風土": "Terroir",
    "茶的日常": "Everyday Tea",
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
