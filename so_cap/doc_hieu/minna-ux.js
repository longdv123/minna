/**
 * Minna (so_cap / trung_cap) WebView UX overlay.
 *
 * Flutter:
 *   window.jlptUxLang = 'en';          // UserScript at document start
 *   minnaUxSetLang('en');              // after page load
 * Also accepts ?lang=en
 */
(function () {
  if (window.__minnaUxInit) return;
  window.__minnaUxInit = true;

  var STORAGE_ONBOARD = "minna_ux_onboard_v1";
  var STORAGE_LANG = "jlpt_ux_lang";
  var STORAGE_TR = "minna_ux_tr_on";

  var state = {
    lang: "en",
    trOn: false
  };

  var LANG_ALIASES = {
    vn: "vi", vie: "vi", vietnamese: "vi", "vi-vn": "vi",
    eng: "en", english: "en", "en-us": "en", "en-gb": "en",
    jp: "ja", jpn: "ja", japanese: "ja", "ja-jp": "ja",
    cn: "zh", chi: "zh", chinese: "zh", "zh-cn": "zh", "zh-hans": "zh", "zh-sg": "zh",
    "zh-tw": "zh-TW", "zh-hk": "zh-TW", "zh-hant": "zh-TW", "zh-mo": "zh-TW",
    kr: "ko", kor: "ko", korean: "ko", "ko-kr": "ko",
    thai: "th", "th-th": "th",
    ind: "id", indonesian: "id", "id-id": "id"
  };

  var STRINGS = {
    en: {
      showTranslation: "Show translation",
      hideTranslation: "Hide translation",
      meaning: "Meaning",
      guide: "How to use",
      close: "Close",
      menu: "Menu",
      tabGrammar: "Grammar",
      tabPracticeB: "Practice B",
      tabVocab: "Vocabulary",
      tabReading: "Reading",
      tabExtra: "Extra",
      tabDialogue: "Dialogue",
      tabDialoguePattern: "Dialogue patterns",
      tabPattern: "Patterns",
      tabExample: "Examples",
      tabPracticeA: "Practice A",
      tabQuestion: "Q{n}",
      answersTranslate: "Answers & translation",
      scriptTranslate: "Script & translation",
      partN: "Part {n}",
      dialoguePatternN: "Pattern {n}",
      structure: "Structure",
      affirmative: "Affirmative",
      negative: "Negative",
      kanji: "Kanji",
      sinoViet: "Sino-Viet",
      vocabWord: "Word",
      answerLabel: "Answer:",
      lessonN: "Lesson {n}",
      onboard1Title: "Lesson sections",
      onboard1Body: "The chips at the top switch parts of the lesson (grammar, practice, dialogue). Swipe sideways if they do not all fit.",
      onboard2Title: "Expand a heading",
      onboard2Body: "Grey bars are sections. Tap one to open or close it. The first section is already open.",
      onboard3Title: "See the meaning",
      onboard3Body: "Tap a Japanese line to show its translation when available. Use the top-bar button to show or hide all translations at once.",
      onboardBack: "Back",
      onboardNext: "Next",
      onboardStart: "Start"
    },
    vi: {
      showTranslation: "Hiện bản dịch",
      hideTranslation: "Ẩn bản dịch",
      meaning: "Nghĩa",
      guide: "Hướng dẫn",
      close: "Đóng",
      menu: "Menu",
      tabGrammar: "Ngữ pháp",
      tabPracticeB: "Luyện tập B",
      tabVocab: "Từ vựng",
      tabReading: "Đọc hiểu",
      tabExtra: "Bổ sung",
      tabDialogue: "Đàm thoại",
      tabDialoguePattern: "Mẫu đàm thoại",
      tabPattern: "Văn mẫu",
      tabExample: "Ví dụ",
      tabPracticeA: "Luyện tập A",
      tabQuestion: "Câu {n}",
      answersTranslate: "Đáp án & dịch",
      scriptTranslate: "Script & dịch",
      partN: "Phần {n}",
      dialoguePatternN: "Mẫu đàm thoại {n}",
      structure: "Cấu trúc",
      affirmative: "Khẳng định",
      negative: "Phủ định",
      kanji: "Hán tự",
      sinoViet: "Âm Hán",
      vocabWord: "Từ vựng",
      answerLabel: "Đáp án:",
      lessonN: "Bài {n}",
      onboard1Title: "Các phần bài học",
      onboard1Body: "Các nút phía trên chuyển phần (ngữ pháp, luyện tập, hội thoại). Vuốt ngang nếu không đủ chỗ.",
      onboard2Title: "Mở tiêu đề",
      onboard2Body: "Thanh xám là từng mục. Chạm để mở hoặc đóng. Mục đầu đã được mở sẵn.",
      onboard3Title: "Xem nghĩa",
      onboard3Body: "Chạm một câu tiếng Nhật để xem bản dịch (nếu có). Dùng nút trên cùng để hiện hoặc ẩn tất cả bản dịch.",
      onboardBack: "Quay lại",
      onboardNext: "Tiếp",
      onboardStart: "Bắt đầu"
    },
    ja: {
      showTranslation: "訳を表示",
      hideTranslation: "訳を隠す",
      meaning: "意味",
      guide: "使い方",
      close: "閉じる",
      menu: "メニュー",
      tabGrammar: "文法",
      tabPracticeB: "練習B",
      tabVocab: "語彙",
      tabReading: "読解",
      tabExtra: "補足",
      tabDialogue: "会話",
      tabDialoguePattern: "会話例",
      tabPattern: "文型",
      tabExample: "例文",
      tabPracticeA: "練習A",
      tabQuestion: "問{n}",
      answersTranslate: "解答と訳",
      scriptTranslate: "スクリプトと訳",
      partN: "パート{n}",
      dialoguePatternN: "会話例{n}",
      structure: "文型",
      affirmative: "肯定",
      negative: "否定",
      kanji: "漢字",
      sinoViet: "漢越",
      vocabWord: "単語",
      answerLabel: "答え：",
      lessonN: "第{n}課",
      onboard1Title: "レッスンの区分",
      onboard1Body: "上のチップで文法・練習・会話などを切り替えます。入りきらないときは横にスワイプしてください。",
      onboard2Title: "見出しを開く",
      onboard2Body: "灰色のバーが各セクションです。タップで開閉できます。最初のセクションは開いてあります。",
      onboard3Title: "意味を見る",
      onboard3Body: "日本語の行をタップすると訳が出ます。上のボタンですべての訳をまとめて表示・非表示できます。",
      onboardBack: "戻る",
      onboardNext: "次へ",
      onboardStart: "始める"
    },
    zh: {
      showTranslation: "显示译文",
      hideTranslation: "隐藏译文",
      meaning: "释义",
      guide: "使用说明",
      close: "关闭",
      menu: "菜单",
      tabGrammar: "语法",
      tabPracticeB: "练习 B",
      tabVocab: "词汇",
      tabReading: "阅读",
      tabExtra: "补充",
      tabDialogue: "会话",
      tabDialoguePattern: "会话范例",
      tabPattern: "句型",
      tabExample: "例句",
      tabPracticeA: "练习 A",
      tabQuestion: "第{n}题",
      answersTranslate: "答案与译文",
      scriptTranslate: "原文与译文",
      partN: "第 {n} 部分",
      dialoguePatternN: "范例 {n}",
      structure: "结构",
      affirmative: "肯定",
      negative: "否定",
      kanji: "汉字",
      sinoViet: "汉越音",
      vocabWord: "单词",
      answerLabel: "答案：",
      lessonN: "第 {n} 课",
      onboard1Title: "课程分区",
      onboard1Body: "顶部标签可切换语法、练习、会话等。显示不下时可左右滑动。",
      onboard2Title: "展开标题",
      onboard2Body: "灰色条是各个小节。点一下即可展开或收起。第一节已默认打开。",
      onboard3Title: "查看意思",
      onboard3Body: "点日语句子可查看译文（如有）。也可用顶栏按钮一次显示或隐藏全部译文。",
      onboardBack: "返回",
      onboardNext: "下一步",
      onboardStart: "开始"
    },
    "zh-TW": {
      showTranslation: "顯示譯文",
      hideTranslation: "隱藏譯文",
      meaning: "釋義",
      guide: "使用說明",
      close: "關閉",
      menu: "選單",
      tabGrammar: "文法",
      tabPracticeB: "練習 B",
      tabVocab: "詞彙",
      tabReading: "閱讀",
      tabExtra: "補充",
      tabDialogue: "會話",
      tabDialoguePattern: "會話範例",
      tabPattern: "句型",
      tabExample: "例句",
      tabPracticeA: "練習 A",
      tabQuestion: "第{n}題",
      answersTranslate: "答案與譯文",
      scriptTranslate: "原文與譯文",
      partN: "第 {n} 部分",
      dialoguePatternN: "範例 {n}",
      structure: "結構",
      affirmative: "肯定",
      negative: "否定",
      kanji: "漢字",
      sinoViet: "漢越音",
      vocabWord: "單字",
      answerLabel: "答案：",
      lessonN: "第 {n} 課",
      onboard1Title: "課程分區",
      onboard1Body: "頂部標籤可切換文法、練習、會話等。顯示不下時可左右滑動。",
      onboard2Title: "展開標題",
      onboard2Body: "灰色列是各個小節。點一下即可展開或收合。第一節已預設開啟。",
      onboard3Title: "查看意思",
      onboard3Body: "點日文句子可查看譯文（如有）。也可用頂欄按鈕一次顯示或隱藏全部譯文。",
      onboardBack: "返回",
      onboardNext: "下一步",
      onboardStart: "開始"
    },
    ko: {
      showTranslation: "번역 보기",
      hideTranslation: "번역 숨기기",
      meaning: "의미",
      guide: "사용 방법",
      close: "닫기",
      menu: "메뉴",
      tabGrammar: "문법",
      tabPracticeB: "연습 B",
      tabVocab: "어휘",
      tabReading: "독해",
      tabExtra: "보충",
      tabDialogue: "회화",
      tabDialoguePattern: "회화 예",
      tabPattern: "문형",
      tabExample: "예문",
      tabPracticeA: "연습 A",
      tabQuestion: "문제 {n}",
      answersTranslate: "정답과 번역",
      scriptTranslate: "스크립트와 번역",
      partN: "{n}부",
      dialoguePatternN: "예 {n}",
      structure: "구조",
      affirmative: "긍정",
      negative: "부정",
      kanji: "한자",
      sinoViet: "한월음",
      vocabWord: "단어",
      answerLabel: "정답:",
      lessonN: "{n}과",
      onboard1Title: "수업 구역",
      onboard1Body: "위 칩으로 문법, 연습, 회화 등을 바꿉니다. 다 안 보이면 옆으로 미세요.",
      onboard2Title: "제목 열기",
      onboard2Body: "회색 막대가 각 섹션입니다. 눌러서 열고 닫을 수 있습니다. 첫 섹션은 이미 열려 있습니다.",
      onboard3Title: "뜻 보기",
      onboard3Body: "일본어 줄을 누르면 번역이 나옵니다. 위 버튼으로 모든 번역을 한 번에 켜거나 끌 수 있습니다.",
      onboardBack: "뒤로",
      onboardNext: "다음",
      onboardStart: "시작"
    },
    th: {
      showTranslation: "แสดงคำแปล",
      hideTranslation: "ซ่อนคำแปล",
      meaning: "ความหมาย",
      guide: "วิธีใช้",
      close: "ปิด",
      menu: "เมนู",
      tabGrammar: "ไวยากรณ์",
      tabPracticeB: "แบบฝึก B",
      tabVocab: "คำศัพท์",
      tabReading: "อ่านเข้าใจ",
      tabExtra: "เพิ่มเติม",
      tabDialogue: "บทสนทนา",
      tabDialoguePattern: "ตัวอย่างสนทนา",
      tabPattern: "รูปประโยค",
      tabExample: "ตัวอย่าง",
      tabPracticeA: "แบบฝึก A",
      tabQuestion: "ข้อ {n}",
      answersTranslate: "เฉลยและคำแปล",
      scriptTranslate: "บทและคำแปล",
      partN: "ส่วนที่ {n}",
      dialoguePatternN: "แบบที่ {n}",
      structure: "โครงสร้าง",
      affirmative: "บอกเล่า",
      negative: "ปฏิเสธ",
      kanji: "คันจิ",
      sinoViet: "เสียงฮันเวียด",
      vocabWord: "คำ",
      answerLabel: "คำตอบ:",
      lessonN: "บทที่ {n}",
      onboard1Title: "ส่วนของบทเรียน",
      onboard1Body: "ปุ่มด้านบนสลับไวยากรณ์ แบบฝึก สนทนา ปัดข้างถ้าไม่ครบ",
      onboard2Title: "เปิดหัวข้อ",
      onboard2Body: "แถบเทาคือแต่ละหัวข้อ แตะเพื่อเปิดหรือปิด ส่วนแรกเปิดไว้แล้ว",
      onboard3Title: "ดูความหมาย",
      onboard3Body: "แตะประโยคญี่ปุ่นเพื่อดูคำแปล (ถ้ามี) ใช้ปุ่มบนสุดเพื่อเปิดหรือซ่อนคำแปลทั้งหมด",
      onboardBack: "ย้อนกลับ",
      onboardNext: "ถัดไป",
      onboardStart: "เริ่ม"
    },
    id: {
      showTranslation: "Tampilkan terjemahan",
      hideTranslation: "Sembunyikan terjemahan",
      meaning: "Arti",
      guide: "Cara pakai",
      close: "Tutup",
      menu: "Menu",
      tabGrammar: "Tata bahasa",
      tabPracticeB: "Latihan B",
      tabVocab: "Kosakata",
      tabReading: "Membaca",
      tabExtra: "Tambahan",
      tabDialogue: "Percakapan",
      tabDialoguePattern: "Pola percakapan",
      tabPattern: "Pola kalimat",
      tabExample: "Contoh",
      tabPracticeA: "Latihan A",
      tabQuestion: "Soal {n}",
      answersTranslate: "Jawaban & terjemahan",
      scriptTranslate: "Naskah & terjemahan",
      partN: "Bagian {n}",
      dialoguePatternN: "Pola {n}",
      structure: "Struktur",
      affirmative: "Afirmatif",
      negative: "Negatif",
      kanji: "Kanji",
      sinoViet: "Sino-Viet",
      vocabWord: "Kata",
      answerLabel: "Jawaban:",
      lessonN: "Pelajaran {n}",
      onboard1Title: "Bagian pelajaran",
      onboard1Body: "Chip di atas berpindah bagian (tata bahasa, latihan, percakapan). Geser ke samping jika tidak muat.",
      onboard2Title: "Buka judul",
      onboard2Body: "Bilah abu-abu adalah bagian. Ketuk untuk membuka atau menutup. Bagian pertama sudah terbuka.",
      onboard3Title: "Lihat arti",
      onboard3Body: "Ketuk baris Jepang untuk melihat terjemahan jika ada. Gunakan tombol atas untuk menampilkan atau menyembunyikan semua terjemahan.",
      onboardBack: "Kembali",
      onboardNext: "Lanjut",
      onboardStart: "Mulai"
    }
  };

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function closest(el, selector) {
    while (el && el.nodeType === 1) {
      if (el.matches && el.matches(selector)) return el;
      if (el.msMatchesSelector && el.msMatchesSelector(selector)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function normalizeLang(code) {
    if (!code) return "en";
    var raw = String(code).trim().replace(/_/g, "-").toLowerCase();
    if (LANG_ALIASES[raw]) return LANG_ALIASES[raw];
    if (raw.indexOf("zh-hant") === 0 || raw === "zh-tw" || raw === "zh-hk") return "zh-TW";
    var base = raw.split("-")[0];
    if (base === "zh") return "zh";
    if (STRINGS[raw]) return raw;
    if (STRINGS[base]) return base;
    return "en";
  }

  function detectLang() {
    var fromQuery = "";
    try {
      var match = String(location.search || "").match(/[?&]lang=([^&]+)/i);
      if (match) fromQuery = decodeURIComponent(match[1].replace(/\+/g, " "));
    } catch (e) {}
    if (fromQuery) return normalizeLang(fromQuery);
    if (window.jlptUxLang) return normalizeLang(window.jlptUxLang);
    try {
      var stored = localStorage.getItem(STORAGE_LANG);
      if (stored) return normalizeLang(stored);
    } catch (e2) {}
    return "en";
  }

  function formatStr(str, vars) {
    if (!vars) return str;
    return String(str).replace(/\{(\w+)\}/g, function (_, key) {
      return vars[key] != null ? String(vars[key]) : "";
    });
  }

  function t(key, vars) {
    var pack = STRINGS[state.lang] || STRINGS.en;
    var str = (pack && pack[key]) || STRINGS.en[key] || key;
    return formatStr(str, vars);
  }

  function persistLang(code) {
    state.lang = normalizeLang(code);
    try {
      localStorage.setItem(STORAGE_LANG, state.lang);
    } catch (e) {}
    window.jlptUxLang = state.lang;
    try {
      document.documentElement.setAttribute("lang", state.lang);
    } catch (e2) {}
  }

  function injectCss() {
    if (qs("#minna-ux-css")) return;
    var css = [
      "html,body{max-width:100%;overflow-x:hidden;}",
      "body.minna-ux-ready{padding-top:52px;}",
      ".button_minna,#ampz_inline_bottom,#ampz,#rt-content-bottom,.ampz_container{display:none !important;}",
      "p[style*='margin-left']{margin-left:0 !important;}",
      "img{max-width:100% !important;height:auto !important;}",
      ".ppq-audio-player{height:48px !important;line-height:48px !important;border-radius:10px;margin:8px 0;}",
      ".ppq-audio-player .play-pause-btn .play-pause-icon{width:36px !important;height:36px !important;}",
      ".ppq-audio-player .player-bar{margin-top:21px !important;}",
      "ul.tabs{display:flex !important;float:none !important;flex-wrap:nowrap;height:auto !important;",
      "  width:auto !important;overflow-x:auto;-webkit-overflow-scrolling:touch;gap:6px;",
      "  margin:0 !important;padding:8px 8px 6px !important;border:0 !important;",
      "  position:sticky;top:52px;z-index:9990;background:#fff;}",
      "ul.tabs li{float:none !important;flex:0 0 auto;height:auto !important;line-height:1.2 !important;",
      "  border:0 !important;margin:0 !important;overflow:visible !important;background:transparent !important;}",
      "ul.tabs li a{padding:10px 14px !important;border:0 !important;border-radius:20px;background:#f2f4f7;",
      "  font-size:14px !important;white-space:nowrap;font-weight:600;}",
      "ul.tabs li.active a, html ul.tabs li.active, html ul.tabs li.active a:hover{",
      "  background:#5c90d2 !important;color:#fff !important;border:0 !important;}",
      ".tab_container{float:none !important;width:100% !important;margin:0 !important;}",
      ".tab_content{padding:12px !important;border-radius:0 0 8px 8px;}",
      ".slide-title{display:flex;align-items:center;justify-content:space-between;min-height:44px;",
      "  border-radius:8px 8px 0 0;padding-right:8px;}",
      ".slide-title span{flex:1;}",
      ".minna-chevron{flex-shrink:0;margin:0 8px;color:#666;font-size:12px;}",
      ".slide-title.active .minna-chevron{transform:rotate(180deg);}",
      ".candich{cursor:pointer;border-radius:4px;padding:4px 2px;}",
      "body.minna-tr-on .kqdich,.tudich.minna-open .kqdich{",
      "  display:block !important;opacity:1 !important;position:static !important;",
      "  width:auto !important;max-width:100%;height:auto !important;margin-top:4px;}",
      "body.minna-tr-on .nddich,.tudich.minna-open .nddich{",
      "  width:auto !important;max-width:100%;display:block;}",
      "body.minna-tr-on .kqdich span,.tudich.minna-open .kqdich span{width:auto !important;height:auto !important;}",
      "body.minna-hide-tr .kqdich,body.minna-hide-tr .nddich{display:none !important;}",
      ".vietbtn,.anhbtn{display:none !important;}",
      "body.minna-hide-sino .search_result th.ah,body.minna-hide-sino .search_result td:nth-child(2),",
      "body.minna-hide-sino .td2,body.minna-hide-sino .td6{display:none !important;}",
      ".minna-topbar{position:fixed;top:0;left:0;right:0;z-index:10000;display:flex;align-items:center;",
      "  gap:8px;padding:6px 10px;min-height:52px;background:#fff;border-bottom:1px solid #e6e6e6;}",
      ".minna-topbar-title{flex:1;min-width:0;font-size:14px;font-weight:700;white-space:nowrap;",
      "  overflow:hidden;text-overflow:ellipsis;}",
      ".minna-topbar button{border:0;border-radius:10px;min-height:40px;padding:0 12px;font-size:13px;font-weight:600;",
      "  background:#f2f4f7;color:#333;flex-shrink:0;}",
      ".minna-topbar button.primary{background:#5c90d2;color:#fff;}",
      ".minna-icon-btn{width:40px;padding:0 !important;font-size:18px;}",
      ".minna-overlay{position:fixed;top:0;right:0;bottom:0;left:0;z-index:10020;background:rgba(0,0,0,0.45);",
      "  display:flex;align-items:center;justify-content:center;padding:16px;}",
      ".minna-sheet{width:100%;max-width:420px;background:#fff;border-radius:16px;padding:20px;}",
      ".minna-sheet h3{margin:0 0 10px;font-size:17px;}",
      ".minna-sheet p{margin:0 0 14px;font-size:14px;line-height:1.5;color:#333;}",
      ".minna-dots{display:flex;gap:6px;justify-content:center;margin:12px 0;}",
      ".minna-dots span{width:8px;height:8px;border-radius:50%;background:#d0d5dd;}",
      ".minna-dots span.on{background:#5c90d2;}",
      ".minna-actions{display:flex;gap:8px;}",
      ".minna-actions button{flex:1;min-height:44px;border:0;border-radius:10px;font-size:15px;font-weight:600;}"
    ].join("\n");
    var style = document.createElement("style");
    style.id = "minna-ux-css";
    style.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(style);
  }

  function pageTitle() {
    var file = (location.pathname || "").split("/").pop() || "";
    var m = file.match(/bai-(\d+)/i);
    if (!m) m = file.match(/(\d+)/);
    if (m) return t("lessonN", { n: parseInt(m[1], 10) });
    return file.replace(/\.html$/i, "").replace(/-/g, " ") || "Minna";
  }

  function mapTabLabel(src) {
    src = (src || "").replace(/\s+/g, " ").trim();
    if (/^Ngữ Pháp$/i.test(src)) return t("tabGrammar");
    if (/^Luyện Tập B$/i.test(src)) return t("tabPracticeB");
    if (/^Từ vựng$/i.test(src)) return t("tabVocab");
    if (/^Đọc hiểu$/i.test(src)) return t("tabReading");
    if (/^Bổ sung$/i.test(src)) return t("tabExtra");
    if (/Bài đàm thoại|会話/.test(src)) return t("tabDialogue");
    if (/Mẫu đàm thoại|練習/.test(src) && /C\)|れんしゅう/.test(src)) return t("tabDialoguePattern");
    if (/文型|văn mẫu/.test(src)) return t("tabPattern");
    if (/例文|ví dụ/.test(src)) return t("tabExample");
    if (/練習\s*A|Luyện tập A/.test(src)) return t("tabPracticeA");
    var q = src.match(/^Câu\s*(\d+)$/i);
    if (q) return t("tabQuestion", { n: q[1] });
    return "";
  }

  function mapSlideLabel(src) {
    src = (src || "").replace(/\s+/g, " ").trim();
    if (/Đáp\s*Án|Answers/i.test(src) && /[Dd]ịch|[Tt]ranslat/.test(src)) return t("answersTranslate");
    if (/Script/i.test(src)) return t("scriptTranslate");
    var part = src.match(/^Phần\s+(\d+)\s*:?(.*)$/i);
    if (part) {
      var label = t("partN", { n: part[1] });
      if (state.lang === "vi" && part[2] && part[2].trim()) label += ": " + part[2].trim();
      return label;
    }
    var pat = src.match(/^Mẫu đàm thoại\s+(\d+)/i);
    if (pat) return t("dialoguePatternN", { n: pat[1] });
    return "";
  }

  function translateTabs() {
    qsa("ul.tabs li a").forEach(function (a) {
      if (!a.getAttribute("data-minna-html")) {
        a.setAttribute("data-minna-html", a.innerHTML);
      }
      if (state.lang === "vi") {
        a.innerHTML = a.getAttribute("data-minna-html");
        return;
      }
      var src = (a.textContent || "").replace(/\s+/g, " ").trim();
      var out = mapTabLabel(src);
      if (out) a.textContent = out;
    });
  }

  function translateSlides() {
    qsa(".slide-title span").forEach(function (span) {
      if (!span.getAttribute("data-minna-html")) {
        span.setAttribute("data-minna-html", span.innerHTML);
      }
      var src = (span.getAttribute("data-minna-html") || span.textContent || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (state.lang === "vi") {
        var mappedVi = mapSlideLabel(src);
        span.innerHTML = mappedVi || span.getAttribute("data-minna-html");
        return;
      }
      var out = mapSlideLabel(src);
      if (out) span.textContent = out;
      else span.innerHTML = span.getAttribute("data-minna-html");
    });
  }

  function translateExact() {
    var map = {
      "Cấu trúc": "structure",
      "Khẳng định": "affirmative",
      "Phủ định": "negative",
      "Hán Tự": "kanji",
      "Âm Hán": "sinoViet",
      "Từ Vựng": "vocabWord",
      "Đáp án:": "answerLabel",
      "Đáp án": "answerLabel"
    };
    qsa("th, strong, .slide-title span").forEach(function (el) {
      var raw = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (!el.getAttribute("data-minna-exact")) {
        if (!map[raw]) return;
        el.setAttribute("data-minna-exact", raw);
      }
      var key = map[el.getAttribute("data-minna-exact")];
      if (key) el.textContent = t(key);
    });
    qsa("span").forEach(function (el) {
      var raw = (el.textContent || "").trim();
      if (raw === "Đáp án:" || raw === "Đáp án") {
        if (!el.getAttribute("data-minna-exact")) el.setAttribute("data-minna-exact", raw);
        el.textContent = t("answerLabel");
      }
    });
  }

  function applyMeanings() {
    var vi = state.lang === "vi";
    qsa(".nghia_viet").forEach(function (el) {
      el.style.display = vi ? "" : "none";
    });
    qsa(".nghia_anh").forEach(function (el) {
      el.style.display = vi ? "none" : "";
    });
    document.body.classList.toggle("minna-hide-sino", !vi);
    document.body.classList.toggle("minna-hide-tr", !canShowTranslation());
  }

  function canShowTranslation() {
    return state.lang === "vi" && !!qs(".nddich, .kqdich");
  }

  function setTrOn(on) {
    state.trOn = !!on && canShowTranslation();
    try {
      localStorage.setItem(STORAGE_TR, state.trOn ? "1" : "0");
    } catch (e) {}
    document.body.classList.toggle("minna-tr-on", state.trOn);
    if (!state.trOn) {
      qsa(".tudich.minna-open").forEach(function (el) {
        el.classList.remove("minna-open");
      });
    }
    var btn = qs("#minna-tr-btn");
    if (btn) {
      btn.style.display = canShowTranslation() ? "" : "none";
      btn.textContent = state.trOn ? t("hideTranslation") : t("showTranslation");
    }
  }

  function wireTapTranslate() {
    if (window.jQuery) {
      try {
        window.jQuery(".candich, .item").off("mouseenter mouseleave mousemove hover");
      } catch (e) {}
    }
    document.body.addEventListener(
      "click",
      function (e) {
        if (!canShowTranslation() || state.trOn) return;
        var line = closest(e.target, ".candich");
        if (!line) return;
        var wrap = closest(line, ".tudich");
        if (!wrap) return;
        wrap.classList.toggle("minna-open");
      },
      true
    );
  }

  function interceptSiteNav() {
    document.body.addEventListener(
      "click",
      function (e) {
        var btn = closest(e.target, ".button_minna");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        var src = btn.getAttribute("onclick") || "";
        var m = src.match(/bai-(\d+)-([a-z0-9-]+)/i);
        try {
          if (window.MinnaHost && typeof window.MinnaHost.postMessage === "function" && m) {
            window.MinnaHost.postMessage(
              JSON.stringify({ type: "open_skill", lesson: m[1], skill: m[2] })
            );
          }
        } catch (err) {}
        return false;
      },
      true
    );
  }

  function enhanceAccordions() {
    qsa(".slide-title").forEach(function (title) {
      if (!title.querySelector(".minna-chevron")) {
        var ch = document.createElement("span");
        ch.className = "minna-chevron";
        ch.setAttribute("aria-hidden", "true");
        ch.textContent = "▾";
        title.appendChild(ch);
      }
    });
    var scopes = qsa(".tab_content");
    if (!scopes.length) scopes = [document.body];
    scopes.forEach(function (scope) {
      var slides = qsa(".slide", scope);
      slides.forEach(function (slide, i) {
        var title = qs(".slide-title", slide);
        var content = qs(".slide-content", slide);
        if (!title || !content) return;
        if (title.classList.contains("sl2")) return;
        if (i === 0) {
          content.style.display = "block";
          title.classList.add("active");
        }
      });
    });
  }

  function buildChrome() {
    if (qs("#minna-topbar")) return;
    var top = document.createElement("div");
    top.id = "minna-topbar";
    top.className = "minna-topbar";
    top.innerHTML =
      '<div class="minna-topbar-title"></div>' +
      '<button type="button" id="minna-tr-btn"></button>' +
      '<button type="button" class="minna-icon-btn" id="minna-more" aria-label="">⋯</button>';
    document.body.insertBefore(top, document.body.firstChild);
    qs(".minna-topbar-title", top).textContent = pageTitle();
    qs("#minna-more").onclick = function () {
      showOnboarding(true);
    };
    qs("#minna-tr-btn").onclick = function () {
      setTrOn(!state.trOn);
    };
    document.body.classList.add("minna-ux-ready");
  }

  function applyLang() {
    var more = qs("#minna-more");
    if (more) more.setAttribute("aria-label", t("menu"));
    var title = qs(".minna-topbar-title");
    if (title) title.textContent = pageTitle();
    translateTabs();
    translateSlides();
    translateExact();
    applyMeanings();
    setTrOn(state.trOn && canShowTranslation());
  }

  function closeOverlays() {
    qsa(".minna-overlay").forEach(function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function showOnboarding(force) {
    var seen = false;
    try {
      seen = localStorage.getItem(STORAGE_ONBOARD) === "1";
    } catch (e) {}
    if (seen && !force) return;
    var steps = [
      { title: t("onboard1Title"), body: t("onboard1Body") },
      { title: t("onboard2Title"), body: t("onboard2Body") },
      { title: t("onboard3Title"), body: t("onboard3Body") }
    ];
    var step = 0;
    function render() {
      closeOverlays();
      var s = steps[step];
      var dots = steps
        .map(function (_, i) {
          return '<span class="' + (i === step ? "on" : "") + '"></span>';
        })
        .join("");
      var wrap = document.createElement("div");
      wrap.className = "minna-overlay";
      wrap.innerHTML =
        '<div class="minna-sheet"><h3></h3><p></p><div class="minna-dots">' +
        dots +
        '</div><div class="minna-actions">' +
        (step > 0 ? '<button type="button" id="minna-ob-back"></button>' : "") +
        '<button type="button" id="minna-ob-next"></button></div></div>';
      qs("h3", wrap).textContent = s.title;
      qs("p", wrap).textContent = s.body;
      var next = qs("#minna-ob-next", wrap);
      next.textContent = step === steps.length - 1 ? t("onboardStart") : t("onboardNext");
      next.style.background = "#5c90d2";
      next.style.color = "#fff";
      next.onclick = function () {
        if (step === steps.length - 1) {
          try {
            localStorage.setItem(STORAGE_ONBOARD, "1");
          } catch (e2) {}
          closeOverlays();
          return;
        }
        step++;
        render();
      };
      var back = qs("#minna-ob-back", wrap);
      if (back) {
        back.textContent = t("onboardBack");
        back.style.background = "#f2f4f7";
        back.onclick = function () {
          step--;
          render();
        };
      }
      wrap.addEventListener("click", function (e) {
        if (e.target === wrap) closeOverlays();
      });
      document.body.appendChild(wrap);
    }
    render();
  }

  function loadPrefs() {
    try {
      state.trOn = localStorage.getItem(STORAGE_TR) === "1";
    } catch (e) {
      state.trOn = false;
    }
  }

  window.minnaUxSetLang = function (code) {
    persistLang(code);
    applyLang();
  };
  if (!window.jlptUxSetLang) {
    window.jlptUxSetLang = window.minnaUxSetLang;
  } else {
    var prev = window.jlptUxSetLang;
    window.jlptUxSetLang = function (code) {
      prev(code);
      persistLang(code);
      applyLang();
    };
  }

  function init() {
    if (!document.body) return;
    injectCss();
    persistLang(detectLang());
    loadPrefs();
    buildChrome();
    enhanceAccordions();
    wireTapTranslate();
    interceptSiteNav();
    applyLang();
    showOnboarding(false);
  }

  function start() {
    if (document.body) {
      init();
      return;
    }
    document.addEventListener("DOMContentLoaded", init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(start, 80);
    });
  } else {
    setTimeout(start, 80);
  }
})();
