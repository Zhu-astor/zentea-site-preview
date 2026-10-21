/*
 * 首頁「找到適合自己的茶」互動測驗。
 * 三種開始方式（第一次認識／深入探索台灣茶／挑份茶禮），每個選項替幾款茶加分，
 * 結果給主推一款＋備選一款，各附推薦理由，另有沖泡建議與配茶文章。
 * 題目與加分的依據見 /srv/storage/projects/reports/蟬吃茶選茶測驗依據.md：
 *   - 香氣題對應茶改場風味輪的五大香調（青香、花香、果香、甜香、焙香），用食物來比喻
 *   - 苦澀接受度是台灣消費者偏好最好的預測因子（取代原本沒有依據的「心情」題）
 *   - 點心題只當輔助題，依蟬茶誌〈點心配哪杯茶？先比重量，再找香氣〉的對照表
 *   - 茶色用茶改場的水色用語；每題都有不計分的「還不確定」
 *   - 「什麼時候喝」不計分，只決定結果頁先給熱泡還是冷泡建議
 * 同分時先看 tie 指定的那一題（證據最強的題），再依新手友善順序 NOVICE_ORDER。
 * 純前端，不需要後端；茶的連結指到商品頁 product.html?slug=…
 */
(function () {
  const TEAS = window.ZENTEA_TEAS; // js/teas.js
  const NOVICE_ORDER = ["yushan-oolong", "fresh-oolong", "gaba", "honey-black", "charcoal-oolong", "ruby-black"];
  const UNSURE = ["還不確定", "star", {}];
  const PAIRING_ARTICLES = [
    ["點心配哪杯茶？先比重量，再找香氣", "茶與點心搭配_先比重量再找香氣"],
    ["今天吃什麼？配一杯對的茶", "茶與餐食搭配_三餐配茶地圖"],
  ];

  // 每個選項：[文字, 圖示, {茶: 分數}, 沖泡方式]；題目 scored: false 的不計分（只影響沖泡建議）
  const PATHS = {
    first: {
      label: "第一次認識蟬吃茶",
      tie: 0,
      questions: [
        {
          step: "喜歡的香氣",
          title: "這幾種香氣，你最喜歡哪一種？",
          hint: "想想平常吃的東西就好，不用懂茶。",
          next: "接著，聊聊苦跟澀",
          options: [
            ["青草、黃瓜般的清爽", "leaf", { "fresh-oolong": 3, "yushan-oolong": 1 }],
            ["梔子花、桂花般的花香", "flower", { "yushan-oolong": 3, "fresh-oolong": 1 }],
            ["蜂蜜、熟芒果般的甜香", "cup", { "honey-black": 3, gaba: 2 }],
            ["烤地瓜、焦糖般的焙香", "mountain", { "charcoal-oolong": 3, gaba: 1 }],
            ["肉桂、薄荷般的特別香", "sun", { "ruby-black": 3, "honey-black": 1 }],
          ],
        },
        {
          step: "苦與澀",
          title: "黑咖啡、黑巧克力這類帶苦的味道，你覺得…",
          hint: "能接受多少苦澀，最能看出你適合哪一類茶。",
          next: "接著，聊聊配什麼吃",
          options: [
            ["不太喜歡，順口最好", "wave", { gaba: 3, "honey-black": 1, "yushan-oolong": 1 }],
            ["偶爾可以，不要太重", "leaf", { "fresh-oolong": 2, "yushan-oolong": 2, "honey-black": 1 }],
            ["很喜歡那種濃厚感", "mountain", { "charcoal-oolong": 3, "ruby-black": 3 }],
            UNSURE,
          ],
        },
        {
          step: "配什麼吃",
          title: "喝茶的時候，你常配…",
          hint: "點心有多厚，茶就要有多厚。",
          next: "最後，什麼時候喝",
          options: [
            ["鳳梨酥、蛋糕、餅乾", "cup", { "honey-black": 2, "ruby-black": 2 }],
            ["綠豆椪、太陽餅、蛋黃酥", "mountain", { "charcoal-oolong": 3, gaba: 1 }],
            ["豆花、麻糬、水果", "flower", { "fresh-oolong": 2, "yushan-oolong": 2 }],
            ["瓜子、花生、鹹酥雞", "sun", { "fresh-oolong": 2, "charcoal-oolong": 1 }],
            ["什麼都不配，單喝", "leaf", { "yushan-oolong": 2, "fresh-oolong": 1 }],
          ],
        },
        {
          step: "什麼時候喝",
          title: "你最常在什麼時候喝茶？",
          hint: "這題不影響推薦，只用來決定怎麼泡比較適合。",
          scored: false,
          options: [
            ["早上，慢慢開始", "sun", {}, "hot"],
            ["午後，歇一會兒", "cup", {}, "hot"],
            ["晚上，想放鬆", "moon", {}, "cold"],
            ["天熱時，想喝冰的", "wave", {}, "cold"],
          ],
        },
      ],
    },
    explore: {
      label: "深入探索台灣茶",
      tie: 2,
      questions: [
        {
          step: "茶湯的顏色",
          title: "你想喝哪一種茶色？",
          hint: "用的是評茶時描述水色的說法：發酵越深，顏色越紅。",
          next: "接著，聊聊製程",
          options: [
            ["蜜綠，清透帶黃綠", "leaf", { "fresh-oolong": 3, "yushan-oolong": 2 }],
            ["金黃，明亮如蜜", "flower", { "yushan-oolong": 2, gaba: 2, "fresh-oolong": 1 }],
            ["琥珀，焙過的深金", "mountain", { "charcoal-oolong": 3, gaba: 1 }],
            ["橙紅、紅亮", "cup", { "honey-black": 3, "ruby-black": 3 }],
            UNSURE,
          ],
        },
        {
          step: "製程與焙火",
          title: "製茶的方式，你偏好…",
          hint: "烏龍茶看焙火深淺；紅茶是全發酵，香氣來自發酵本身。",
          next: "最後，選一個你最想喝到的",
          options: [
            ["輕焙，留住清香", "wave", { "yushan-oolong": 3, "fresh-oolong": 1 }],
            ["中焙，香氣圓潤", "sun", { "fresh-oolong": 3, gaba: 1 }],
            ["炭焙，溫潤炭香", "mountain", { "charcoal-oolong": 3 }],
            ["全發酵的紅茶", "cup", { "honey-black": 2, "ruby-black": 2 }],
            UNSURE,
          ],
        },
        {
          step: "最想喝到",
          title: "一杯台灣茶，你最想喝到…",
          hint: "選一個最吸引你的就好。",
          options: [
            ["高山茶的清幽花香", "mountain", { "yushan-oolong": 3 }],
            ["清甜甘醇的日常烏龍", "leaf", { "fresh-oolong": 3 }],
            ["龍眼木炭焙的炭香", "sun", { "charcoal-oolong": 3 }],
            ["小綠葉蟬的蜜香", "flower", { "honey-black": 3, gaba: 1 }],
            ["厭氧發酵的熟果香", "moon", { gaba: 3 }],
            ["肉桂薄荷的台灣香", "heart", { "ruby-black": 3 }],
            UNSURE,
          ],
        },
      ],
    },
    gift: {
      label: "為重要的人挑份茶禮",
      tie: 1,
      questions: [
        {
          step: "送給誰",
          title: "這份茶禮，想送給…",
          hint: "想著對方的樣子選就好。",
          next: "接著，對方平常怎麼喝",
          options: [
            ["長輩家人", "home", { "charcoal-oolong": 1, gaba: 1 }],
            ["同事客戶", "people", { "yushan-oolong": 1, "fresh-oolong": 1 }],
            ["好朋友", "heart", { "honey-black": 1, "ruby-black": 1 }],
            ["懂茶的人", "leaf", { "ruby-black": 1, "yushan-oolong": 1, "charcoal-oolong": 1 }],
          ],
        },
        {
          step: "對方的口味",
          title: "對方平常喝茶，比較喜歡…",
          hint: "送茶最重要的是對方愛喝；不清楚也沒關係。",
          next: "最後，想留下的感覺",
          options: [
            ["清香、不要太重", "flower", { "fresh-oolong": 3, "yushan-oolong": 2 }],
            ["老派的焙火茶", "mountain", { "charcoal-oolong": 3, gaba: 1 }],
            ["紅茶、奶茶", "cup", { "honey-black": 3, "ruby-black": 2 }],
            ["新奇、特別的味道", "star", { "ruby-black": 3, gaba: 3 }],
            ["不太清楚", "people", { "yushan-oolong": 2, "fresh-oolong": 1 }],
          ],
        },
        {
          step: "想留下的感覺",
          title: "希望對方喝到時，感覺…",
          hint: "茶會替你把心意說出來。",
          options: [
            ["安心、自在", "moon", { gaba: 1, "charcoal-oolong": 1 }],
            ["溫暖、貼心", "heart", { "honey-black": 1, "charcoal-oolong": 1 }],
            ["有質感、有份量", "mountain", { "yushan-oolong": 1, "ruby-black": 1 }],
            ["輕鬆、好入口", "wave", { "fresh-oolong": 1, "honey-black": 1 }],
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

    // 依分數排好的茶；同分先看 path.tie 那一題，再看新手友善順序
    function rankTeas() {
      const score = {};
      Object.keys(TEAS).forEach((k) => (score[k] = 0));
      answers.forEach((opt, q) => {
        if (path.questions[q].scored === false) return;
        Object.entries(path.questions[q].options[opt][2]).forEach(([tea, n]) => (score[tea] += n));
      });
      const tieChoice = path.questions[path.tie].options[answers[path.tie]][2];
      return Object.keys(score).sort(
        (a, b) =>
          score[b] - score[a] ||
          (tieChoice[b] || 0) - (tieChoice[a] || 0) ||
          NOVICE_ORDER.indexOf(a) - NOVICE_ORDER.indexOf(b)
      );
    }

    // 推薦理由：引用替這款茶加最多分的兩個答案
    function reasonFor(slug) {
      const hits = answers
        .map((opt, q) => [path.questions[q], path.questions[q].options[opt]])
        .filter(([q, o]) => q.scored !== false && (o[2][slug] || 0) > 0)
        .sort((a, b) => b[1][2][slug] - a[1][2][slug])
        .slice(0, 2)
        .map(([, o]) => `「${o[0]}」`);
      return hits.length ? `你選了${hits.join("、")}，` : "";
    }

    // 「什麼時候喝」選晚上或天熱 → 先給冷泡建議
    function brewTips(tea) {
      const cold = answers.some((opt, q) => path.questions[q].options[opt][3] === "cold");
      return cold ? [tea.brew.cold, tea.brew.hot] : [tea.brew.hot, tea.brew.cold];
    }

    function showResult() {
      const [slug, altSlug] = rankTeas();
      const tea = TEAS[slug];
      const alt = TEAS[altSlug];
      const picked = answers.map((opt, q) => path.questions[q].options[opt][0]);
      const lead = pathKey() === "gift" ? "小蟬想推薦你這份" : "小蟬想推薦你試試";
      $("[data-r-mood]").textContent = tea.mood;
      const img = $("[data-r-img]");
      img.hidden = !tea.img;
      if (tea.img) {
        img.src = tea.img;
        img.alt = tea.name;
      }
      $("[data-r-glyph]").hidden = !!tea.img;
      $("[data-r-glyph]").textContent = tea.glyph;
      $("[data-r-caption]").textContent = tea.caption;
      $("[data-r-name]").textContent = tea.name;
      $("[data-r-tags]").textContent = tea.tags.join(" ・ ");
      $("[data-r-desc]").textContent = `${reasonFor(slug)}${lead}${tea.name}。${tea.summary}`;
      $("[data-r-picked]").textContent = picked.join(" ・ ");

      $("[data-r-brew]").replaceChildren(...brewTips(tea).map((t) => el("li", "", t)));

      $("[data-alt-name]").textContent = alt.name;
      $("[data-alt-why]").textContent = `${reasonFor(altSlug) || "換個方向的話，"}也可以試試這款：${alt.tags.join("、")}。`;
      const altLink = $("[data-alt-link]");
      altLink.href = alt.shop ? `product.html?slug=${encodeURIComponent(alt.shop)}` : "#know-tea";
      altLink.textContent = alt.shop ? "到蟬茶鋪看看 →" : "認識這款茶 →";

      $("[data-r-reads]").replaceChildren(
        ...PAIRING_ARTICLES.map(([title, s]) => {
          const li = el("li");
          const a = el("a", "", title);
          a.href = `article.html?slug=${encodeURIComponent(s)}`;
          li.append(a);
          return li;
        })
      );

      const fb = $("[data-r-feedback]");
      fb.querySelectorAll("button").forEach((b) => (b.disabled = false));
      fb.querySelector("[data-fb-thanks]").hidden = true;

      $("[data-d-name]").textContent = tea.name;
      $("[data-d-meta]").textContent = `${tea.origin}　${tea.process}`;
      $("[data-d-desc]").replaceChildren(...tea.story.map((t) => Object.assign(document.createElement("p"), { textContent: t })));
      const link = $("[data-d-link]");
      link.hidden = !tea.shop;
      if (tea.shop) link.href = `product.html?slug=${encodeURIComponent(tea.shop)}`;
      $("[data-d-soon]").hidden = !!tea.shop;
      resultBox.dataset.tea = slug;
      resultBox.hidden = false;
      resultBox.classList.remove("is-in");
      requestAnimationFrame(() => resultBox.classList.add("is-in"));
      scrollToEl(resultBox);
    }

    // 👍／👎：目前先記在這台瀏覽器，之後接後台統計推薦準不準
    $("[data-r-feedback]").querySelectorAll("[data-fb]").forEach((b) =>
      b.addEventListener("click", () => {
        const fb = $("[data-r-feedback]");
        fb.querySelectorAll("button").forEach((x) => (x.disabled = true));
        fb.querySelector("[data-fb-thanks]").hidden = false;
        try {
          const log = JSON.parse(localStorage.getItem("zentea-quiz-feedback") || "[]");
          log.push({ path: pathKey(), answers: [...answers], tea: resultBox.dataset.tea, vote: b.dataset.fb, at: Date.now() });
          localStorage.setItem("zentea-quiz-feedback", JSON.stringify(log.slice(-50)));
        } catch (e) {
          /* 無痕模式等存不了就算了 */
        }
      })
    );

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
