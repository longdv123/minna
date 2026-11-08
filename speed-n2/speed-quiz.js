(function () {
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function pack() { try { return JSON.parse($('#minna-i18n').textContent); } catch (e) { return null; } }
  function tr(vi) {
    var p = pack(), l = document.documentElement.getAttribute('lang') || 'vi';
    if (!p || l === 'vi') return vi;
    var m = p[l + 'Map'] || {};
    return m[vi] || (p.enMap && p.enMap[vi]) || vi;
  }
  function labels() {
    $$('input[data-quiz-action]').forEach(function (b) {
      var vi = b.getAttribute('data-vi') || b.value;
      b.setAttribute('data-vi', vi);
      b.value = tr(vi);
    });
  }
  function qs() { return $$('.tracnghiem[data-correct]'); }
  function spans(input) {
    var id = input.id.replace('answer_', '');
    return { q: document.getElementById('result_question_' + id), c: document.getElementById('result_correct_' + id) };
  }
  function clearAll() {
    $$('.f2-options span[id^="result_"]').forEach(function (s) { s.textContent = ''; s.className = ''; });
    $$('.tracnghiem .giaithich, .tracnghiem .nghia').forEach(function (d) { d.hidden = true; d.style.display = 'none'; });
    var st = $('[data-quiz-status] span'); if (st) st.textContent = '';
  }
  function mark(span, ok) { if (!span) return; span.textContent = ok ? ' ✓' : ' ✗'; span.className = ok ? 'q-ok' : 'q-ng'; }
  function inputs(q) { return $$('input[type=radio]', q); }
  function check() {
    clearAll();
    var score = 0, list = qs();
    list.forEach(function (q) {
      var c = q.getAttribute('data-correct');
      inputs(q).forEach(function (i) {
        if (i.checked) { var ok = i.value === c; if (ok) score++; mark(spans(i).q, ok); }
        else if (i.value === c && $('input:checked', q)) { mark(spans(i).c, true); }
      });
    });
    var st = $('[data-quiz-status] span'); if (st) st.textContent = score + ' / ' + list.length;
  }
  function reveal() {
    clearAll();
    qs().forEach(function (q) {
      var c = q.getAttribute('data-correct');
      inputs(q).forEach(function (i) { if (i.value === c) mark(spans(i).c, true); });
      $$('.giaithich, .nghia', q).forEach(function (d) { if (d.textContent.trim()) { d.hidden = false; d.style.display = 'block'; } });
    });
  }
  function reset() { $$('.tracnghiem input[type=radio]').forEach(function (i) { i.checked = false; }); clearAll(); }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.getAttribute && e.target.getAttribute('data-quiz-action');
    if (a === 'check') check(); else if (a === 'reveal') reveal(); else if (a === 'reset') reset();
  });
  function init() {
    labels();
    try { new MutationObserver(labels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] }); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
