/*
 * 蟬吃茶六款茶的介紹資料，首頁「找到適合自己的茶」測驗與「認識茶」共用。
 * 內容依品牌提供的茶品說明整理，「多知道一點」是補充的製茶背景知識。
 * shop：商品詳細頁的 slug（product.html?slug=…），六款都有詳細頁。
 * soon：還沒開賣的茶填 true，卡片與測驗結果會標「即將上架」（詳細頁照常可以看）。
 * brew：熱泡／冷泡建議，測驗結果頁用。
 * img：商品圖；還沒有照片的茶填 null，畫面上改用茶名的字樣代替。
 * en：英文版用的製程、香氣、口感、簡介（茶名保留中文）。
 *
 * 注意：食品不能宣稱醫療或保健功效（食安法第 28 條），佳葉龍的文字只描述成分與品牌暱稱，修改時請留意。
 */
window.ZENTEA_TEAS = {
  "fresh-oolong": {
    name: "蟬吃鮮翠烏龍茶",
    short: "鮮翠烏龍",
    glyph: "鮮",
    shop: "fresh-oolong",
    img: "assets/img/product-fresh-oolong.png",
    tags: ["清香", "清甜", "甘醇"],
    brew: { hot: "熱泡：95°C 熱水，3 克配 150 毫升，第一泡約 50 秒。", cold: "冷泡：10 克配 1 公升冷水，冷藏 6–8 小時。" },
    mood: "清爽・甘醇",
    origin: "南投山上・契作自然生態茶園",
    process: "輕發酵・中烘焙",
    aroma: "清香、烏龍香、山林感",
    taste: "清甜甘醇、乾淨回甘",
    caption: "輕發酵留住清香，\n中烘焙讓底蘊更穩。",
    summary: "契作農場自己做的南投山上烏龍茶。輕發酵留住清香，中烘焙讓底蘊更好、不生冷，喝起來清甜甘醇。",
    story: [
      "這是我們契作農場自己做的茶，來自南投山上的自然生態茶園。",
      "用輕發酵、中烘焙製成：輕發酵，保留茶葉原本的清香；中烘焙，讓茶的底蘊比較好，喝起來也比較不會生冷。",
      "茶湯非常清甜甘醇，是每天都喝得下去的一杯。",
    ],
    more: "發酵（氧化）程度決定香氣往哪裡走：越輕越接近清香、花香，越重越往熟果與蜜香走。烘焙則是茶的「火候」，烘得適中能把青味收乾淨，讓茶湯溫潤、不刺激。",
    // 英文版首頁「認識茶」用（茶名等專有名詞保留中文）
    en: {
      "short": "Chan Chih Oolong",
      "tags": ["Fresh", "Sweet", "Smooth"],
      "mood": "Fresh・Smooth",
      "brew": {"hot": "Hot: 95°C water, 3 g per 150 ml, first steep about 50 seconds.", "cold": "Cold: 10 g in 1 L of cold water, refrigerate 6–8 hours."},
      "caption": "Light oxidation keeps the fragrance;\na medium roast adds depth.",
      "name": "Chan Chih Oolong Tea",
      "process": "Lightly oxidized・Medium roast",
      "aroma": "Fresh, classic oolong, a hint of mountain forest",
      "taste": "Sweet and smooth, clean with a sweet finish",
      "summary": "Oolong from the mountains of Nantou, made by our partner farm. Light oxidation keeps the fragrance, a medium roast adds depth. Sweet and smooth."
    },
  },

  "charcoal-oolong": {
    name: "蟬吃炭焙烏龍茶",
    short: "炭焙烏龍",
    glyph: "炭",
    shop: "charcoal-oolong",
    soon: true,
    img: null,
    tags: ["炭香", "溫潤", "沉穩"],
    brew: { hot: "熱泡：100°C 滾水，3 克配 150 毫升，第一泡約 45 秒，炭香才出得來。", cold: "冷泡：10 克配 1 公升冷水，冷藏 8 小時，炭香會變得柔和。" },
    mood: "溫潤・炭香",
    origin: "南投・自然生態茶園",
    process: "傳統龍眼木炭焙",
    aroma: "淡淡炭香、焙火香",
    taste: "溫潤、沉穩、回甘",
    caption: "傳統龍眼木炭慢慢焙火，\n帶一點淡淡的炭香。",
    summary: "南投自然生態的烏龍茶，用傳統的龍眼木炭焙火，帶一點淡淡的炭香，溫潤沉穩。",
    story: [
      "用南投自然生態茶園的烏龍茶，以傳統的龍眼木炭慢慢焙火。",
      "焙好的茶帶一點淡淡的炭香，茶湯溫潤、沉穩，適合想喝點有溫度的茶的時候。",
    ],
    more: "炭焙是台灣傳統的焙茶方式：把龍眼木燒成炭，再覆上一層炭灰控制溫度，用文火長時間烘焙。比起電焙，炭火的熱度更柔和，焙出來的茶香氣溫潤、帶著炭火的暖意，也比較耐泡。",
    // 英文版首頁「認識茶」用（茶名等專有名詞保留中文）
    en: {
      "tags": ["Charcoal", "Mellow", "Deep"],
      "mood": "Mellow・Charcoal",
      "brew": {"hot": "Hot: 100°C boiling water, 3 g per 150 ml, first steep about 45 seconds to bring out the charcoal note.", "cold": "Cold: 10 g in 1 L of cold water, refrigerate 8 hours. The charcoal note becomes softer."},
      "caption": "Slowly roasted over longan-wood charcoal,\nwith a light charcoal note.",
      "process": "Traditionally roasted over longan-wood charcoal",
      "aroma": "Light charcoal and roasted notes",
      "taste": "Mellow, deep, with a sweet finish",
      "summary": "Oolong from an ecological garden in Nantou, roasted the traditional way over longan-wood charcoal. A light charcoal note, mellow and deep."
    },
  },

  "honey-black": {
    name: "蟬吃手採蜜香紅茶",
    short: "手採蜜香紅",
    glyph: "蜜",
    shop: "honey-black",
    img: "assets/img/product-honey-black.png",
    tags: ["蜜果香", "溫潤", "清甜"],
    brew: { hot: "熱泡：90–95°C 熱水，3 克配 150 毫升，泡 1 分鐘左右。", cold: "冷泡：8 克配 1 公升冷水，冷藏 6–8 小時，蜜香更清甜。" },
    mood: "溫潤・蜜甜",
    origin: "南投・自然生態茶園・手採",
    process: "小綠葉蟬叮咬・全發酵",
    aroma: "天然蜜果香、熟果感",
    taste: "溫柔清甜、有茶感不厚重",
    caption: "被小綠葉蟬吃過的嫩芽，\n烘出天然的蜜果香。",
    summary: "南投自然生態茶園、每一片原葉都手摘。不用農藥與化學肥料，嫩芽被小綠葉蟬吃過後，烘出天然獨特的蜜果香。",
    story: [
      "我們的蜜香紅茶來自南投自然生態茶園，每一片原葉都是手摘的。",
      "因為是自然生態，沒有使用農藥跟化學肥料，茶葉會被一種叫「茶小綠葉蟬」的小蟲吃；吃過之後烘出來的茶，會帶一種天然、獨特的蜜果香。",
    ],
    more: "小綠葉蟬叮咬嫩芽後，茶樹會產生帶香氣的防禦物質，經過萎凋與發酵轉成蜜果香，東方美人茶的香氣也是這樣來的。因為要讓蟲來吃，茶園不能噴農藥：這股蜜香，其實就是自然生態的證明。",
    // 英文版首頁「認識茶」用（茶名等專有名詞保留中文）
    en: {
      "short": "Honey-Flavored Black",
      "tags": ["Honey-fruit", "Mellow", "Sweet"],
      "mood": "Mellow・Honey-sweet",
      "brew": {"hot": "Hot: 90–95°C water, 3 g per 150 ml, steep about 1 minute.", "cold": "Cold: 8 g in 1 L of cold water, refrigerate 6–8 hours for sweeter honey notes."},
      "caption": "Young buds nibbled by leafhoppers,\nwith a natural honey-fruit aroma.",
      "name": "Honey-Flavored Black Tea",
      "process": "Leafhopper-bitten・Fully oxidized",
      "aroma": "Natural honey-fruit, ripe fruit",
      "taste": "Gentle and sweet, flavorful but not heavy",
      "summary": "From an ecological tea garden in Nantou, every leaf picked by hand. Grown without pesticides or chemical fertilizers, the young buds are nibbled by tea green leafhoppers, giving a natural, distinctive honey-fruit aroma."
    },
  },

  gaba: {
    name: "蟬吃手採佳葉龍茶",
    short: "手採佳葉龍",
    glyph: "安",
    shop: "gaba",
    img: "assets/img/product-gaba.png",
    tags: ["蜜果香", "沉穩", "晚安茶"],
    brew: { hot: "熱泡：95°C 熱水，3 克配 150 毫升，第一泡約 50 秒。", cold: "冷泡：10 克配 1 公升冷水，冷藏 8 小時。" },
    mood: "沉穩・安定",
    origin: "南投・自然生態茶園・手採",
    process: "特殊厭氧發酵",
    aroma: "天然蜜果香",
    taste: "沉穩、溫潤、柔和",
    caption: "特殊厭氧發酵的烏龍茶，\n又被叫作「好睡茶」。",
    summary: "經過特殊厭氧發酵的烏龍茶，帶天然的蜜果香氣，含 γ-胺基丁酸（GABA），是一款比較沉穩的茶，又被暱稱為「好睡茶」。",
    story: [
      "這是一種經過特殊厭氧發酵的烏龍茶，帶一種天然的蜜果香氣，是比較沉穩的茶。",
      "特殊的厭氧發酵，會讓茶葉裡的麩胺酸轉化成 γ-胺基丁酸（GABA）。γ-胺基丁酸是我們腦中最主要的抑制性神經傳導物質，所以這款茶又被叫作「好睡茶」。",
    ],
    more: "「佳葉龍」就是 GABA 的音譯。製作時把茶菁放在不透氣（例如充滿氮氣）的環境中進行厭氧處理；依茶改場的標準，每 100 公克茶葉的 GABA 含量要在 150 毫克以上，才能稱為佳葉龍茶。",
    // 英文版首頁「認識茶」用（茶名等專有名詞保留中文）
    en: {
      "short": "Gaba Tea",
      "tags": ["Honey-fruit", "Deep", "Soft"],
      "mood": "Deep・Mellow",
      "brew": {"hot": "Hot: 95°C water, 3 g per 150 ml, first steep about 50 seconds.", "cold": "Cold: 10 g in 1 L of cold water, refrigerate 8 hours."},
      "caption": "An oolong made with\na special anaerobic process.",
      "name": "Gaba Tea",
      "process": "Special anaerobic processing",
      "aroma": "Natural honey-fruit",
      "taste": "Deep, mellow, soft",
      "summary": "An oolong made with a special anaerobic process, with a natural honey-fruit aroma and a deep, mellow character."
    },
  },

  "ruby-black": {
    name: "蟬吃手採紅玉紅茶",
    short: "手採紅玉紅",
    glyph: "玉",
    shop: "ruby-black",
    img: null,
    tags: ["肉桂香", "薄荷香", "台灣香"],
    brew: { hot: "熱泡：90°C 熱水，3 克配 150 毫升，泡 50 秒到 1 分鐘，太久容易澀。", cold: "冷泡：8 克配 1 公升冷水，冷藏 6 小時，薄荷般的清涼感更明顯。" },
    mood: "獨特・台灣香",
    origin: "南投山上・契作自然生態茶園・手採",
    process: "台茶 18 號・全發酵",
    aroma: "肉桂與薄荷的香氣",
    taste: "醇厚、甘甜、尾韻清涼",
    caption: "台茶 18 號，\n肉桂與薄荷香的「台灣香」。",
    summary: "契作農場自己做的南投山上紅茶，每一葉都手摘。又叫「台茶 18 號」，帶非常特殊的肉桂與薄荷香氣，被稱作「台灣香」。",
    story: [
      "紅玉紅茶是我們契作農場自己做的茶，來自南投山上的自然生態茶園，每一葉都是手摘的。",
      "紅玉又叫作「台茶 18 號」，帶一種非常特殊的肉桂跟薄荷的香氣，所以又被稱作「台灣香」。",
    ],
    more: "紅玉是茶改場魚池分場以緬甸大葉種與台灣野生山茶雜交培育出的品種，1999 年命名為台茶 18 號。它的香氣在其他紅茶裡很少見，是只屬於台灣的紅茶風味。",
    // 英文版首頁「認識茶」用（茶名等專有名詞保留中文）
    en: {
      "short": "Ruby Black",
      "tags": ["Cinnamon", "Mint", "台灣香"],
      "mood": "Distinctive・台灣香",
      "brew": {"hot": "Hot: 90°C water, 3 g per 150 ml, steep 50 seconds to 1 minute. Longer can make it astringent.", "cold": "Cold: 8 g in 1 L of cold water, refrigerate 6 hours for a cooler, minty finish."},
      "caption": "台茶 18 號:\nthe cinnamon and mint aroma of 台灣香.",
      "name": "Ruby Black Tea",
      "process": "台茶 18 號・Fully oxidized",
      "aroma": "Cinnamon and mint",
      "taste": "Full, sweet, with a cool finish",
      "summary": "Black tea from the mountains of Nantou, made by our partner farm and picked leaf by leaf. Also known as 台茶 18 號, it has a rare cinnamon and mint aroma known as 台灣香."
    },
  },

  "yushan-oolong": {
    name: "蟬吃玉山烏龍茶",
    short: "玉山烏龍",
    glyph: "山",
    shop: "yushan-oolong",
    img: "assets/img/product-yushan-oolong.png",
    tags: ["山頭氣", "高雅", "清香"],
    brew: { hot: "熱泡：95°C 熱水，3 克配 150 毫升，第一泡約 50 秒。", cold: "冷泡：10 克配 1 公升冷水，冷藏 6–8 小時，花香很清楚。" },
    mood: "清雅・高山",
    origin: "玉山茶區・自然生態・手採",
    process: "中發酵・輕烘焙",
    aroma: "高雅清香、玉山山頭氣",
    taste: "層次豐富、清雅細緻",
    caption: "玉山茶區的山頭氣，\n層次豐富、高雅清香。",
    summary: "來自玉山茶區、自然生態、每一葉都手採。中發酵、輕烘焙，帶有玉山茶區特殊的山頭氣，層次豐富、高雅清香。",
    story: [
      "玉山烏龍來自玉山茶區，自然生態，每一葉都是手摘的烏龍茶。",
      "用中發酵、輕烘焙製成，帶有玉山茶區特殊的「山頭氣」；烏龍茶的層次感非常豐富，味道高雅清香。",
    ],
    more: "高海拔茶區日夜溫差大、雲霧多，茶樹長得慢，葉片厚、內含物豐富，所以茶湯滑順、耐沖泡。茶人說的「山頭氣」，就是每座山的風土在茶裡留下的獨特氣息。",
    // 英文版首頁「認識茶」用（茶名等專有名詞保留中文）
    en: {
      "short": "Yushan Oolong",
      "tags": ["Mountain character", "Elegant", "Fragrant"],
      "mood": "Elegant・High mountain",
      "brew": {"hot": "Hot: 95°C water, 3 g per 150 ml, first steep about 50 seconds.", "cold": "Cold: 10 g in 1 L of cold water, refrigerate 6–8 hours. The floral notes come through clearly."},
      "caption": "The character of the Yushan mountains:\nlayered, elegant and fragrant.",
      "name": "Yushan Oolong Tea",
      "process": "Medium oxidation・Light roast",
      "aroma": "Elegant fragrance with the character of Yushan",
      "taste": "Layered, elegant, delicate",
      "summary": "From the Yushan tea region, grown naturally and picked leaf by leaf. Medium oxidized and lightly roasted, with the distinctive character of the Yushan mountains. Layered and elegantly fragrant."
    },
  },
};
