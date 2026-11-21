/* =========================================================
   QLibrary / modes / anim.js
   โหมด "ดูแอนิเมชัน" — ฉากไวยากรณ์ทีละขั้น (ข้อมูลใน pack.anim — ดู content/jpn5-final-anim.js)

   2 มุมมอง (จำค่าที่เลือกไว้)
     📋 เทียบทั้งฉาก  ทุกเฟรมเรียงเป็นบันได คำที่เพิ่ม/เปลี่ยนจากบรรทัดก่อนขีดเส้นใต้สีส้ม
                     เห็นทั้งฉากในจอเดียว เทียบได้ทันทีไม่ต้องกด · แตะบรรทัดไหน = เปิดดูทีละเฟรมที่บรรทัดนั้น
     🎞️ ทีละเฟรม     ทีละประโยค กด ◀ ▶ / แตะจุด · ประโยคเปลี่ยนทันที (ไม่มีการเคลื่อนไหวของตัวอักษร)
                     เปิดฉากแล้วไม่เล่นเอง — กด ▶ เล่น ถ้าอยากให้เลื่อนเองแบบสไลด์
   คำที่ต้องดู (*คำ*) มีกรอบสีเด่น · คำที่ใช้ไม่ได้ (!คำ) ขีดฆ่าสีแดง · ฉากให้-รับมีของลอยจากผู้ให้ไปผู้รับ

   คีย์ลัด: ← → = เฟรมก่อน/ถัดไป · ↑ ↓ = ฉากก่อน/ถัดไป · V = สลับมุมมอง · Space = เล่น/หยุด · S = อ่านออกเสียง
   ========================================================= */
