/*
 * 選茶測驗（find-tea.html）。題目、選項、各茶分數與加權照
 * chan_tea_find_your_tea_v1_2_balanced.html（v1.2 balanced）：
 *   - 5 題：日常 15%、感覺 12%、喜好 43%、搭配 10%（可複選 2 個取平均）、泡法 20%
 *   - 每題可跳過；中立選項不計分；喜好題選「不知道」會出現補充題
 *   - 只用有作答的題目重新分配權重，換算成 0～100 分；新手、想探索另外微調
 *   - 推薦把握度＝作答涵蓋率 40%＋喜好題 40%＋第一、二名差距 20%
 * 結果頁另外加上：商品圖與描述（js/teas.js）、推薦理由、六款排序、沖泡建議、「了解更多」連到商品詳細頁。
 * 第一、二名差不到 5 分時，多問一題「日常方便／細緻品飲」決定先後。
 *
 * 注意：「感覺」題描述的是使用者想要的喝茶情境，結果頁不寫成茶的功效（食安法第 28 條）。
 */
(function () {
  const TEAS = window.ZENTEA_TEAS;
  // 測驗內部代號 → js/teas.js 的 key（也是商品詳細頁的 slug）
  const SLUG = {
    xian_cui: "fresh-oolong", tan_bei: "charcoal-oolong", mi_xiang: "honey-black",
    hong_yu: "ruby-black", gaba: "gaba", yu_shan: "yushan-oolong",
  };
  const TAGLINE = {
    xian_cui: "清甜・日常・方便", tan_bei: "焙香・溫暖・厚實", mi_xiang: "甜香・親和・好入口",
    hong_yu: "濃郁・個性・品飲", gaba: "柔和・舒服・耐喝", yu_shan: "花香・細緻・慢慢品",
  };
  const TEA_KEYS = ["xian_cui", "tan_bei", "mi_xiang", "hong_yu", "gaba", "yu_shan"];
  const W = { daily: 15, feeling: 12, flavor: 43, pairing: 10, brew: 20 };
  // 兩款很接近時的最後一題：偏日常方便，還是細緻品飲
  const EVERYDAY = new Set(["xian_cui", "mi_xiang", "gaba"]);

  const QS = [
    {
      key: "daily", step: "01 日常", title: "你平常會在什麼時候，把茶泡起來？", sub: "選最接近你日常的就好。", type: "single",
      options: [
        { id: "work", title: "工作／讀書時慢慢喝", desc: "手邊有杯茶，就能一路喝到事情做完。", scores: [5, 3, 3, 4, 4, 4.5] },
        { id: "meal", title: "吃完飯，想來杯茶", desc: "讓味道慢慢收回來，舒服結束一餐。", scores: [5, 4, 3, 3, 3, 4] },
        { id: "me_time", title: "留給自己的時間", desc: "下午或晚上，慢一點泡，也慢一點喝。", scores: [4, 3, 4, 4, 5, 4.5] },
        { id: "weekend", title: "週末有空，認真泡一壺", desc: "聞香、慢慢喝，也想感受茶的變化。", scores: [3, 4, 4, 5, 4, 5] },
        { id: "share", title: "和家人朋友一起喝", desc: "泡一壺放桌上，大家都可以喝。", scores: [4.5, 3, 5, 3, 4.5, 4] },
        { id: "neutral", title: "想到就泡，沒有固定時間", desc: "喝茶沒有固定情境。", status: "neutral" },
        { id: "beginner", title: "剛開始喝茶，還沒有習慣", desc: "希望先從容易開始的茶認識。", scores: [4.5, 3, 5, 2, 4.5, 4], beginner: true },
      ],
    },
    {
      key: "feeling", step: "02 感覺", title: "你希望喝這杯茶時，自己是什麼感覺？",
      sub: "選你最想靠近的感覺。這一題只作為推薦修正，不代表醫療、治療或保證效果。", type: "single",
      options: [
        { id: "relax", title: "放鬆、慢下來", desc: "想把節奏放慢，喝一杯比較柔和、安定的茶。", scores: [3.5, 3.5, 4, 3.5, 5, 4.5] },
        { id: "clear", title: "清爽、俐落", desc: "希望茶感乾淨、明亮，不要太厚重。", scores: [5, 2.5, 3, 4, 3.5, 5] },
        { id: "warm", title: "溫暖、安定", desc: "想要焙香、熟香或比較有包覆感的風味。", scores: [3, 5, 4.5, 4, 4, 2.5] },
        { id: "reward", title: "犒賞自己、心情好一點", desc: "想喝一款香氣討喜、甜潤、讓人有滿足感的茶。", scores: [3.5, 3.5, 5, 4.5, 4, 4] },
        { id: "immerse", title: "沉浸、慢慢感受", desc: "想把注意力放在香氣、層次與回甘上。", scores: [3.5, 4.5, 4, 5, 4.5, 5] },
        { id: "easy", title: "舒服就好，不想想太多", desc: "希望順口、耐喝，隨手泡也能陪著日常。", scores: [5, 3, 4.5, 3, 5, 4] },
        { id: "neutral", title: "沒有特別想要什麼感覺", desc: "這一層不影響推薦。", status: "neutral" },
      ],
    },
    {
      key: "flavor", step: "03 喜好", title: "如果這包茶要陪你喝一陣子，你比較不容易喝膩哪一種？", sub: "不用知道茶名，跟著你熟悉的味道選。", type: "single",
      options: [
        { id: "floral", title: "清新花香", desc: "像淡淡花香、山裡的風，乾淨輕盈。", scores: [4.5, 1, 2, 2, 3, 5] },
        { id: "sweet", title: "清甜回甘", desc: "入口清甜，喝完嘴裡還留著舒服的甜。", scores: [5, 3, 4, 3, 4.5, 4.5] },
        { id: "honey", title: "蜂蜜熟果", desc: "像蜂蜜、熟水果，自然甜潤。", scores: [2, 2, 5, 4.5, 3, 3] },
        { id: "roasted", title: "烘焙堅果", desc: "像烤堅果、穀物、炭火，溫暖沉穩。", scores: [2.5, 5, 2, 2, 2, 1] },
        { id: "bold", title: "濃郁有個性", desc: "香氣明顯、茶感飽滿，我喜歡一喝就記得住。", scores: [2, 4.5, 4, 5, 3, 3.5] },
        { id: "soft", title: "柔和順口", desc: "不追求很強烈，舒服、耐喝最重要。", scores: [4, 3, 4.5, 3, 5, 4] },
        { id: "explore", title: "我什麼都喝，想試點不一樣的", desc: "比起安全牌，我更想認識有辨識度的茶。", scores: [2.5, 4.5, 3.5, 5, 4.5, 4], explore: true },
        { id: "unknown", title: "我還不知道自己喜歡什麼", desc: "沒關係，我們可以換個簡單方式。", status: "unknown" },
      ],
      fallback: [
        { id: "fb_fresh", title: "花、青草、清新的空氣", scores: [5, 1, 2, 2, 3, 5] },
        { id: "fb_honey", title: "蜂蜜、熟水果", scores: [2, 2, 5, 4.5, 3, 3] },
        { id: "fb_nutty", title: "烤堅果、穀物", scores: [2.5, 5, 2, 2, 2, 1] },
        { id: "fb_deep", title: "深沉、濃郁的香氣", scores: [2, 4.5, 4, 5, 3, 3.5] },
        { id: "fb_soft", title: "不要太強，順口最好", scores: [4, 3, 4.5, 3, 5, 4] },
        { id: "fb_beginner", title: "真的不知道，幫我選好入門的", status: "beginner_default", beginner: true },
      ],
    },
    {
      key: "pairing", step: "04 搭配", title: "在家喝茶時，通常會和什麼一起？", sub: "可以選 1～2 個；沒有固定也沒關係。", type: "multi", max: 2,
      options: [
        { id: "solo", title: "茶本身就是主角", desc: "大多時候不配東西，只想好好喝茶。", scores: [4, 4, 4, 5, 4, 5] },
        { id: "bread", title: "早餐／麵包", desc: "吐司、可頌、麵包，偶爾一起吃早餐。", scores: [3, 5, 5, 4, 3, 3] },
        { id: "dessert", title: "甜點／餅乾", desc: "下午嘴饞時，會一起吃點甜的。", scores: [3, 4, 5, 5, 3, 3] },
        { id: "meal", title: "正餐", desc: "吃飯時或飯後，會一起喝。", scores: [5, 5, 3, 4, 3, 4] },
        { id: "fruit", title: "水果／清爽小點", desc: "水果、果乾或比較清爽的點心。", scores: [5, 2, 4, 3, 3, 5] },
        { id: "neutral", title: "看家裡有什麼，沒有固定", desc: "搭配不是我選茶的重點。", status: "neutral" },
      ],
    },
    {
      key: "brew", step: "05 泡法", title: "最後，在家你通常怎麼泡茶？", sub: "沒有標準答案，選你真的會用的方式。", type: "single",
      options: [
        { id: "cup", title: "杯子一放，直接泡", desc: "馬克杯、玻璃杯，簡單就好。", scores: [5, 4, 5, 3, 5, 4] },
        { id: "gongfu", title: "茶壺／蓋碗慢慢泡", desc: "願意多花一點時間，把茶泡開。", scores: [4, 5, 4, 5, 4, 5] },
        { id: "cold", title: "冷泡", desc: "放冰箱，隔天慢慢喝。", scores: [5, 2, 4, 3, 4, 5] },
        { id: "thermos", title: "保溫瓶／大杯泡著喝", desc: "希望一次泡比較多，帶著走。", scores: [4.5, 3, 4, 2, 5, 3] },
        { id: "neutral", title: "各種方式都會", desc: "泡法不會限制我的選擇。", status: "neutral" },
        { id: "beginner", title: "我還不太會泡茶", desc: "希望先從容易上手的開始。", scores: [5, 3, 5, 2, 5, 4], beginner: true },
      ],
    },
  ];
  const TAG = {
    work: "日常耐喝", meal: "飯後清爽", me_time: "留給自己的時間", weekend: "慢慢品茶", share: "適合分享", beginner: "容易開始",
    relax: "想放慢步調", clear: "想要清爽", warm: "想要溫暖", reward: "犒賞自己", immerse: "沉浸品茶", easy: "舒服耐喝",
    floral: "清新花香", sweet: "清甜回甘", honey: "蜂蜜熟果", roasted: "烘焙堅果", bold: "濃郁有個性", soft: "柔和順口", explore: "想探索不同風味",
    fb_fresh: "清新花草", fb_honey: "蜂蜜熟果", fb_nutty: "烤堅果穀物", fb_deep: "深沉濃郁", fb_soft: "順口最好",
    cup: "簡單杯泡", gongfu: "茶壺慢泡", cold: "冷泡", thermos: "大杯久泡",
    solo: "只喝茶", bread: "早餐麵包", dessert: "甜點搭配", fruit: "清爽小點",
  };

  let idx = 0;
  let answers = {};
  let pairing = [];
  let fallbackShown = false;

  const $ = (sel) => document.querySelector(sel);
  function el(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // ---------- 作答 ----------
  function start() {
    $("[data-ft-result]").hidden = true;
    $("[data-ft-quiz]").hidden = false;
    idx = 0; answers = {}; pairing = []; fallbackShown = false;
    render();
  }

  function render() {
    const prog = $("[data-ft-progress]");
    prog.replaceChildren(...QS.map((_, i) => el("span", i <= Math.min(idx, 4) ? "is-on" : "")));
    const q = QS[idx];
    const fb = fallbackShown;
    const box = $("[data-ft-question]");
    box.replaceChildren();
    box.append(
      el("p", "ft-step", fb ? "03.5 喜好補充" : q.step),
      el("h2", "ft-h2", fb ? "沒關係，換個簡單的方式。" : q.title),
      el("p", "ft-sub", fb ? "哪一組味道聞起來，你比較想靠近？" : q.sub)
    );
    const opts = el("div", "ft-options");
    (fb ? q.fallback : q.options).forEach((o) => {
      const b = el("button", "ft-option");
      b.type = "button";
      if (q.type === "multi" && pairing.includes(o.id)) b.classList.add("is-selected");
      b.append(el("span", "ft-option__title", o.title));
      if (o.desc) b.append(el("span", "ft-option__desc", o.desc));
      b.addEventListener("click", () => choose(q, o));
      opts.append(b);
    });
    box.append(opts);
    const actions = el("div", "ft-actions");
    if (idx > 0 || fb) {
      const back = el("button", "ft-btn ft-btn--ghost", "上一步");
      back.type = "button";
      back.addEventListener("click", () => {
        if (fallbackShown) fallbackShown = false;
        else idx = Math.max(0, idx - 1);
        render();
      });
      actions.append(back);
    } else actions.append(el("span"));
    if (q.type === "multi") {
      const next = el("button", "ft-btn", "下一步");
      next.type = "button";
      next.addEventListener("click", nextFromMulti);
      actions.append(next);
    }
    box.append(actions);
    const skip = el("button", "ft-skip", "先跳過這題 →");
    skip.type = "button";
    skip.addEventListener("click", () => {
      answers[q.key] = { status: "skip" };
      advance();
    });
    box.append(skip);
  }

  function choose(q, o) {
    if (q.type === "multi") {
      if (o.status === "neutral") {
        pairing = [];
        answers[q.key] = { status: "neutral" };
        return advance();
      }
      const i = pairing.indexOf(o.id);
      if (i >= 0) pairing.splice(i, 1);
      else {
        if (pairing.length >= q.max) pairing.shift();
        pairing.push(o.id);
      }
      return render();
    }
    if (o.status === "unknown") {
      answers[q.key] = { status: "unknown" };
      fallbackShown = true;
      return render();
    }
    if (o.status === "beginner_default") answers[q.key] = { status: "beginner_default", beginner: true };
    else if (o.status === "neutral") answers[q.key] = { status: "neutral" };
    else answers[q.key] = { status: "normal", scores: o.scores, id: o.id, title: o.title, beginner: !!o.beginner, explore: !!o.explore };
    advance();
  }

  function nextFromMulti() {
    const q = QS[idx];
    if (!pairing.length) answers[q.key] = { status: "skip" };
    else {
      const picked = q.options.filter((o) => pairing.includes(o.id));
      const avg = TEA_KEYS.map((_, i) => picked.reduce((s, o) => s + o.scores[i], 0) / picked.length);
      answers[q.key] = { status: "normal", scores: avg, ids: pairing.slice(), title: picked.map((o) => o.title).join("、") };
    }
    advance();
  }

  function advance() {
    fallbackShown = false;
    idx++;
    if (idx >= QS.length) showResult();
    else render();
    scrollTop();
  }

  // ---------- 計分（照 v1.2 balanced） ----------
  function calc() {
    let activeTotal = 0;
    const active = {};
    let beginnerCount = 0;
    let explore = false;
    QS.forEach((q) => {
      const a = answers[q.key];
      if (!a) return;
      if (a.beginner) beginnerCount++;
      if (a.explore) explore = true;
      if (a.status === "normal") {
        active[q.key] = a.scores;
        activeTotal += W[q.key];
      }
    });
    if (answers.flavor && answers.flavor.status === "beginner_default") beginnerCount++;

    const scores = {};
    TEA_KEYS.forEach((k, ti) => {
      let s = 50;
      if (activeTotal > 0) {
        s = 0;
        Object.keys(active).forEach((key) => (s += active[key][ti] * (W[key] / activeTotal)));
        s = (s / 5) * 100;
      }
      if (beginnerCount >= 2) s += { xian_cui: 4, tan_bei: 0, mi_xiang: 4, hong_yu: -3, gaba: 3, yu_shan: 1 }[k];
      if (explore) s += { xian_cui: 0, tan_bei: 2, mi_xiang: 1, hong_yu: 2, gaba: 2, yu_shan: 1 }[k];
      scores[k] = Math.max(0, Math.min(100, s));
    });
    const arr = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const margin = arr[0][1] - arr[1][1];
    const coverage = activeTotal / 100;
    const flavorConf = answers.flavor?.status === "normal" ? 1 : answers.flavor?.status === "beginner_default" ? 0.4 : 0;
    const marginConf = margin >= 10 ? 1 : margin >= 6 ? 0.8 : margin >= 3 ? 0.6 : 0.3;
    const confidence = coverage * 0.4 + flavorConf * 0.4 + marginConf * 0.2;
    return { scores, arr, margin, confidence, beginnerCount, explore };
  }

  const tone = (c) => (c >= 0.8 ? "高信心推薦" : c >= 0.6 ? "很適合你的選擇" : "先從這款開始");

  // 推薦理由：哪幾題的答案替這款茶加了最多分（分數 × 該題權重）
  function reasonsFor(key) {
    const ti = TEA_KEYS.indexOf(key);
    return QS.map((q) => ({ q, a: answers[q.key] }))
      .filter(({ a }) => a && a.status === "normal")
      .map(({ q, a }) => ({ step: q.step.replace(/^\d+\s*/, ""), title: a.title, score: a.scores[ti], weight: W[q.key] }))
      .filter((r) => r.score >= 4)
      .sort((x, y) => y.score * y.weight - x.score * x.weight)
      .slice(0, 3);
  }

  function tags() {
    const out = [];
    ["daily", "feeling", "flavor", "brew"].forEach((k) => {
      const id = answers[k]?.id;
      if (id && TAG[id]) out.push(TAG[id]);
    });
    (answers.pairing?.ids || []).forEach((id) => TAG[id] && out.push(TAG[id]));
    return out.slice(0, 4);
  }

  const detailUrl = (key) => `product.html?slug=${encodeURIComponent(SLUG[key])}`;

  function teaImage(key, className) {
    const tea = TEAS[SLUG[key]];
    const wrap = el("div", className);
    if (tea.img) {
      const img = el("img");
      img.src = tea.img;
      img.alt = tea.name;
      img.loading = "lazy";
      wrap.append(img);
    } else wrap.append(el("span", "ft-glyph", tea.glyph));
    if (tea.soon) wrap.append(el("span", "ft-soon", "即將上架"));
    return wrap;
  }

  function moreLink(key, label) {
    const a = el("a", "ft-more", label || "了解更多 →");
    a.href = detailUrl(key);
    return a;
  }

  // ---------- 結果：一個畫面看完，只放重點；細節在商品詳細頁 ----------
  function showResult(order) {
    const d = calc();
    const ranked = order || d.arr.map(([k]) => k);
    const close = d.margin < 5 && !order;
    const [topKey, secondKey] = ranked;
    const top = TEAS[SLUG[topKey]];
    const second = TEAS[SLUG[secondKey]];
    const score = (k) => Math.round(d.scores[k]);

    $("[data-ft-quiz]").hidden = true;
    document.body.classList.add("ft-done");
    const r = $("[data-ft-result]");
    r.hidden = false;
    r.replaceChildren();

    const card = el("section", "ft-card ft-one");
    card.append(teaImage(topKey, "ft-one__media"));
    const body = el("div", "ft-one__body");
    body.append(
      el("p", "ft-match", tone(d.confidence) + (d.confidence >= 0.8 ? `・${score(topKey)}% Match` : "")),
      el("h1", "ft-tea", top.name),
      el("p", "ft-tagline", TAGLINE[topKey])
    );
    // 小分頁：為什麼推薦／茶的特色／怎麼泡（同一時間只顯示一項，畫面不會被撐長）
    const reasons = reasonsFor(topKey);
    const whyList = el("ul", "ft-list");
    if (reasons.length) {
      reasons.forEach((x) => {
        const li = el("li");
        li.append(el("strong", "", `${x.step}「${x.title}」`), ` ${top.short}在這一項 ${x.score} / 5`);
        whyList.append(li);
      });
    } else whyList.append(el("li", "", "你跳過了大部分題目，先推薦最容易開始、多數人都喝得順的一款。"));
    const whyPanel = el("div");
    whyPanel.append(whyList);
    const chips = el("div", "ft-chips");
    tags().slice(0, 4).forEach((t) => chips.append(el("span", "ft-chip", t)));
    if (chips.childElementCount) whyPanel.append(chips);

    const descPanel = el("div");
    descPanel.append(el("p", "ft-panel__p", top.summary));
    const flavor = el("p", "ft-panel__p ft-panel__meta");
    flavor.append(el("strong", "", "香氣　"), top.aroma, el("br"), el("strong", "", "口感　"), top.taste);
    descPanel.append(flavor);

    const cold = answers.brew?.id === "cold";
    const brewPanel = el("div");
    const brewList = el("ul", "ft-list");
    [[cold ? "推薦冷泡" : "推薦熱泡", cold ? top.brew.cold : top.brew.hot], [cold ? "也可以熱泡" : "也可以冷泡", cold ? top.brew.hot : top.brew.cold]]
      .forEach(([label, text]) => {
        const li = el("li");
        li.append(el("strong", "", label + "　"), text.replace(/^(熱泡|冷泡)：/, ""));
        brewList.append(li);
      });
    brewPanel.append(brewList);

    const tabs = el("div", "ft-tabs");
    const tabBar = el("div", "ft-tabs__bar");
    tabBar.setAttribute("role", "tablist");
    const panelBox = el("div", "ft-tabs__panel");
    const panels = [["為什麼推薦", whyPanel], ["茶的特色", descPanel], ["怎麼泡", brewPanel]];
    function openTab(i) {
      tabBar.querySelectorAll("button").forEach((b, k) => {
        b.classList.toggle("is-on", k === i);
        b.setAttribute("aria-selected", String(k === i));
      });
      panelBox.replaceChildren(panels[i][1]);
      panelBox.classList.remove("is-in");
      requestAnimationFrame(() => panelBox.classList.add("is-in"));
    }
    panels.forEach(([label], i) => {
      const b = el("button", "ft-tabs__btn", label);
      b.type = "button";
      b.setAttribute("role", "tab");
      b.addEventListener("click", () => openTab(i));
      tabBar.append(b);
    });
    tabs.append(tabBar, panelBox);
    body.append(tabs);
    openTab(0);

    if (close) {
      const tie = el("div", "ft-tie1");
      tie.append(el("span", "", `${top.short}和${second.short}很接近，你比較想要：`));
      [["日常方便", true], ["細緻品飲", false]].forEach(([label, everyday]) => {
        const b = el("button", "ft-tie1__btn", label);
        b.type = "button";
        b.addEventListener("click", () => {
          const pick = [topKey, secondKey].find((k) => EVERYDAY.has(k) === everyday) || topKey;
          showResult([pick, ...ranked.filter((k) => k !== pick)]);
        });
        tie.append(b);
      });
      body.append(tie);
    }

    const actions = el("div", "ft-result__actions");
    const detail = el("a", "ft-btn", "了解更多 →");
    detail.href = detailUrl(topKey);
    const again = el("button", "ft-btn ft-btn--ghost", "再測一次");
    again.type = "button";
    again.addEventListener("click", () => {
      document.body.classList.remove("ft-done");
      start();
    });
    actions.append(detail, again);
    body.append(actions);

    // 第二推薦：一列
    const alt = el("a", "ft-alt1");
    alt.href = detailUrl(secondKey);
    alt.append(teaImage(secondKey, "ft-alt1__thumb"));
    const altText = el("span", "ft-alt1__text");
    altText.append(el("span", "ft-alt1__label", "第二推薦"), el("span", "ft-alt1__name", `${second.name}・${score(secondKey)} 分`));
    alt.append(altText, el("span", "ft-alt1__more", "了解更多 →"));
    body.append(alt);

    // 六款分數：一排小標籤
    const rank = el("div", "ft-rank1");
    rank.append(el("span", "ft-rank1__label", "相似度"));
    ranked.forEach((k) => {
      const a = el("a", "ft-rank1__item");
      a.href = detailUrl(k);
      a.append(el("span", "", TEAS[SLUG[k]].short), el("strong", "", String(score(k))));
      rank.append(a);
    });
    body.append(rank);
    body.append(el("p", "ft-fine", "依你的答案與各款茶的香氣、焙火、茶湯厚度比對相似度；「感覺」題是喝茶情境，不代表茶的功效。"));

    card.append(body);
    r.append(card);
    scrollTop();
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!TEAS) return;
    start(); // 一進來就是第一題，不另外放介紹頁
  });
})();
