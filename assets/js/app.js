/* Mizan — app bootstrap */
(function () {
  'use strict';
  var M = window.M;

  M.load();
  M.applyTheme();
  try {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onScheme = function () { if (M.state.settings.theme === 'system') M.applyTheme(); };
    if (mq.addEventListener) mq.addEventListener('change', onScheme); else if (mq.addListener) mq.addListener(onScheme);
  } catch (e) { /* ignore */ }

  /* ---------- Install (PWA) ---------- */
  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    M.$$('[data-action="install"]').forEach(function (b) { b.hidden = false; });
  });
  window.addEventListener('appinstalled', function () { deferredPrompt = null; M.toast('Mizan installed'); });
  M.install = function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () { deferredPrompt = null; }, function () { deferredPrompt = null; });
      return;
    }
    M.sheet({
      title: 'Install Mizan',
      body: '<p class="soft">Mizan works like an app once it’s on your home screen — full screen, and offline.</p><ul class="list">' +
        '<li><div class="li-main"><strong>iPhone / iPad (Safari)</strong><span>Tap the Share button, then “Add to Home Screen”.</span></div></li>' +
        '<li><div class="li-main"><strong>Android (Chrome)</strong><span>Tap the ⋮ menu, then “Install app” or “Add to Home screen”.</span></div></li>' +
        '<li><div class="li-main"><strong>Computer (Chrome or Edge)</strong><span>Click the install icon at the right of the address bar.</span></div></li></ul>',
      foot: '<button type="button" class="btn btn-primary" data-close>OK</button>', noAutofocus: true
    });
  };

  /* ---------- More menu (mobile) ---------- */
  function moreSheet() {
    var items = [
      ['review', 'list', 'Weekly review', 'Planned vs done, obstacles, reflection'],
      ['body/tools', 'calc', 'Calculators', 'BMI, calories, body fat, water, sleep and more'],
      ['body/workouts', 'dumbbell', 'Workout plan', 'Sessions for your equipment and schedule'],
      ['settings', 'settings', 'Settings', 'Profile, units, prayer times, backup'],
      ['science', 'book', 'Science & sources', 'The research behind every feature'],
      ['about', 'lock', 'Privacy & about', 'Your data stays on this device']
    ];
    M.sheet({
      title: 'More',
      body: '<ul class="list">' + items.map(function (x) {
        return '<li><a href="#/' + x[0] + '" data-close class="row grow" style="text-decoration:none;color:inherit;gap:14px"><span class="ti" style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--surface-2)">' + M.icon(x[1], 'style="width:22px;height:22px"') + '</span><span class="li-main"><strong>' + x[2] + '</strong><span>' + x[3] + '</span></span></a></li>';
      }).join('') + '</ul>' +
        '<div class="btn-row" style="margin-top:12px"><button type="button" class="btn" data-install-inline>' + M.icon('download') + 'Install as an app</button><button type="button" class="btn" data-focus-inline>' + M.icon('timer') + 'Focus timer</button></div>',
      noAutofocus: true,
      onOpen: function (dlg) {
        dlg.querySelector('[data-install-inline]').addEventListener('click', function () { dlg.close(); M.install(); });
        dlg.querySelector('[data-focus-inline]').addEventListener('click', function () { dlg.close(); M.ui.focusTimer(''); });
      }
    });
  }

  /* ---------- Global actions ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-action]');
    if (!a) return;
    var act = a.getAttribute('data-action');
    if (act === 'edit-profile') { e.preventDefault(); M.go('settings/profile'); }
    else if (act === 'more') { e.preventDefault(); moreSheet(); }
    else if (act === 'install') { e.preventDefault(); M.install(); }
    else if (act === 'focus-global') { e.preventDefault(); M.ui.focusTimer(''); }
  });

  window.addEventListener('hashchange', function () { M.render(); });
  window.addEventListener('storage', function (e) {
    if (e.key === 'mizan.v1' && !document.querySelector('dialog[open]')) { M.load(); M.applyTheme(); M.refresh(); }
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && M.currentRoute && M.currentRoute.name === 'today' && !document.querySelector('dialog[open]')) M.render(true);
  });

  /* ---------- Offline support ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) { console.warn('Service worker not registered', err); });
    });
  }

  if (M.state.settings.onboarded) M.requestPersist();
  M.render();
})();