(function () {
  var u = QL.util;
  var V = QL.vocab;

  var PARTICLES = ['は', 'が', 'を', 'に', 'で', 'から', 'も', 'の', 'へ', 'と', 'か', 'な'];
  var PARTICLE_ROMAJI = { 'は': 'wa', 'へ': 'e', 'を': 'o' };

  /** 'わたし|は|*はし*|+か|!から' → [{ text, focus, join, bad, particle, key }] */
  function parse(s) {
    var seen = {};
    return String(s).split('|').map(function (raw) {
      var t = { join: false, focus: false, bad: false };
      if (raw.charAt(0) === '+') { t.join = true; raw = raw.slice(1); }
      if (raw.charAt(0) === '!') { t.bad = true; raw = raw.slice(1); }
      var m = raw.match(/^\*(.+)\*([、。]?)$/);                  // *が*、 = เน้นคำ แล้วตามด้วยวรรคตอน
      if (m) { t.focus = true; raw = m[1] + m[2]; }
      t.text = raw;
      t.particle = PARTICLES.indexOf(raw.replace(/[、。]/g, '')) >= 0;
      seen[raw] = (seen[raw] || 0) + 1;
      t.key = raw + '#' + seen[raw];
      return t;
    });
  }

  function romajiOf(t) {
    var core = t.text.replace(/[、。「」"]/g, '');
    if (t.particle && PARTICLE_ROMAJI[core]) return PARTICLE_ROMAJI[core];
    if (!u.hasKana(core)) return '';
    return V.romaji(core);
  }

  function mdBold(s) { return u.esc(s || '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }

  function speakText(frame) {
    return parse(frame.s).map(function (t) { return t.text; }).join('').replace(/"[^"]*"/g, '');
  }

  /** วาดประโยค — prev = ประโยคเฟรมก่อน (คำที่ไม่มีในเฟรมก่อน = เพิ่ม/เปลี่ยน → ขีดเส้นใต้) */
  function sentence(frame, prev, cls) {
    var before = {};
    if (prev) parse(prev.s).forEach(function (t) { before[t.key] = 1; });
    var box = u.el('div', { class: 'an-sent' + (cls ? ' ' + cls : '') });
    parse(frame.s).forEach(function (t) {
      var c = 'an-tok' + (t.particle ? ' p' : '') + (t.focus ? ' focus' : '') + (t.bad ? ' bad' : '') + (t.join ? ' join' : '') +
        (prev && !before[t.key] ? ' chg' : '');
      box.appendChild(u.el('span', { class: c }, [
        u.el('span', { class: 'an-jp', text: t.text }),
        u.el('span', { class: 'an-rom v-romaji', text: romajiOf(t) || ' ' })
      ]));
    });
    return box;
  }

  QL.modes.register({
    id: 'anim',
    name: 'ดูแอนิเมชัน',
    icon: '🎬',
    description: 'ฉากไวยากรณ์ทีละขั้น — เทียบทุกประโยคของฉากในจอเดียว (คำที่เปลี่ยนขีดเส้นใต้) หรือดูทีละเฟรม คำที่ต้องจำมีกรอบสีเด่น',
    available: function (pack) { return !!(pack.anim && pack.anim.length); },

    mount: function (root, ctx) {
      var pack = ctx.pack;
      var scenes = pack.anim;
      var chapters = [];
      scenes.forEach(function (sc) { if (chapters.indexOf(sc.ch) < 0) chapters.push(sc.ch); });

      var ch = chapters[0];
      var si = 0, fi = 0;              // ฉาก / เฟรม
      var view = QL.store.setting('animView') === 'step' ? 'step' : 'ladder';
      var playing = false;             // ไม่เล่นเองตอนเปิด
      var speed = +QL.store.setting('animSpeed') || 1;
      var autoSpeak = QL.store.setting('animSpeak') === true;
      var timer = null;
      var ui = {};

      var head = u.el('div', { class: 'study-head' });
      var bar = u.el('div');
      var stage = u.el('div', { class: 'study-stage an-wrap' });
      root.appendChild(head);
      root.appendChild(bar);
      root.appendChild(stage);

      function list() { return scenes.filter(function (s) { return s.ch === ch; }); }
      function scene() { return list()[si]; }

      /* ---------- หัว + ตัวเลือก ---------- */
      function renderHead() {
        head.innerHTML = '';
        head.appendChild(u.el('div', {}, [
          u.el('h2', { style: 'margin:0;font-size:19px', text: '🎬 ดูแอนิเมชัน' }),
          u.el('div', { class: 'study-meta', text: 'บทที่ ' + ch + ' · ฉาก ' + (si + 1) + ' จาก ' + list().length })
        ]));
        head.appendChild(u.el('button', { class: 'btn ghost', text: '← กลับ', onclick: ctx.back }));
      }

      function renderBar() {
        bar.innerHTML = '';
        var top = u.el('div', { class: 'an-top' });
        var chips = u.el('div', { class: 'chips', style: 'margin:0' });
        chapters.forEach(function (c) {
          chips.appendChild(u.el('button', {
            type: 'button', class: 'chip' + (c === ch ? ' active' : ''),
            onclick: function () { ch = c; si = 0; openScene(); }
          }, [u.el('span', { text: 'บทที่ ' + c }), u.el('span', { class: 'chip-count', text: String(scenes.filter(function (s) { return s.ch === c; }).length) })]));
        });
        top.appendChild(chips);
        var seg = u.el('div', { class: 'seg', role: 'group', 'aria-label': 'มุมมอง' });
        [['ladder', '📋 เทียบทั้งฉาก'], ['step', '🎞️ ทีละเฟรม']].forEach(function (o) {
          seg.appendChild(u.el('button', {
            type: 'button', class: view === o[0] ? 'active' : '', text: o[1],
            onclick: function () { setView(o[0]); }
          }));
        });
        top.appendChild(seg);
        bar.appendChild(top);

        var tabs = u.el('div', { class: 'an-tabs', role: 'tablist', 'aria-label': 'ฉาก' });
        list().forEach(function (sc, i) {
          tabs.appendChild(u.el('button', {
            type: 'button', role: 'tab', class: 'an-tab' + (i === si ? ' active' : ''), 'aria-selected': i === si ? 'true' : 'false',
            text: sc.title, onclick: function () { si = i; openScene(); }
          }));
        });
        bar.appendChild(tabs);
        var active = tabs.querySelector('.active');
        if (active && active.scrollIntoView) setTimeout(function () { try { active.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) { /* */ } }, 0);
      }

      function setView(v) {
        stop();
        view = v;
        QL.store.setting('animView', v);
        renderBar();
        renderScene();
      }

      function openScene() {
        stop();
        fi = 0;
        renderHead(); renderBar();
        renderScene();
      }

      function renderScene() {
        stage.innerHTML = '';
        ui = {};
        var sc = scene();
        var card = u.el('div', { class: 'an-card' + (view === 'ladder' ? ' ladder' : '') }, [
          u.el('div', { class: 'an-title' }, [u.el('span', { text: sc.title }), u.el('span', { class: 'an-src', text: sc.src || '' })])
        ]);
        stage.appendChild(card);
        if (view === 'ladder') renderLadder(card, sc);
        else renderStep(card);
        stage.appendChild(u.el('div', { class: 'an-next-row' }, [
          si > 0 ? u.el('button', { class: 'btn ghost', text: '⏮ ฉากก่อน', onclick: function () { si--; openScene(); } }) : null,
          u.el('button', { class: 'btn', text: 'ฉากถัดไป ⏭', onclick: nextScene })
        ]));
      }

      /* ---------- มุมมอง 📋 เทียบทั้งฉาก ---------- */
      function renderLadder(card, sc) {
        card.appendChild(u.el('div', { class: 'an-legend' }, [
          u.el('span', {}, [u.el('span', { class: 'an-key focus', text: 'คำ' }), ' ต้องจำ']),
          u.el('span', {}, [u.el('span', { class: 'an-key chg', text: 'คำ' }), ' เพิ่ม/เปลี่ยนจากบรรทัดบน']),
          u.el('span', {}, [u.el('span', { class: 'an-key bad', text: 'คำ' }), ' ใช้ไม่ได้'])
        ]));
        var steps = u.el('ol', { class: 'an-steps' });
        sc.frames.forEach(function (f, i) {
          var row = u.el('li', { class: 'an-step', title: 'แตะเพื่อดูเฟรมนี้แบบเต็ม' });
          row.appendChild(u.el('div', { class: 'an-step-no', text: String(i + 1) }));
          var body = u.el('div', { class: 'an-step-body' });
          body.appendChild(sentence(f, i > 0 ? sc.frames[i - 1] : null, 'sm'));
          body.appendChild(u.el('div', { class: 'an-step-th' }, [
            f.stage && f.stage.go ? u.el('span', { class: 'an-flow', text: flowText(f.stage) }) : (f.pic ? u.el('span', { class: 'an-step-pic', text: f.pic }) : null),
            u.el('span', { text: f.th || '' })
          ]));
          body.appendChild(u.el('div', { class: 'an-step-cap', html: mdBold(f.cap) }));
          row.appendChild(body);
          row.appendChild(u.el('button', {
            class: 'v-speak an-step-speak', type: 'button', 'aria-label': 'อ่านออกเสียง', html: '🔊',
            onclick: function (ev) { ev.stopPropagation(); if (V.canSpeak) V.speak(speakText(f)); }
          }));
          row.addEventListener('click', function () { fi = i; setView('step'); });
          steps.appendChild(row);
        });
        card.appendChild(steps);
      }

      function flowText(s) {
        return s.go === 'ab' ? s.a + ' ' + s.an + ' → ' + s.item + ' → ' + s.b + ' ' + s.bn
          : s.b + ' ' + s.bn + ' → ' + s.item + ' → ' + s.a + ' ' + s.an;
      }

      /* ---------- มุมมอง 🎞️ ทีละเฟรม ---------- */
      function renderStep(card) {
        ui.visual = u.el('div', { class: 'an-visual' });
        ui.sentWrap = u.el('div', { 'aria-live': 'polite' });
        ui.th = u.el('div', { class: 'an-th' });
        ui.cap = u.el('div', { class: 'an-cap' });
        ui.dots = u.el('div', { class: 'an-dots' });
        [ui.visual, ui.sentWrap, ui.th, ui.cap, ui.dots].forEach(function (n) { card.appendChild(n); });
        ui.controls = u.el('div', { class: 'an-controls' });
        stage.appendChild(ui.controls);
        renderControls();
        showFrame();
      }

      function renderControls() {
        if (!ui.controls) return;
        ui.controls.innerHTML = '';
        var sc = scene();
        var last = fi >= sc.frames.length - 1;
        ui.controls.appendChild(u.el('div', { class: 'an-btns' }, [
          u.el('button', { class: 'btn an-arrow-btn', 'aria-label': 'เฟรมก่อน', html: '◀ ก่อน', disabled: fi === 0 ? 'disabled' : null, onclick: function () { stop(); go(-1); } }),
          u.el('button', { class: 'btn primary an-arrow-btn', 'aria-label': 'เฟรมถัดไป', html: 'ถัดไป ▶', disabled: last ? 'disabled' : null, onclick: function () { stop(); go(1); } })
        ]));

        var speedSeg = u.el('div', { class: 'seg', role: 'group', 'aria-label': 'ความเร็วสไลด์' });
        [[0.75, 'ช้า'], [1, 'ปกติ'], [1.5, 'เร็ว']].forEach(function (o) {
          speedSeg.appendChild(u.el('button', {
            type: 'button', class: speed === o[0] ? 'active' : '', text: o[1],
            onclick: function () { speed = o[0]; QL.store.setting('animSpeed', speed); renderControls(); if (playing) schedule(); }
          }));
        });
        ui.controls.appendChild(u.el('div', { class: 'an-opts' }, [
          u.el('button', { class: 'btn ghost', html: playing ? '⏸ หยุดสไลด์' : (last ? '↺ เล่นสไลด์ใหม่' : '▶ เล่นสไลด์'), onclick: togglePlay }),
          speedSeg,
          u.el('button', { class: 'btn ghost', 'aria-label': 'อ่านออกเสียง', html: '🔊', onclick: speakNow }),
          u.el('button', {
            type: 'button', class: 'kw-toggle' + (autoSpeak ? ' on' : ''), 'aria-pressed': autoSpeak ? 'true' : 'false',
            text: autoSpeak ? '🔊 อ่านทุกเฟรม' : '🔇 ไม่อ่านเอง',
            onclick: function () { autoSpeak = !autoSpeak; QL.store.setting('animSpeak', autoSpeak); renderControls(); }
          })
        ]));
      }

      /** ประโยคเปลี่ยนทันที ไม่มีการเคลื่อนไหวของตัวอักษร — คำที่เปลี่ยนจากเฟรมก่อนขีดเส้นใต้ไว้ให้เทียบ */
      function showFrame() {
        var sc = scene();
        var frame = sc.frames[fi];
        ui.sentWrap.innerHTML = '';
        ui.sentWrap.appendChild(sentence(frame, fi > 0 ? sc.frames[fi - 1] : null));
        ui.th.textContent = frame.th || '';
        ui.cap.innerHTML = mdBold(frame.cap);
        renderVisual(frame);

        ui.dots.innerHTML = '';
        sc.frames.forEach(function (f, i) {
          ui.dots.appendChild(u.el('button', {
            type: 'button', class: 'an-dot' + (i === fi ? ' on' : i < fi ? ' past' : ''), 'aria-label': 'เฟรม ' + (i + 1),
            onclick: function () { stop(); fi = i; showFrame(); renderControls(); }
          }));
        });
        if (autoSpeak) speakNow();
      }

      /** ภาพประกอบ: ฉากให้-รับ (ของลอยตามทิศ) หรืออีโมจิ */
      function renderVisual(frame) {
        var v = ui.visual;
        var s = frame.stage;
        v.innerHTML = '';
        if (s) {
          var lane = u.el('div', { class: 'an-lane' + (s.go ? ' go-' + s.go : '') }, [u.el('span', { class: 'an-item', text: s.item }), u.el('span', { class: 'an-arrow' })]);
          v.appendChild(u.el('div', { class: 'an-stage' }, [
            u.el('div', { class: 'an-who' }, [u.el('span', { class: 'an-who-pic', text: s.a }), u.el('span', { text: s.an })]),
            lane,
            u.el('div', { class: 'an-who' }, [u.el('span', { class: 'an-who-pic', text: s.b }), u.el('span', { text: s.bn })])
          ]));
        } else if (frame.pic) {
          v.appendChild(u.el('div', { class: 'an-pic', text: frame.pic }));
        }
      }

      /* ---------- สไลด์ (กดเล่นเองเท่านั้น) ---------- */
      function duration(frame) {
        var base = 1700 + Math.min(2600, (frame.cap || '').length * 38);
        if (frame.stage && frame.stage.go) base += 900;
        return base / speed;
      }

      function schedule() {
        clearTimeout(timer);
        var sc = scene();
        timer = setTimeout(function () {
          if (!document.body.contains(stage)) return;
          if (fi < sc.frames.length - 1) { go(1); schedule(); }
          else { playing = false; renderControls(); }
        }, duration(sc.frames[fi]));
      }

      function stop() { clearTimeout(timer); if (playing) { playing = false; renderControls(); } }

      function togglePlay() {
        if (playing) return stop();
        if (fi >= scene().frames.length - 1) { fi = 0; showFrame(); }
        playing = true;
        renderControls();
        schedule();
      }

      function go(d) {
        var n = fi + d;
        if (n < 0 || n >= scene().frames.length) return;
        fi = n;
        showFrame();
        renderControls();
      }

      function nextScene() {
        if (si < list().length - 1) { si++; openScene(); return; }
        var k = chapters.indexOf(ch);
        if (k < chapters.length - 1) { ch = chapters[k + 1]; si = 0; openScene(); }
        else u.toast('ดูครบทุกฉากแล้ว 🎉');
      }

      function speakNow() {
        if (V.canSpeak) V.speak(speakText(scene().frames[fi]));
      }

      ctx.onKey(function (e) {
        if (e.key === 'v' || e.key === 'V') setView(view === 'ladder' ? 'step' : 'ladder');
        else if (e.key === 'ArrowDown') { e.preventDefault(); nextScene(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (si > 0) { si--; openScene(); } }
        else if (view !== 'step') return;
        else if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); togglePlay(); }
        else if (e.key === 'ArrowRight') { stop(); go(1); }
        else if (e.key === 'ArrowLeft') { stop(); go(-1); }
        else if (e.key === 's' || e.key === 'S') speakNow();
      });

      openScene();
    }
  });
})();
