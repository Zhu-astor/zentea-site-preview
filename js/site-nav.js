/*
 * 固定功能列：切換樣式（?nav=clear 全透明／?nav=frost 20% 白底／購物頁 solid 實心白底）、捲動後加陰影、手機版選單開關。
 */
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("[data-site-nav]");
  if (!nav) return;

  // 購物車、結帳等頁面用實心白底（data-variant="solid"），不受 ?nav= 影響
  const variant =
    nav.dataset.variant === "solid" ? "solid" : new URLSearchParams(location.search).get("nav") || nav.dataset.variant || "clear";
  nav.classList.add({ frost: "site-nav--frost", solid: "site-nav--solid" }[variant] || "site-nav--clear");

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const button = nav.querySelector("[data-nav-toggle]");
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
  };
  button.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  nav.querySelectorAll(".site-nav__links a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));

  // 茶知識下拉選單：滑鼠移上去由 CSS 打開；觸控螢幕（平板）第一次點只打開選單，第二次才進入茶知識頁
  nav.querySelectorAll("[data-nav-menu]").forEach((item) => {
    const top = item.querySelector(":scope > a");
    const sync = () => top.setAttribute("aria-expanded", String(item.matches(":hover, :focus-within, .is-open")));
    ["mouseenter", "mouseleave", "focusin", "focusout"].forEach((ev) => item.addEventListener(ev, () => setTimeout(sync)));
    top.addEventListener("click", (e) => {
      const desktop = window.matchMedia("(min-width: 961px)").matches;
      if (desktop && window.matchMedia("(hover: none)").matches && !item.classList.contains("is-open")) {
        e.preventDefault();
        item.classList.add("is-open");
        sync();
      }
    });
    document.addEventListener("click", (e) => {
      if (!item.contains(e.target)) { item.classList.remove("is-open"); sync(); }
    });
  });

  // 在「全部文章」頁，目前篩選的分類在選單裡標成紅色
  const current = new URLSearchParams(location.search).get("category");
  if (current && /articles\.html$/.test(location.pathname)) {
    nav.querySelectorAll("[data-nav-category]").forEach((a) => a.classList.toggle("is-current", a.dataset.navCategory === current));
  }
});
