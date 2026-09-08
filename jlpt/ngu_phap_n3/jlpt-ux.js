/**
 * JLPT WebView UX overlay.
 * Loaded at the end of each quiz page (script src="jlpt-ux.js").
 *
 * Language: Flutter should set the user's mother tongue before/at load:
 *   1) UserScript at document start: window.jlptUxLang = 'en';
 *   2) URL query: quiz.html?lang=en
 *   3) After load: controller.runJavaScript("jlptUxSetLang('en')")
 * Supported: en, vi, ja, zh, zh-TW, ko, th, id. Unknown codes fall back to en.
 */
(function () {
  if (window.__jlptUxInit) return;
  window.__jlptUxInit = true;

  var STORAGE_ONBOARD = "jlpt_ux_onboard_v1";
  var STORAGE_ONE_Q = "jlpt_ux_one_q";
  var STORAGE_LANG = "jlpt_ux_lang";

  var state = {
    graded: false,
    oneQuestion: false,
    currentIndex: 0,
    origCheck: null,
    origReset: null,
    origResultCorrect: null,
    lang: "en"
  };

  var HINT_RULES = [
    { test: /読み方/, key: "hintReading" },
    { test: /漢字で書く/, key: "hintKanji" },
    { test: /意味が最も近い/, key: "hintSynonym" },
    { test: /使い方/, key: "hintUsage" },
    { test: /（　*　*）に入れる/, key: "hintParen" },
    { test: /に入れるのに最もよい/, key: "hintBlank" },
    { test: /★/, key: "hintStar" },
    { test: /文章を読んで/, key: "hintPassage" }
  ];

  var LANG_ALIASES = {
    vn: "vi",
    vie: "vi",
    vietnamese: "vi",
    "vi-vn": "vi",
    eng: "en",
    english: "en",
    "en-us": "en",
    "en-gb": "en",
    jp: "ja",
    jpn: "ja",
    japanese: "ja",
    "ja-jp": "ja",
    cn: "zh",
    chi: "zh",
    chinese: "zh",
    "zh-cn": "zh",
    "zh-hans": "zh",
    "zh-sg": "zh",
    "zh-tw": "zh-TW",
    "zh-hk": "zh-TW",
    "zh-hant": "zh-TW",
    "zh-mo": "zh-TW",
    kr: "ko",
    kor: "ko",
    korean: "ko",
    "ko-kr": "ko",
    thai: "th",
    "th-th": "th",
    ind: "id",
    indonesian: "id",
    "id-id": "id"
  };

  var STRINGS = {
    en: {
      submit: "Submit",
      retry: "Retry",
      reviewWrong: "Review mistakes",
      close: "Close",
      cancel: "Cancel",
      ok: "OK",
      menu: "Menu",
      prev: "Previous",
      next: "Next",
      moreAll: "Show all questions",
      moreOne: "One question at a time",
      meaning: "Meaning",
      answers: "Answer key",
      guide: "How to use",
      result: "Result",
      meaningLocked: "Submit the quiz to see the translation.",
      answersLocked: "Submit the quiz to see the answer key.",
      unanswered: "You still have {n} unanswered questions. Submit anyway?",
      retryConfirm: "Retry this test? All answers will be cleared.",
      progressCorrect: "Correct {correct}/{total} ({pct}%)",
      progressQuestion: "Question {current}/{total} · answered {answered}/{total}",
      progressAnswered: "Answered {answered}/{total}",
      testNumber: "Test {n}",
      scoreCorrect: "Correct {pct}%",
      hintReading: "Choose the correct reading of the underlined part.",
      hintKanji: "Choose the correct kanji for the underlined part.",
      hintSynonym: "Choose the word closest in meaning to the underlined part.",
      hintUsage: "Choose the sentence that uses the word correctly.",
      hintParen: "Choose the best option to fill in the parentheses.",
      hintBlank: "Choose the best option to fill in the blank.",
      hintStar: "Choose the best phrase for the ★ position.",
      hintPassage: "Read the passage and choose the best option for each blank.",
      hintDefault: "Choose one answer (1–4 / A–D) for each question.",
      onboard1Title: "How to answer",
      onboard1Body: "Each question has 4 choices (A–D or 1–4). Tap the whole row to select — you do not need to hit the small circle.",
      onboard2Title: "What to answer",
      onboard2Body: "The underlined or highlighted word is what the question asks about. A short instruction in your language appears above each section.",
      onboard3Title: "Submit and retry",
      onboard3Body: "Use the bottom bar to submit for scoring or retry to clear answers. Open ⋯ to switch to one-question mode — easier when you are starting out.",
      onboardBack: "Back",
      onboardNext: "Next",
      onboardStart: "Start"
    },
    vi: {
      submit: "Nộp bài",
      retry: "Làm lại",
      reviewWrong: "Xem lỗi",
      close: "Đóng",
      cancel: "Hủy",
      ok: "Đồng ý",
      menu: "Menu",
      prev: "Câu trước",
      next: "Câu sau",
      moreAll: "Xem tất cả câu",
      moreOne: "Làm từng câu",
      meaning: "Dịch nghĩa",
      answers: "Đáp án",
      guide: "Hướng dẫn",
      result: "Kết quả",
      meaningLocked: "Nộp bài xong sẽ hiện bản dịch.",
      answersLocked: "Nộp bài xong mới xem đáp án.",
      unanswered: "Còn {n} câu chưa chọn. Nộp bài luôn?",
      retryConfirm: "Làm lại đề này? Mọi câu trả lời sẽ bị xóa.",
      progressCorrect: "Đúng {correct}/{total} ({pct}%)",
      progressQuestion: "Câu {current}/{total} · đã chọn {answered}/{total}",
      progressAnswered: "Đã chọn {answered}/{total}",
      testNumber: "Đề số {n}",
      scoreCorrect: "Đúng {pct}%",
      hintReading: "Chọn cách đọc đúng của phần gạch chân.",
      hintKanji: "Chọn chữ Hán đúng cho phần gạch chân.",
      hintSynonym: "Chọn từ gần nghĩa nhất với phần gạch chân.",
      hintUsage: "Chọn câu dùng từ đó đúng nhất.",
      hintParen: "Chọn cụm từ thích hợp để điền vào ngoặc.",
      hintBlank: "Chọn cụm từ thích hợp để điền vào chỗ trống.",
      hintStar: "Sắp xếp / chọn cụm thích hợp cho vị trí ★.",
      hintPassage: "Đọc đoạn văn và chọn đáp án điền vào chỗ trống.",
      hintDefault: "Chọn một đáp án (1–4 / A–D) cho mỗi câu.",
      onboard1Title: "Cách làm bài",
      onboard1Body: "Mỗi câu có 4 lựa chọn A–D (hoặc 1–4). Chạm vào cả dòng đáp án để chọn, không cần nhằm đúng nút tròn nhỏ.",
      onboard2Title: "Phần cần trả lời",
      onboard2Body: "Từ được gạch chân hoặc tô màu là phần câu hỏi. Ở trên mỗi nhóm có dòng giải thích yêu cầu bằng ngôn ngữ của bạn.",
      onboard3Title: "Nộp bài và làm lại",
      onboard3Body: "Thanh dưới cùng: Nộp bài để chấm điểm, Làm lại để xóa đáp án. Bấm ⋯ để làm từng câu một — dễ hơn khi mới bắt đầu.",
      onboardBack: "Quay lại",
      onboardNext: "Tiếp",
      onboardStart: "Bắt đầu"
    },
    ja: {
      submit: "採点する",
      retry: "やり直す",
      reviewWrong: "間違いを見る",
      close: "閉じる",
      cancel: "キャンセル",
      ok: "OK",
      menu: "メニュー",
      prev: "前の問題",
      next: "次の問題",
      moreAll: "全問を表示",
      moreOne: "1問ずつ解く",
      meaning: "意味",
      answers: "正解",
      guide: "使い方",
      result: "結果",
      meaningLocked: "採点後に訳が表示されます。",
      answersLocked: "採点後に正解を見られます。",
      unanswered: "未回答が {n} 問あります。このまま採点しますか？",
      retryConfirm: "やり直しますか？回答はすべて消えます。",
      progressCorrect: "正解 {correct}/{total}（{pct}%）",
      progressQuestion: "問題 {current}/{total} · 回答済み {answered}/{total}",
      progressAnswered: "回答済み {answered}/{total}",
      testNumber: "第{n}回",
      scoreCorrect: "正解率 {pct}%",
      hintReading: "下線部の正しい読み方を選んでください。",
      hintKanji: "下線部に合う漢字を選んでください。",
      hintSynonym: "下線部に最も近い意味の語を選んでください。",
      hintUsage: "その語の正しい使い方の文を選んでください。",
      hintParen: "（　）に入る最もよいものを選んでください。",
      hintBlank: "空欄に入る最もよいものを選んでください。",
      hintStar: "★の位置に入る最もよいものを選んでください。",
      hintPassage: "文章を読んで、空欄に入る最もよいものを選んでください。",
      hintDefault: "各問について選択肢（1–4 / A–D）から1つ選んでください。",
      onboard1Title: "答え方",
      onboard1Body: "各問は選択肢が4つ（A–D または 1–4）です。丸印だけでなく、行全体をタップして選べます。",
      onboard2Title: "何を答えるか",
      onboard2Body: "下線や色付きの語が問題の対象です。各セクションの上に、あなたの言語での短い説明があります。",
      onboard3Title: "採点とやり直し",
      onboard3Body: "下のバーで採点するか、やり直して回答を消せます。⋯ から1問ずつモードに切り替えられます。",
      onboardBack: "戻る",
      onboardNext: "次へ",
      onboardStart: "始める"
    },
    zh: {
      submit: "提交",
      retry: "重做",
      reviewWrong: "查看错题",
      close: "关闭",
      cancel: "取消",
      ok: "确定",
      menu: "菜单",
      prev: "上一题",
      next: "下一题",
      moreAll: "显示全部题目",
      moreOne: "逐题作答",
      meaning: "释义",
      answers: "答案",
      guide: "使用说明",
      result: "成绩",
      meaningLocked: "提交后即可查看译文。",
      answersLocked: "提交后即可查看答案。",
      unanswered: "还有 {n} 题未作答。确定提交吗？",
      retryConfirm: "重做本套题？所有作答将被清除。",
      progressCorrect: "正确 {correct}/{total}（{pct}%）",
      progressQuestion: "第 {current}/{total} 题 · 已答 {answered}/{total}",
      progressAnswered: "已答 {answered}/{total}",
      testNumber: "第 {n} 套",
      scoreCorrect: "正确率 {pct}%",
      hintReading: "请选择划线部分的正确读音。",
      hintKanji: "请选择划线部分对应的正确汉字。",
      hintSynonym: "请选择与划线部分意思最接近的词。",
      hintUsage: "请选择该词用法正确的句子。",
      hintParen: "请选择填入括号的最恰当选项。",
      hintBlank: "请选择填入空格的最恰当选项。",
      hintStar: "请选择填入 ★ 位置的最恰当选项。",
      hintPassage: "请阅读文章，选择填入空格的最恰当选项。",
      hintDefault: "每题从选项（1–4 / A–D）中选一个答案。",
      onboard1Title: "如何作答",
      onboard1Body: "每题有 4 个选项（A–D 或 1–4）。点击整行即可选择，不必对准小圆点。",
      onboard2Title: "题目问什么",
      onboard2Body: "下划线或高亮的词就是要考查的部分。每个部分上方有你所用语言的简短说明。",
      onboard3Title: "提交与重做",
      onboard3Body: "用底部栏提交评分，或重做以清空答案。点 ⋯ 可改为一次一题，更适合初学者。",
      onboardBack: "返回",
      onboardNext: "下一步",
      onboardStart: "开始"
    },
    "zh-TW": {
      submit: "提交",
      retry: "重做",
      reviewWrong: "查看錯題",
      close: "關閉",
      cancel: "取消",
      ok: "確定",
      menu: "選單",
      prev: "上一題",
      next: "下一題",
      moreAll: "顯示全部題目",
      moreOne: "逐題作答",
      meaning: "釋義",
      answers: "答案",
      guide: "使用說明",
      result: "成績",
      meaningLocked: "提交後即可查看譯文。",
      answersLocked: "提交後即可查看答案。",
      unanswered: "還有 {n} 題未作答。確定提交嗎？",
      retryConfirm: "重做本套題？所有作答將被清除。",
      progressCorrect: "正確 {correct}/{total}（{pct}%）",
      progressQuestion: "第 {current}/{total} 題 · 已答 {answered}/{total}",
      progressAnswered: "已答 {answered}/{total}",
      testNumber: "第 {n} 套",
      scoreCorrect: "正確率 {pct}%",
      hintReading: "請選擇劃線部分的正確讀音。",
      hintKanji: "請選擇劃線部分對應的正確漢字。",
      hintSynonym: "請選擇與劃線部分意思最接近的詞。",
      hintUsage: "請選擇該詞用法正確的句子。",
      hintParen: "請選擇填入括號的最恰當選項。",
      hintBlank: "請選擇填入空格的最恰當選項。",
      hintStar: "請選擇填入 ★ 位置的最恰當選項。",
      hintPassage: "請閱讀文章，選擇填入空格的最恰當選項。",
      hintDefault: "每題從選項（1–4 / A–D）中選一個答案。",
      onboard1Title: "如何作答",
      onboard1Body: "每題有 4 個選項（A–D 或 1–4）。點整行即可選擇，不必對準小圓點。",
      onboard2Title: "題目問什麼",
      onboard2Body: "底線或醒目提示的詞就是要考查的部分。每個部分上方有你所用語言的簡短說明。",
      onboard3Title: "提交與重做",
      onboard3Body: "用底部列提交評分，或重做以清空答案。點 ⋯ 可改為一次一題，更適合初學者。",
      onboardBack: "返回",
      onboardNext: "下一步",
      onboardStart: "開始"
    },
    ko: {
      submit: "제출",
      retry: "다시 풀기",
      reviewWrong: "틀린 문제 보기",
      close: "닫기",
      cancel: "취소",
      ok: "확인",
      menu: "메뉴",
      prev: "이전 문제",
      next: "다음 문제",
      moreAll: "모든 문제 보기",
      moreOne: "한 문제씩 풀기",
      meaning: "의미",
      answers: "정답",
      guide: "사용 방법",
      result: "결과",
      meaningLocked: "제출하면 번역을 볼 수 있습니다.",
      answersLocked: "제출하면 정답을 볼 수 있습니다.",
      unanswered: "아직 {n}문항이 남아 있습니다. 제출할까요?",
      retryConfirm: "다시 풀까요? 모든 답이 지워집니다.",
      progressCorrect: "정답 {correct}/{total} ({pct}%)",
      progressQuestion: "문제 {current}/{total} · 응답 {answered}/{total}",
      progressAnswered: "응답 {answered}/{total}",
      testNumber: "{n}회",
      scoreCorrect: "정답률 {pct}%",
      hintReading: "밑줄 친 부분의 올바른 읽기를 고르세요.",
      hintKanji: "밑줄 친 부분에 맞는 한자를 고르세요.",
      hintSynonym: "밑줄 친 부분과 가장 가까운 뜻의 단어를 고르세요.",
      hintUsage: "그 단어를 올바르게 쓴 문장을 고르세요.",
      hintParen: "괄호에 들어갈 가장 알맞은 것을 고르세요.",
      hintBlank: "빈칸에 들어갈 가장 알맞은 것을 고르세요.",
      hintStar: "★ 자리에 들어갈 가장 알맞은 것을 고르세요.",
      hintPassage: "글을 읽고 빈칸에 들어갈 가장 알맞은 것을 고르세요.",
      hintDefault: "각 문항에서 보기(1–4 / A–D) 중 하나를 고르세요.",
      onboard1Title: "푸는 방법",
      onboard1Body: "각 문항은 보기 4개(A–D 또는 1–4)입니다. 작은 원뿐 아니라 줄 전체를 눌러 선택할 수 있습니다.",
      onboard2Title: "무엇을 묻나요",
      onboard2Body: "밑줄이거나 강조된 단어가 문제의 대상입니다. 각 섹션 위에 사용 언어로 짧은 안내가 있습니다.",
      onboard3Title: "제출과 다시 풀기",
      onboard3Body: "아래 바로 채점하거나 다시 풀어 답을 지울 수 있습니다. ⋯ 에서 한 문제씩 모드로 바꿀 수 있습니다.",
      onboardBack: "뒤로",
      onboardNext: "다음",
      onboardStart: "시작"
    },
    th: {
      submit: "ส่งคำตอบ",
      retry: "ทำใหม่",
      reviewWrong: "ดูข้อที่ผิด",
      close: "ปิด",
      cancel: "ยกเลิก",
      ok: "ตกลง",
      menu: "เมนู",
      prev: "ข้อก่อน",
      next: "ข้อถัดไป",
      moreAll: "แสดงทุกข้อ",
      moreOne: "ทำทีละข้อ",
      meaning: "ความหมาย",
      answers: "เฉลย",
      guide: "วิธีใช้",
      result: "ผลคะแนน",
      meaningLocked: "ส่งคำตอบแล้วจึงดูคำแปลได้",
      answersLocked: "ส่งคำตอบแล้วจึงดูเฉลยได้",
      unanswered: "ยังไม่ได้ตอบ {n} ข้อ ส่งเลยไหม?",
      retryConfirm: "ทำชุดนี้อีกครั้ง? คำตอบทั้งหมดจะถูกลบ",
      progressCorrect: "ถูก {correct}/{total} ({pct}%)",
      progressQuestion: "ข้อ {current}/{total} · ตอบแล้ว {answered}/{total}",
      progressAnswered: "ตอบแล้ว {answered}/{total}",
      testNumber: "ชุดที่ {n}",
      scoreCorrect: "ถูก {pct}%",
      hintReading: "เลือกวิธีอ่านที่ถูกต้องของส่วนที่ขีดเส้นใต้",
      hintKanji: "เลือกคันจิที่ถูกต้องของส่วนที่ขีดเส้นใต้",
      hintSynonym: "เลือกคำที่ความหมายใกล้เคียงส่วนที่ขีดเส้นใต้ที่สุด",
      hintUsage: "เลือกประโยคที่ใช้คำนั้นได้ถูกต้อง",
      hintParen: "เลือกตัวเลือกที่เหมาะสมที่สุดสำหรับวงเล็บ",
      hintBlank: "เลือกตัวเลือกที่เหมาะสมที่สุดสำหรับช่องว่าง",
      hintStar: "เลือกวลีที่เหมาะสมที่สุดสำหรับตำแหน่ง ★",
      hintPassage: "อ่านข้อความแล้วเลือกคำตอบสำหรับช่องว่าง",
      hintDefault: "เลือกคำตอบหนึ่งข้อ (1–4 / A–D) ในแต่ละข้อ",
      onboard1Title: "วิธีตอบ",
      onboard1Body: "แต่ละข้อมี 4 ตัวเลือก (A–D หรือ 1–4) แตะทั้งแถวเพื่อเลือก ไม่ต้องเล็งจุดกลมเล็ก",
      onboard2Title: "ต้องตอบอะไร",
      onboard2Body: "คำที่ขีดเส้นใต้หรือไฮไลต์คือส่วนที่ถาม ด้านบนแต่ละชุดมีคำอธิบายสั้น ๆ ในภาษาของคุณ",
      onboard3Title: "ส่งและทำใหม่",
      onboard3Body: "แถบล่างใช้ส่งเพื่อตรวจคะแนน หรือทำใหม่เพื่อล้างคำตอบ กด ⋯ เพื่อทำทีละข้อ ง่ายกว่าตอนเริ่มเรียน",
      onboardBack: "ย้อนกลับ",
      onboardNext: "ถัดไป",
      onboardStart: "เริ่ม"
    },
    id: {
      submit: "Kirim",
      retry: "Ulangi",
      reviewWrong: "Lihat yang salah",
      close: "Tutup",
      cancel: "Batal",
      ok: "OK",
      menu: "Menu",
      prev: "Soal sebelumnya",
      next: "Soal berikutnya",
      moreAll: "Tampilkan semua soal",
      moreOne: "Satu soal per layar",
      meaning: "Arti",
      answers: "Kunci jawaban",
      guide: "Cara pakai",
      result: "Hasil",
      meaningLocked: "Kirim kuis untuk melihat terjemahan.",
      answersLocked: "Kirim kuis untuk melihat kunci jawaban.",
      unanswered: "Masih ada {n} soal belum dijawab. Kirim sekarang?",
      retryConfirm: "Ulangi tes ini? Semua jawaban akan dihapus.",
      progressCorrect: "Benar {correct}/{total} ({pct}%)",
      progressQuestion: "Soal {current}/{total} · terjawab {answered}/{total}",
      progressAnswered: "Terjawab {answered}/{total}",
      testNumber: "Tes {n}",
      scoreCorrect: "Benar {pct}%",
      hintReading: "Pilih cara baca yang benar untuk bagian yang digarisbawahi.",
      hintKanji: "Pilih kanji yang benar untuk bagian yang digarisbawahi.",
      hintSynonym: "Pilih kata yang paling dekat artinya dengan bagian yang digarisbawahi.",
      hintUsage: "Pilih kalimat yang memakai kata itu dengan benar.",
      hintParen: "Pilih opsi terbaik untuk mengisi tanda kurung.",
      hintBlank: "Pilih opsi terbaik untuk mengisi bagian kosong.",
      hintStar: "Pilih frasa terbaik untuk posisi ★.",
      hintPassage: "Baca teks dan pilih opsi terbaik untuk setiap bagian kosong.",
      hintDefault: "Pilih satu jawaban (1–4 / A–D) untuk setiap soal.",
      onboard1Title: "Cara menjawab",
      onboard1Body: "Setiap soal punya 4 pilihan (A–D atau 1–4). Ketuk seluruh baris untuk memilih — tidak perlu mengenai lingkaran kecil.",
      onboard2Title: "Apa yang ditanyakan",
      onboard2Body: "Kata yang digarisbawahi atau disorot adalah inti soal. Di atas setiap bagian ada petunjuk singkat dalam bahasa Anda.",
      onboard3Title: "Kirim dan ulangi",
      onboard3Body: "Bilah bawah untuk mengirim agar dinilai, atau ulangi untuk menghapus jawaban. Buka ⋯ untuk mode satu soal — lebih mudah bagi pemula.",
      onboardBack: "Kembali",
      onboardNext: "Lanjut",
      onboardStart: "Mulai"
    }
  };

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

  function applyLang() {
    var more = qs("#jlpt-more");
    if (more) more.setAttribute("aria-label", t("menu"));
    var prev = qs("#jlpt-prev");
    if (prev) prev.setAttribute("aria-label", t("prev"));
    var next = qs("#jlpt-next");
    if (next) next.setAttribute("aria-label", t("next"));
    var title = qs(".jlpt-topbar-title");
    if (title) title.textContent = pageTitle();
    qsa("[data-hint-key]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-hint-key"));
    });
    var closeBtn = document.getElementById("alert_dialog_button");
    if (closeBtn) closeBtn.value = t("close");
    renderBar();
    updateProgress();
  }

  window.jlptUxSetLang = function (code) {
    persistLang(code);
    applyLang();
  };

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function waitForQuiz(fn, tries) {
    tries = tries || 0;
    if (typeof window.check_result === "function" || tries > 40) {
      fn();
      return;
    }
    setTimeout(function () {
      waitForQuiz(fn, tries + 1);
    }, 50);
  }

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function getQuestionBlocks() {
    var byClass = qsa(".tracnghiem");
    if (byClass.length) return byClass;
    return qsa('#khungtracnghiem, div[id="khungtracnghiem"]');
  }

  function getQuestionCount() {
    if (typeof window.question_count === "number" && window.question_count > 0) {
      return window.question_count;
    }
    if (window.answer_id && window.answer_id.length) return window.answer_id.length;
    return getQuestionBlocks().length;
  }

  function countAnswered() {
    if (!window.answer_id) {
      var names = {};
      qsa('input[type="radio"]').forEach(function (r) {
        if (r.checked && r.name) names[r.name] = true;
      });
      return Object.keys(names).length;
    }
    var n = 0;
    for (var i = 0; i < window.answer_id.length; i++) {
      var ids = window.answer_id[i] || [];
      for (var j = 0; j < ids.length; j++) {
        var el = document.getElementById("answer_" + ids[j]);
        if (el && el.checked) {
          n++;
          break;
        }
      }
    }
    return n;
  }

  function countCorrect() {
    if (!window.answer_correct) return 0;
    var n = 0;
    for (var i = 0; i < window.answer_correct.length; i++) {
      var el = document.getElementById("answer_" + window.answer_correct[i]);
      if (el && el.checked) n++;
    }
    return n;
  }

  function firstUnansweredIndex() {
    if (!window.answer_id) return 0;
    for (var i = 0; i < window.answer_id.length; i++) {
      var ids = window.answer_id[i] || [];
      var any = false;
      for (var j = 0; j < ids.length; j++) {
        var el = document.getElementById("answer_" + ids[j]);
        if (el && el.checked) {
          any = true;
          break;
        }
      }
      if (!any) return i;
    }
    return 0;
  }

  function firstWrongIndex() {
    if (!window.answer_correct || !window.answer_id) return 0;
    for (var i = 0; i < window.answer_correct.length; i++) {
      var el = document.getElementById("answer_" + window.answer_correct[i]);
      if (!el || !el.checked) return i;
    }
    return 0;
  }

  function injectCss() {
    if (qs("#jlpt-ux-css")) return;
    var css = [
      "html,body{max-width:100%;overflow-x:hidden;}",
      "body.jlpt-ux-ready{padding-top:56px;padding-bottom:92px;}",
      "#ketqua,#lamlai,#dapan,#dichnghia{display:none !important;position:static !important;}",
      "#gui_ketqua{display:none !important;}",
      "h2{display:none !important;}",
      "#khungtracnghiem{line-height:1.7 !important;padding:8px 4px !important;}",
      "#table_tracnghiem{padding-left:4px !important;width:100%;}",
      "#table_tracnghiem td, .td_tracnghiem{",
      "  display:block;padding:12px 10px !important;min-height:44px;border-radius:8px;",
      "  margin:4px 0;background:#fff;box-sizing:border-box;",
      "}",
      "#table_tracnghiem td:active, .td_tracnghiem:active{background:#eef4fc;}",
      'input[type="radio"]{width:20px !important;height:20px !important;margin:0 8px 0 0 !important;',
      "  vertical-align:middle;flex-shrink:0;}",
      ".double, u{border-bottom:2px solid #5c90d2;background:#eef4fc;padding:0 3px;border-radius:2px;text-decoration:none;}",
      ".nghia{margin:6px 0 4px;font-size:14px;color:#3B4161;line-height:1.5;}",
      "h4{font-size:15px !important;line-height:1.45 !important;margin:12px 8px 4px !important;color:#1a1a1a;}",
      ".jlpt-hint{display:block;margin:0 8px 10px;font-size:13px;color:#5c6b7a;font-weight:400;}",
      ".jlpt-q-hidden{display:none !important;}",
      ".jlpt-topbar{position:fixed;top:0;left:0;right:0;z-index:10000;display:flex;align-items:center;",
      "  gap:8px;padding:8px 12px;min-height:48px;background:#fff;border-bottom:1px solid #e6e6e6;}",
      ".jlpt-topbar-main{flex:1;min-width:0;}",
      ".jlpt-topbar-title{font-size:13px;font-weight:700;color:#222;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".jlpt-topbar-progress{font-size:12px;color:#5c6b7a;margin-top:2px;}",
      ".jlpt-progress-track{height:4px;background:#e9edf2;border-radius:2px;margin-top:6px;overflow:hidden;}",
      ".jlpt-progress-fill{height:100%;width:0;background:#5c90d2;border-radius:2px;}",
      ".jlpt-icon-btn{border:0;background:#f2f4f7;color:#333;width:40px;height:40px;border-radius:10px;",
      "  font-size:18px;line-height:1;flex-shrink:0;}",
      ".jlpt-bar{position:fixed;left:0;right:0;bottom:0;z-index:10000;display:flex;gap:8px;align-items:center;",
      "  padding:10px 12px calc(10px + env(safe-area-inset-bottom, 0px));background:#fff;border-top:1px solid #e6e6e6;}",
      ".jlpt-bar button{flex:1;min-height:44px;border:0;border-radius:10px;font-size:15px;font-weight:600;}",
      ".jlpt-bar .nav{flex:0 0 44px;width:44px;background:#f2f4f7;color:#333;font-size:20px;}",
      ".jlpt-bar .nav:disabled{opacity:0.35;}",
      ".jlpt-bar .primary{background:#5c90d2;color:#fff;}",
      ".jlpt-bar .secondary{background:#f2f4f7;color:#333;}",
      ".jlpt-bar .danger{background:#fff0f0;color:#b42318;}",
      ".jlpt-overlay{position:fixed;top:0;right:0;bottom:0;left:0;z-index:10020;background:rgba(0,0,0,0.45);display:flex;",
      "  align-items:flex-end;justify-content:center;}",
      ".jlpt-overlay.center{align-items:center;padding:16px;}",
      ".jlpt-sheet{width:100%;max-width:480px;background:#fff;border-radius:16px 16px 0 0;padding:12px 12px 24px;}",
      ".jlpt-overlay.center .jlpt-sheet{border-radius:16px;padding:20px;}",
      ".jlpt-sheet h3{margin:4px 8px 12px;font-size:17px;}",
      ".jlpt-sheet p{margin:0 8px 14px;font-size:14px;line-height:1.5;color:#333;}",
      ".jlpt-sheet-item{display:block;width:100%;text-align:left;border:0;background:transparent;",
      "  padding:14px 12px;font-size:16px;border-radius:8px;}",
      ".jlpt-sheet-item:active{background:#f2f4f7;}",
      ".jlpt-score{text-align:center;padding:8px 0 4px;}",
      ".jlpt-score-num{font-size:32px;font-weight:700;color:#1a1a1a;}",
      ".jlpt-score-sub{font-size:14px;color:#5c6b7a;margin-top:4px;}",
      ".jlpt-dots{display:flex;gap:6px;justify-content:center;margin:12px 0;}",
      ".jlpt-dots span{width:8px;height:8px;border-radius:50%;background:#d0d5dd;}",
      ".jlpt-dots span.on{background:#5c90d2;}",
      ".jlpt-actions{display:flex;gap:8px;margin-top:8px;}",
      ".jlpt-actions button{flex:1;min-height:44px;border:0;border-radius:10px;font-size:15px;font-weight:600;}",
      ".bai_stt{margin-right:6px;}"
    ].join("\n");
    var style = document.createElement("style");
    style.id = "jlpt-ux-css";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function pageTitle() {
    var h2 = qs("h2");
    var raw = h2 && h2.textContent ? h2.textContent.trim() : "";
    var num = raw.match(/Đề số\s*0*(\d+)/i) || raw.match(/(\d+)/);
    if (num) return t("testNumber", { n: num[1] });
    if (raw) return raw;
    var file = (location.pathname || "").split("/").pop() || "";
    return file.replace(/\.html$/i, "").replace(/-/g, " ") || "JLPT";
  }

  function translateInstructions() {
    qsa("h4").forEach(function (h4) {
      if (h4.dataset.jlptHinted) return;
      var text = h4.textContent || "";
      var key = "";
      for (var i = 0; i < HINT_RULES.length; i++) {
        if (HINT_RULES[i].test.test(text)) {
          key = HINT_RULES[i].key;
          break;
        }
      }
      if (!key && /問題/.test(text)) key = "hintDefault";
      if (!key) return;
      h4.dataset.jlptHinted = "1";
      var el = document.createElement("div");
      el.className = "jlpt-hint";
      el.setAttribute("data-hint-key", key);
      el.textContent = t(key);
      if (h4.nextSibling) h4.parentNode.insertBefore(el, h4.nextSibling);
      else h4.parentNode.appendChild(el);
    });
  }

  function closest(el, selector) {
    while (el && el.nodeType === 1) {
      if (el.matches && el.matches(selector)) return el;
      if (el.msMatchesSelector && el.msMatchesSelector(selector)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function makeOptionsTappable() {
    document.body.addEventListener("click", function (e) {
      if (closest(e.target, ".td_tracnghiem")) return;
      var td = closest(e.target, "td");
      if (!td) return;
      if (!closest(td, "#khungtracnghiem, [id='khungtracnghiem']")) return;
      if (e.target.tagName === "INPUT") return;
      var radio = td.querySelector('input[type="radio"]');
      if (!radio || radio.disabled) return;
      radio.checked = true;
      try {
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (err) {}
      updateProgress();
    }, true);
  }

  function buildChrome() {
    if (qs("#jlpt-topbar")) return;

    var top = document.createElement("div");
    top.id = "jlpt-topbar";
    top.className = "jlpt-topbar";
    top.innerHTML =
      '<div class="jlpt-topbar-main">' +
      '<div class="jlpt-topbar-title"></div>' +
      '<div class="jlpt-topbar-progress" id="jlpt-progress-text"></div>' +
      '<div class="jlpt-progress-track"><div class="jlpt-progress-fill" id="jlpt-progress-fill"></div></div>' +
      "</div>" +
      '<button type="button" class="jlpt-icon-btn" id="jlpt-more" aria-label="">⋯</button>';
    document.body.appendChild(top);
    qs(".jlpt-topbar-title", top).textContent = pageTitle();

    var bar = document.createElement("div");
    bar.id = "jlpt-bar";
    bar.className = "jlpt-bar";
    bar.innerHTML =
      '<button type="button" class="nav" id="jlpt-prev" aria-label="">‹</button>' +
      '<button type="button" class="secondary" id="jlpt-secondary"></button>' +
      '<button type="button" class="primary" id="jlpt-primary"></button>' +
      '<button type="button" class="nav" id="jlpt-next" aria-label="">›</button>';
    document.body.appendChild(bar);

    document.body.classList.add("jlpt-ux-ready");

    qs("#jlpt-more").onclick = openMore;
    qs("#jlpt-primary").onclick = onPrimary;
    qs("#jlpt-secondary").onclick = onSecondary;
    qs("#jlpt-prev").onclick = function () {
      goQuestion(state.currentIndex - 1);
    };
    qs("#jlpt-next").onclick = function () {
      goQuestion(state.currentIndex + 1);
    };
    applyLang();
  }

  function updateProgress() {
    var total = getQuestionCount();
    var answered = countAnswered();
    var text = qs("#jlpt-progress-text");
    var fill = qs("#jlpt-progress-fill");
    if (text) {
      if (state.graded) {
        var correct = countCorrect();
        var pct = total ? Math.round((correct / total) * 100) : 0;
        text.textContent = t("progressCorrect", { correct: correct, total: total, pct: pct });
      } else if (state.oneQuestion) {
        text.textContent = t("progressQuestion", {
          current: state.currentIndex + 1,
          total: total,
          answered: answered
        });
      } else {
        text.textContent = t("progressAnswered", { answered: answered, total: total });
      }
    }
    if (fill) {
      var ratio = total ? (state.graded ? countCorrect() / total : answered / total) : 0;
      fill.style.width = Math.round(ratio * 100) + "%";
    }
    renderBar();
  }

  function renderBar() {
    var prev = qs("#jlpt-prev");
    var next = qs("#jlpt-next");
    var primary = qs("#jlpt-primary");
    var secondary = qs("#jlpt-secondary");
    var total = getQuestionBlocks().length;
    var showNav = state.oneQuestion && total > 1;
    if (prev) {
      prev.style.display = showNav ? "" : "none";
      prev.disabled = state.currentIndex <= 0;
    }
    if (next) {
      next.style.display = showNav ? "" : "none";
      next.disabled = state.currentIndex >= total - 1;
    }
    if (primary && secondary) {
      if (state.graded) {
        primary.textContent = t("reviewWrong");
        primary.className = "primary";
        secondary.textContent = t("retry");
        secondary.className = "secondary";
      } else {
        primary.textContent = t("submit");
        primary.className = "primary";
        secondary.textContent = t("retry");
        secondary.className = "secondary";
      }
    }
  }

  function isQuestionBlock(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.classList && el.classList.contains("tracnghiem")) return true;
    if (el.id === "khungtracnghiem") return true;
    return false;
  }

  function applyOneQuestion() {
    var blocks = getQuestionBlocks();
    blocks.forEach(function (block, i) {
      if (state.oneQuestion && i !== state.currentIndex) block.classList.add("jlpt-q-hidden");
      else block.classList.remove("jlpt-q-hidden");
    });
    var chrome = qsa("h4, .jlpt-hint, .box6, .noidungdoc, hr.style-one");
    if (!state.oneQuestion) {
      chrome.forEach(function (el) {
        el.classList.remove("jlpt-q-hidden");
      });
      updateProgress();
      return;
    }
    chrome.forEach(function (el) {
      el.classList.add("jlpt-q-hidden");
    });
    var current = blocks[state.currentIndex];
    var n = current && current.previousElementSibling;
    while (n) {
      if (isQuestionBlock(n)) break;
      n.classList.remove("jlpt-q-hidden");
      n = n.previousElementSibling;
    }
    updateProgress();
  }

  function goQuestion(index) {
    var blocks = getQuestionBlocks();
    if (!blocks.length) return;
    if (index < 0) index = 0;
    if (index > blocks.length - 1) index = blocks.length - 1;
    state.currentIndex = index;
    applyOneQuestion();
    try {
      blocks[index].scrollIntoView({ block: "start" });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  function setOneQuestion(on) {
    state.oneQuestion = !!on;
    try {
      localStorage.setItem(STORAGE_ONE_Q, on ? "1" : "0");
    } catch (e) {}
    if (on && !state.graded) state.currentIndex = firstUnansweredIndex();
    applyOneQuestion();
  }

  function onPrimary() {
    if (state.graded) {
      var idx = firstWrongIndex();
      if (!state.oneQuestion) setOneQuestion(true);
      goQuestion(idx);
      closeOverlays();
      return;
    }
    submitQuiz();
  }

  function onSecondary() {
    retryQuiz();
  }

  function submitQuiz() {
    if (state.graded) return;
    var total = getQuestionCount();
    var unanswered = total - countAnswered();
    if (unanswered > 0) {
      showConfirm(
        t("unanswered", { n: unanswered }),
        function () {
          doCheck();
        }
      );
      return;
    }
    doCheck();
  }

  function doCheck() {
    if (state.graded) return;
    if (typeof state.origCheck === "function") {
      state.origCheck.call(window);
    }
    state.graded = true;
    setTimeout(function () {
      enhanceScoreDialog();
      unlockLearningAids();
      updateProgress();
      notifyHost();
    }, 30);
  }

  function retryQuiz() {
    showConfirm(t("retryConfirm"), function () {
      state.graded = false;
      if (typeof state.origReset === "function") {
        state.origReset.call(window);
      }
      qsa(".nghia").forEach(function (el) {
        el.style.display = "none";
      });
      state.currentIndex = 0;
      applyOneQuestion();
      window.scrollTo(0, 0);
      updateProgress();
      closeOverlays();
    });
  }

  function wrapQuizFns() {
    if (typeof window.check_result === "function" && !window.check_result.__jlptWrapped) {
      state.origCheck = window.check_result;
      window.check_result = function () {
        submitQuiz();
      };
      window.check_result.__jlptWrapped = true;
    }
    if (typeof window.reset_result === "function" && !window.reset_result.__jlptWrapped) {
      state.origReset = window.reset_result;
      window.reset_result = function () {
        retryQuiz();
      };
      window.reset_result.__jlptWrapped = true;
    }
    if (typeof window.result_correct === "function" && !window.result_correct.__jlptWrapped) {
      state.origResultCorrect = window.result_correct;
      window.result_correct = function () {
        showAnswers();
      };
      window.result_correct.__jlptWrapped = true;
    }
  }

  function showAnswers() {
    if (!window.answer_correct || !window.your_answer) {
      if (state.origResultCorrect) state.origResultCorrect.call(window);
      return;
    }
    for (var i = 0; i < window.answer_correct.length; i++) {
      var el = document.getElementById("result_correct_" + window.answer_correct[i]);
      if (el) el.innerHTML = window.your_answer[1];
    }
  }

  function unlockLearningAids() {
    var show = state.lang === "vi";
    qsa(".nghia").forEach(function (el) {
      el.style.display = show ? "block" : "none";
    });
  }

  function enhanceScoreDialog() {
    var finish = document.getElementById("gui_ketqua");
    if (finish) finish.style.setProperty("display", "none", "important");
    var closeBtn = document.getElementById("alert_dialog_button");
    if (closeBtn) closeBtn.value = t("close");

    var msg = document.getElementById("alert_dialog_message");
    var correct = countCorrect();
    var total = getQuestionCount();
    var pct = total ? Math.round((correct / total) * 100) : 0;
    var html =
      '<div class="jlpt-score"><div class="jlpt-score-num">' +
      correct +
      "/" +
      total +
      '</div><div class="jlpt-score-sub">' +
      t("scoreCorrect", { pct: pct }) +
      "</div></div>";

    if (msg) {
      msg.innerHTML = html;
      var popup = msg.parentNode;
      if (popup && popup.style) {
        popup.style.position = "fixed";
        popup.style.left = "50%";
        popup.style.top = "50%";
        popup.style.right = "auto";
        popup.style.bottom = "auto";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.zIndex = "10030";
        popup.style.width = "min(320px, 88vw)";
        popup.style.maxWidth = "320px";
      }
      var bg = popup && popup.previousSibling;
      while (bg && bg.nodeType !== 1) bg = bg.previousSibling;
      if (bg && bg.style) {
        bg.style.position = "fixed";
        bg.style.left = "0";
        bg.style.top = "0";
        bg.style.width = "100%";
        bg.style.height = "100%";
        bg.style.zIndex = "10025";
      }
    } else {
      showCenter(
        t("result"),
        html,
        [{ label: t("close"), primary: true, fn: closeOverlays }]
      );
    }
  }

  function notifyHost() {
    var payload = JSON.stringify({
      type: "jlpt_score",
      correct: countCorrect(),
      total: getQuestionCount()
    });
    try {
      if (window.QuizHost && typeof window.QuizHost.postMessage === "function") {
        window.QuizHost.postMessage(payload);
      }
    } catch (e) {}
  }

  function closeOverlays() {
    qsa(".jlpt-overlay").forEach(function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function showCenter(title, bodyHtml, actions) {
    closeOverlays();
    var wrap = document.createElement("div");
    wrap.className = "jlpt-overlay center";
    var sheet = document.createElement("div");
    sheet.className = "jlpt-sheet";
    sheet.innerHTML = "<h3></h3><div class='jlpt-body'></div><div class='jlpt-actions'></div>";
    qs("h3", sheet).textContent = title;
    qs(".jlpt-body", sheet).innerHTML = bodyHtml;
    var box = qs(".jlpt-actions", sheet);
    (actions || []).forEach(function (a) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = a.label;
      b.className = a.primary ? "primary" : "secondary";
      b.style.background = a.primary ? "#5c90d2" : "#f2f4f7";
      b.style.color = a.primary ? "#fff" : "#333";
      b.onclick = function () {
        closeOverlays();
        if (a.fn) a.fn();
      };
      box.appendChild(b);
    });
    wrap.appendChild(sheet);
    wrap.addEventListener("click", function (e) {
      if (e.target === wrap) closeOverlays();
    });
    document.body.appendChild(wrap);
  }

  function showConfirm(message, onOk) {
    showCenter(message, "", [
      { label: t("cancel"), fn: null },
      { label: t("ok"), primary: true, fn: onOk }
    ]);
  }

  function openMore() {
    closeOverlays();
    var wrap = document.createElement("div");
    wrap.className = "jlpt-overlay";
    var sheet = document.createElement("div");
    sheet.className = "jlpt-sheet";
    var items = [];
    items.push({
      label: state.oneQuestion ? t("moreAll") : t("moreOne"),
      fn: function () {
        setOneQuestion(!state.oneQuestion);
      }
    });
    if (qs("#dichnghia") && state.lang === "vi") {
      items.push({
        label: t("meaning"),
        fn: function () {
          if (!state.graded) {
            showCenter(t("meaning"), "<p>" + t("meaningLocked") + "</p>", [
              { label: t("close"), primary: true }
            ]);
            return;
          }
          qsa(".nghia").forEach(function (el) {
            el.style.display = el.style.display === "none" ? "block" : "none";
          });
        }
      });
    }
    if (qs("#dapan")) {
      items.push({
        label: t("answers"),
        fn: function () {
          if (!state.graded) {
            showCenter(t("answers"), "<p>" + t("answersLocked") + "</p>", [
              { label: t("close"), primary: true }
            ]);
            return;
          }
          showAnswers();
        }
      });
    }
    items.push({
      label: t("guide"),
      fn: function () {
        showOnboarding(true);
      }
    });
    items.push({ label: t("close"), fn: null });

    items.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "jlpt-sheet-item";
      b.textContent = item.label;
      b.onclick = function () {
        closeOverlays();
        if (item.fn) item.fn();
      };
      sheet.appendChild(b);
    });
    wrap.appendChild(sheet);
    wrap.addEventListener("click", function (e) {
      if (e.target === wrap) closeOverlays();
    });
    document.body.appendChild(wrap);
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
      wrap.className = "jlpt-overlay center";
      wrap.innerHTML =
        '<div class="jlpt-sheet">' +
        "<h3></h3><p></p>" +
        '<div class="jlpt-dots">' +
        dots +
        "</div>" +
        '<div class="jlpt-actions">' +
        (step > 0 ? '<button type="button" class="secondary" id="jlpt-ob-back"></button>' : "") +
        '<button type="button" class="primary" id="jlpt-ob-next"></button>' +
        "</div></div>";
      qs("h3", wrap).textContent = s.title;
      qs("p", wrap).textContent = s.body;
      var next = qs("#jlpt-ob-next", wrap);
      next.textContent = step === steps.length - 1 ? t("onboardStart") : t("onboardNext");
      next.style.background = "#5c90d2";
      next.style.color = "#fff";
      next.onclick = function () {
        if (step === steps.length - 1) {
          try {
            localStorage.setItem(STORAGE_ONBOARD, "1");
          } catch (e) {}
          closeOverlays();
          return;
        }
        step++;
        render();
      };
      var back = qs("#jlpt-ob-back", wrap);
      if (back) {
        back.textContent = t("onboardBack");
        back.style.background = "#f2f4f7";
        back.onclick = function () {
          step--;
          render();
        };
      }
      document.body.appendChild(wrap);
    }
    render();
  }

  function loadPrefs() {
    try {
      var v = localStorage.getItem(STORAGE_ONE_Q);
      if (v === null) state.oneQuestion = true;
      else state.oneQuestion = v === "1";
    } catch (e) {
      state.oneQuestion = true;
    }
  }

  function bindProgressEvents() {
    document.addEventListener("change", updateProgress, true);
    document.addEventListener("click", function () {
      setTimeout(updateProgress, 0);
    }, true);
  }

  function init() {
    if (!qs(".quiz-form") && !qs("#ketqua") && !qs("#lamlai")) return;
    var vp = qs('meta[name="viewport"]');
    if (vp && vp.content && vp.content.indexOf("viewport-fit") === -1) {
      vp.content += ", viewport-fit=cover";
    }
    injectCss();
    persistLang(detectLang());
    loadPrefs();
    wrapQuizFns();
    translateInstructions();
    makeOptionsTappable();
    buildChrome();
    applyOneQuestion();
    bindProgressEvents();
    updateProgress();
    showOnboarding(false);
  }

  ready(function () {
    waitForQuiz(init);
  });
})();
