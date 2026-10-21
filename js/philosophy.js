/*
 * 首頁第四段品牌理念（css/philosophy.css）：
 * 捲到時大標與四個理念逐一浮現、墨線畫出來；滑鼠在卡片上移動時，卡片跟著游標微微傾斜。
 */
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".philo");
  if (!section) return;
  const items = [...section.querySelectorAll("[data-philo-item]")];
  const body = section.querySelector(".philo-stage");

  // 同時進入畫面的幾項，依序錯開一點時間出現
  let queue = 0;
  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .forEach((e) => {
          const delay = queue++ * 280;
          setTimeout(() => {
            e.target.classList.add("is-in");
            queue = Math.max(0, queue - 1);
          }, delay);
          observer.unobserve(e.target);
        });
    },
    { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
  );
  items.forEach((el) => observer.observe(el));

  new IntersectionObserver(
    (entries, obs) => {
      if (entries[0].isIntersecting) {
        body.classList.add("is-drawn");
        obs.disconnect();
      }
    },
    { threshold: 0.1 }
  ).observe(body);

  // 卡片跟著游標傾斜（觸控裝置與減少動態時不做）
  if (window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) {
    section.querySelectorAll(".philo-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
        card.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
      });
      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  // 連結還沒接頁面前，點了不要跳到頁首
  section.querySelectorAll('[data-philo-link][href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
});
