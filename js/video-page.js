/*
 * 蟬茶影音：影片清單與站內播放。
 * 有影片時在 VIDEOS 加一筆就會出現（YouTube 縮圖自動抓）；分類有兩種以上才顯示分類按鈕。
 * 還沒有影片時，顯示「即將上架」的佔位卡片，先把版面留出來。
 *
 * 範例：
 *   { youtube: "https://www.youtube.com/watch?v=XXXXXXXXXXX", title: "冷泡茶怎麼泡", date: "2026-12-01",
 *     category: "泡茶教學", summary: "兩三行介紹……" },
 */
const VIDEOS = [];

const PLACEHOLDERS = 6;

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("[data-video-grid]");
  const tabs = document.querySelector("[data-video-tabs]");
  const note = document.querySelector("[data-video-note]");
  const player = document.querySelector("[data-video-player]");
  const frame = document.querySelector("[data-video-frame]");
  if (!grid) return;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const youtubeId = (url) => (String(url).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || [])[1];
  const playIcon = () => {
    const s = el("span", "vd-card__play");
    s.setAttribute("aria-hidden", "true");
    return s;
  };

  // 還沒有影片：佔位卡片
  if (!VIDEOS.length) {
    for (let i = 0; i < PLACEHOLDERS; i += 1) {
      const card = el("div", "vd-card vd-card--soon");
      const thumb = el("div", "vd-card__thumb");
      thumb.append(playIcon());
      card.append(thumb, el("h3", "vd-card__title", "影片即將上架"), el("p", "vd-card__date", "COMING SOON"), el("p", "vd-card__text", "泡茶、茶園與製茶的故事，正在拍攝整理中。"));
      grid.append(card);
    }
    return;
  }

  note.hidden = true;
  const list = VIDEOS.map((v) => ({ ...v, id: youtubeId(v.youtube) })).filter((v) => v.id);
  const categories = [...new Set(list.map((v) => v.category).filter(Boolean))];
  let current = "";

  const open = (v) => {
    const iframe = el("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`;
    iframe.title = v.title;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    frame.replaceChildren(iframe);
    player.hidden = false;
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    frame.replaceChildren();
    player.hidden = true;
    document.body.style.overflow = "";
  };
  player.addEventListener("click", (e) => (e.target === player || e.target.closest("[data-video-close]")) && close());
  document.addEventListener("keydown", (e) => e.key === "Escape" && !player.hidden && close());

  const render = () => {
    grid.replaceChildren(
      ...list
        .filter((v) => !current || v.category === current)
        .map((v) => {
          const card = el("button", "vd-card");
          card.type = "button";
          const thumb = el("div", "vd-card__thumb");
          const img = el("img");
          img.src = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
          img.alt = "";
          img.loading = "lazy";
          thumb.append(img, playIcon());
          card.append(thumb, el("h3", "vd-card__title", v.title), el("p", "vd-card__date", (v.date || "").replaceAll("-", ".")), el("p", "vd-card__text", v.summary || ""));
          card.addEventListener("click", () => open(v));
          return card;
        })
    );
  };

  if (categories.length > 1) {
    const tab = (label, value) => {
      const b = el("button", "vd-tab", label);
      b.type = "button";
      b.addEventListener("click", () => {
        current = value;
        tabs.querySelectorAll(".vd-tab").forEach((x) => x.classList.toggle("is-active", x === b));
        render();
      });
      return b;
    };
    tabs.append(tab("全部影片", ""), ...categories.map((c) => tab(c, c)));
    tabs.firstChild.classList.add("is-active");
    tabs.hidden = false;
  }
  render();
});
