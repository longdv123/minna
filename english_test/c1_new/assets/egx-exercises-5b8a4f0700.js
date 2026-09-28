/* EG Exercises v1.4.27.17 */

(function() {
  'use strict';

  function qs(el, sel) {
    return el.querySelector(sel);
  }

  function qsa(el, sel) {
    return Array.prototype.slice.call(el.querySelectorAll(sel));
  }

  function intVal(v, fallback) {
    var n = parseInt(v, 10);
    return isNaN(n) ? fallback : n;
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function burstConfetti(exerciseEl) {
    if (!exerciseEl || prefersReducedMotion()) return;

    var inst = exerciseEl.getAttribute('data-egx-instance') || '';
    var prev = document.querySelector('.egx-confetti[data-egx-owner="' + inst + '"]');
    if (prev && prev.parentNode) prev.parentNode.removeChild(prev);

    var cont = document.createElement('div');
    cont.className = 'egx-confetti';
    cont.setAttribute('data-egx-owner', inst);

    var anchor = exerciseEl.querySelector('.egx-question') || exerciseEl;
    var rect = anchor.getBoundingClientRect();
    var left = Math.max(0, rect.left);
    var width = Math.max(0, Math.min(window.innerWidth - left, rect.width));
    cont.style.left = left.toFixed(0) + 'px';
    cont.style.width = width.toFixed(0) + 'px';

    var colors = ['#4b64ad', '#22c55e', '#f97316', '#eab308', '#a855f7', '#ef4444', '#06b6d4', '#f43f5e'];

    var pieces = 34;
    for (var i = 0; i < pieces; i++) {
      var p = document.createElement('span');
      p.className = 'egx-confetti-piece';
      p.style.left = (Math.random() * 100).toFixed(2) + '%';
      var w = 6 + Math.random() * 6;
      var h = 8 + Math.random() * 8;
      p.style.width = w.toFixed(0) + 'px';
      p.style.height = h.toFixed(0) + 'px';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.opacity = (0.75 + Math.random() * 0.25).toFixed(2);
      p.style.setProperty('--egx-x', ((Math.random() * 2 - 1) * 140).toFixed(0) + 'px');
      p.style.setProperty('--egx-rot', (360 + Math.random() * 720).toFixed(0) + 'deg');
      p.style.setProperty('--egx-dur', (900 + Math.random() * 900).toFixed(0) + 'ms');
      cont.appendChild(p);
    }

    (document.body || document.documentElement).appendChild(cont);
    window.setTimeout(function() {
      if (cont && cont.parentNode) cont.parentNode.removeChild(cont);
    }, 2200);
  }

  function findAnswersWrapper(exerciseEl) {
    var el = exerciseEl.nextElementSibling;
    while (el) {
      if (el.matches && el.matches('.egx-answers[data-egx-answers]')) {
        return el;
      }
      el = el.nextElementSibling;
    }
    return document.querySelector('.egx-answers[data-egx-answers]');
  }

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) {
      el.setAttribute('hidden', 'hidden');
    } else {
      el.removeAttribute('hidden');
    }
  }


  function cleanShareTitle(title) {
    title = String(title || '').replace(/\s+/g, ' ').trim();
    title = title.replace(/\s+[|\-ââ]\s+EnglishGrammar\.org.*$/i, '').trim();
    title = title.replace(/\s+[|\-ââ]\s+English Grammar.*$/i, '').trim();
    return title || 'English Exercise';
  }

  function getShareTitle(exerciseEl) {
    var t = exerciseEl ? (exerciseEl.getAttribute('data-egx-share-title') || '') : '';
    if (!t) {
      var og = document.querySelector('meta[property="og:title"], meta[name="twitter:title"]');
      if (og) t = og.getAttribute('content') || '';
    }
    if (!t && document.title) t = document.title;
    return cleanShareTitle(t);
  }

  function getShareUrl() {
    try {
      var u = new URL(window.location.href);
      u.hash = '';
      return u.toString();
    } catch (e) {
      return String(window.location.href || '').split('#')[0];
    }
  }

  function buildResultSquares(exerciseEl) {
    var out = [];
    qsa(exerciseEl, '.egx-question').forEach(function(qEl) {
      if (!qEl.classList.contains('egx-done')) {
        out.push('â¬');
      } else if (qEl.querySelector('.egx-option.egx-wrong')) {
        out.push('ð¥');
      } else {
        out.push('ð©');
      }
    });
    return out.join('');
  }

  function buildShareSubject(exerciseEl) {
    var total = intVal(exerciseEl.getAttribute('data-egx-total'), 0);
    var correct = intVal(exerciseEl.getAttribute('data-egx-correct'), 0);
    var title = getShareTitle(exerciseEl);
    return 'I scored ' + correct + '/' + total + ' in the ' + title;
  }

  function buildShareText(exerciseEl) {
    var url = getShareUrl();
    var squares = buildResultSquares(exerciseEl);
    var lines = [];
    lines.push(buildShareSubject(exerciseEl));
    if (squares) lines.push(squares);
    lines.push(url);
    lines.push('What score can you get?');
    return lines.join('\n\n');
  }

  function setupShareLinks(exerciseEl) {
    if (!exerciseEl) return '';
    var shareText = buildShareText(exerciseEl);
    exerciseEl.setAttribute('data-egx-share-text', shareText);
    var shareMenu = qs(exerciseEl, '.egx-share-menu');
    if (!shareMenu) return shareText;

    var shareUrl = getShareUrl();
    var title = getShareTitle(exerciseEl);
    var u = encodeURIComponent(shareUrl);
    var text = encodeURIComponent(shareText);
    var encodedTitle = encodeURIComponent(buildShareSubject(exerciseEl));

    var fb = shareMenu.querySelector('.egx-share-fb');
    var x = shareMenu.querySelector('.egx-share-x');
    var reddit = shareMenu.querySelector('.egx-share-reddit');
    var email = shareMenu.querySelector('.egx-share-email');
    var li = shareMenu.querySelector('.egx-share-linkedin');

    if (fb) fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + u;
    if (x) x.href = 'https://twitter.com/intent/tweet?text=' + text;
    if (reddit) reddit.href = 'https://www.reddit.com/submit?url=' + u + '&title=' + encodedTitle;
    if (li) li.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + u;
    if (email) {
      email.href = 'mailto:?subject=' + encodeURIComponent(buildShareSubject(exerciseEl)) + '&body=' + encodeURIComponent(shareText);
    }
    return shareText;
  }

  // Share options are an inline disclosure. Opening them never covers Restart
  // or More Exercises, including on narrow/touch screens.
  function closeShareWrap(shareWrap) {
    if (!shareWrap) return;
    shareWrap.classList.remove('egx-share-open');
    setHidden(qs(shareWrap, '.egx-share-menu'), true);
    var btn = qs(shareWrap, '.egx-share-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function closeShare(exerciseEl) {
    if (exerciseEl) closeShareWrap(qs(exerciseEl, '.egx-share'));
  }

  function closeAllShares(exceptWrap) {
    document.querySelectorAll('.egx-share.egx-share-open').forEach(function(wrap) {
      if (wrap !== exceptWrap) closeShareWrap(wrap);
    });
  }

  function openShareWrap(shareWrap) {
    if (!shareWrap) return;
    var exerciseEl = shareWrap.closest('.egx-exercise');
    if (exerciseEl) setupShareLinks(exerciseEl);
    closeAllShares(shareWrap);
    shareWrap.classList.add('egx-share-open');
    setHidden(qs(shareWrap, '.egx-share-menu'), false);
    var btn = qs(shareWrap, '.egx-share-btn');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  async function copyToClipboard(text) {
    text = String(text || '').trim();
    if (!text) return false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {}
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return !!ok;
    } catch (e) {
      return false;
    }
  }

  function updateProgress(exerciseEl) {
    var total = intVal(exerciseEl.getAttribute('data-egx-total'), 0);
    var done = qsa(exerciseEl, '.egx-question.egx-done').length;
    var correct = intVal(exerciseEl.getAttribute('data-egx-correct'), 0);

    var curEl = qs(exerciseEl, '.egx-progress-current');
    if (curEl) curEl.textContent = String(done);

    var bar = qs(exerciseEl, '.egx-progressbar-fill');
    if (bar) {
      var pct = 0;
      if (total > 0) {
        pct = Math.max(0, Math.min(100, (done / total) * 100));
      }
      bar.style.width = pct.toFixed(2) + '%';
    }

    var finish = qs(exerciseEl, '.egx-finish');
    var score = qs(exerciseEl, '.egx-score');
    if (score) score.textContent = String(correct);

    if (finish) {
      if (total > 0 && done >= total) {
        setupShareLinks(exerciseEl);
        setHidden(finish, false);
        var nudge = qs(exerciseEl, '.egx-share-nudge');
        if (nudge && !nudge.getAttribute('data-egx-nudge-shown')) {
          nudge.setAttribute('data-egx-nudge-shown', '1');
          nudge.classList.remove('egx-share-nudge-active');
          void nudge.offsetWidth;
          nudge.classList.add('egx-share-nudge-active');
        }
      } else {
        closeShare(exerciseEl);
        setHidden(finish, true);
        var hiddenNudge = qs(exerciseEl, '.egx-share-nudge');
        if (hiddenNudge) {
          hiddenNudge.removeAttribute('data-egx-nudge-shown');
          hiddenNudge.classList.remove('egx-share-nudge-active');
        }
      }
    }

    if (total > 0 && done >= total) {
      var answers = findAnswersWrapper(exerciseEl);
      setHidden(answers, false);

      if (correct >= total && exerciseEl.getAttribute('data-egx-confetti') !== '1') {
        exerciseEl.setAttribute('data-egx-confetti', '1');
        burstConfetti(exerciseEl);
      }
    }
  }

  function disableQuestion(qEl) {
    var options = qsa(qEl, '.egx-option');
    options.forEach(function(btn) {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('aria-pressed', 'false');
    });
    qEl.classList.add('egx-done');
  }

  function showFeedback(qEl, show) {
    var fb = qs(qEl, '.egx-feedback');
    if (!fb) return;

    if (!show) {
      setHidden(fb, true);
      return;
    }

    var body = qs(fb, '.egx-feedback-body');
    if (body) {
      var txt = (body.textContent || '').trim();
      if (!txt) {
        body.style.display = 'none';
      } else {
        body.style.display = '';
      }
    }

    setHidden(fb, false);
  }

  function markCorrectOptions(options) {
    options.forEach(function(btn) {
      if (btn.getAttribute('data-egx-correct') === '1') {
        btn.classList.add('egx-correct');
      }
    });
  }

  function forcePaint(el) {
    if (!el) return;
    void el.offsetHeight;
  }
  
  // Safely tucked inside the IIFE!
  function blurOptionSoon(btn) {
    if (!btn || typeof btn.blur !== "function") return;
    window.setTimeout(function() {
      try { btn.blur(); } catch (e) {}
    }, 0);
  }

  function updateQuestionNote(qEl) {
    if (!qEl) return;
    var note = qs(qEl, '.egx-q-note');
    if (!note) return;
    var correctCount = intVal(qEl.getAttribute('data-egx-correct-count'), 1);
    if (correctCount <= 1) return;
    var base = 'Select ' + correctCount + ' answers.';
    var selectedCount = qsa(qEl, '.egx-option.egx-selected').length;
    if (qEl.classList.contains('egx-done') || selectedCount === 0) {
      note.classList.remove('egx-q-note-active');
      note.textContent = base;
      return;
    }
    if (selectedCount < correctCount) {
      note.classList.add('egx-q-note-active');
      note.textContent = base + ' ' + selectedCount + ' selected.';
      return;
    }
    note.classList.remove('egx-q-note-active');
    note.textContent = base;
  }

  function evaluateSingle(exerciseEl, qEl, chosenBtn) {
    var isCorrect = chosenBtn.getAttribute('data-egx-correct') === '1';

    markCorrectOptions(qsa(qEl, '.egx-option'));

    if (!isCorrect) {
      chosenBtn.classList.add('egx-wrong', 'egx-anim-wrong');
      showFeedback(qEl, true);
    } else {
      chosenBtn.classList.add('egx-correct', 'egx-anim-correct');
      showFeedback(qEl, false);
    }

    window.setTimeout(function() {
      chosenBtn.classList.remove('egx-anim-correct', 'egx-anim-wrong');
    }, 350);

    disableQuestion(qEl);
    updateQuestionNote(qEl);

    if (isCorrect) {
      var correct = intVal(exerciseEl.getAttribute('data-egx-correct'), 0);
      exerciseEl.setAttribute('data-egx-correct', String(correct + 1));
    }

    qsa(qEl, '.egx-option').forEach(forcePaint);
    updateProgress(exerciseEl);
  }

  function evaluateMulti(exerciseEl, qEl) {
    var options = qsa(qEl, '.egx-option');
    var selected = options.filter(function(btn) {
      return btn.classList.contains('egx-selected');
    });

    var allCorrect = true;
    selected.forEach(function(btn) {
      if (btn.getAttribute('data-egx-correct') !== '1') {
        allCorrect = false;
        btn.classList.add('egx-wrong', 'egx-anim-wrong');
        window.setTimeout(function() {
          btn.classList.remove('egx-anim-wrong');
        }, 350);
      }
    });

    markCorrectOptions(options);

    if (!allCorrect) {
      showFeedback(qEl, true);
    } else {
      if (selected.length) {
        var last = selected[selected.length - 1];
        last.classList.add('egx-anim-correct');
        window.setTimeout(function() {
          last.classList.remove('egx-anim-correct');
        }, 350);
      }
      showFeedback(qEl, false);
    }

    disableQuestion(qEl);
    updateQuestionNote(qEl);

    if (allCorrect) {
      var correct = intVal(exerciseEl.getAttribute('data-egx-correct'), 0);
      exerciseEl.setAttribute('data-egx-correct', String(correct + 1));
    }

    qsa(qEl, '.egx-option').forEach(forcePaint);
    updateProgress(exerciseEl);
  }

  function shouldIgnoreActivation(btn) {
    return false;
  }

  function activateOption(btn) {
    if (!btn || btn.disabled) return;
    if (shouldIgnoreActivation(btn)) return;

    var qEl = btn.closest('.egx-question');
    if (!qEl || qEl.classList.contains('egx-done')) return;

    var exerciseEl = btn.closest('.egx-exercise');
    if (!exerciseEl) return;

    var correctCount = intVal(qEl.getAttribute('data-egx-correct-count'), 1);

    if (correctCount > 1) {
      var willSelect = !btn.classList.contains('egx-selected');
      var options = qsa(qEl, '.egx-option');
      var selected = options.filter(function(b) { return b.classList.contains('egx-selected'); });

      if (willSelect && selected.length >= correctCount) {
        btn.classList.add('egx-anim-wrong');
        window.setTimeout(function() {
          btn.classList.remove('egx-anim-wrong');
        }, 300);
        return;
      }

      btn.classList.toggle('egx-selected');
      btn.setAttribute('aria-pressed', btn.classList.contains('egx-selected') ? 'true' : 'false');
      forcePaint(btn);
      blurOptionSoon(btn);

      selected = options.filter(function(b) { return b.classList.contains('egx-selected'); });
      options.forEach(function(b) { b.classList.remove('egx-pending'); });
      
      if (selected.length === correctCount) {
        evaluateMulti(exerciseEl, qEl);
      } else {
        selected.forEach(function(b) { b.classList.add('egx-pending'); });
        forcePaint(qEl);
        if (window.requestAnimationFrame) { window.requestAnimationFrame(function(){ forcePaint(qEl); }); }
        updateQuestionNote(qEl);
      }

      return;
    }

    evaluateSingle(exerciseEl, qEl, btn);
  }

  function onOptionButtonClick(e) {
    var btn = e.currentTarget;
    activateOption(btn);
    blurOptionSoon(btn);
  }

  function resetExercise(exerciseEl) {
    exerciseEl.setAttribute('data-egx-correct', '0');
    exerciseEl.removeAttribute('data-egx-confetti');
    var inst = exerciseEl.getAttribute('data-egx-instance') || '';
    var conf = document.querySelector('.egx-confetti[data-egx-owner="' + inst + '"]');
    if (conf && conf.parentNode) conf.parentNode.removeChild(conf);

    qsa(exerciseEl, '.egx-question').forEach(function(qEl) {
      qEl.classList.remove('egx-done');
      showFeedback(qEl, false);

      qsa(qEl, '.egx-option').forEach(function(btn) {
        btn.disabled = false;
        btn.removeAttribute('aria-disabled');
        btn.classList.remove('egx-selected', 'egx-pending', 'egx-correct', 'egx-wrong', 'egx-anim-correct', 'egx-anim-wrong');
        btn.setAttribute('aria-pressed', 'false');
      });
      updateQuestionNote(qEl);
    });

    var finish = qs(exerciseEl, '.egx-finish');
    closeShare(exerciseEl);
    var nudge = qs(exerciseEl, '.egx-share-nudge');
    if (nudge) {
      nudge.removeAttribute('data-egx-nudge-shown');
      nudge.classList.remove('egx-share-nudge-active');
    }
    var copyBtn = qs(exerciseEl, '.egx-share-copy');
    if (copyBtn) {
      copyBtn.classList.remove('egx-copied');
      var copyLabel = copyBtn.querySelector('span');
      if (copyLabel) copyLabel.textContent = 'Copy';
    }
    setHidden(finish, true);

    var answers = findAnswersWrapper(exerciseEl);
    setHidden(answers, true);

    updateProgress(exerciseEl);
  }

  function onRestartButtonClick(e) {
    var btn = e.currentTarget;
    var exerciseEl = btn.closest('.egx-exercise');
    if (!exerciseEl) return;
    resetExercise(exerciseEl);
  }

  function onShareButtonClick(e) {
    e.preventDefault();
    var btn = e.currentTarget;
    var exerciseEl = btn.closest('.egx-exercise');
    var shareWrap = btn.closest('.egx-share');
    if (!exerciseEl || !shareWrap) return;
    setupShareLinks(exerciseEl);
    if (shareWrap.classList.contains('egx-share-open')) {
      closeShareWrap(shareWrap);
    } else {
      openShareWrap(shareWrap);
    }
  }

  function onShareCopyClick(e) {
    e.preventDefault();
    var btn = e.currentTarget;
    var exerciseEl = btn.closest('.egx-exercise');
    if (!exerciseEl) return;
    var shareText = setupShareLinks(exerciseEl) || exerciseEl.getAttribute('data-egx-share-text') || '';
    copyToClipboard(shareText).then(function(ok) {
      if (!ok) return;
      btn.classList.add('egx-copied');
      var label = btn.querySelector('span');
      if (label) label.textContent = 'Copied';
      window.setTimeout(function() {
        btn.classList.remove('egx-copied');
        if (label) label.textContent = 'Copy';
      }, 1800);
    });
  }

  function bindExercise(ex) {
    qsa(ex, '.egx-option').forEach(function(btn) {
      btn.addEventListener('click', onOptionButtonClick);
    });

    qsa(ex, '.egx-restart, .egx-restart-2').forEach(function(btn) {
      btn.addEventListener('click', onRestartButtonClick);
    });

    qsa(ex, '.egx-share-btn').forEach(function(btn) {
      btn.addEventListener('click', onShareButtonClick);
    });

    qsa(ex, '.egx-share-copy').forEach(function(btn) {
      btn.addEventListener('click', onShareCopyClick);
    });

    qsa(ex, '.egx-share-link').forEach(function(link) {
      link.addEventListener('click', function() {
        var exerciseEl = link.closest('.egx-exercise');
        if (exerciseEl) setupShareLinks(exerciseEl);
      });
    });
  }

  function init() {
    document.querySelectorAll('.egx-exercise').forEach(function(ex) {
      if (!ex.getAttribute('data-egx-correct')) {
        ex.setAttribute('data-egx-correct', '0');
      }
      updateProgress(ex);
      bindExercise(ex);
      qsa(ex, '.egx-question').forEach(updateQuestionNote);
    });
  }

  // Do not close on focusout: removing an inline menu during pointer-down
  // would move More Exercises before pointer-up and swallow its click.
  document.addEventListener('click', function(e) {
    var target = e.target;
    if (target && target.closest && target.closest('.egx-share')) return;
    closeAllShares(null);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      var target = e.target;
      var wrap = target && target.closest ? target.closest('.egx-share.egx-share-open') : null;
      closeAllShares(null);
      if (wrap) {
        e.preventDefault();
        var btn = qs(wrap, '.egx-share-btn');
        if (btn) btn.focus();
      }
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();