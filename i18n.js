(function () {
  var STORAGE_KEY = 'lang';
  var SUPPORTED = ['en', 'es'];

  function getUrlLang() {
    var v = new URLSearchParams(window.location.search).get('lang');
    return SUPPORTED.indexOf(v) !== -1 ? v : null;
  }

  function getLang() {
    var urlLang = getUrlLang();
    if (urlLang) return urlLang;
    var saved = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.indexOf(saved) !== -1 ? saved : 'en';
  }

  // Keeps the address bar itself consistent with the active language, so a
  // copied link always reopens in the language it was copied from.
  function syncUrl(lang) {
    var url = new URL(window.location.href);
    if (url.searchParams.get('lang') === lang) return;
    url.searchParams.set('lang', lang);
    window.history.replaceState(null, '', url);
  }

  // Same-site .html links need the current language threaded through them —
  // this is a static multi-page site, not an SPA, so every internal <a> has
  // to carry ?lang= itself for navigation to stay in the chosen language.
  function propagateLangToLinks(lang) {
    var anchors = document.querySelectorAll('a[href]');
    for (var i = 0; i < anchors.length; i++) {
      var raw = anchors[i].getAttribute('href');
      if (!raw || raw.charAt(0) === '#') continue;
      var url;
      try { url = new URL(raw, window.location.href); } catch (e) { continue; }
      if (url.origin !== window.location.origin) continue;
      if (!/\.html?$/i.test(url.pathname)) continue;
      url.searchParams.set('lang', lang);
      anchors[i].setAttribute('href', url.pathname + url.search + url.hash);
    }
  }

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '.lang-switch {',
      '  position: fixed;',
      '  top: 20px;',
      '  right: 20px;',
      '  z-index: 1000;',
      '  display: flex;',
      '  gap: 2px;',
      '  padding: 4px;',
      '  background: #F9F0E8;',
      '  border-radius: 100px;',
      '  font-family: "Karla", sans-serif;',
      '}',
      '.lang-switch button {',
      '  border: none;',
      '  background: transparent;',
      '  cursor: pointer;',
      '  font-family: inherit;',
      '  font-size: 12px;',
      '  font-weight: 700;',
      '  letter-spacing: 0.03em;',
      '  padding: 6px 14px;',
      '  border-radius: 100px;',
      '  color: #8A7A63;',
      '  transition: background 0.2s, color 0.2s, box-shadow 0.2s;',
      '}',
      '.lang-switch button.active {',
      '  background: #fff;',
      '  color: #000;',
      '  box-shadow: 0 1px 4px rgba(0,0,0,0.12);',
      '}',
      '@media (max-width: 700px) {',
      '  .lang-switch { top: 14px; right: 14px; }',
      '  .lang-switch button { padding: 5px 11px; font-size: 11px; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function wireSwitcherButtons(el) {
    var buttons = el.querySelectorAll('button[data-lang]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', (function (btn) {
        return function () { setLang(btn.getAttribute('data-lang')); };
      })(buttons[i]));
    }
  }

  // Pages can hand-place their own `.lang-switch` markup (e.g. embedded in a
  // custom topbar) instead of getting the default fixed floating pill — if
  // one already exists in the DOM, wire it up in place rather than injecting
  // a second one.
  function injectSwitcher() {
    var existing = document.querySelector('.lang-switch');
    if (existing) { wireSwitcherButtons(existing); return; }
    var el = document.createElement('div');
    el.className = 'lang-switch';
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'Language');
    el.innerHTML = '<button type="button" data-lang="es">ES</button><button type="button" data-lang="en">EN</button>';
    document.body.appendChild(el);
    wireSwitcherButtons(el);
  }

  function applyLang(lang) {
    var dict = window.I18N && window.I18N[lang];
    if (!dict) return;
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      if (dict[key] !== undefined) nodes[i].innerHTML = dict[key];
    }
    document.documentElement.lang = lang;
    var buttons = document.querySelectorAll('.lang-switch button');
    for (var j = 0; j < buttons.length; j++) {
      var isActive = buttons[j].getAttribute('data-lang') === lang;
      buttons[j].classList.toggle('active', isActive);
    }
    propagateLangToLinks(lang);
    syncUrl(lang);
    // lets pages react to a language change (e.g. re-run a masonry layout
    // when translated text wraps to a different number of lines).
    document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: lang } }));
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.querySelector('.lang-switch')) injectStyles();
    injectSwitcher();
    // setLang (not applyLang) so a language arriving via ?lang= in a shared
    // link also gets remembered for this visitor's later, param-less visits.
    setLang(getLang());
  });

  window.setLang = setLang;
})();
