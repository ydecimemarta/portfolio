(function () {
  var STORAGE_KEY = 'lang';
  var SUPPORTED = ['en', 'es'];

  function getLang() {
    var saved = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.indexOf(saved) !== -1 ? saved : 'en';
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

  function injectSwitcher() {
    var el = document.createElement('div');
    el.className = 'lang-switch';
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'Language');
    el.innerHTML = '<button type="button" data-lang="es">ES</button><button type="button" data-lang="en">EN</button>';
    document.body.appendChild(el);
    var buttons = el.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', (function (btn) {
        return function () { setLang(btn.getAttribute('data-lang')); };
      })(buttons[i]));
    }
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
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectStyles();
    injectSwitcher();
    applyLang(getLang());
  });

  window.setLang = setLang;
})();
