/*
 * 首頁「找到適合自己的茶」互動測驗。
 * 三種開始方式（第一次認識／深入探索台灣茶／挑份茶禮），各三題，每題四個選項；
 * 每個選項替四款茶加分，最高分的就是推薦（同分時看第一題的選擇）。
 * 題目一題一題往下出現，選完按下一步才出現下一題；最後顯示推薦的茶。
 * 純前端，不需要後端；茶的連結指到商品頁 product.html?slug=…
 */
(function () {
  const TEAS = {
    "honey-black": {
      name: "蟬吃蜜香紅茶",
      tags: ["蜜香", "熟果", "溫潤"],
      mood: "溫潤・蜜甜",
      img: "assets/img/product-honey-black.png",
      caption: "小綠葉蟬咬過的嫩芽，\n轉出天然的蜜果香。",
      desc: "小綠葉蟬叮咬過的嫩芽，在發酵中轉出天然蜜香與熟果感。入口溫柔清甜、有茶感卻不厚重，配點心剛好，也很適合想換個心情的時候。",
    },
    gaba: {
      name: "蟬吃佳葉龍茶",
      tags: ["熟香", "溫潤", "沉穩"],
      mood: "沉穩・安定",
      img: "assets/img/product-gaba.png",
      caption: "厭氧發酵的熟香，\n喝起來有一種安定感。",
      desc: "以厭氧發酵製成的佳葉龍（GABA）茶，熟香溫潤、口感柔和厚實。不急不躁的味道，適合放鬆下來、飯後，或一天結束時慢慢喝。",
    },
    "fresh-oolong": {
      name: "蟬吃鮮翠烏龍茶",
      tags: ["清香", "甘潤", "回甘"],
      mood: "清爽・甘潤",
      img: "assets/img/product-fresh-oolong.png",
      caption: "輕發酵、中烘焙，\n清甜乾淨的一杯。",
      desc: "輕發酵、中烘焙，保留烏龍的清香與山林感。清甜甘醇、乾淨回甘，早晨清飲剛剛好，也是每天喝都不膩的一杯。",
    },
    "yushan-oolong": {
      name: "蟬吃玉山烏龍茶",
      tags: ["高山香", "清雅", "細緻"],
      mood: "清雅・高山",
      img: "assets/img/product-yushan-oolong.png",
      caption: "高山雲霧與日夜溫差，\n養出葉厚耐泡的茶。",
      desc: "玉山高海拔的雲霧與日夜溫差，養出葉厚耐泡的茶。高山香清雅，茶湯清透甘醇、口感細緻，適合靜下來細細品，也是有份量的茶禮。",
    },
  };

  // 每個選項：[文字, 圖示, {茶: 分數}]
  const PATHS = {
    first: {
      label: "第一次認識蟬吃茶",
      questions: [
        {
          step: "喜歡的味道",
          title: "你平常比較喜歡…",
          hint: "不用懂茶，選一個讓你心動的味道就好。",
          next: "接著，聊聊現在的你",
          options: [
            ["清爽淡雅", "leaf", { "fresh-oolong": 3, "yushan-oolong": 1 }],
            ["花香清亮", "flower", { "yushan-oolong": 3, "fresh-oolong": 1 }],
            ["溫厚醇甜", "cup", { "honey-black": 3, gaba: 1 }],
            ["焙火沉穩", "mountain", { gaba: 3, "honey-black": 1 }],
          ],
        },
        {
          step: "此刻的心情",
          title: "現在的你，想讓這杯茶陪你…",
          hint: "照著此刻的感覺選就好。",
          next: "最後，留一點時間給茶",
          options: [
            ["放鬆一下", "wave", { gaba: 2, "honey-black": 1 }],
            ["提振精神", "sun", { "fresh-oolong": 2, "yushan-oolong": 1 }],
            ["靜靜獨處", "moon", { "yushan-oolong": 2, gaba: 1 }],
            ["換個心情", "heart", { "honey-black": 2, "fresh-oolong": 1 }],
          ],
        },
        {
          step: "喝茶的片刻",
          title: "今天，你想怎麼享受這杯茶？",
          hint: "一杯茶，可以有不同的日常模樣。",
          options: [
            ["早晨清飲，慢慢開始", "wave", { "fresh-oolong": 2, "yushan-oolong": 1 }],
            ["午後配點心，歇一會兒", "sun", { "honey-black": 2, "fresh-oolong": 1 }],
            ["飯後喝一杯，收個尾", "moon", { gaba: 2, "yushan-oolong": 1 }],
            ["和人一起喝，聊聊天", "heart", { "yushan-oolong": 2, "honey-black": 1 }],
          ],
        },
      ],
    },
    explore: {
      label: "深入探索台灣茶",
      questions: [
        {
          step: "茶湯的顏色",
          title: "你想喝哪一種茶色？",
          hint: "茶色跟發酵程度有關，越紅潤發酵越深。",
          next: "接著，聊聊焙火",
          options: [
            ["清綠透亮", "leaf", { "fresh-oolong": 3, "yushan-oolong": 2 }],
            ["金黃蜜色", "flower", { "yushan-oolong": 2, gaba: 2 }],
            ["琥珀紅潤", "cup", { "honey-black": 3 }],
            ["都想試試", "star", { "honey-black": 1, gaba: 1, "fresh-oolong": 1, "yushan-oolong": 1 }],
          ],
        },
        {
          step: "焙火程度",
          title: "焙火的香氣，你偏好…",
          hint: "焙火越深，香氣越熟、越沉穩。",
          next: "最後，選一個你在意的",
          options: [
            ["不焙，保留清香", "wave", { "yushan-oolong": 2, "fresh-oolong": 1 }],
            ["輕焙，香氣圓潤", "sun", { "fresh-oolong": 2 }],
            ["中焙，熟香沉穩", "mountain", { gaba: 2, "honey-black": 1 }],
            ["沒有特別偏好", "star", { "honey-black": 1 }],
          ],
        },
        {
          step: "你在意的",
          title: "一杯台灣茶，你最想喝到…",
          hint: "選一個最吸引你的就好。",
          options: [
            ["高山雲霧的清冽", "mountain", { "yushan-oolong": 3 }],
            ["小綠葉蟬的蜜香", "flower", { "honey-black": 3 }],
            ["沉穩安定的感覺", "moon", { gaba: 3 }],
            ["每天喝也不膩", "leaf", { "fresh-oolong": 3 }],
          ],
        },
      ],
    },
    gift: {
      label: "為重要的人挑份茶禮",
      questions: [
        {
          step: "送給誰",
          title: "這份茶禮，想送給…",
          hint: "想著對方的樣子選就好。",
          next: "接著，說說場合",
          options: [
            ["長輩家人", "home", { gaba: 2, "yushan-oolong": 1 }],
            ["同事客戶", "people", { "yushan-oolong": 2, "fresh-oolong": 1 }],
            ["好朋友", "heart", { "honey-black": 2, "fresh-oolong": 1 }],
            ["懂茶的人", "leaf", { "yushan-oolong": 2, "honey-black": 1 }],
          ],
        },
        {
          step: "什麼場合",
          title: "是什麼樣的時候？",
          hint: "場合不同，適合的茶也不太一樣。",
          next: "最後，想留下的感覺",
          options: [
            ["年節送禮", "gift", { "yushan-oolong": 2, "honey-black": 1 }],
            ["生日、道謝", "star", { "honey-black": 2 }],
            ["拜訪、初次見面", "people", { "fresh-oolong": 2, "yushan-oolong": 1 }],
            ["想到就送", "sun", { "fresh-oolong": 2, "honey-black": 1 }],
          ],
        },
        {
          step: "想留下的感覺",
          title: "希望對方喝到時，感覺…",
          hint: "茶會替你把心意說出來。",
          options: [
            ["安心、自在", "moon", { gaba: 3 }],
            ["溫暖、貼心", "heart", { "honey-black": 3 }],
            ["有質感、有份量", "mountain", { "yushan-oolong": 3 }],
            ["輕鬆、好入口", "wave", { "fresh-oolong": 3 }],
          ],
        },
      ],
    },
  };

  const ICONS = {
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19c3-4 6-7 9-9"/>',
    flower: '<circle cx="12" cy="12" r="2.2"/><path d="M12 9.8c-1.6-3.6 1.6-5.8 2.4-2.6.8-3.2 4.4-1.4 2 1.6 3.4-.6 3.6 3.4.4 3.4 2.8 2 .4 5-2.2 3-.2 3.4-4.2 3.2-3.4-.2-2.6 2-5-1-2.2-3-3.2 0-3-4 .4-3.4-2.4-3 1.2-4.8 2.6-1.4z"/>',
    cup: '<path d="M4 10h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 3.5c-.8 1 .8 2 0 3M12 3.5c-.8 1 .8 2 0 3"/>',
    mountain: '<path d="M2 19l7-11 4 6 3-4 6 9z"/><path d="M7.5 10.5l1.5 1.5 1.5-1.5"/>',
    wave: '<path d="M3 9c3-3 6 3 9 0s6 3 9 0"/><path d="M3 15c3-3 6 3 9 0s6 3 9 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
    people: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9.5" r="2.4"/><path d="M3.5 19c.5-3.4 2.8-5.5 5.5-5.5s5 2.1 5.5 5.5"/><path d="M15 14.2c2.7-.6 5 1.2 5.5 4.3"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11"/><path d="M12 9c-2-4-6-4-6-1.5S10 9 12 9c2 0 6-.5 6-1.5S14 5 12 9z"/>',
  };
  const icon = (key) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[key] || ""}</svg>`;

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-quiz]");
    if (!root) return;
    const $ = (sel) => root.querySelector(sel);
    const stepsBox = $("[data-quiz-steps]");
    const resultBox = $("[data-quiz-result]");
    const dialog = $("[data-quiz-dialog]");
    let path = null;
    let answers = [];

    function el(tag, className, html) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (html !== undefined) node.innerHTML = html;
      return node;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function scrollToEl(node) {
      const top = node.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    }

    function start(key) {
      path = PATHS[key];
      answers = [];
      resultBox.hidden = true;
      root.querySelectorAll("[data-quiz-path]").forEach((b) => b.classList.toggle("is-active", b.dataset.quizPath === key));
      stepsBox.replaceChildren(...path.questions.map(renderQuestion));
      reveal(0);
    }

    function renderQuestion(q, index) {
      const total = path.questions.length;
      const box = el("section", "tq-step");
      box.hidden = true;
      box.dataset.index = index;
      const bars = Array.from({ length: total }, (_, i) => `<span class="${i <= index ? "is-on" : ""}"></span>`).join("");
      box.innerHTML = `
        <div class="tq-bars" aria-hidden="true">${bars}</div>
        <p class="tq-step__count">0${index + 1} / 0${total} ・ ${q.step}</p>
        <h3 class="tq-step__title">${q.title}</h3>
        <p class="tq-step__hint">${q.hint}</p>
        <div class="tq-options" role="radiogroup" aria-label="${q.title}"></div>
        <p class="tq-step__picked" aria-live="polite">慢慢選，照著你的喜歡就好。</p>
        <div class="tq-step__nav">
          ${index > 0 ? '<button type="button" class="tq-link" data-back>↑ 上一題</button>' : ""}
          <button type="button" class="tq-next" data-next disabled>${q.next || "看看適合我的茶"} <span aria-hidden="true">↓</span></button>
        </div>`;
      const options = box.querySelector(".tq-options");
      q.options.forEach(([label, iconKey], i) => {
        const b = el("button", label.length > 6 ? "tq-option is-long" : "tq-option", `${icon(iconKey)}<span>${label}</span>`);
        b.type = "button";
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", "false");
        b.addEventListener("click", () => choose(index, i, box));
        options.append(b);
      });
      box.querySelector("[data-next]").addEventListener("click", () =>
        index + 1 < total ? reveal(index + 1) : showResult()
      );
      const back = box.querySelector("[data-back]");
      if (back) back.addEventListener("click", () => scrollToEl(stepsBox.children[index - 1]));
      return box;
    }

    function choose(index, optionIndex, box) {
      answers[index] = optionIndex;
      answers.length = index + 1; // 改了前面的答案，後面重選
      box.querySelectorAll(".tq-option").forEach((b, i) => {
        b.classList.toggle("is-picked", i === optionIndex);
        b.setAttribute("aria-checked", String(i === optionIndex));
      });
      box.querySelector(".tq-step__picked").textContent = `已選擇「${path.questions[index].options[optionIndex][0]}」`;
      box.querySelector("[data-next]").disabled = false;
      // 往回改答案時，把後面已經出現的題目與結果收起來
      [...stepsBox.children].slice(index + 1).forEach((s) => {
        s.hidden = true;
        s.querySelectorAll(".tq-option").forEach((b) => {
          b.classList.remove("is-picked");
          b.setAttribute("aria-checked", "false");
        });
        s.querySelector("[data-next]").disabled = true;
        s.querySelector(".tq-step__picked").textContent = "慢慢選，照著你的喜歡就好。";
      });
      resultBox.hidden = true;
    }

    function reveal(index) {
      const box = stepsBox.children[index];
      box.hidden = false;
      box.classList.remove("is-in");
      requestAnimationFrame(() => box.classList.add("is-in"));
      scrollToEl(box);
    }

    const pathKey = () => Object.keys(PATHS).find((k) => PATHS[k] === path);

    function pickTea() {
      const score = {};
      Object.keys(TEAS).forEach((k) => (score[k] = 0));
      answers.forEach((opt, q) => {
        Object.entries(path.questions[q].options[opt][2]).forEach(([tea, n]) => (score[tea] += n));
      });
      const firstChoice = path.questions[0].options[answers[0]][2];
      return Object.keys(score).sort((a, b) => score[b] - score[a] || (firstChoice[b] || 0) - (firstChoice[a] || 0))[0];
    }

    function showResult() {
      const slug = pickTea();
      const tea = TEAS[slug];
      const picked = answers.map((opt, q) => path.questions[q].options[opt][0]);
      const intro = {
        first: `你喜歡「${picked[0]}」的味道，也想讓這杯茶陪你「${picked[1]}」。小蟬想推薦你試試${tea.name}。`,
        explore: `你想喝「${picked[0]}」的茶色，焙火偏好「${picked[1]}」，最想喝到「${picked[2]}」。小蟬想推薦你試試${tea.name}。`,
        gift: `想送給「${picked[0]}」，在「${picked[1]}」的時候，希望對方感覺${picked[2]}。小蟬想推薦你這份${tea.name}。`,
      }[pathKey()];
      const text = `${intro}${tea.desc}`;
      $("[data-r-mood]").textContent = tea.mood;
      $("[data-r-img]").src = tea.img;
      $("[data-r-img]").alt = tea.name;
      $("[data-r-caption]").textContent = tea.caption;
      $("[data-r-name]").textContent = tea.name;
      $("[data-r-tags]").textContent = tea.tags.join(" ・ ");
      $("[data-r-desc]").textContent = text;
      $("[data-r-picked]").textContent = picked.join(" ・ ");
      $("[data-d-name]").textContent = tea.name;
      $("[data-d-desc]").textContent = text;
      $("[data-d-link]").href = `product.html?slug=${encodeURIComponent(slug)}`;
      resultBox.hidden = false;
      resultBox.classList.remove("is-in");
      requestAnimationFrame(() => resultBox.classList.add("is-in"));
      scrollToEl(resultBox);
    }

    root.querySelectorAll("[data-quiz-path]").forEach((b) => b.addEventListener("click", () => start(b.dataset.quizPath)));
    $("[data-quiz-again]").addEventListener("click", () => {
      scrollToEl(root);
      setTimeout(() => start(pathKey()), reduceMotion ? 0 : 450);
    });
    $("[data-quiz-open]").addEventListener("click", () => dialog.showModal());
    dialog.querySelector("[data-quiz-close]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => e.target === dialog && dialog.close());
  });
})();
