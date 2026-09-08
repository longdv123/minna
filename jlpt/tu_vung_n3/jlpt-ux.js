/**
 * JLPT WebView UX overlay.
 * Loaded at the end of each quiz page (script src="jlpt-ux.js").
 * Flutter can also inject this file via runJavaScript after load.
 */
(function () {
  if (window.__jlptUxInit) return;
  window.__jlptUxInit = true;

  var STORAGE_ONBOARD = "jlpt_ux_onboard_v1";
  var STORAGE_ONE_Q = "jlpt_ux_one_q";

  var state = {
    graded: false,
    oneQuestion: false,
    currentIndex: 0,
    origCheck: null,
    origReset: null,
    origResultCorrect: null
  };

  var INSTRUCTION_HINTS = [
    { test: /読み方/, hint: "Chọn cách đọc đúng của phần gạch chân." },
    { test: /漢字で書く/, hint: "Chọn chữ Hán đúng cho phần gạch chân." },
    { test: /意味が最も近い/, hint: "Chọn từ gần nghĩa nhất với phần gạch chân." },
    { test: /使い方/, hint: "Chọn câu dùng từ đó đúng nhất." },
    { test: /（　*　*）に入れる/, hint: "Chọn cụm từ thích hợp để điền vào ngoặc." },
    { test: /に入れるのに最もよい/, hint: "Chọn cụm từ thích hợp để điền vào chỗ trống." },
    { test: /★/, hint: "Sắp xếp / chọn cụm thích hợp cho vị trí ★." },
    { test: /文章を読んで/, hint: "Đọc đoạn văn và chọn đáp án điền vào chỗ trống." }
  ];

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
    if (h2 && h2.textContent.trim()) return h2.textContent.trim();
    var file = (location.pathname || "").split("/").pop() || "";
    return file.replace(/\.html$/i, "").replace(/-/g, " ") || "JLPT";
  }

  function translateInstructions() {
    qsa("h4").forEach(function (h4) {
      if (h4.dataset.jlptHinted) return;
      var text = h4.textContent || "";
      var hint = "";
      for (var i = 0; i < INSTRUCTION_HINTS.length; i++) {
        if (INSTRUCTION_HINTS[i].test.test(text)) {
          hint = INSTRUCTION_HINTS[i].hint;
          break;
        }
      }
      if (!hint && /問題/.test(text)) {
        hint = "Chọn một đáp án (1–4 / A–D) cho mỗi câu.";
      }
      if (!hint) return;
      h4.dataset.jlptHinted = "1";
      var el = document.createElement("div");
      el.className = "jlpt-hint";
      el.textContent = hint;
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
      '<button type="button" class="jlpt-icon-btn" id="jlpt-more" aria-label="Menu">⋯</button>';
    document.body.appendChild(top);
    qs(".jlpt-topbar-title", top).textContent = pageTitle();

    var bar = document.createElement("div");
    bar.id = "jlpt-bar";
    bar.className = "jlpt-bar";
    bar.innerHTML =
      '<button type="button" class="nav" id="jlpt-prev" aria-label="Câu trước">‹</button>' +
      '<button type="button" class="secondary" id="jlpt-secondary">Làm lại</button>' +
      '<button type="button" class="primary" id="jlpt-primary">Nộp bài</button>' +
      '<button type="button" class="nav" id="jlpt-next" aria-label="Câu sau">›</button>';
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
        text.textContent = "Đúng " + correct + "/" + total + " (" + pct + "%)";
      } else if (state.oneQuestion) {
        text.textContent = "Câu " + (state.currentIndex + 1) + "/" + total + " · đã chọn " + answered + "/" + total;
      } else {
        text.textContent = "Đã chọn " + answered + "/" + total;
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
        primary.textContent = "Xem lỗi";
        primary.className = "primary";
        secondary.textContent = "Làm lại";
        secondary.className = "secondary";
      } else {
        primary.textContent = "Nộp bài";
        primary.className = "primary";
        secondary.textContent = "Làm lại";
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
        "Còn " + unanswered + " câu chưa chọn. Nộp bài luôn?",
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
    showConfirm("Làm lại đề này? Mọi câu trả lời sẽ bị xóa.", function () {
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
    qsa(".nghia").forEach(function (el) {
      el.style.display = "block";
    });
  }

  function enhanceScoreDialog() {
    var finish = document.getElementById("gui_ketqua");
    if (finish) finish.style.setProperty("display", "none", "important");
    var closeBtn = document.getElementById("alert_dialog_button");
    if (closeBtn) closeBtn.value = "Đóng";

    var msg = document.getElementById("alert_dialog_message");
    var correct = countCorrect();
    var total = getQuestionCount();
    var pct = total ? Math.round((correct / total) * 100) : 0;
    var html =
      '<div class="jlpt-score"><div class="jlpt-score-num">' +
      correct +
      "/" +
      total +
      '</div><div class="jlpt-score-sub">Đúng ' +
      pct +
      "%</div></div>";

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
        "Kết quả",
        html,
        [{ label: "Đóng", primary: true, fn: closeOverlays }]
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
      { label: "Hủy", fn: null },
      { label: "Đồng ý", primary: true, fn: onOk }
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
      label: state.oneQuestion ? "Xem tất cả câu" : "Làm từng câu",
      fn: function () {
        setOneQuestion(!state.oneQuestion);
      }
    });
    if (qs("#dichnghia")) {
      items.push({
        label: "Dịch nghĩa",
        fn: function () {
          if (!state.graded) {
            showCenter("Dịch nghĩa", "<p>Nộp bài xong sẽ hiện nghĩa tiếng Việt.</p>", [
              { label: "Đóng", primary: true }
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
        label: "Đáp án",
        fn: function () {
          if (!state.graded) {
            showCenter("Đáp án", "<p>Nộp bài xong mới xem đáp án.</p>", [
              { label: "Đóng", primary: true }
            ]);
            return;
          }
          showAnswers();
        }
      });
    }
    items.push({
      label: "Hướng dẫn",
      fn: function () {
        showOnboarding(true);
      }
    });
    items.push({ label: "Đóng", fn: null });

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
      {
        title: "Cách làm bài",
        body: "Mỗi câu có 4 lựa chọn A–D (hoặc 1–4). Chạm vào cả dòng đáp án để chọn, không cần nhằm đúng nút tròn nhỏ."
      },
      {
        title: "Phần cần trả lời",
        body: "Từ được gạch chân hoặc tô xanh là phần câu hỏi. Ở trên mỗi nhóm có dòng tiếng Việt giải thích yêu cầu."
      },
      {
        title: "Nộp bài và làm lại",
        body: "Thanh dưới cùng: Nộp bài để chấm điểm, Làm lại để xóa đáp án. Bấm ⋯ để làm từng câu một — dễ hơn khi mới bắt đầu."
      }
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
        (step > 0 ? '<button type="button" class="secondary" id="jlpt-ob-back">Quay lại</button>' : "") +
        '<button type="button" class="primary" id="jlpt-ob-next"></button>' +
        "</div></div>";
      qs("h3", wrap).textContent = s.title;
      qs("p", wrap).textContent = s.body;
      var next = qs("#jlpt-ob-next", wrap);
      next.textContent = step === steps.length - 1 ? "Bắt đầu" : "Tiếp";
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
