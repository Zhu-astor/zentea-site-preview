/*
 * 單篇文章：article.html?slug=…，向後端 /api/articles/<slug>/ 讀取。
 * 內文（body_html）後端已過濾成只剩基本格式（段落、標題、粗體、連結），才用 innerHTML 顯示。
 * 後台「在官網預覽」會加 ?preview=1，登入後台的人可以看到草稿。
 */
document.addEventListener("DOMContentLoaded", async () => {
  const api = window.ZenteaCart ? window.ZenteaCart.apiBase : "";
  const $ = (sel) => document.querySelector(sel);
  const status = $("[data-status]");
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");
  const preview = params.get("preview") === "1";

  if (!slug) {
    status.textContent = ZT.t("找不到這篇文章。");
    return;
  }

  try {
    const url = `${api}/api/articles/${encodeURIComponent(slug)}/${preview ? "?preview=1" : ""}`;
    const res = await fetch(url, { credentials: "include" });
    if (res.status === 404) {
      status.textContent = ZT.t("找不到這篇文章，可能已經下架。");
      return;
    }
    if (!res.ok) throw new Error(res.status);
    const a = await res.json();

    // 依文章欄目決定「回到哪裡」：蟬茶誌（品牌文章）或茶知識
    const section = a.section === "journal" ? { name: "蟬茶誌", href: ZT.page("journal.html") } : { name: ZT.t("茶知識"), href: ZT.page("knowledge.html") };
    document.title = `${a.title} | ${section.name} | 蟬吃茶`;
    const back = document.querySelector(".ar-head__back");
    if (back) {
      back.href = section.href;
      back.textContent = ZT.en ? `← Back to ${section.name}` : `← 回${section.name}`;
    }
    document.querySelector('meta[name="description"]').content = a.summary || "";
    $("[data-preview]").hidden = a.status !== "draft";
    $("[data-category]").textContent = a.category || "";
    $("[data-title]").textContent = a.title;
    $("[data-date]").textContent = a.published_at ? a.published_at.slice(0, 10).replaceAll("-", ".") : "";
    $("[data-body]").innerHTML = a.body_html;

    if (a.video) {
      const video = $("[data-video]");
      video.src = a.video;
      if (a.cover) video.poster = a.cover;
      video.hidden = false;
    }
    if (a.images.length) {
      const gallery = $("[data-gallery]");
      gallery.replaceChildren(
        ...a.images.map((img) => {
          const fig = document.createElement("figure");
          const el = document.createElement("img");
          el.src = img.url;
          el.alt = img.caption || "";
          el.loading = "lazy";
          fig.appendChild(el);
          if (img.caption) {
            const cap = document.createElement("figcaption");
            cap.textContent = img.caption;
            fig.appendChild(cap);
          }
          return fig;
        })
      );
      gallery.hidden = false;
    }
    if (a.citations.length) {
      $("[data-citation-list]").replaceChildren(
        ...a.citations.map((c) => {
          const li = document.createElement("li");
          li.append(`[${c.id}] `);
          if (c.url && /^https?:\/\//.test(c.url)) {
            const link = document.createElement("a");
            link.href = c.url;
            link.target = "_blank";
            link.rel = "noopener nofollow";
            link.textContent = c.name || c.url;
            li.appendChild(link);
          } else {
            li.append(c.name || "");
          }
          return li;
        })
      );
      $("[data-citations]").hidden = false;
    }
    status.hidden = true;
    $("[data-article]").hidden = false;
    revealOnScroll($("[data-article]"));
    if (a.status === "published") countView(slug);
  } catch (e) {
    status.textContent = ZT.t("暫時無法載入文章，請稍後再試。");
  }
});

// 記一次點閱（給茶知識的「人氣文章」「最多點閱」）。同一個分頁重新整理不重複算；後端另外依 IP 去重。
function countView(slug) {
  const key = `zentea_viewed_${slug}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch (e) {
    /* 無痕模式等：交給後端去重 */
  }
  const api = window.ZenteaCart ? window.ZenteaCart.apiBase : "";
  fetch(`${api}/api/articles/${encodeURIComponent(slug)}/view/`, { method: "POST", keepalive: true }).catch(() => {});
}

// 閱讀時圖片、文字慢慢浮現（設計師 11/18，參考王德傳官網）：捲到畫面上才淡入、往上浮一點。
// 只有 JS 執行後才加上 .ar-reveal，沒有 JS 時內容照常顯示；開了「減少動態效果」就不播。
function revealOnScroll(root) {
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const targets = [
    ...root.querySelectorAll(".ar__eyebrow, .ar__title, .ar__date"),
    ...root.querySelectorAll(".ar__video:not([hidden]), .ar__body > *, .ar__gallery:not([hidden]) > figure, .ar__citations:not([hidden])"),
  ];
  targets.forEach((el) => {
    el.classList.add("ar-reveal");
    if (el.matches("figure, video, .ar__video") || el.querySelector("img")) el.classList.add("ar-reveal--media");
  });
  let batch = 0;
  let timer = 0;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // 同一次一起進入畫面的，一個接一個出現（每個間隔 0.12 秒，最多 0.6 秒）
        entry.target.style.transitionDelay = `${Math.min(batch, 5) * 0.12}s`;
        batch += 1;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
      clearTimeout(timer);
      timer = setTimeout(() => (batch = 0), 200);
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  targets.forEach((el) => io.observe(el));
}
