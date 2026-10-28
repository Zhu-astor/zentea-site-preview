/*
 * 全站標題換行保護（搭配 css/style.css 的 keep-all 規則）：
 * 標題、短句只在標點或空白換行；如果某一段沒有標點的字太長、在這個寬度塞不下，
 * 瀏覽器會被迫在字中間斷開。這裡偵測到這種情況就把字級一點一點縮小（最多縮到 70%），
 * 直到可以在標點換行為止。版面寬度改變、內容晚載入（文章、測驗結果）時會重新檢查。
 */
(function () {
  const SEL = 'h1, h2, h3, h4, [class*="title"], [class*="__name"], [class*="tagline"], [class*="lede"], .philo-card__text, .ft-why1, .ft-tea';
  const SKIP = ".ar__body, .pdx-story__body, .ft-tabs__panel";
  const OK_END = new Set([..."，。、！？；：」』）)】!?,.;:…—～·・ "]);
  const OK_START = new Set([..."「『（(【—・·"]);
  const MIN = 0.7;

  // 有沒有「不在標點」的換行
  function badBreak(el) {
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let prev = null;
    let gap = false;
    let n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 1) {
        if (n.tagName === "BR" || /block|flex|grid|list-item|table/.test(getComputedStyle(n).display)) gap = true;
        continue;
      }
      const s = n.textContent;
      for (let i = 0; i < s.length; i++) {
        if (/\s/.test(s[i])) { gap = true; continue; }
        const r = document.createRange();
        r.setStart(n, i);
        r.setEnd(n, i + 1);
        const rect = r.getClientRects()[0];
        if (!rect) continue;
        const cur = { ch: s[i], top: rect.top, h: rect.height };
        if (prev && cur.top > prev.top + prev.h * 0.6 && !gap && !OK_END.has(prev.ch) && !OK_START.has(cur.ch)) return true;
        gap = false;
        prev = cur;
      }
    }
    return false;
  }

  function fit(el) {
    if (el.closest(SKIP) || !el.offsetParent) return;
    const text = el.textContent.replace(/\s+/g, "");
    if (!text || text.length > 60) return;
    el.style.fontSize = "";
    if (!badBreak(el)) return;
    const base = parseFloat(getComputedStyle(el).fontSize);
    for (let k = 0.96; k >= MIN - 0.001; k -= 0.04) {
      el.style.fontSize = `${(base * k).toFixed(2)}px`;
      if (!badBreak(el)) return;
    }
  }

  let timer = null;
  function run() {
    clearTimeout(timer);
    timer = setTimeout(() => document.querySelectorAll(SEL).forEach(fit), 120);
  }

  window.addEventListener("load", run);
  window.addEventListener("resize", run);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
  document.addEventListener("DOMContentLoaded", () => {
    run();
    // 文章列表、測驗結果等晚一點才產生的內容
    new MutationObserver((list) => {
      if (list.some((m) => [...m.addedNodes].some((x) => x.nodeType === 1))) run();
    }).observe(document.body, { childList: true, subtree: true });
  });
})();
