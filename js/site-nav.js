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
});
