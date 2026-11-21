/* =========================================================
   QLibrary / modes / anim.js
   โหมด "ดูแอนิเมชัน" — เล่นฉากไวยากรณ์ทีละเฟรม (ข้อมูลใน pack.anim — ดู content/jpn5-final-anim.js)

   แต่ละเฟรมคือประโยคทั้งประโยค ตัวเล่นจะ "ต่อ" จากเฟรมก่อนด้วยเทคนิค FLIP:
     คำเดิม (ข้อความ + ลำดับที่ซ้ำ เหมือนกัน) → เลื่อนจากที่เดิมไปที่ใหม่
     คำใหม่ → หล่นลงมา · คำที่หายไป → จางลงตรงที่เดิม
   ฉากให้-รับ (stage) มีของลอยจากผู้ให้ไปผู้รับ

   คีย์ลัด: Space = เล่น/หยุด · ← → = เฟรมก่อน/ถัดไป · ↑ ↓ = ฉากก่อน/ถัดไป · S = อ่านออกเสียง
   ========================================================= */
(function () {
  var u = QL.util;
  var V = QL.vocab;

  var PARTICLES = ['は', 'が', 'を', 'に', 'で', 'から', 'も', 'の', 'へ', 'と', 'か', 'な'];
  var PARTICLE_ROMAJI = { 'は': 'wa', 'へ': 'e', 'を': 'o' };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  QL.modes.register({
    id: 'anim',
    name: 'ดูแอนิเมชัน',
    icon: '🎬',
    description: 'ประโยคประกอบร่างทีละคำ คำช่วยที่ต้องจำเด้งให้เห็น รูปที่เปลี่ยนสไลด์ให้ดู กดเล่นอัตโนมัติหรือเลื่อนทีละเฟรมเองก็ได้',
    available: function (pack) { return !!(pack.anim && pack.anim.length); },

    mount: function (root, ctx) {
      var pack = ctx.pack;
      var scenes = pack.anim;
      var chapters = [];
      scenes.forEach(function (sc) { if (chapters.indexOf(sc.ch) < 0) chapters.push(sc.ch); });

      var ch = chapters[0];
      var si = 0, fi = 0;             // ฉาก / เฟรม
      var playing = !reduceMotion;
      var speed = +QL.store.setting('animSpeed') || 1;
      var autoSpeak = QL.store.setting('animSpeak') === true;
      var timer = null;
      var prevTokens = null;          // ตำแหน่งคำของเฟรมก่อน (สำหรับ FLIP)

      var head = u.el('div', { class: 'study-head' });
      var bar = u.el('div');
      var stage = u.el('div', { class: 'study-stage an-wrap' });
      root.appendChild(head);
      root.appendChild(bar);
      root.appendChild(stage);

      function list() { return scenes.filter(function (s) { return s.ch === ch; }); }
      function scene() { return list()[si]; }

      /* ---------- โครงหน้า (สร้างครั้งเดียวต่อฉาก) ---------- */
      var ui = {};

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
        var chips = u.el('div', { class: 'chips', style: 'margin-bottom:12px' });
        chapters.forEach(function (c) {
          chips.appendChild(u.el('button', {
            type: 'button', class: 'chip' + (c === ch ? ' active' : ''),
            onclick: function () { ch = c; si = 0; openScene(); }
          }, [u.el('span', { text: 'บทที่ ' + c }), u.el('span', { class: 'chip-count', text: String(scenes.filter(function (s) { return s.ch === c; }).length) })]));
        });
        bar.appendChild(chips);

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

      function openScene() {
        clearTimeout(timer);
        playing = !reduceMotion;          // เปิดฉากใหม่ = เล่นเองทันที (ยกเว้นเครื่องที่ตั้งลดการเคลื่อนไหว)
        fi = 0; prevTokens = null;
        renderHead(); renderBar();
        var sc = scene();
        stage.innerHTML = '';
        ui = {};
        ui.card = u.el('div', { class: 'an-card' });
        ui.title = u.el('div', { class: 'an-title' }, [
          u.el('span', { text: sc.title }),
          u.el('span', { class: 'an-src', text: sc.src || '' })
        ]);
        ui.visual = u.el('div', { class: 'an-visual' });
        ui.sent = u.el('div', { class: 'an-sent', 'aria-live': 'polite' });
        ui.th = u.el('div', { class: 'an-th' });
        ui.cap = u.el('div', { class: 'an-cap' });
        ui.dots = u.el('div', { class: 'an-dots' });
        ui.card.appendChild(ui.title);
        ui.card.appendChild(ui.visual);
        ui.card.appendChild(ui.sent);
        ui.card.appendChild(ui.th);
        ui.card.appendChild(ui.cap);
        ui.card.appendChild(ui.dots);
        stage.appendChild(ui.card);

        ui.controls = u.el('div', { class: 'an-controls' });
        stage.appendChild(ui.controls);
        renderControls();
        showFrame(true);
        if (playing) schedule();
      }

      function renderControls() {
        ui.controls.innerHTML = '';
        var sc = scene();
        var last = fi >= sc.frames.length - 1;
        ui.controls.appendChild(u.el('div', { class: 'an-btns' }, [
          u.el('button', { class: 'btn', 'aria-label': 'เฟรมก่อน', html: '◀', onclick: function () { stop(); go(-1); } }),
          u.el('button', {
            class: 'btn primary an-play', 'aria-label': playing ? 'หยุด' : 'เล่น',
            html: playing ? '⏸ หยุด' : (last ? '↺ เล่นใหม่' : '▶ เล่น'),
            onclick: togglePlay
          }),
          u.el('button', { class: 'btn', 'aria-label': 'เฟรมถัดไป', html: '▶', onclick: function () { stop(); go(1); } }),
          u.el('button', { class: 'btn ghost', 'aria-label': 'อ่านออกเสียง', html: '🔊', onclick: function () { speakNow(); } })
        ]));

        var speedSeg = u.el('div', { class: 'seg', role: 'group', 'aria-label': 'ความเร็ว' });
        [[0.75, 'ช้า'], [1, 'ปกติ'], [1.5, 'เร็ว']].forEach(function (o) {
          speedSeg.appendChild(u.el('button', {
            type: 'button', class: speed === o[0] ? 'active' : '', text: o[1],
            onclick: function () { speed = o[0]; QL.store.setting('animSpeed', speed); renderControls(); if (playing) schedule(); }
          }));
        });
        ui.controls.appendChild(u.el('div', { class: 'an-opts' }, [
          speedSeg,
          u.el('button', {
            type: 'button', class: 'kw-toggle' + (autoSpeak ? ' on' : ''), 'aria-pressed': autoSpeak ? 'true' : 'false',
            text: autoSpeak ? '🔊 อ่านออกเสียงทุกเฟรม' : '🔇 ไม่อ่านออกเสียง',
            onclick: function () { autoSpeak = !autoSpeak; QL.store.setting('animSpeak', autoSpeak); renderControls(); }
          }),
          u.el('button', {
            type: 'button', class: 'btn ghost', text: 'ฉากถัดไป ⏭',
            onclick: function () { stop(); nextScene(); }
          })
        ]));
      }

      /* ---------- เล่น ---------- */
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

      function stop() { clearTimeout(timer); if (playing) { playing = false; if (ui.controls) renderControls(); } }

      function togglePlay() {
        if (playing) return stop();
        var sc = scene();
        if (fi >= sc.frames.length - 1) { fi = 0; prevTokens = null; showFrame(true); }
        playing = true;
        renderControls();
        schedule();
      }

      function go(d) {
        var sc = scene();
        var n = fi + d;
        if (n < 0) return;
        if (n >= sc.frames.length) return;
        fi = n;
        showFrame(d < 0);
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

      /* ---------- แสดงเฟรม (FLIP) ---------- */
      function showFrame(jump) {
        var sc = scene();
        var frame = sc.frames[fi];
        var tokens = parse(frame.s);

        // ตำแหน่งเดิมของคำ (เทียบกับกรอบประโยค)
        var box = ui.sent.getBoundingClientRect();
        var old = {};
        if (!jump && prevTokens) {
          u.$$('.an-tok', ui.sent).forEach(function (el) {
            var r = el.getBoundingClientRect();
            old[el.getAttribute('data-key')] = { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height, el: el };
          });
        }

        // วาดประโยคใหม่
        var frag = document.createDocumentFragment();
        var nodes = tokens.map(function (t) {
          var cls = 'an-tok' + (t.particle ? ' p' : '') + (t.focus ? ' focus' : '') + (t.bad ? ' bad' : '') + (t.join ? ' join' : '');
          var rom = romajiOf(t);
          var el = u.el('span', { class: cls, 'data-key': t.key }, [
            u.el('span', { class: 'an-jp', text: t.text }),
            u.el('span', { class: 'an-rom v-romaji', text: rom || ' ' })
          ]);
          frag.appendChild(el);
          return el;
        });
        var leaving = Object.keys(old).filter(function (k) { return !tokens.some(function (t) { return t.key === k; }); });
        ui.sent.innerHTML = '';
        ui.sent.appendChild(frag);

        if (!reduceMotion && !jump && prevTokens) {
          var box2 = ui.sent.getBoundingClientRect();
          // คำที่หายไป: วางผีไว้ที่เดิมแล้วจางออก
          leaving.forEach(function (k) {
            var o = old[k];
            var ghost = o.el.cloneNode(true);
            ghost.classList.add('an-ghost');
            ghost.style.left = (o.x + box.left - box2.left) + 'px';
            ghost.style.top = (o.y + box.top - box2.top) + 'px';
            ghost.style.width = o.w + 'px';
            ui.sent.appendChild(ghost);
            void ghost.offsetWidth;                 // บังคับ layout ก่อน แล้วค่อยใส่ .out → เกิด transition (ไม่พึ่ง rAF)
            ghost.classList.add('out');
            setTimeout(function () { ghost.remove(); }, 650);
          });
          // คำเดิม: เลื่อนจากที่เดิม · คำใหม่: หล่นลงมา
          var delay = 0;
          nodes.forEach(function (el) {
            var k = el.getAttribute('data-key');
            var r = el.getBoundingClientRect();
            if (old[k]) {
              var dx = old[k].x + box.left - r.left, dy = old[k].y + box.top - r.top;
              if (dx || dy) {
                // FLIP: วางคำไว้ที่เดิมก่อน (ไม่มี transition) → บังคับ layout → ปล่อยให้เลื่อนกลับที่ใหม่
                // ใช้ reflow แทน requestAnimationFrame — ถ้าแท็บอยู่เบื้องหลัง rAF จะไม่ทำงาน คำจะค้างผิดที่
                el.style.transition = 'none';
                el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
                void el.offsetWidth;
                el.style.transition = '';
                el.style.transform = '';
              }
            } else {
              el.classList.add('enter');
              el.style.animationDelay = (delay * 90) + 'ms';
              delay++;
            }
          });
        } else if (!reduceMotion) {
          nodes.forEach(function (el, i) { el.classList.add('enter'); el.style.animationDelay = (i * 70) + 'ms'; });
        }
        prevTokens = tokens;

        // คำแปล + คำอธิบาย
        ui.th.textContent = frame.th || '';
        ui.cap.innerHTML = mdBold(frame.cap);
        if (!reduceMotion) { ui.cap.classList.remove('show'); void ui.cap.offsetWidth; ui.cap.classList.add('show'); }

        renderVisual(frame);

        // จุดบอกเฟรม
        ui.dots.innerHTML = '';
        sc.frames.forEach(function (f, i) {
          ui.dots.appendChild(u.el('button', {
            type: 'button', class: 'an-dot' + (i === fi ? ' on' : i < fi ? ' past' : ''), 'aria-label': 'เฟรม ' + (i + 1),
            onclick: function () { stop(); var back = i < fi; fi = i; showFrame(back); renderControls(); }
          }));
        });

        if (autoSpeak) speakNow();
      }

      /** ภาพประกอบ: ฉากให้-รับ (ของลอยตามทิศ) หรืออีโมจิใหญ่ */
      function renderVisual(frame) {
        var v = ui.visual;
        var s = frame.stage;
        if (s) {
          var same = v.getAttribute('data-stage') === s.an + s.bn + s.item;
          if (!same) {
            v.innerHTML = '';
            v.setAttribute('data-stage', s.an + s.bn + s.item);
            v.appendChild(u.el('div', { class: 'an-stage' }, [
              u.el('div', { class: 'an-who' }, [u.el('span', { class: 'an-who-pic', text: s.a }), u.el('span', { text: s.an })]),
              u.el('div', { class: 'an-lane' }, [u.el('span', { class: 'an-item', text: s.item }), u.el('span', { class: 'an-arrow' })]),
              u.el('div', { class: 'an-who' }, [u.el('span', { class: 'an-who-pic', text: s.b }), u.el('span', { text: s.bn })])
            ]));
          }
          var lane = v.querySelector('.an-lane');
          lane.className = 'an-lane';
          void lane.offsetWidth;
          if (s.go) lane.classList.add('go-' + s.go);
          return;
        }
        v.removeAttribute('data-stage');
        v.innerHTML = '';
        if (frame.pic) {
          var p = u.el('div', { class: 'an-pic', text: frame.pic });
          v.appendChild(p);
        }
      }

      ctx.onKey(function (e) {
        if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); togglePlay(); }
        else if (e.key === 'ArrowRight') { stop(); go(1); }
        else if (e.key === 'ArrowLeft') { stop(); go(-1); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); stop(); nextScene(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); stop(); if (si > 0) { si--; openScene(); } }
        else if (e.key === 's' || e.key === 'S') speakNow();
      });

      openScene();
    }
  });
})();
