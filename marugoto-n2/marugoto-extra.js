(function () {
  var KEY = 'marugoto_furigana';
  function set(on) {
    document.body.classList.toggle('hide-furigana', !on);
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
  }
  window.marugotoSetFurigana = set;
  var on = true;
  try { on = localStorage.getItem(KEY) !== '0'; } catch (e) {}
  function init() {
    set(on);
    var b = document.createElement('button');
    b.id = 'marugoto-furi';
    b.type = 'button';
    b.textContent = 'ふ';
    b.onclick = function () { set(document.body.classList.contains('hide-furigana')); };
    document.body.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
