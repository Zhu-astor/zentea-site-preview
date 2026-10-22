/*
 * 首頁第一段的版面：山水底圖（assets/img/bg-main.png，原圖寬 941）寬度跟著螢幕寬，
 * 這裡依「標題實際佔的位置」決定底圖要往下移多少（--bg-shift），讓山不會壓到標題；
 * 在不壓到標題的前提下，盡量讓水面落在畫面約 72% 的高度。
 * 船、「走進蟬吃茶」、兩側山崖都用同一個 --bg-shift 定位（css/style.css 最後），所以永遠浮在同一片水上。
 * 不同螢幕比例（Mac / Windows 縮放 / 平板 / 手機）都靠這個公式，不需要個別調。
 */
(function () {
  // 底圖每 1/24 寬的「山頂」在原圖第幾列（由 bg-main.png 算出：比紙色暗、且不是太陽的第一列）
  const MOUNTAIN_TOP = [225, 199, 195, 192, 204, 204, 206, 218, 222, 217, 216, 235, 209, 198, 169, 154, 127, 137, 162, 71, 119, 102, 87, 74];
  const IMG_W = 941;
  const WATERLINE = 392; // 船的吃水線在原圖第幾列
  const GAP = 28; // 標題最下面到山頂至少留的距離（px）

  function layout() {
    const text = document.querySelector("#session-1 .session-text");
    if (!text) return;
    const W = document.documentElement.clientWidth;
    const H = window.innerHeight;
    const scale = W / IMG_W;
    // 用 offset 系列量（不受捲動時的飄移動畫影響）
    const left = text.offsetLeft;
    const right = left + text.offsetWidth;
    const bottom = text.offsetTop + text.offsetHeight;
    const from = Math.max(0, Math.floor((left / W) * 24));
    const to = Math.min(23, Math.floor((right / W) * 24));
    const peak = Math.min(...MOUNTAIN_TOP.slice(from, to + 1)) - 6; // 山頂往上多抓一點霧
    const minShift = bottom + GAP - peak * scale;
    const waterShift = 0.72 * H - WATERLINE * scale;
    const shift = Math.max(minShift, waterShift);
    document.documentElement.style.setProperty("--bg-shift", `${Math.round(shift)}px`);
  }

  layout();
  window.addEventListener("resize", layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout); // 字型載入後標題高度會變
  window.addEventListener("load", layout);
})();
