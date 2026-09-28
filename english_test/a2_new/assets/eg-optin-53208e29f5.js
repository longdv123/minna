
(function(){
  'use strict';

  function qs(sel, root){ return (root || document).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function isLikelyMobile(){
    try{
      if(window.matchMedia){
        if(window.matchMedia('(pointer: coarse)').matches) return true;
        if(window.matchMedia('(hover: none)').matches) return true;
      }
      if(window.innerWidth && window.innerWidth < 768) return true;
    }catch(e){}
    return false;
  }

  function parseSelectorList(s){
    if(!s || typeof s !== 'string') return [];
    return s.split(',').map(function(x){ return x.trim(); }).filter(Boolean);
  }

  function closestMatches(el, selector){
    if(!el || el === document) return null;
    if(el.closest){
      try{ return el.closest(selector); }catch(e){ return null; }
    }
    while(el && el !== document){
      try{
        if(el.matches && el.matches(selector)) return el;
      }catch(e){}
      el = el.parentNode;
    }
    return null;
  }

  function portalOverlayToBody(overlay){
    try{
      if(overlay && overlay.parentNode !== document.body){
        document.body.appendChild(overlay);
      }
    }catch(e){}
  }

  function turnstileReady(){
    return !!(window.turnstile && typeof window.turnstile.render === 'function');
  }

  function getTurnstileEl(root){
    return qs('.eg-optin-turnstile', root);
  }

  function setTurnstileVisibility(el, visible){
    if(!el) return;
    if(visible){
      el.classList.add('eg-optin-turnstile--active');
      el.setAttribute('aria-hidden', 'false');
    }else{
      el.classList.remove('eg-optin-turnstile--active');
      el.setAttribute('aria-hidden', 'true');
    }
  }

  function resetTurnstile(el){
    if(!el || !turnstileReady()) return;
    var widgetId = el.dataset.egWidgetId;
    if(typeof widgetId === 'undefined' || widgetId === '') return;
    try{
      window.turnstile.reset(widgetId);
      el.dataset.egTokenPresent = '';
      el.dataset.egTokenAt = '';
    }catch(e){}
  }

  function tokenIsFresh(el){
    if(!el) return true;
    if(el.dataset.egTokenPresent !== '1') return false;
    var ts = parseInt(el.dataset.egTokenAt || '0', 10);
    if(!ts) return true;
    return (Date.now() - ts) < 240000;
  }

  function renderTurnstileWithin(root){
    if(!root || !turnstileReady()) return false;
    var targets = qsa('.eg-optin-turnstile', root);
    var renderedAny = false;

    targets.forEach(function(el){
      if(el.dataset.egRendered === '1') return;
      setTurnstileVisibility(el, true);
      var sitekey = el.getAttribute('data-sitekey');
      if(!sitekey) return;
      try{
        var widgetId = window.turnstile.render(el, {
          sitekey: sitekey,
          'response-field': true,
          callback: function(token){
            el.dataset.egTokenPresent = token ? '1' : '';
            el.dataset.egTokenAt = token ? String(Date.now()) : '';
            clearFormNotice(closestMatches(el, '.eg-optin-form'));
          },
          'expired-callback': function(){
            el.dataset.egTokenPresent = '';
            el.dataset.egTokenAt = '';
          },
          'error-callback': function(){
            el.dataset.egTokenPresent = '';
            el.dataset.egTokenAt = '';
          }
        });
        if(typeof widgetId !== 'undefined'){
          el.dataset.egWidgetId = String(widgetId);
        }
        el.dataset.egRendered = '1';
        renderedAny = true;
      }catch(e){}
    });
    return renderedAny;
  }

  function whenTurnstileReady(cb){
    if(!window.EG_OPTIN || !window.EG_OPTIN.turnstileEnabled){
      cb();
      return;
    }
    var attempts = 0;
    function tick(){
      if(turnstileReady()){
        cb();
        return;
      }
      attempts += 1;
      if(attempts < 80){
        window.setTimeout(tick, 100);
      }
    }
    tick();
  }

  function showFormNotice(form, text){
    if(!form || !text) return;
    var notice = qs('.eg-optin-message--client', form);
    if(!notice){
      notice = document.createElement('div');
      notice.className = 'eg-optin-message eg-optin-message--error eg-optin-message--client';
      var first = form.firstChild;
      if(first){
        form.insertBefore(notice, first);
      }else{
        form.appendChild(notice);
      }
    }
    notice.textContent = text;
  }

  function clearFormNotice(form){
    if(!form) return;
    var notice = qs('.eg-optin-message--client', form);
    if(notice && notice.parentNode){
      notice.parentNode.removeChild(notice);
    }
  }

  function primeTurnstileForForm(form){
    if(!form) return;
    var el = getTurnstileEl(form);
    if(!el) return;
    setTurnstileVisibility(el, true);
    if(el.dataset.egRendered === '1') return;
    whenTurnstileReady(function(){
      renderTurnstileWithin(form);
    });
  }

  function initFormLifecycle(){
    qsa('.eg-optin-form').forEach(function(form){
      if(form.dataset.egBound === '1') return;
      form.dataset.egBound = '1';

      ['focusin','pointerdown','touchstart'].forEach(function(evt){
        form.addEventListener(evt, function(){
          primeTurnstileForForm(form);
        }, { passive: true });
      });

      var initialCaptchaEl = getTurnstileEl(form);
      if(initialCaptchaEl && initialCaptchaEl.dataset.egShowOnLoad === '1'){
        primeTurnstileForForm(form);
      }

      form.addEventListener('submit', function(e){
        var submit = qs('.eg-optin-submit', form);
        var captchaEl = getTurnstileEl(form);

        if(form.dataset.egSubmitting === '1'){
          e.preventDefault();
          return;
        }

        if(!captchaEl){
          if(submit){
            submit.disabled = true;
            submit.setAttribute('aria-busy', 'true');
          }
          form.dataset.egSubmitting = '1';
          return;
        }

        if(captchaEl.dataset.egRendered !== '1'){
          e.preventDefault();
          primeTurnstileForForm(form);
          showFormNotice(form, 'Please complete the captcha and then submit again.');
          return;
        }

        if(!tokenIsFresh(captchaEl)){
          e.preventDefault();
          setTurnstileVisibility(captchaEl, true);
          resetTurnstile(captchaEl);
          showFormNotice(form, 'Captcha refreshed. Please submit again.');
          return;
        }

        clearFormNotice(form);
        if(submit){
          submit.disabled = true;
          submit.setAttribute('aria-busy', 'true');
        }
        form.dataset.egSubmitting = '1';
      });
    });
  }

  function init(){
    var overlay = qs('#eg-optin-overlay');
    if(overlay){
      portalOverlayToBody(overlay);
    }

    initFormLifecycle();

    function openPopup(){
      if(!overlay) return;
      portalOverlayToBody(overlay);

      overlay.hidden = false;
      overlay.style.display = 'flex';
      overlay.classList.add('is-open');
      document.documentElement.classList.add('eg-optin-modal-open');
      document.body.classList.add('eg-optin-modal-open');

      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';

      whenTurnstileReady(function(){
        window.setTimeout(function(){
          var captchaEl = getTurnstileEl(overlay);
          if(!captchaEl) return;
          if(captchaEl.dataset.egRendered === '1'){
            if(!tokenIsFresh(captchaEl)){
              resetTurnstile(captchaEl);
            }
          } else {
            renderTurnstileWithin(overlay);
          }
        }, 30);
      });

      var af = (window.EG_OPTIN && window.EG_OPTIN.popupAutofocus) ? window.EG_OPTIN.popupAutofocus : 'desktop';
      var allowFocus = false;
      if(af === 'always') allowFocus = true;
      else if(af === 'desktop') allowFocus = !isLikelyMobile();

      if(allowFocus){
        setTimeout(function(){
          var email = qs('.eg-optin-email', overlay);
          if(!email) return;
          try{
            email.focus({ preventScroll: true });
          }catch(e){
            try{ email.focus(); }catch(e2){}
          }
        }, 60);
      }
    }

    function closePopup(){
      if(!overlay) return;
      overlay.classList.remove('is-open');
      overlay.hidden = true;
      overlay.style.display = 'none';
      document.documentElement.classList.remove('eg-optin-modal-open');
      document.body.classList.remove('eg-optin-modal-open');
    }

    var baseSelectors = ['.eg-optin-open', '[data-eg-optin-open]', 'a[href="#eg-optin"]'];
    var extraSelectors = (window.EG_OPTIN && window.EG_OPTIN.popupSelectors) ? window.EG_OPTIN.popupSelectors : '';
    var selectorList = baseSelectors.concat(parseSelectorList(extraSelectors));
    selectorList = selectorList.filter(function(s, i){
      return s && selectorList.indexOf(s) === i;
    });

    document.addEventListener('click', function(e){
      if(!selectorList || !selectorList.length) return;

      var hit = null;
      for(var i=0;i<selectorList.length;i++){
        hit = closestMatches(e.target, selectorList[i]);
        if(hit) break;
      }
      if(!hit) return;

      if(hit.tagName && hit.tagName.toLowerCase() === 'a'){
        var href = hit.getAttribute('href') || '';
        if(href === '#eg-optin' || href === '#'){
          e.preventDefault();
        }
      }else{
        e.preventDefault();
      }
      openPopup();
    }, true);

    document.addEventListener('click', function(e){
      var btn = closestMatches(e.target, '[data-eg-optin-close]');
      if(btn){
        e.preventDefault();
        closePopup();
      }
      var bg = closestMatches(e.target, '[data-eg-optin-overlay]');
      if(bg && window.EG_OPTIN && window.EG_OPTIN.closeOnOverlay){
        e.preventDefault();
        closePopup();
      }
    }, true);

    document.addEventListener('keydown', function(e){
      if(!(window.EG_OPTIN && window.EG_OPTIN.closeOnEsc)) return;
      if(e.key === 'Escape' || e.keyCode === 27){
        closePopup();
      }
    });

    try{
      var params = new URLSearchParams(window.location.search);
      var status = params.get('eg_optin_status');
      var mode = params.get('eg_optin_mode');
      if(status === 'error' && mode === 'popup' && window.EG_OPTIN && window.EG_OPTIN.autoOpenOnError){
        openPopup();
      }
    }catch(e){}

    window.EG_OPTIN_OPEN = openPopup;
    window.EG_OPTIN_CLOSE = closePopup;
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
