/* Mizan — Welcome, Settings, Science, About */
(function () {
  'use strict';
  var M = (window.M = window.M || {});
  var U = M.ui;
  var C = M.calc;
  var step = 0;
  var draft = null;

  /* ------------------------------------------------------------------ */
  /* Welcome / onboarding                                                */
  /* ------------------------------------------------------------------ */
  M.views.welcome = {
    head: function () { return { title: 'Welcome' }; },
    render: function (el) {
      var st = M.state;
      if (!draft) draft = { template: 'earlyRiser' };
      var dots = '<div class="steps" aria-hidden="true">' + [0, 1, 2].map(function (i) { return '<i class="' + (i <= step ? 'on' : '') + '"></i>'; }).join('') + '</div>';
      var html = '<div class="onboard">' + dots;
      if (step === 0) {
        html += '<div class="brand-hero">' + M.logo(64) + '<div><strong>Mizan</strong><span>Balance your day, body &amp; plate</span></div></div>' +
          '<h1>Plan a day you can actually keep.</h1>' +
          '<p class="lede">Mizan helps you build a realistic routine, follow it hour by hour, form habits that stick, and eat and train for your goals — using guidance from WHO, ICMR-NIN and sports-science research.</p>' +
          '<ul class="checks" style="margin:18px 0 24px">' +
          '<li class="info">' + M.icon('today') + '<span><strong>A live dial of your day</strong> — what’s now, what’s next, and quick check-ins.</span></li>' +
          '<li class="info">' + M.icon('habits') + '<span><strong>Habits without streak anxiety</strong> — weekly consistency, backup plans, never-miss-twice.</span></li>' +
          '<li class="info">' + M.icon('body') + '<span><strong>BMI, calories, body fat and more</strong> — with Asian and teen-appropriate cut-offs.</span></li>' +
          '<li class="info">' + M.icon('food') + '<span><strong>7-day meal plans</strong> with real Indian dishes, grocery lists, and workout plans for any equipment.</span></li>' +
          '<li class="info">' + M.icon('lock') + '<span><strong>Private by design</strong> — no account, no tracking. Everything stays on this device.</span></li></ul>' +
          '<div class="btn-row"><button type="button" class="btn btn-primary" data-action="next">Get started</button><button type="button" class="btn btn-ghost" data-action="skip">Skip and explore</button></div>';
      } else if (step === 1) {
        var p = st.profile;
        var w = M.latestWeight();
        html += '<h1>About you</h1><p class="lede">Used only to personalise sleep, calorie and BMI guidance. All optional — you can change it any time in Settings.</p>' +
          '<form id="ob-form" class="stack" novalidate>' +
          '<div class="field"><label for="ob-name">First name</label><input class="input" id="ob-name" name="name" maxlength="40" value="' + M.esc(p.name) + '" autocomplete="given-name"></div>' +
          '<div class="field"><span class="label">Units</span>' + U.radios('units', [['metric', 'kg & cm'], ['imperial', 'lb & inches']], st.settings.units) + '</div>' +
          '<div class="form-grid">' + U.numField('age', 'Age', M.ageFrom(p) || '', 'years', { step: 1, min: 5, max: 110 }) +
          U.numField('h', 'Height', p.heightCm ? (M.imperial() ? M.fmt(M.cmToIn(p.heightCm), 1) : Math.round(p.heightCm)) : '', M.imperial() ? 'in' : 'cm', { step: 0.1 }) +
          U.numField('w', 'Weight', w ? (M.imperial() ? M.fmt(M.kgToLb(w), 1) : w) : '', M.wUnit(), { step: 0.1 }) + '</div>' +
          '<div class="field"><span class="label">Sex</span>' + U.radios('sex', [['female', 'Female'], ['male', 'Male'], ['', 'Prefer not to say']], p.sex) + '<span class="hint">Calorie and body-fat formulas differ by sex. If you skip this, Mizan uses an average.</span></div>' +
          U.selectField('activity', 'How active are you on a normal day?', C.ACTIVITY.map(function (a) { return [a.id, a.label + ' — ' + a.desc]; }), p.activity) +
          '<label class="switch"><span class="sw-text"><strong>Use Asian BMI cut-offs</strong><span>Recommended for South Asian and East Asian backgrounds, where health risks start at a lower BMI.</span></span><input type="checkbox" name="asian"' + (st.settings.bmiStandard === 'asian' ? ' checked' : '') + '></label>' +
          '<div class="btn-row"><button type="submit" class="btn btn-primary">Continue</button><button type="button" class="btn btn-ghost" data-action="back">Back</button></div></form>';
      } else {
        html += '<h1>Your day</h1><p class="lede">Pick a starting routine. You’ll be able to edit every block.</p>' +
          '<form id="ob-form2" class="stack" novalidate><div class="choice-grid" role="radiogroup">' +
          M.TEMPLATE_LIST.map(function (t) { return '<label class="choice block"><input type="radio" name="tpl" value="' + t.id + '"' + (draft.template === t.id ? ' checked' : '') + '><span><strong>' + M.esc(t.name) + '</strong></span><small>' + M.esc(t.desc) + '</small></label>'; }).join('') + '</div>' +
          '<label class="switch"><span class="sw-text"><strong>Show prayer times</strong><span>Uses your location once to calculate Fajr to Isha on this device. You can set it up later in Settings.</span></span><input type="checkbox" name="prayer"' + (st.settings.prayer.enabled ? ' checked' : '') + '></label>' +
          '<div class="btn-row"><button type="submit" class="btn btn-primary">Finish</button><button type="button" class="btn btn-ghost" data-action="back">Back</button></div></form>';
      }
      html += '<p class="muted" style="margin-top:28px;font-size:var(--fs-sm)">Mizan gives general guidance, not medical advice. <a href="#/about">Privacy & about</a> · <a href="#/science">Science & sources</a></p></div>';
      el.innerHTML = html;

      el.addEventListener('click', function (e) {
        var a = e.target.closest('[data-action]');
        if (!a) return;
        var act = a.getAttribute('data-action');
        if (act === 'next') { step = 1; M.refresh(); }
        else if (act === 'back') { step = Math.max(0, step - 1); M.refresh(); }
        else if (act === 'skip') finish(false);
      });
      var f = M.$('#ob-form', el);
      if (f) {
        f.addEventListener('change', function (e) {
          if (e.target.name === 'units') { saveStep1(f); M.state.settings.units = e.target.value; M.refresh(); }
        });
        f.addEventListener('submit', function (e) { e.preventDefault(); saveStep1(f); step = 2; M.refresh(); });
      }
      var f2 = M.$('#ob-form2', el);
      if (f2) f2.addEventListener('submit', function (e) {
        e.preventDefault();
        var d = M.formData(f2);
        draft.template = d.tpl || 'earlyRiser';
        M.state.routines = M.templates.make(draft.template);
        finish(!!d.prayer);
      });
    }
  };

  function saveStep1(f) {
    var d = M.formData(f);
    var p = M.state.profile;
    p.name = (d.name || '').trim();
    var age = M.num(d.age); if (age) { p.age = Math.round(age); p.dob = ''; }
    var h = M.num(d.h); if (h) p.heightCm = M.imperial() ? M.inToCm(h) : h;
    var w = M.inW(d.w); if (w && w > 20 && w < 350) M.logWeight(w);
    p.sex = d.sex || '';
    p.activity = d.activity || p.activity;
    M.state.settings.bmiStandard = d.asian ? 'asian' : 'who';
    M.save();
  }

  function finish(wantPrayer) {
    M.state.settings.onboarded = true;
    M.save(true);
    M.requestPersist();
    step = 0; draft = null;
    if (wantPrayer) { M.state.settings.prayer.enabled = true; M.save(); locate(function () { M.go('today'); }); M.go('settings/prayer'); return; }
    M.go('today');
  }

  /* ------------------------------------------------------------------ */
  /* Location for prayer times                                           */
  /* ------------------------------------------------------------------ */
  function locate(done) {
    if (!navigator.geolocation) { M.toast('Location isn’t available — enter your city’s coordinates instead.'); return; }
    M.toast('Finding your location…');
    navigator.geolocation.getCurrentPosition(function (pos) {
      var pr = M.state.settings.prayer;
      pr.lat = Math.round(pos.coords.latitude * 10000) / 10000;
      pr.lng = Math.round(pos.coords.longitude * 10000) / 10000;
      pr.enabled = true;
      if (!pr.place) pr.place = 'My location';
      M.save(); M.refresh(); M.toast('Location saved on this device');
      if (done) done();
    }, function () {
      M.toast('Couldn’t get your location. You can type coordinates instead.');
    }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 86400000 });
  }

  /* ------------------------------------------------------------------ */
  /* Settings                                                            */
  /* ------------------------------------------------------------------ */
  M.views.settings = {
    head: function () { return { title: 'Settings', sub: 'Profile, preferences, prayer times and your data' }; },
    render: function (el, parts) {
      var st = M.state, p = st.profile, s = st.settings;
      var w = M.latestWeight();
      var pr = s.prayer;
      var pt = pr.enabled && pr.lat !== null ? M.prayer.times(M.today(), pr) : null;
      var imp = M.imperial();
      el.innerHTML =
        '<div class="split even">' +
        '<section class="panel" id="profile" aria-labelledby="set-prof"><h2 id="set-prof" style="margin-bottom:14px">Profile</h2><form id="prof-form" class="stack" novalidate>' +
        '<div class="form-grid"><div class="field"><label for="st-name">First name</label><input class="input" id="st-name" name="name" maxlength="40" value="' + M.esc(p.name) + '"></div>' +
        '<div class="field"><label for="st-dob">Date of birth</label><input class="input" id="st-dob" type="date" name="dob" value="' + M.esc(p.dob) + '" max="' + M.today() + '"><span class="hint">Or just enter your age →</span></div>' +
        U.numField('age', 'Age', p.dob ? '' : (p.age || ''), 'years', { step: 1, min: 2, max: 110, placeholder: p.dob ? String(M.ageFrom(p)) : '' }) +
        '<div class="field"><span class="label">Sex</span>' + U.radios('sex', [['female', 'Female'], ['male', 'Male'], ['', 'Not set']], p.sex) + '</div>' +
        U.numField('h', 'Height', p.heightCm ? (imp ? M.fmt(M.cmToIn(p.heightCm), 1) : M.fmt(p.heightCm, 1)) : '', imp ? 'in' : 'cm', { step: 0.1 }) +
        U.numField('w', 'Weight today', w ? (imp ? M.fmt(M.kgToLb(w), 1) : w) : '', M.wUnit(), { step: 0.1, hint: 'Saving a new value logs a weigh-in for today.' }) +
        U.numField('waist', 'Waist', p.waistCm ? M.showLen(p.waistCm) : '', M.lenUnit(), { step: 0.1 }) +
        U.numField('neck', 'Neck', p.neckCm ? M.showLen(p.neckCm) : '', M.lenUnit(), { step: 0.1 }) +
        U.numField('hip', 'Hips', p.hipCm ? M.showLen(p.hipCm) : '', M.lenUnit(), { step: 0.1 }) +
        U.numField('rest', 'Resting heart rate', p.restingHr || '', 'bpm', { step: 1 }) + '</div>' +
        U.selectField('activity', 'Activity level', C.ACTIVITY.map(function (a) { return [a.id, a.label + ' — ' + a.desc]; }), p.activity) +
        '<button type="submit" class="btn btn-primary">Save profile</button></form></section>' +

        '<div class="stack">' +
        '<section class="panel" aria-labelledby="set-pref"><h2 id="set-pref" style="margin-bottom:10px">Preferences</h2><form id="pref-form" class="stack" novalidate>' +
        '<div class="field"><span class="label">Units</span>' + U.radios('units', [['metric', 'kg & cm'], ['imperial', 'lb & inches']], s.units) + '</div>' +
        '<div class="field"><span class="label">Clock</span>' + U.radios('clock', [['24', '24-hour'], ['12', '12-hour']], s.clock) + '</div>' +
        '<div class="field"><span class="label">Theme</span>' + U.radios('theme', [['system', 'Match device'], ['light', 'Light'], ['dark', 'Dark']], s.theme) + '</div>' +
        '<div class="field"><span class="label">Adult BMI cut-offs</span>' + U.radios('bmiStandard', [['who', 'WHO (global)'], ['asian', 'Asian Indian / South Asian']], s.bmiStandard) + '</div>' +
        '<label class="switch"><span class="sw-text"><strong>Numbers-light mode</strong><span>Hides calories in plans and logs, and shows a simple plate check instead. Helpful if tracking numbers feels stressful.</span></span><input type="checkbox" name="numbersLight"' + (s.numbersLight ? ' checked' : '') + '></label>' +
        '<div class="form-grid">' + U.numField('glassMl', 'Glass size', s.glassMl || 250, 'ml', { step: 10, min: 100, max: 1000 }) + U.numField('waterGoal', 'Water goal (optional)', s.waterGoalMl ? s.waterGoalMl / 1000 : '', 'L', { step: 0.1, hint: 'Leave empty to use the suggested amount.' }) + '</div>' +
        '</form></section>' +

        '<section class="panel" id="prayer" aria-labelledby="set-pr"><h2 id="set-pr" style="margin-bottom:10px">Prayer times</h2><form id="pr-form" class="stack" novalidate>' +
        '<label class="switch"><span class="sw-text"><strong>Show prayer times</strong><span>Calculated on your device — your location is never sent anywhere.</span></span><input type="checkbox" name="enabled"' + (pr.enabled ? ' checked' : '') + '></label>' +
        '<div class="row wrap"><button type="button" class="btn" data-action="locate">' + M.icon('pin') + 'Use my location</button><span class="muted" style="font-size:var(--fs-sm)">' + (pr.lat !== null ? M.esc(pr.place || 'Saved') + ' (' + pr.lat + ', ' + pr.lng + ')' : 'No location yet') + '</span></div>' +
        '<details><summary class="muted" style="cursor:pointer;font-weight:700;font-size:var(--fs-sm)">Enter coordinates manually</summary><div class="form-grid" style="margin-top:10px">' +
        '<div class="field full"><label for="pr-place">Place name</label><input class="input" id="pr-place" name="place" maxlength="40" value="' + M.esc(pr.place) + '" placeholder="e.g. Mathura"></div>' +
        U.numField('lat', 'Latitude', pr.lat !== null ? pr.lat : '', '°', { step: 0.0001, min: -90, max: 90 }) + U.numField('lng', 'Longitude', pr.lng !== null ? pr.lng : '', '°', { step: 0.0001, min: -180, max: 180 }) + '</div></details>' +
        U.selectField('method', 'Calculation method', Object.keys(M.PRAYER_METHODS).map(function (k) { return [k, M.PRAYER_METHODS[k].name]; }), pr.method, { hint: 'Karachi is common in India, Pakistan and Bangladesh; follow your local mosque if it differs.' }) +
        '<div class="field"><span class="label">Asr</span>' + U.radios('asr', [['Standard', 'Standard (Shafi’i, Maliki, Hanbali)'], ['Hanafi', 'Hanafi']], pr.asr) + '</div>' +
        '<button type="submit" class="btn btn-primary">Save prayer settings</button>' +
        (pt ? '<div class="inset"><strong>Today' + (pr.place ? ' in ' + M.esc(pr.place) : '') + '</strong><dl class="kv" style="margin-top:8px">' + M.PRAYER_NAMES.map(function (x) { return '<dt>' + x.label + '</dt><dd>' + (pt[x.id] !== null ? M.fmtTime(pt[x.id]) : '—') + '</dd>'; }).join('') + '</dl><p class="hint muted" style="margin-top:8px">In your plan, edit a prayer block and choose "Move with prayer time" so it follows the season.</p></div>' : '') +
        '</form></section>' +

        '<section class="panel" id="data" aria-labelledby="set-data"><h2 id="set-data" style="margin-bottom:10px">Your data</h2>' +
        '<p class="soft" style="font-size:var(--fs-sm)">Everything is stored in this browser on this device. Nothing is uploaded. Clearing your browser data or using private mode will erase it, so back up now and then.</p>' +
        (M.storageOK ? '' : U.note('warn', '<p>This browser is blocking storage (private mode?). Changes will be lost when you close the page.</p>')) +
        '<div class="btn-row"><button type="button" class="btn" data-action="export">' + M.icon('download') + 'Back up (download)</button>' +
        '<label class="btn" style="cursor:pointer">' + M.icon('upload') + 'Restore from file<input type="file" accept="application/json,.json" data-action="import" class="sr-only"></label>' +
        '<button type="button" class="btn btn-danger" data-action="reset">' + M.icon('trash') + 'Erase everything</button></div></section>' +
        '<p class="muted" style="font-size:var(--fs-sm)">Mizan ' + M.VERSION + ' · <a href="#/science">Science & sources</a> · <a href="#/about">Privacy & about</a></p>' +
        '</div></div>';

      M.$('#prof-form', el).addEventListener('submit', function (e) {
        e.preventDefault();
        var d = M.formData(e.target);
        p.name = d.name.trim();
        p.dob = d.dob || '';
        if (!p.dob) p.age = M.num(d.age) ? Math.round(M.num(d.age)) : p.age;
        p.sex = d.sex || '';
        var h = M.num(d.h); p.heightCm = h ? (imp ? M.inToCm(h) : h) : null;
        var kg = M.inW(d.w); if (kg && kg > 20 && kg < 350 && Math.abs(kg - (M.latestWeight() || 0)) > 0.05) M.logWeight(kg);
        p.waistCm = M.inLen(d.waist); p.neckCm = M.inLen(d.neck); p.hipCm = M.inLen(d.hip);
        p.restingHr = M.num(d.rest);
        p.activity = d.activity || p.activity;
        M.save(); M.toast('Profile saved'); M.refresh();
      });
      M.$('#pref-form', el).addEventListener('change', function (e) {
        var d = M.formData(e.currentTarget);
        s.units = d.units; s.clock = d.clock; s.theme = d.theme; s.bmiStandard = d.bmiStandard; s.numbersLight = !!d.numbersLight;
        s.glassMl = M.clamp(M.num(d.glassMl) || 250, 100, 1000);
        var wg = M.num(d.waterGoal); s.waterGoalMl = wg ? Math.round(wg * 1000) : null;
        M.save(); M.applyTheme();
        if (['units', 'clock', 'theme'].indexOf(e.target.name) >= 0) M.refresh();
        M.toast('Preferences saved');
      });
      M.$('#pr-form', el).addEventListener('submit', function (e) {
        e.preventDefault();
        var d = M.formData(e.target);
        pr.enabled = !!d.enabled; pr.method = d.method; pr.asr = d.asr || 'Standard'; pr.place = (d.place || '').trim();
        var la = M.num(d.lat), lo = M.num(d.lng);
        if (la !== null && lo !== null && Math.abs(la) <= 90 && Math.abs(lo) <= 180) { pr.lat = la; pr.lng = lo; }
        if (pr.enabled && pr.lat === null) M.toast('Add a location so prayer times can be calculated.');
        M.save(); M.refresh(); M.toast('Prayer settings saved');
      });
      el.addEventListener('click', function (e) {
        var a = e.target.closest('[data-action]');
        if (!a) return;
        var act = a.getAttribute('data-action');
        if (act === 'locate') locate();
        else if (act === 'export') exportData();
        else if (act === 'reset') {
          M.confirm('Erase everything?', 'This deletes your routines, check-ins, habits, weights, food logs and plans from this device. Download a backup first if you might want them.', 'Erase everything', true).then(function (ok) {
            if (!ok) return;
            M.resetAll(); M.applyTheme(); M.go('welcome'); M.toast('All data erased');
          });
        }
      });
      var imp2 = el.querySelector('[data-action="import"]');
      imp2.addEventListener('change', function () {
        var file = imp2.files && imp2.files[0];
        if (!file) return;
        var rd = new FileReader();
        rd.onload = function () {
          try {
            var data = JSON.parse(rd.result);
            if (!data || typeof data !== 'object' || !data.profile || !data.routines) throw new Error('Not a Mizan backup');
            M.confirm('Restore this backup?', 'It will replace everything currently in Mizan on this device.', 'Restore').then(function (ok) {
              if (!ok) return;
              var base = M.defaultState();
              Object.keys(data).forEach(function (k) { base[k] = data[k]; });
              M.state = base; M.save(true); M.applyTheme(); M.go('today'); M.toast('Backup restored');
            });
          } catch (err) { M.toast('That file isn’t a Mizan backup.'); }
        };
        rd.readAsText(file);
      });
      if (parts && parts[0]) { var target = document.getElementById(parts[0]); if (target) setTimeout(function () { target.scrollIntoView({ block: 'start' }); }, 50); }
    }
  };

  function exportData() {
    try {
      var blob = new Blob([JSON.stringify(M.state, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'mizan-backup-' + M.today() + '.json';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      M.toast('Backup downloaded');
    } catch (e) { M.toast('Couldn’t create the backup file.'); }
  }

  /* ------------------------------------------------------------------ */
  /* Science & sources                                                   */
  /* ------------------------------------------------------------------ */
  var REFS = [
    ['Habits & self-management', [
      ['Lally et al. (2010) — habits took 66 days on average (18–254); missing one day didn’t matter', 'https://www.ucl.ac.uk/news/2009/aug/how-long-does-it-take-form-habit'],
      ['Gollwitzer & Sheeran (2006) — if–then plans, meta-analysis d = 0.65', 'https://en.wikipedia.org/wiki/Implementation_intention'],
      ['Milne, Orbell & Sheeran (2002) — exercise plans: 91% vs 35–38% follow-through', 'https://habi.app/insights/habit-tracker-statistics/'],
      ['Harkin et al. (2016) — monitoring progress helps, more when recorded and shared (138 studies)', 'https://www.sciencedaily.com/releases/2015/10/151029101349.htm'],
      ['Buehler et al. (1994) — the planning fallacy: 34 days planned, 55 taken', 'https://en.wikipedia.org/wiki/Planning_fallacy'],
      ['Dai, Milkman & Riis (2014) — the fresh start effect', 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2204126'],
      ['Breines & Chen (2012) — self-compassion increases motivation to improve', 'https://www.psychologytoday.com/us/blog/the-science-of-willpower/201206/does-self-compassion-or-criticism-motivate-self-improvement'],
      ['Oettingen — WOOP / mental contrasting with implementation intentions', 'https://woopmylife.org/en/science'],
      ['Fogg Behavior Model — behaviour = motivation × ability × prompt', 'https://behaviormodel.org/'],
      ['Bedtime procrastination and MCII (33 vs 14 minutes earlier to bed)', 'https://en.wikipedia.org/wiki/Bedtime_procrastination']
    ]],
    ['Body size & composition', [
      ['WHO — obesity and overweight fact sheet; BMI cut-offs', 'https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight'],
      ['CDC — adult BMI categories and BMI-for-age percentiles (2–19)', 'https://www.cdc.gov/bmi/child-teen-calculator/bmi-categories.html'],
      ['WHO — BMI-for-age reference, 5–19 years', 'https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators/bmi-for-age'],
      ['Revised definition of obesity in Asian Indians (2025) — BMI 23, waist 90/80 cm', 'https://www.cmcendovellore.org/pub/2025/revised-definition-of-obesity-in-asian-indians-living-in-india.pdf'],
      ['NHS — lower BMI thresholds for South Asian and other groups; waist under half your height', 'https://www.nhs.uk/conditions/obesity/'],
      ['Waist-to-height ratio (NICE 2022 boundaries 0.4 / 0.5 / 0.6)', 'https://en.wikipedia.org/wiki/Waist-to-height_ratio'],
      ['Harvard Health — limits of BMI', 'https://www.health.harvard.edu/blog/how-useful-is-the-body-mass-index-bmi-201603309339'],
      ['US Navy circumference method and body-fat ranges', 'https://en.wikipedia.org/wiki/Body_fat_percentage']
    ]],
    ['Energy & weight change', [
      ['Mifflin–St Jeor equation (1990)', 'https://mifflinstjeor.com/mifflin-st-jeor-equation/'],
      ['Activity multipliers and why people overestimate them', 'https://www.calculatemytdee.org/blog/activity-level-multipliers'],
      ['Hall — why the 3,500 kcal rule overestimates weight loss', 'https://www.nature.com/articles/ijo2013112'],
      ['Hall — metabolic adaptation and appetite after weight loss', 'https://www.obesityaction.org/wp-content/uploads/Why-is-it-So-Hard-to-Lose-Weight-and-Keep-it-off.pdf'],
      ['CDC — losing 1–2 lb a week is easier to keep off', 'https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html'],
      ['Helms et al. (2014) — lose 0.5–1% of body weight a week', 'https://link.springer.com/article/10.1186/1550-2783-11-20'],
      ['Iraki et al. (2019) — gain 0.25–0.5% a week in a lean bulk', 'https://www.mdpi.com/2075-4663/7/7/154'],
      ['NHS — healthy weight gain for underweight adults (+300–500 kcal)', 'https://www.nhs.uk/live-well/healthy-weight/managing-your-weight/advice-for-underweight-adults/'],
      ['The Hacker’s Diet — smoothing daily weight into a trend', 'https://www.fourmilab.ch/hackdiet/e4/signalnoise.html'],
      ['Ultra-processed diets led to ~500 kcal/day more eating (NIH RCT)', 'https://www.nih.gov/node/40356'],
      ['BMJ 2025 — intermittent fasting works about as well as daily calorie restriction', 'https://bmjgroup.com/intermittent-fasting-comparable-to-traditional-diets-for-weight-loss/']
    ]],
    ['Nutrition', [
      ['ICMR-NIN Dietary Guidelines for Indians (2024) — My Plate for the Day', 'https://nin.res.in/dietaryguidelines/pdfjs/locale/DGI_2024.pdf'],
      ['ICMR-NIN Nutrient Requirements (2020) — protein RDA 0.83 g/kg', 'https://www.nin.res.in/rdabook/brief_note.pdf'],
      ['WHO — healthy diet (sugar, salt, fat, fruit & veg)', 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet'],
      ['ISSN position stand — protein and exercise (2017)', 'https://link.springer.com/article/10.1186/s12970-017-0177-8'],
      ['Morton et al. (2018) — protein benefits plateau around 1.6 g/kg', 'https://www.scinergy.io/learn/how-much-protein-for-muscle-gain'],
      ['Hydration: EFSA and IOM intakes', 'https://www.gssiweb.org/sports-science-exchange/article/hydration-for-health-and-wellness'],
      ['FDA — caffeine: up to 400 mg a day for adults', 'https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much']
    ]],
    ['Movement & training', [
      ['WHO 2020 guidelines on physical activity and sedentary behaviour', 'https://pureadmin.qub.ac.uk/ws/files/226236258/WorldHealth.pdf'],
      ['Paluch et al. (2022) — steps and mortality', 'https://www.sciencedaily.com/releases/2022/03/220303112207.htm'],
      ['Schoenfeld et al. (2017) — 10+ weekly sets per muscle', 'https://www.ageingmuscle.be/sites/bams/files/publications/Dose%20response%20relationship%20between%20weekly%20resistance%20training%20volume%20and%20increases.pdf'],
      ['Schoenfeld et al. (2016) — train each muscle twice a week', 'https://link.springer.com/article/10.1007/s40279-016-0543-8'],
      ['Loading and the repetition continuum (2021)', 'https://www.mdpi.com/2075-4663/9/2/32'],
      ['Longer rests (3 min) on big lifts', 'https://brookbushinstitute.com/articles/longer-interset-rest-periods-enhance-muscle-strength-hypertrophy-resistance-trained-men'],
      ['NSCA — youth resistance training position statement', 'https://www.nsca.com/globalassets/about/position-statements/position_stand_youth_resistance_training---2009.pdf'],
      ['Heart-rate formulas (Tanaka, Karvonen)', 'https://en.wikipedia.org/wiki/Heart_rate'],
      ['One-rep max formulas (Epley, Brzycki)', 'https://en.wikipedia.org/wiki/One-repetition_maximum'],
      ['METs — energy cost of activities', 'https://en.wikipedia.org/wiki/Metabolic_equivalent_of_task']
    ]],
    ['Sleep & screens', [
      ['CDC — how much sleep you need by age', 'https://www.cdc.gov/sleep/about/index.html'],
      ['AASM — pediatric sleep recommendations', 'https://jcsm.aasm.org/doi/10.5664/jcsm.5866'],
      ['CDC (2025) — screen time and teen health', 'https://www.cdc.gov/pcd/issues/2025/24_0537.htm'],
      ['Adolescent sleep and circadian timing', 'https://en.wikipedia.org/wiki/Adolescent_sleep']
    ]],
    ['Designing a safe health app', [
      ['Diet & fitness apps and eating-disorder behaviours (BJPsych Open)', 'https://www.cambridge.org/core/journals/bjpsych-open/article/effects-of-diet-and-fitness-apps-on-eating-disorder-behaviours-qualitative-study/2D1EE739D97AB3EFC6573835E4C527BD'],
      ['National Center for Health Research — tracking apps and eating disorders', 'https://www.center4research.org/fitness-tracking-apps-eating-disorders/'],
      ['Duke Psychiatry — the trouble with tracking', 'https://psychiatry.duke.edu/blog/trouble-tracking'],
      ['EASO — person-first, non-stigmatising language', 'https://easo.org/wp-content/uploads/2024/05/Person-First-Language-guide-addressing-Weight-Bias.pdf'],
      ['W3C WCAG 2.2 — contrast and target size', 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html'],
      ['Prayer time calculation method', 'http://praytimes.org/calculation']
    ]]
  ];

  M.views.science = {
    head: function () { return { title: 'Science & sources', sub: 'What Mizan is built on' }; },
    render: function (el) {
      var principles = [
        ['plan', 'Plan for real life', 'People underestimate how long things take. Mizan checks your plan for buffers, sleep and overlaps, and compares planned with done.'],
        ['habits', 'Consistency over streaks', 'Habits take about two months to settle and one missed day doesn’t matter — so Mizan shows weekly consistency and helps you avoid missing twice.'],
        ['target', 'If–then plans', 'Every habit has a cue and a backup plan, and skipped blocks ask what got in the way. Specific plans roughly double follow-through.'],
        ['heart', 'Kind, not harsh', 'No red-and-green food grades or shame. Self-compassion after a slip predicts getting back on track.'],
        ['scale', 'Right numbers for the right person', 'Asian BMI cut-offs, percentiles for under-20s, safety floors on calories, and no weight-loss targets for teens.'],
        ['lock', 'Private', 'No accounts, no analytics, no servers. Your data never leaves your device unless you download a backup.']
      ];
      var total = REFS.reduce(function (a, g) { return a + g[1].length; }, 0);
      el.innerHTML = '<div class="split">' +
        '<div class="stack"><p class="lede">Mizan was designed after reviewing more than 120 studies, clinical guidelines and expert sources on habits, body composition, nutrition, exercise, sleep and safe app design. The key ones (' + total + ') are listed here.</p>' +
        '<div class="panel">' + principles.map(function (x) {
          return '<div class="principle"><span class="pi">' + M.icon(x[0]) + '</span><div><strong>' + x[1] + '</strong><p>' + x[2] + '</p></div></div>';
        }).join('') + '</div>' +
        U.note('info', '<p><strong>Not medical advice.</strong> Calculators give population estimates. If you are pregnant, have a medical condition, take medication that affects weight, or are under 18 and worried about your weight, talk to a doctor.</p>') +
        '</div>' +
        '<div class="stack">' + REFS.map(function (g) {
          return '<section class="panel"><h3 style="margin-bottom:6px">' + M.esc(g[0]) + '</h3><ul class="ref-list">' + g[1].map(function (r) {
            return '<li><a href="' + M.esc(r[1]) + '" target="_blank" rel="noopener">' + M.esc(r[0]) + '</a></li>';
          }).join('') + '</ul></section>';
        }).join('') + '</div></div>';
    }
  };

  /* ------------------------------------------------------------------ */
  /* About / privacy                                                     */
  /* ------------------------------------------------------------------ */
  M.views.about = {
    head: function () { return { title: 'Privacy & about', sub: 'How Mizan treats you and your data' }; },
    render: function (el) {
      el.innerHTML = '<div class="split"><div class="stack prose">' +
        '<div class="brand-hero">' + M.logo(56) + '<div><strong>Mizan</strong><span>ميزان · balance</span></div></div>' +
        '<p class="lede">Mizan means balance — of your day, your body and your plate.</p>' +
        '<h2>Your privacy</h2><ul>' +
        '<li>No sign-up and no account. Mizan works fully offline once loaded.</li>' +
        '<li>Everything you enter is saved in your browser’s storage on this device only. There is no server and no analytics.</li>' +
        '<li>Prayer times are calculated on your device. Your location is stored locally and never transmitted.</li>' +
        '<li>Fonts are bundled with the app, so no requests go to third parties.</li>' +
        '<li>You can download a backup or erase everything any time in <a href="#/settings/data">Settings</a>.</li></ul>' +
        '<h2>Health note</h2><p>Mizan offers general, evidence-based guidance for healthy people. It is not a medical device and doesn’t diagnose or treat anything. Calorie and body-fat numbers are estimates.</p>' +
        '</div><div class="stack">' +
        '<section class="panel"><h3 style="margin-bottom:8px">If food, weight or mood feel hard</h3><p class="soft" style="font-size:var(--fs-sm)">You don’t have to handle it alone. Talking to someone helps.</p><ul class="list">' +
        '<li><div class="li-main"><strong>India — Tele MANAS</strong><span>Call 14416 · free, 24/7, many languages</span></div></li>' +
        '<li><div class="li-main"><strong>United States — National Alliance for Eating Disorders</strong><span>Call 866-662-1235 · weekdays</span></div></li>' +
        '<li><div class="li-main"><strong>Anywhere</strong><span><a href="https://findahelpline.com" target="_blank" rel="noopener">findahelpline.com</a> lists free helplines by country</span></div></li>' +
        '<li><div class="li-main"><strong>Emergency</strong><span>Call your local emergency number (112 in India)</span></div></li></ul></section>' +
        '<section class="panel"><h3 style="margin-bottom:8px">Credits</h3><p class="soft" style="font-size:var(--fs-sm);margin:0">Typefaces: Bricolage Grotesque and Atkinson Hyperlegible Next (SIL Open Font License). Growth reference: CDC 2000 BMI-for-age (public domain). Prayer times: astronomical method from praytimes.org. Food values: USDA FoodData Central, IFCT 2017 summaries, product labels.</p></section>' +
        '<a class="btn" href="#/science">' + M.icon('book') + 'Science & sources</a></div></div>';
    }
  };
})();
