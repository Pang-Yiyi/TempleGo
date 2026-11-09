// 導覽內容資料：改內容只要改這個檔案，不用動 app.js
// 熱點座標 x / y 是「圖片寬高的百分比」，任何手機尺寸都對得準
// pose 目前都對應同一張去背照；補拍後在 guide.poses 加上對應圖片即可

window.TOUR = {
  temple: {
    name: "東勢泰興宮",
    subtitle: "跟著在地人，看見廟裡的細節",
  },

  guide: {
    name: "志永哥",
    // ★ 切換人物：同意書簽署前用 "q"；簽署後改成 "real"（步驟見 README「換成真人」）
    style: "real",   // "real" 黑衣多動作版；"realWhite" 原本白 T 單張版
    styles: {
      // Q版志永哥（SVG 手繪，依照片特徵：黑色鴨舌帽、白 T、深藍袖套、雙手交握）
      q: {
        default: "assets/img/guide-q-default.svg",
        wave: "assets/img/guide-q-wave.svg",
        point: "assets/img/guide-q-point.svg",
        think: "assets/img/guide-q-think.svg",
        happy: "assets/img/guide-q-happy.svg",
      },
      // 真人去背：2026-11-08 現場影片截圖（黑色「有求必應」上衣），intro 是開場用的笑臉
      real: {
        intro: "assets/img/guide-real-happy.webp",
        default: "assets/img/guide-real-default.webp",
        wave: "assets/img/guide-real-wave.webp",
        point: "assets/img/guide-real-point.webp",
        think: "assets/img/guide-real-think.webp",
        happy: "assets/img/guide-real-happy.webp",
        fruit: "assets/img/guide-real-fruit.webp",
      },
      // 原本的白 T 照片（只有一張）
      realWhite: {
        default: "assets/img/guide.webp",
      },
    },
  },

  // 照片來源（own: true 是團隊自己拍的，其餘是 Wikimedia Commons，CC BY-SA 4.0）：畫面上會自動顯示標示，開場「照片與資料來源」也會列出
  // 這些照片經過縮放／裁切，修改後的版本同樣以 CC BY-SA 4.0 釋出
  // fit: "width" 的照片會撐滿寬度、改成上下滑動（適合直式照片）
  photos: {
    // own: true = 團隊 2026-11-08 實地拍攝（原檔在 素材/照片/20261108_現場/），車牌與路人臉部已模糊
    "assets/photos/temple-front.webp": {
      title: "泰興宮山門", own: true, edit: "IMG_6327 裁切、縮放，車牌模糊" },
    "assets/photos/front-steps.webp": {
      title: "山門前的石獅與階梯", own: true, edit: "IMG_6329 裁切、縮放，人物臉部模糊" },
    "assets/photos/door-gods-photo.webp": {
      title: "山門門神", author: "Isocyclo", edit: "縮放",
      page: "https://commons.wikimedia.org/wiki/File:202104_WMTW_x_HPCF_workshop_190.jpg" },
    "assets/photos/main-hall-pano.webp": {
      title: "正殿半圈環景", own: true, edit: "IMG_6338 手機全景，縮放" },
    "assets/photos/courtyard-pano.webp": {
      title: "中庭半圈環景", own: true, edit: "IMG_6347 手機全景，縮放" },
    "assets/photos/plaza-pano.webp": {
      title: "廟埕半圈環景", own: true, edit: "IMG_6323 手機全景，縮放，車牌模糊" },
    "assets/photos/guowang-board.webp": {
      title: "「國王宮」木牌與後堂供奉牌", own: true, edit: "IMG_6332 裁切、縮放", fit: "width" },
    "assets/photos/bijiao-front.webp": {
      title: "後殿弼教堂與天公爐", own: true, edit: "IMG_6342 裁切、縮放" },
    "assets/photos/bijiao-altar.webp": {
      title: "弼教堂", own: true, edit: "IMG_6343 裁切、縮放" },
  },
  photoLicense: { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hant" },

  // 鳥瞰地圖：image 之後可換成空拍照或實測平面圖，只要同步調整各站 pin 座標
  map: {
    image: "assets/img/map.svg",
    aspect: 360 / 520,
    say: "歡迎來到泰興宮！點地圖上的號碼，我帶你去看！",
    doneSay: "五個地方都走完了，謝謝你來大茅埔！點右上角「完成卡」，可以存起來做紀念喔！",
  },

  // 大茅埔總覽圖：在泰興宮鳥瞰圖之前。依使用者手繪稿（素材/照片/map.png）重繪，示意非實測
  // 熱點 x / y 是圖片寬高的百分比
  // TODO：請志永哥或廟方確認四營的實際位置、各營的故事，確認後補進 desc
  overview: {
    image: "assets/img/damaopu-overview.svg",
    aspect: 1600 / 1131,
    focus: 53,
    say: "這就是大茅埔庄！左右滑一滑，找找守著庄子的四個營頭；再點中間的泰興宮，我們進去看看！",
    temple: { x: 53, y: 47, label: "泰興宮 ›" },
    camps: [
      { name: "東營", x: 37, y: 47 },
      { name: "南營", x: 67.5, y: 42 },
      { name: "西營", x: 70, y: 65 },
      { name: "北營", x: 35.5, y: 79 },
    ],
    campDesc: "五營是守護庄頭的神兵營寨。東、南、西、北四營守在庄子四周，中營通常就在主廟裡，由廟裡的神明調度，一起守住整個聚落。",
  },

  // 求藥籤：地圖上的獨立體驗（藥籤放在哪一殿還沒確認，確認後可移到對應的站）
  // 資料來源：使用者提供（男人一百首、婦人一百首），見 research/泰興宮資料彙整.md 第 5 節
  // ⚠️ 只做文化體驗，不顯示任何藥方
  yaoqian: {
    intro: [
      "以前庄裡的人要出去看醫生，可不容易。",
      "所以生病的時候，大家會直接到廟裡，向神明求一支「藥籤」。",
      "泰興宮的藥籤分成兩種：男人一百首，婦人一百首。你也來試試看！",
    ],
    kinds: [
      { id: "man", label: "男人籤", sub: "一百首", name: "男人" },
      { id: "woman", label: "婦人籤", sub: "一百首", name: "婦人" },
    ],
    shakeSay: "心裡想著想問的事，輕輕搖籤筒，直到有一支籤跳出來。",
    jiaoSay: "抽到籤以後，還要擲筊問神明：是不是這一支？要擲到「聖筊」才算數喔！",
    jiao: {
      sheng: { name: "聖筊", desc: "一平一凸，神明同意了！" },
      xiao: { name: "笑筊", desc: "兩個平面朝上，神明在笑，意思還不明確。重抽一支吧！" },
      yin: { name: "陰筊", desc: "兩個凸面朝上，神明不同意。重抽一支吧！" },
    },
    resultSay: "以前抽到籤，會去找廟方拿對應號碼的籤紙，上面寫著藥材和份量，再拿去中藥店抓藥。",
    // 網站不提供藥方，改送一句祝福
    blessings: [
      "身體健康，吃飯香，睡得好。",
      "出入平安，一路順風。",
      "多喝水、早點睡，精神就會好起來。",
      "全家平安，大小都健健康康。",
      "心情放輕鬆，身體自然就輕鬆。",
      "有空多走走，來大茅埔散散步。",
      "好天氣、好心情，百病不上身。",
      "照顧好自己，也照顧身邊的人。",
    ],
    disclaimer: "這是文化體驗，不是醫療建議。身體不舒服，請找醫生。",
  },

  // ready: false 的站會出現在地圖上，但顯示「製作中」
  // 內容來源見 research/泰興宮資料彙整.md
  stops: [
    {
      id: "plaza",
      title: "廟埕・大林埔的起點",
      pin: { n: 1, x: 50, y: 79 },
      ready: true,
      intro: "泰興宮背山面溪，是大茅埔中軸大街的起點，整個庄頭的格局就從這裡展開。",
      image: "assets/img/plaza-scroll.svg",
      // 廟埕半圈環景：團隊手機全景（IMG_6323），水平約 193°，車牌已模糊
      pano: "assets/photos/plaza-pano.webp",
      panoView: { haov: 193, vaov: 80 },
      stamp: "開庄",

      // 內容來源：《茅埔成庄》、邱民雄〈大茅埔泰興宮三山國王〉、徐登志〈犒將〉、農業部〈我的幸福小地方〉
      hotspots: [
        { id: "temple", x: 17.5, y: 50, title: "泰興宮",
          desc: "廟背靠莊背山、面向大甲溪，是整條中軸大街的起點。" },
        { id: "road", x: 54, y: 50, title: "棋盤式道路",
          desc: "中軸大街從廟前一路貫穿庄頭，兩邊的巷道像棋盤一樣，左右對稱排列。" },
        { id: "moat", x: 38.5, y: 86, title: "環庄護城河",
          desc: "庄的四周挖了一條寬約十尺的大水溝，可以防禦，也能引水灌溉。大茅埔有臺灣最小規模的環庄護城河。" },
        { id: "bamboo", x: 61.5, y: 10, title: "刺竹圍",
          desc: "水溝外圈種滿了刺竹，長滿尖刺的竹叢就是一道天然的圍牆。" },
        { id: "gate", x: 80.8, y: 50, title: "隘門",
          desc: "進出庄頭的大門，和護城河、刺竹一起守護庄民。" },
        { id: "bend", x: 85.5, y: 89, title: "水口轉個彎",
          desc: "圳水流出庄之前，特別轉了一個彎再慢慢流出去。客家人說「水主財」、「有曲才有財」，轉個彎就能把財留在庄裡。" },
        // ↓ 實景照片熱點（img 指定屬於哪張照片）
        { id: "plaque", img: "assets/photos/temple-front.webp", x: 50, y: 49.5, title: "「國王廟」匾額",
          desc: "山門正中央掛著「國王廟」，告訴大家這裡供奉的是三山國王。老匾額要從右往左讀喔！" },
        { id: "sanshan", img: "assets/photos/temple-front.webp", x: 50, y: 39, title: "屋簷下的小匾",
          desc: "再往上看，屋簷下還有一塊小匾，寫著「三山國王」，一樣從右往左讀。" },
        { id: "lion", img: "assets/photos/temple-front.webp", x: 35, y: 64, title: "石獅",
          desc: "山門兩側各有一隻石獅，守護著廟門。到現場可以比比看，兩隻長得一不一樣？" },
      ],

      // 順序：先看眼前實景 → 進插畫聽故事 → 回到實景
      script: [
        { scene: "pano", focus: { yaw: 0, pitch: 0 }, pose: "wave",
          say: "歡迎來到大茅埔！你現在站的地方是泰興宮的廟埕。用手指左右拖曳，或按「轉動手機看」，看看四周。" },
        { say: "正前方就是泰興宮的山門，我們走近一點看！" },
        { image: "assets/photos/temple-front.webp", focus: 50,
          say: "這就是山門。" },
        { type: "explore", pose: "point", targets: ["plaque", "sanshan", "lion"],
          say: "先跟眼前的廟打個招呼！照片裡有三個發光的地方，點點看。",
          done: "廟後面還有一片山，村民叫它「莊背山」，也叫「龍背林」。泰興宮就是背靠著山、面向大甲溪。" },
        { image: "assets/img/plaza-scroll.svg", focus: 17,
          say: "這座廟不只是一座廟，整個庄頭都是從這裡規劃出去的。我們飛到天上，看看兩百年前的大茅埔！" },
        { say: "道光二年（1822），張寧壽帶著二十八股的夥伴來這裡開墾。那時候，這裡是一大片茅草荒埔。" },
        { type: "choice", pose: "think",
          say: "考考你：這裡叫「大茅埔」，可是庄裡的老一輩用客家話會怎麼念？",
          options: ["大茅埔", "大林埔", "大平埔"], answer: 1,
          wrong: "再猜猜看！有一種說法是：日本人「聽錯」了喔！",
          right: "答對！耆老都念「大林埔」。有一說是日治時期調查地名時被聽成「大茅埔」，就這樣記下來了。" },
        { focus: 55,
          say: "開墾的時候，負責開水圳的陂長易庚麟也是一位風水師，整個庄頭都是經過他仔細規劃的。" },
        { type: "explore", pose: "point", targets: ["temple", "road", "moat", "bamboo", "gate", "bend"],
          say: "這是從天上看大茅埔的樣子！左右滑一滑，點點看先民藏了哪些巧思。",
          done: "防禦、灌溉、風水，全都想到了，先民很厲害吧！" },
        { type: "choice", pose: "think",
          say: "圳水流出庄之前，為什麼要特別轉個彎？",
          options: ["為了好看", "把財留在庄裡", "讓魚游進來"], answer: 1,
          wrong: "提示：客家人說「水主財」喔！",
          right: "沒錯！有曲才有財，轉個彎就能把財留在庄裡。" },
        { focus: 40,
          say: "可惜這些年人口和車子變多，護城河大部分都被加蓋，變成停車場了。" },
        { scene: "pano", focus: { yaw: 0, pitch: 0 }, pose: "wave",
          say: "回到現在的廟埕。兩百年前的規劃，到今天都還看得到喔！" },
        { type: "lookup",
          say: "轉身背對山門往前看，那條直直的大街就是中軸線。等一下在庄裡散步時，留意看看路邊的水圳喔！" },
        { pose: "happy",
          say: "認識大茅埔了，來蓋個章！接下來進廟裡看看吧。" },
      ],
    },
    {
      id: "door-gods",
      title: "三川門・門神",
      // 已確認：Commons「202104 WMTW x HPCF workshop 188」拍到同一組門神與對聯，位於山門（三川門）
      pin: { n: 2, x: 50, y: 62 },
      ready: true,
      intro: "大門上的兩位將軍日夜守著廟門。你認得哪一位是誰嗎？",
      // 照片：Commons workshop 190（Isocyclo），沒有人入鏡；原本的 young1.jpg 版本被人物擋住，已停用
      image: "assets/photos/door-gods-photo.webp",
      stamp: "門神",

      hotspots: [
        { id: "weichi", x: 22, y: 47, title: "尉遲恭",
          desc: "黑臉、圓眼，表情最兇的這位是尉遲恭，唐朝開國名將。臉畫得這麼威猛，就是要把邪祟嚇跑。" },
        { id: "qin", x: 83, y: 45, title: "秦叔寶",
          desc: "白臉、留長鬍子，神情比較沉穩，他是秦叔寶，民間也叫他「秦瓊」，同樣是唐朝名將。" },
        { id: "helmet", x: 22, y: 27, title: "華麗的頭盔", explore: true,
          desc: "把頭盔放大看：頂上有一隻展翅的鳥形裝飾，旁邊還有捲雲花紋。畫師連這麼小的地方都沒放過。" },
        { id: "whip", x: 9.5, y: 62, title: "一節一節的兵器", explore: true,
          desc: "尉遲恭手邊這根金色兵器，一節一節像竹子，就是他的招牌武器「竹節鋼鞭」。" },
        { id: "flags", x: 35, y: 28, title: "背後的旗子", explore: true,
          desc: "將軍背後插著好幾支旗，跟戲曲裡武將背上的「靠旗」很像，表示他是領兵打仗的大將。" },
        { id: "roof", x: 55, y: 22, title: "門後的屋頂", explore: true,
          desc: "從兩扇門中間望進去，看得到廟裡屋頂上彩色的人物和花鳥裝飾。等一下進廟，記得抬頭看！" },
      ],

      script: [
        { pose: "wave", focus: 50,
          say: "我們就從大門開始吧！" },
        { pose: "point", focus: 50,
          say: "進廟之前，先看大門上這兩位。他們是「門神」，專門幫廟守門的將軍。" },
        { say: "一位是秦叔寶，一位是尉遲恭，兩位都是唐朝的大將。" },
        { type: "quiz", pose: "think", focus: 50,
          say: "考考你：黑臉、眼睛瞪得大大的，是哪一位？在畫面上點點看！",
          choices: ["weichi", "qin"], answer: "weichi",
          wrong: "嘿，這位臉比較白、留長鬍子，再找找另一位！",
          right: "答對了！黑臉的就是尉遲恭，白臉長鬍子的是秦叔寶。" },
        { pose: "default",
          say: "傳說唐太宗晚上被惡鬼吵得睡不好，就請這兩位將軍站在宮門口守夜。後來民間就把他們畫在門上保平安。" },
        { type: "explore", pose: "point",
          say: "畫裡還藏了很多細節！把畫面左右滑一滑，發光的地方都點開看看。" },
        { type: "lookup",
          say: "好，現在把手機放下，抬頭看看真正的門神，找找剛剛看到的鋼鞭和頭盔在哪裡？" },
        { pose: "happy",
          say: "門神這關過了，來蓋個章！等一下我們往廟裡面走。" },
      ],
    },
    {
      id: "kaojiang",
      title: "龍邊階梯・犒將",
      pin: { n: 3, x: 81, y: 71 },
      ready: true,
      intro: "每月農曆初二、十六下午，庄民在這裡犒賞王爺的兵馬，還會在龍邊階梯放上馬草和水，讓戰馬吃喝。",
      image: "assets/img/kaojiang-scroll.svg",
      stamp: "犒將",

      // 內容來源：徐登志〈犒將－以臺中東勢大茅埔泰興宮為例〉（教育部臺灣客語辭典）
      // ⚠️ 農業部報導寫「36 碗酒、36 碗肉」，與徐文「酒肉各六碗」不同，這裡採用徐文，請廟方確認
      hotspots: [
        { id: "grass", x: 56.5, y: 65, title: "馬草",
          desc: "將頭們會去割嫩嫩的菅筍或牧草，剪成一截一截的，用桶子裝好。" },
        { id: "water", x: 62, y: 72, title: "一桶清水",
          desc: "再準備一桶乾淨的水，讓將軍的戰馬喝個夠。" },
        { id: "sansheng", x: 8.8, y: 53, title: "三牲",
          desc: "一副三牲，是正式祭拜時的重要供品。" },
        { id: "wine", x: 20.2, y: 56, title: "酒六碗",
          desc: "六碗酒，敬給辛苦出任務的兵將。" },
        { id: "meat", x: 26.5, y: 54, title: "肉六碗",
          desc: "六碗肉，和酒一起慰勞兵將。" },
        { id: "jiao", x: 18.5, y: 88, title: "筊杯",
          desc: "下午三點，廟祝帶將頭點香請神。大約十分鐘後擲出「聖筊」（一正一反），表示眾神到了，才開始敬酒。" },
        { id: "north", x: 86.5, y: 23, title: "北營・黑旗", desc: "北方屬水，令旗是黑色。" },
        { id: "west", x: 74.5, y: 44, title: "西營・白旗", desc: "西方屬金，令旗是白色。" },
        { id: "east", x: 96, y: 44, title: "東營・綠旗", desc: "東方屬木，令旗是綠色。" },
        { id: "south", x: 86.5, y: 69, title: "南營・紅旗", desc: "南方屬火，令旗是紅色。" },
        // ↓ 實景照片：山門前的石獅與階梯
        { id: "dragonSide", img: "assets/photos/front-steps.webp", x: 61, y: 82, title: "龍邊",
          desc: "面向廟門時，你的右手邊就是龍邊（從神明往外看是左手邊）。馬草和水就放在廟前龍邊的階梯上。" },
        { id: "tigerSide", img: "assets/photos/front-steps.webp", x: 39, y: 82, title: "虎邊",
          desc: "面向廟門時，左手邊是虎邊。" },
      ],

      // 順序：先看眼前實景 → 進插畫聽故事 → 回到實景
      script: [
        { image: "assets/photos/front-steps.webp", focus: 50, pose: "wave",
          say: "這裡是廟前的階梯。每個月有兩天，階梯上會出現一桶草和一桶水，你猜是給誰的？" },
        { say: "答案是：給王爺公兵馬的「戰馬」吃的！這個儀式叫做「犒將」。" },
        { pose: "point",
          say: "馬草和水要放在「龍邊」的階梯。龍邊是用神明的角度來看：神明坐在廟裡往外看，左手邊就是龍邊。" },
        { type: "quiz", pose: "think", choices: ["dragonSide", "tigerSide"], answer: "dragonSide",
          say: "那你面向廟門的時候，龍邊在哪一邊？在照片上點出來！",
          wrong: "這邊是虎邊喔！神明的左手邊，就是你面向廟門時的右手邊。",
          right: "答對！面向廟門的右手邊就是龍邊。" },
        { image: "assets/img/kaojiang-scroll.svg", focus: 52,
          say: "王爺公出去辦事，要靠中壇元帥哪吒三太子帶領的兵馬幫忙。為了感謝這些兵將，庄民每月農曆初二、十六都會犒賞他們。" },
        { type: "explore", pose: "point", targets: ["grass", "water"],
          say: "這是犒將那天的樣子，點點看階梯上的兩個桶子！",
          done: "戰馬吃飽喝足，才有力氣保護庄頭！" },
        { focus: 17,
          say: "廟裡面也要準備供品。廟祝會擲筊，選出十位「將頭」來負責準備。" },
        { type: "explore", pose: "point", targets: ["sansheng", "wine", "meat", "jiao"],
          say: "供桌上和地上有什麼？點點看！" },
        { type: "choice", pose: "think",
          say: "酒六碗、肉六碗，六六三十六。你猜「三十六」代表什麼？",
          options: ["三十六天罡", "三十六位將頭", "三十六匹戰馬"], answer: 0,
          wrong: "再猜猜看！提示：跟天上的星星有關。",
          right: "沒錯！代表「三十六天罡」。" },
        { say: "要拜一個時辰，大約兩個小時。到了五點再擲一次聖筊，表示眾神很歡喜，才燒金紙、收供品。" },
        { focus: 83,
          say: "除了廟裡，庄的東西南北四個方向還有「將寮」，是王爺兵馬紮營的地方。" },
        { type: "explore", pose: "point", targets: ["north", "west", "east", "south"],
          say: "點點看四面令旗，每一營的顏色都不一樣！",
          done: "犒將那天，將寮附近的人家也會準備魚、肉和飯菜來拜，媽媽們都會拿出拿手菜喔！" },
        { type: "choice", pose: "think",
          say: "考考你：北營的令旗是什麼顏色？",
          options: ["綠色", "紅色", "黑色"], answer: 2,
          wrong: "提示：北方屬「水」喔！",
          right: "答對！北方屬水，所以是黑色。" },
        { image: "assets/photos/front-steps.webp", focus: 50, pose: "wave", say: "{lunarHint}" },
        { type: "lookup",
          say: "走到廟前右手邊的龍邊階梯看看。如果剛好遇到犒將，請在旁邊安靜觀看，不要碰供品喔！" },
        { pose: "happy",
          say: "犒將學會了，來蓋個章！" },
      ],
    },
    {
      id: "main-hall",
      title: "正殿・三山國王",
      pin: { n: 4, x: 50, y: 48 },
      ready: true,
      intro: "三山國王是廣東巾山、明山、獨山三座山的山神，跟著客家先民一路來到大茅埔。",
      // 故事長卷插畫；之後可加入正殿實拍照片
      image: "assets/img/sanshan-scroll.svg",
      // 360° 環景（等距長方投影 2:1）。目前是程式產生的示意圖，拍到正殿實景後直接替換，並調整下方熱點的 yaw / pitch
      // 正殿半圈環景：團隊用手機全景模式拍（IMG_6338），只有水平約 220°，上下約 80°
      pano: "assets/photos/main-hall-pano.webp",
      panoView: { haov: 220, vaov: 80 },
      stamp: "國王",

      // 內容來源：research/泰興宮資料彙整.md 第 2、4 節（邱民雄〈大茅埔泰興宮三山國王〉、徐登志〈犒將〉、維基百科）
      hotspots: [
        { id: "jin", x: 9.2, y: 45, title: "巾山・大王爺", explore: true,
          desc: "大王爺姓連名傑，聖誕是農曆二月二十五日。大王爺生日是大茅埔一年裡的大事，庄民會獻上豬羊，用最隆重的「三獻古禮」祝壽。" },
        { id: "ming", x: 20.8, y: 36, title: "明山・二王爺", explore: true,
          desc: "二王爺姓趙名軒，聖誕是農曆六月二十五日。" },
        { id: "du", x: 32.5, y: 50, title: "獨山・三王爺", explore: true,
          desc: "三王爺姓喬名俊，聖誕是農曆九月二十五日。" },
        { id: "boat", x: 54, y: 62, title: "渡海而來",
          desc: "東勢一帶的開墾，以廣東潮州府大埔縣來的客家移民為主。移民走到哪裡，三山國王「王爺公」的香火就跟到哪裡。" },
        { id: "hut", x: 84, y: 66, title: "茅草頂的國王宮",
          desc: "1851 年開始集資，1856 年完工。蓋好之後，張寧壽、楊及億、張登龍等人還捐出水田當廟產，用田租支付祭祀的費用。" },
        // ↓ 環景熱點：yaw 是左右角度（0 = 正前方，180 = 背後），pitch 是上下角度（90 = 正上方）
        // ↓ 實景照片：「國王宮」木牌（直式，上下滑動）
        { id: "boardName", img: "assets/photos/guowang-board.webp", x: 71, y: 21, title: "國王宮",
          desc: "木牌上寫著「國王宮」，就是泰興宮最早的名字。" },
        { id: "boardYear", img: "assets/photos/guowang-board.webp", x: 82, y: 16, title: "咸豐辛亥元年",
          desc: "「咸豐辛亥元年」就是 1851 年，也就是大家開始集資建廟的那一年。" },
        { id: "boardDonors", img: "assets/photos/guowang-board.webp", x: 75, y: 52, title: "三位先賢",
          desc: "木牌刻著「信士張寧壽、楊及億、張登龍，施出慶福庄大租股半、水田股半敬奉」。三位捐出田產，用田租支持廟裡的祭祀。" },
        { id: "houtang", img: "assets/photos/guowang-board.webp", x: 23, y: 41, title: "旁邊的紅牌",
          desc: "木牌旁邊的紅牌寫著「後堂供奉　十殿冥君、三尊恩主、城隍老爺」，告訴大家後面的弼教堂拜哪些神明。等一下第 5 站就會看到！" },
        // ↓ 環景熱點
        { id: "altar", yaw: 2, pitch: 2, title: "正殿神龕",
          desc: "三山國王就供奉在這裡。進到殿裡，請不要站在神明的正前方擋住別人參拜喔。" },
        { id: "ceiling", yaw: -14, pitch: 18, title: "抬頭看",
          desc: "廟裡的屋頂和樑上，常有精細的彩繪和木雕。到現場的時候，記得抬頭找找有什麼圖案！" },
        { id: "lantern", yaw: 33, pitch: 20, title: "合家平安",
          desc: "燈籠上寫著「合家平安」，是大家來這裡最常求的心願。" },
      ],

      // 順序：先看實物（國王宮木牌）→ 進插畫聽故事 → 回到木牌 → 環景
      // 木牌照片是團隊實拍（IMG_6332）；正殿實景（IMG_6340、6341）之後可改成正殿開場
      script: [
        { image: "assets/photos/guowang-board.webp", focus: 20, pose: "wave",
          say: "這裡是正殿，供奉我們大茅埔的「王爺公」，也就是三山國王。" },
        { type: "explore", pose: "point", targets: ["boardName"],
          say: "先給你看一樣廟裡的寶貝！這塊木牌上，找找看「國王宮」三個字在哪裡？",
          done: "「國王宮」就是泰興宮最早的名字。為什麼叫國王宮？我們從頭說起！" },
        { image: "assets/img/sanshan-scroll.svg", focus: 20,
          say: "三山國王不是三座山，是三座山的山神喔！這三座山在廣東揭陽。" },
        { type: "explore", pose: "point", targets: ["jin", "ming", "du"],
          say: "點點看這三座山，認識三位王爺！" },
        { type: "choice", pose: "think",
          say: "你有發現嗎？三位王爺的生日，都在農曆的哪一天？",
          options: ["初一", "十五", "二十五"], answer: 2,
          wrong: "再想想看，剛剛卡片上的日期都長得很像喔！",
          right: "沒錯，都是二十五！很好記吧？" },
        { say: "傳說三位是結拜兄弟，一起平定亂事，之後隱居三山。皇帝敬佩他們，封為「三山國王」。" },
        { focus: 54,
          say: "後來客家先民渡海來臺灣開墾，王爺公的香火也跟著過來了。" },
        { focus: 84,
          say: "開庄的張寧壽，從彰化溪湖荷婆崙的霖肇宮請來三山國王的令旗，先供在自己家裡，保佑大家開墾順利。" },
        { say: "開墾有成，大家一起出錢蓋廟，咸豐六年（1856）完工，那時候屋頂還是茅草蓋的呢！" },
        { type: "explore", pose: "point", targets: ["boat", "hut"],
          say: "畫裡的船和小廟也點開看看！" },
        { type: "choice", pose: "think",
          say: "考考你：這座茅草頂的小廟，就是剛剛木牌上寫的哪個名字？",
          options: ["泰興宮", "國王宮", "王爺廟"], answer: 1,
          wrong: "提示：回想一下剛剛木牌上的三個字！",
          right: "答對！一開始叫「國王宮」，後來才改名泰興宮。" },
        { image: "assets/photos/guowang-board.webp", focus: 20, pose: "happy",
          say: "回到這塊木牌。上面還刻著蓋廟的年份，和捐出田地的人，上下滑動看看。" },
        { type: "explore", pose: "point", targets: ["boardYear", "boardDonors", "houtang"],
          say: "點點看，木牌上還寫了什麼？",
          done: "一百七十多年前的事，就刻在這塊木牌上！" },
        { scene: "pano", focus: { yaw: 0, pitch: 0 }, pose: "wave",
          say: "故事聽完了，我們走進正殿看看！用手指左右拖曳畫面，或按「轉動手機看」，像站在殿裡轉頭看。" },
        { type: "explore", pose: "point", targets: ["altar", "ceiling", "lantern"],
          say: "找找看三個發光的地方，有一個要往右邊轉才看得到喔！",
          done: "正殿看過一遍了！到現場記得也抬頭看看樑上的木雕。" },
        { type: "lookup",
          say: "現在抬頭看看正殿裡的三位王爺，比一比他們的臉色和鬍子，有什麼不一樣？" },
        { say: "民國 88 年 921 大地震，庄裡的老屋全倒了，廟卻安然無恙，庄民都說是王爺公在保佑。" },
        { pose: "happy",
          say: "認識王爺公了，來蓋個章！" },
      ],
    },
    {
      id: "bijiao",
      title: "後殿・弼教堂",
      pin: { n: 5, x: 50, y: 27 },
      ready: true,
      intro: "清末鴉片流進庄裡，庄民請來關聖帝君幫忙戒煙，1906 年蓋了這座後殿。",
      image: "assets/img/bijiao-scroll.svg",
      // 中庭半圈環景：團隊手機全景（IMG_6347），水平約 195°
      // TODO：中庭地面的羅盤圖案、兩側兩座塔形建築的名稱與用途，請廟方確認後再加熱點
      pano: "assets/photos/courtyard-pano.webp",
      panoView: { haov: 195, vaov: 80 },
      stamp: "弼教",

      // 內容來源：維基百科〈慶東泰興宮〉、農業部〈我的幸福小地方〉、東勢後生添手團〈泰興宮裝置藝術調查〉
      // ⚠️ 三恩主神位在畫中的左右位置為示意，請依現場實際配置調整
      hotspots: [
        { id: "haze", x: 11.5, y: 38, title: "鴉片流入",
          desc: "鴉片戰爭以後，鴉片四處氾濫，連大茅埔也受到影響。那時候還沒有勒戒的地方可以幫忙。" },
        { id: "feifeng", x: 36.3, y: 39, title: "飛鳳山代勸堂",
          desc: "地方士紳（包括徐德文）到新竹芎林的飛鳳山「代勸堂」，迎回關聖帝君、孚佑帝君、司命真君的香火。" },
        { id: "mill", x: 57, y: 64, title: "礱間",
          desc: "「礱」是以前用來替稻穀脫殼的器具，放礱的房間就叫礱間。香火迎回來以後，先暫時供在民宅的礱間。" },
        { id: "guan", x: 84.6, y: 66, title: "關聖帝君",
          desc: "也就是三國時代的關羽，大家熟悉的「關公」。弼教堂裡還陪祀關平、周倉兩位將軍。" },
        { id: "fuyou", x: 77.8, y: 66, title: "孚佑帝君",
          desc: "也就是八仙之一的呂洞賓。" },
        // ↓ 實景照片：弼教堂外觀與神龕
        { id: "tiangonglu", img: "assets/photos/bijiao-front.webp", x: 50, y: 62, title: "天公爐",
          desc: "一般廟宇的天公爐多放在前殿，泰興宮卻放在後堂弼教堂前面，這是典型的客家廟宇配置。" },
        { id: "bijiaoRoof", img: "assets/photos/bijiao-front.webp", x: 47, y: 27, title: "屋頂裝飾",
          desc: "屋頂上有龍和各種彩色裝飾。到現場記得抬頭看！" },
        { id: "bijiaoSign", img: "assets/photos/bijiao-altar.webp", x: 50, y: 89, title: "「弼教堂」",
          desc: "神桌前面寫著「弼教堂」三個字（傳統寫法由右往左讀）。" },
        { id: "bijiaoLantern", img: "assets/photos/bijiao-altar.webp", x: 34, y: 22, title: "燈籠上的名字",
          desc: "燈籠上寫著「關聖帝君」「孚佑帝君」「司命真君」，就是弼教堂供奉的三恩主。" },
        { id: "bijiaoCouplet", img: "assets/photos/bijiao-altar.webp", x: 18, y: 41, title: "柱子上的楹聯",
          desc: "後殿有兩對楹聯是庄裡的書法家邱丙坤寫的。這是不是其中一對？到現場找找看落款！" },
        { id: "siming", x: 91.4, y: 66, title: "司命真君",
          desc: "也就是灶君，守護一家人的平安。" },
      ],

      // 順序：先看眼前實景 → 進插畫聽故事 → 回到實景（神龕）
      script: [
        { scene: "pano", focus: { yaw: 0, pitch: 0 }, pose: "wave",
          say: "穿過正殿，來到後面的中庭。用手指左右拖曳，或按「轉動手機看」，看看四周。" },
        { say: "正前方這座就是「弼教堂」，我們走近一點看！" },
        { image: "assets/photos/bijiao-front.webp", focus: 50,
          say: "這就是弼教堂的正面。" },
        { type: "explore", pose: "point", targets: ["tiangonglu", "bijiaoRoof"],
          say: "先看看眼前！照片裡有兩個發光的地方，點點看。",
          done: "弼教堂的故事，跟清朝末年的鴉片有關。我們回到一百多年前！" },
        { image: "assets/img/bijiao-scroll.svg", focus: 12,
          say: "鴉片戰爭以後，鴉片到處流傳，連大茅埔也有人染上，那時候可沒有勒戒所。" },
        { focus: 40,
          say: "地方士紳就到新竹芎林的飛鳳山「代勸堂」，迎回關聖帝君的香火，希望靠神明的力量幫大家戒掉鴉片。" },
        { focus: 60,
          say: "香火迎回來以後，先暫時供在民宅的「礱間」。" },
        { type: "explore", pose: "point", targets: ["haze", "feifeng", "mill"],
          say: "左右滑一滑，點點看這段故事裡的三個地方！" },
        { type: "choice", pose: "think",
          say: "後來，是誰指示要另外蓋一座廟來供奉這些神明？",
          options: ["三山國王", "縣太爺", "張寧壽"], answer: 0,
          wrong: "提示：是前殿那位大家都很熟的王爺公喔！",
          right: "答對！光緒三十二年（1906），三山國王降乩指示另建廟宇，就在國王廟後面蓋了弼教堂。" },
        { focus: 85, type: "explore", pose: "point", targets: ["fuyou", "guan", "siming"],
          say: "弼教堂主祀三位恩主，點點看是哪三位！",
          done: "這三位合稱「三恩主」。庄民就是靠恩主的神威，戒掉了鴉片。" },
        { type: "choice", pose: "think",
          say: "「弼教堂」的「弼」是什麼意思？",
          options: ["輔助", "打仗", "下雨"], answer: 0,
          wrong: "再想想，跟「幫忙」有關喔！",
          right: "對！「弼」是輔助的意思，「弼教」可以想成輔助教化，幫大家改掉壞習慣。" },
        { image: "assets/photos/bijiao-altar.webp", focus: 45, pose: "wave",
          say: "回到現在，這就是弼教堂，三恩主就供奉在裡面。" },
        { type: "explore", pose: "point", targets: ["bijiaoSign", "bijiaoLantern", "bijiaoCouplet"],
          say: "左右滑一滑，找找三個發光的地方！" },
        { say: "弼教堂的左殿還有十殿閻王和牛頭、馬面，右殿有城隍爺和文、武判官。" },
        { type: "lookup",
          say: "抬頭看看弼教堂兩邊的對聯，其中有兩對，是庄裡的書法家邱丙坤寫的喔！" },
        { pose: "happy",
          say: "弼教堂也看完了，蓋個章！回地圖看看你收集了幾個章吧！" },
      ],
    },
  ],
};
