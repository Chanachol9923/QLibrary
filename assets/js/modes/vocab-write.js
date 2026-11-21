/* =========================================================
   QLibrary / modes / vocab-write.js
   โหมด "เขียนด้วยปากกา" — เขียนคำศัพท์ทีละตัวด้วยนิ้วหรือ Apple Pencil (แนว Write It! Japanese)

   3 ระดับ
     🖍️ ลากตามโครง   เห็นโครงตัวอักษร พลาด 1 ครั้งมีเส้นใบ้ (เหมือนหัดเขียน)
     ✍️ เขียนเอง      ไม่มีโครง เห็นโรมาจิ พลาด 3 ครั้งค่อยใบ้
     🧪 ทดสอบ         เห็นแค่ความหมายภาษาไทย (เหมือนข้อสอบตอนที่ 1) จับเวลา ผลเข้าระบบ Leitner

   ตรวจทีละเส้น: ลำดับเส้น · ทิศทาง · รูปร่าง (Hanzi Writer เทียบกับเส้นกลางของตัวอักษร)
   Apple Pencil: พอเจอปากกาครั้งแรก ระบบจะไม่รับนิ้ว/ฝ่ามือบนกระดานอีก (กันฝ่ามือ) — ปิดได้

   ข้อมูลภายนอก (โหลดเฉพาะตอนเข้าโหมดนี้ ต้องต่อเน็ต)
     ตัวตรวจเส้น  hanzi-writer@3.7.3 (MIT) — https://github.com/chanind/hanzi-writer
     ลำดับเส้น    @k1low/hanzi-writer-data-jp@0.8.0 (ข้อมูลจาก AnimCJK · Arphic PL / LGPL)
   ข้อมูลคานะบางตัว (あ お の る ぬ …) แยกเส้นโค้งเป็นหลายชิ้นเพื่อทำแอนิเมชัน → mergePieces()
   รวมชิ้นที่ "จบที่จุดเดียวกันเป๊ะ" กลับเป็นเส้นเดียว (ตรวจแล้ว: จำนวนเส้นตรงตำราครบ 151 ตัว)
   ========================================================= */
(function () {
  var u = QL.util;
  var V = QL.vocab;

  var HW_SRC = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/dist/hanzi-writer.min.js';
  var HW_SRI = 'sha384-xd6VpwMU5AxPFzG/nyhXrW70SSR2usiUNV8RrA0wlOjYlCrZyzZC6JiR/mT51pm2';
  var DATA_URL = 'https://cdn.jsdelivr.net/npm/@k1low/hanzi-writer-data-jp@0.8.0/';

  var LEVELS = [
    { id: 'trace', name: '🖍️ ลากตามโครง', hintAfter: 1 },
    { id: 'free', name: '✍️ เขียนเอง', hintAfter: 3 },
    { id: 'test', name: '🧪 ทดสอบ', hintAfter: 3 }
  ];

  /* ---------- โหลด Hanzi Writer (ครั้งเดียว) ---------- */
  var hwLoading = null;
  function loadWriter() {
    if (window.HanziWriter) return Promise.resolve();
    if (hwLoading) return hwLoading;
    hwLoading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = HW_SRC; s.integrity = HW_SRI; s.crossOrigin = 'anonymous';
      s.onload = resolve;
      s.onerror = function () { hwLoading = null; s.remove(); reject(new Error('โหลดตัวตรวจเส้นไม่สำเร็จ')); };
      document.head.appendChild(s);
    });
    return hwLoading;
  }

  /* ---------- ข้อมูลเส้นของแต่ละตัว (cache ในหน่วยความจำ) ---------- */
  var dataCache = {};
  function samePoint(a, b) { return a && b && a[0] === b[0] && a[1] === b[1]; }

  /** รวมชิ้นส่วนที่จบที่จุดเดียวกัน (เส้นโค้งที่ถูกแยกไว้ทำแอนิเมชัน) ให้เป็นเส้นเดียวตามตำรา */
  function mergePieces(d) {
    var strokes = [], medians = [];
    d.medians.forEach(function (m, i) {
      var last = medians[medians.length - 1];
      if (last && samePoint(last[last.length - 1], m[m.length - 1])) {
        strokes[strokes.length - 1] += ' ' + d.strokes[i];   // เก็บรูปทรงไว้ครบ แต่ใช้เส้นกลางของชิ้นแรก
      } else {
        strokes.push(d.strokes[i]);
        medians.push(m);
      }
    });
    return { strokes: strokes, medians: medians };
  }

  function charData(ch) {
    if (!dataCache[ch]) {
      dataCache[ch] = fetch(DATA_URL + encodeURIComponent(ch) + '.json')
        .then(function (r) {
          if (!r.ok) { var e = new Error('ไม่มีข้อมูลเส้นของ ' + ch); e.missing = r.status === 404; throw e; }
          return r.json();
        })
        .then(mergePieces)
        .catch(function (e) { if (!e.missing) delete dataCache[ch]; throw e; });
    }
    return dataCache[ch];
  }

  /* ---------- คำไหนเขียนได้ ---------- */
  var KANA_ONLY = /^[ぁ-ゖァ-ヺー]+$/;
  /** คำอ่านที่ต้องเขียน: ตัด [ส่วนที่ไม่ใส่ก็ได้] ช่องว่าง และเครื่องหมายวรรคตอน · คำที่เป็นแพทเทิร์น ～ ไม่เอา */
  function writable(v) {
    var s = String(v.kana || '');
    if (/[～〜]/.test(s)) return '';
    s = s.replace(/\[[^\]]*\]/g, '').replace(/[\s　。、！？!?・「」]/g, '');
    return KANA_ONLY.test(s) ? s : '';
  }

  /** สีจากตัวแปรธีม แปลงเป็น #rrggbb เสมอ (Hanzi Writer ไม่รับ #rrggbbaa / ชื่อสี) */
  function cssVar(name, fallback) {
    var probe = document.createElement('span');
    probe.style.color = 'var(' + name + ', ' + fallback + ')';
    probe.style.display = 'none';
    document.body.appendChild(probe);
    var m = getComputedStyle(probe).color.match(/[\d.]+/g);
    probe.remove();
    if (!m || m.length < 3) return fallback;
    return '#' + m.slice(0, 3).map(function (n) { return ('0' + Math.round(+n).toString(16)).slice(-2); }).join('');
  }

  function fmtTime(ms) {
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  QL.modes.register({
    id: 'vocabwrite',
    name: 'เขียนด้วยปากกา',
    icon: '✍️',
    description: 'เขียนคำศัพท์ทีละตัวด้วยนิ้วหรือ Apple Pencil ตรวจลำดับเส้น ทิศทาง และรูปร่างทันที มีลากตามโครง · เขียนเอง · ทดสอบจับเวลา',
    available: function (pack) { return pack.vocab.some(function (v) { return !!writable(v); }); },

    mount: function (root, ctx) {
      var pack = ctx.pack;
      var deckId = ctx.deckId;
      var itemId = function (v) { return 'vocab:' + v.id; };

      var level = QL.store.setting('writeLevel') || 'trace';
      var palmGuard = QL.store.setting('writePalmGuard') !== false;   // กันฝ่ามือเมื่อเจอปากกา (ค่าเริ่มต้น เปิด)
      var penSeen = false;                                            // เจอ Apple Pencil แล้วหรือยัง (ในหน้านี้)
      var ch = null, group = '';
      var queue = [], idx = 0;
      var word = null;      // { e, chars, ci, miss: [], hint: [], given: [], done }
      var writer = null, strokeAt = 0;
      var results = [];     // { e, miss, hint }
      var startedAt = 0, timer = null;

      var head = u.el('div', { class: 'study-head' });
      var bar = u.el('div');
      var stage = u.el('div', { class: 'study-stage' });
      root.appendChild(head);
      root.appendChild(bar);
      root.appendChild(stage);

      function lv() { return LEVELS.filter(function (l) { return l.id === level; })[0] || LEVELS[0]; }

      function pool() {
        return pack.vocab.filter(function (v) {
          return writable(v) && (ch === null || (v.ch || 1) === ch) && (!group || v.group === group);
        });
      }

      function restart(list) {
        var p = list || pool();
        queue = level === 'test' && !list ? QL.store.orderByPriority(deckId, p, itemId) : p.slice();
        idx = 0; results = []; startedAt = Date.now();
        startWord();
      }

      /* ---------- หัว + ตัวเลือก ---------- */
      function renderHead() {
        head.innerHTML = '';
        var meta = 'คำที่ ' + Math.min(idx + 1, queue.length) + ' จาก ' + queue.length;
        var metaEl = u.el('div', { class: 'study-meta', text: meta });
        head.appendChild(u.el('div', {}, [u.el('h2', { style: 'margin:0;font-size:19px', text: '✍️ เขียนด้วยปากกา' }), metaEl]));
        head.appendChild(u.el('button', { class: 'btn ghost', text: '← กลับ', onclick: ctx.back }));

        clearInterval(timer);
        if (level === 'test' && idx < queue.length) {
          timer = setInterval(function () {
            if (!document.body.contains(metaEl)) return clearInterval(timer);
            metaEl.textContent = meta + ' · ⏱ ' + fmtTime(Date.now() - startedAt);
          }, 1000);
        }
      }

      function renderBar() {
        bar.innerHTML = '';
        bar.appendChild(V.chapterChips(pack, ch, function (c) { ch = c; restart(); }));

        var row = u.el('div', { class: 'kw-opts' });
        var seg = u.el('div', { class: 'seg', role: 'group', 'aria-label': 'ระดับ' });
        LEVELS.forEach(function (l) {
          seg.appendChild(u.el('button', {
            type: 'button', class: level === l.id ? 'active' : '', text: l.name,
            onclick: function () { level = l.id; QL.store.setting('writeLevel', level); restart(); }
          }));
        });
        row.appendChild(seg);

        var groups = [];
        pack.vocab.forEach(function (v) { if (v.group && writable(v) && groups.indexOf(v.group) < 0) groups.push(v.group); });
        if (groups.length > 1) {
          var sel = u.el('select', { class: 'kw-select', 'aria-label': 'หมวด', onchange: function () { group = this.value; restart(); } });
          sel.appendChild(u.el('option', { value: '', text: 'ทุกหมวด' }));
          groups.forEach(function (g) { var o = u.el('option', { value: g, text: g }); if (g === group) o.selected = true; sel.appendChild(o); });
          row.appendChild(sel);
        }

        row.appendChild(u.el('button', {
          type: 'button', class: 'kw-toggle' + (palmGuard ? ' on' : ''), 'aria-pressed': palmGuard ? 'true' : 'false',
          title: 'เมื่อเจอ Apple Pencil จะไม่รับนิ้ว/ฝ่ามือบนกระดาน',
          text: palmGuard ? (penSeen ? '✏️ กันฝ่ามือ: ทำงาน' : '✏️ กันฝ่ามือ: รอปากกา') : '✋ รับนิ้วด้วย',
          onclick: function () { palmGuard = !palmGuard; QL.store.setting('writePalmGuard', palmGuard); renderBar(); }
        }));
        bar.appendChild(row);
      }

      /* ---------- เริ่มคำใหม่ ---------- */
      function startWord() {
        renderHead(); renderBar();
        stage.innerHTML = '';
        if (!queue.length) return stage.appendChild(u.el('div', { class: 'empty' }, [
          u.el('div', { class: 'empty-icon', text: '📭' }), u.el('div', { text: 'ไม่มีคำที่เขียนได้ในตัวเลือกนี้' })
        ]));
        if (idx >= queue.length) return renderSummary();

        var e = queue[idx];
        var chars = Array.from(writable(e));
        word = { e: e, chars: chars, ci: 0, miss: chars.map(function () { return 0; }), hint: chars.map(function () { return 0; }), given: [], done: false, peek: false };
        renderWord();
      }

      function renderWord() {
        var e = word.e;
        stage.innerHTML = '';

        // โจทย์
        var ask = u.el('div', { class: 'prompt-card kw-ask' });
        ask.appendChild(u.el('div', { class: 'prompt-topic', text: 'บทที่ ' + (e.ch || 1) + (e.group ? ' · ' + e.group : '') }));
        ask.appendChild(V.pic(e, 'kw-pic'));
        ask.appendChild(u.el('div', { class: 'v-ask', text: e.th }));
        var showRomaji = level !== 'test' || word.peek || word.done;
        if (showRomaji) ask.appendChild(u.el('div', { class: 'v-romaji kw-rom', text: V.romaji(word.chars.join('')) }));
        if (level === 'trace' || word.done) ask.appendChild(u.el('div', { class: 'kw-kana', text: word.chars.join('') }));
        if (word.done) {
          if (e.kanji) ask.appendChild(u.el('div', { class: 'v-kanji', text: e.kanji }));
          ask.appendChild(V.speakBtn(e));
        }
        stage.appendChild(ask);

        // ช่องตัวอักษรของคำ
        var slots = u.el('div', { class: 'kw-slots', 'aria-label': 'ตัวอักษรในคำ' });
        word.chars.forEach(function (c, i) {
          var cls = 'kw-slot';
          var txt = '';
          if (i < word.ci || word.done) {
            txt = c;
            cls += word.given.indexOf(i) >= 0 ? ' given' : (word.miss[i] + word.hint[i] === 0 ? ' ok' : ' warn');
          } else if (i === word.ci) cls += ' now';
          slots.appendChild(u.el('div', { class: cls, text: txt }));
        });
        stage.appendChild(slots);

        if (word.done) return renderWordResult();

        // กระดาน
        // iPad: กระดานใหญ่พอให้เขียนด้วยปากกาสบาย แต่ยังเห็นปุ่มใต้กระดานในจอเดียว
        var size = Math.round(Math.max(240, Math.min(520, (root.clientWidth || 360) - 8, window.innerHeight * 0.55)));
        var pad = u.el('div', { class: 'kw-pad', style: 'width:' + size + 'px;height:' + size + 'px' });
        pad.appendChild(u.el('div', { class: 'kw-grid' }));
        var target = u.el('div', { class: 'kw-target' });
        pad.appendChild(target);
        guardPalm(pad);
        var status = u.el('div', { class: 'kw-status', text: 'กำลังโหลดตัวอักษร…' });
        stage.appendChild(u.el('div', { class: 'kw-board' }, [pad]));
        stage.appendChild(status);

        stage.appendChild(u.el('div', { class: 'btn-row kw-actions' }, [
          u.el('button', { class: 'btn', html: '▶ ดูลำดับเส้น <span class="kbd">A</span>', onclick: animate }),
          u.el('button', { class: 'btn', html: '💡 ใบ้เส้นถัดไป <span class="kbd">H</span>', onclick: hint }),
          level === 'test' && !word.peek ? u.el('button', { class: 'btn', text: '👀 ดูโรมาจิ', onclick: peek }) : null,
          u.el('button', { class: 'btn ghost', text: '↺ เขียนตัวนี้ใหม่', onclick: function () { startChar(target, status, size); } }),
          u.el('button', { class: 'btn ghost', text: 'ข้ามคำ', onclick: skipWord })
        ]));
        stage.appendChild(u.el('div', { class: 'kw-credit', html: 'ตรวจเส้นด้วย <a href="https://github.com/chanind/hanzi-writer" target="_blank" rel="noopener">Hanzi Writer</a> · ข้อมูลลำดับเส้นจาก AnimCJK' }));

        startChar(target, status, size);
      }

      /* ---------- Apple Pencil: กันฝ่ามือ ----------
         Hanzi Writer ฟัง touch/mouse ที่ตัว svg — เราดักที่กรอบนอกในช่วง capture
         ถ้าเคยเจอปากกาแล้ว ทัชที่ไม่ใช่ stylus จะไม่ถึงกระดานเลย */
      function guardPalm(pad) {
        function onTouch(ev) {
          var t = ev.changedTouches && ev.changedTouches[0];
          if (!t) return;
          if (t.touchType === 'stylus') {
            if (!penSeen) { penSeen = true; if (palmGuard) renderBar(); }
            return;
          }
          if (palmGuard && penSeen) { ev.stopPropagation(); ev.preventDefault(); }
        }
        ['touchstart', 'touchmove', 'touchend'].forEach(function (type) {
          pad.addEventListener(type, onTouch, { capture: true, passive: false });
        });
      }

      /* ---------- เขียนทีละตัว ---------- */
      function startChar(target, status, size) {
        var c = word.chars[word.ci];
        target.innerHTML = '';
        writer = null; strokeAt = 0;
        status.textContent = 'กำลังโหลดตัวอักษร…';
        status.className = 'kw-status';
        var myWord = word, myCi = word.ci;

        loadWriter().then(function () { return charData(c); }).then(function () {
          if (word !== myWord || word.ci !== myCi) return;     // เปลี่ยนคำไปแล้ว
          writer = HanziWriter.create(target, c, {
            width: size, height: size, padding: Math.round(size * 0.07),
            showCharacter: false,
            showOutline: level === 'trace',
            strokeColor: cssVar('--text', '#16181d'),
            outlineColor: cssVar('--border', '#dfe3ea'),
            highlightColor: cssVar('--accent', '#3b5bdb'),
            drawingColor: cssVar('--accent', '#3b5bdb'),
            drawingWidth: Math.max(12, Math.round(size / 26)),
            strokeAnimationSpeed: 1.4, delayBetweenStrokes: 180,
            charDataLoader: function (ch2, onLoad, onError) { charData(ch2).then(onLoad, onError); }
          });
          runQuiz(status);
        }).catch(function (err) {
          if (word !== myWord) return;
          if (err && /ข้อมูลเส้น/.test(err.message)) {
            // ตัวที่ไม่มีข้อมูลเส้น (เช่นสัญลักษณ์พิเศษ) — เติมให้แล้วข้ามไป
            word.given.push(word.ci);
            status.textContent = 'ตัว ' + c + ' ไม่มีข้อมูลเส้น ข้ามให้แล้ว';
            setTimeout(nextChar, 700);
          } else {
            status.className = 'kw-status bad';
            status.textContent = '⚠️ โหลดไม่สำเร็จ — โหมดนี้ต้องต่ออินเทอร์เน็ต ลองกด "↺ เขียนตัวนี้ใหม่"';
          }
        });
      }

      function runQuiz(status) {
        if (!writer) return;
        var c = word.chars[word.ci];
        status.className = 'kw-status';
        status.textContent = 'เขียนตัว ' + (level === 'test' && !word.peek ? 'ที่ ' + (word.ci + 1) : '「' + c + '」') + ' — เส้นที่ 1';
        writer.quiz({
          leniency: level === 'test' ? 1.15 : 1.35,
          showHintAfterMisses: lv().hintAfter,
          highlightOnComplete: true,
          onCorrectStroke: function (d) {
            strokeAt = d.strokeNum + 1;
            if (d.strokesRemaining > 0) status.textContent = '✓ ถูก — เส้นที่ ' + (strokeAt + 1) + ' จาก ' + (strokeAt + d.strokesRemaining);
          },
          onMistake: function (d) {
            word.miss[word.ci]++;
            status.className = 'kw-status bad';
            status.textContent = '✗ เส้นที่ ' + (d.strokeNum + 1) + ' ยังไม่ใช่ — ดูลำดับ ทิศทาง หรือรูปร่าง' +
              (d.mistakesOnStroke >= lv().hintAfter ? ' (มีเส้นใบ้ให้แล้ว)' : '');
          },
          onComplete: function () {
            status.className = 'kw-status ok';
            var m = word.miss[word.ci] + word.hint[word.ci];
            status.textContent = m === 0 ? '🎉 เป๊ะ!' : '✓ เสร็จ (พลาด/ใบ้ ' + m + ')';
            setTimeout(nextChar, 450);
          }
        });
      }

      function nextChar() {
        if (!word || word.done) return;
        word.ci++;
        if (word.ci >= word.chars.length) return finishWord();
        renderWord();
      }

      function animate() {
        if (!writer) return;
        if (level === 'test') word.hint[word.ci]++;
        var status = stage.querySelector('.kw-status');
        writer.cancelQuiz();
        status.className = 'kw-status';
        status.textContent = 'ดูลำดับเส้น…';
        writer.animateCharacter({
          onComplete: function () {
            setTimeout(function () { if (!writer) return; writer.hideCharacter(); runQuiz(status); }, 500);
          }
        });
      }

      function hint() {
        if (!writer) return;
        word.hint[word.ci]++;
        writer.highlightStroke(strokeAt);
      }

      function peek() { word.peek = true; word.hint[word.ci]++; renderWord(); }

      function skipWord() {
        word.miss = word.miss.map(function (m) { return m + 3; });   // ข้าม = ยังเขียนไม่ได้
        finishWord();
      }

      /* ---------- จบคำ ---------- */
      function finishWord() {
        word.done = true; writer = null;
        var miss = word.miss.reduce(function (a, b) { return a + b; }, 0);
        var hints = word.hint.reduce(function (a, b) { return a + b; }, 0);
        results.push({ e: word.e, miss: miss, hint: hints });
        if (level === 'test') {
          var total = miss + hints;
          QL.store.grade(deckId, itemId(word.e), total <= 2, total > 0 && total <= 2);
        }
        if (V.canSpeak) V.speak(word.e.kana);
        renderWord();
      }

      function renderWordResult() {
        var r = results[results.length - 1];
        var total = r.miss + r.hint;
        var verdict = total === 0 ? ['ok', '🎉 เขียนได้เป๊ะทั้งคำ'] : total <= 2 ? ['warn', '👍 เกือบเป๊ะ — พลาด ' + r.miss + ' · ใบ้ ' + r.hint] : ['bad', '📝 ต้องฝึกเพิ่ม — พลาด ' + r.miss + ' · ใบ้ ' + r.hint];
        stage.appendChild(u.el('div', { class: 'kw-verdict ' + verdict[0], text: verdict[1] }));
        if (word.e.note) stage.appendChild(u.el('div', { class: 'v-note', text: word.e.note }));
        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:14px' }, [
          u.el('button', { class: 'btn primary', html: (idx + 1 < queue.length ? 'คำถัดไป →' : 'ดูสรุป') + ' <span class="kbd">Enter</span>', onclick: nextWord }),
          u.el('button', { class: 'btn ghost', text: '↺ เขียนคำนี้อีกรอบ', onclick: function () { results.pop(); startWord(); } })
        ]));
        stage.appendChild(u.el('div', { style: 'margin-top:18px' }, [u.bar(idx + 1, queue.length, { label: 'ความคืบหน้า', text: (idx + 1) + '/' + queue.length })]));
      }

      function nextWord() { idx++; startWord(); }

      /* ---------- สรุป ---------- */
      function renderSummary() {
        clearInterval(timer);
        var perfect = results.filter(function (r) { return r.miss + r.hint === 0; }).length;
        var weak = results.filter(function (r) { return r.miss + r.hint > 2; });
        if (level === 'test') QL.store.logSession(deckId, 'vocabwrite', perfect, results.length);

        stage.appendChild(u.el('div', { class: 'card result-big' }, [
          u.el('div', { class: 'result-score', text: perfect + '/' + results.length }),
          u.el('div', { class: 'result-label', text: 'คำที่เขียนได้เป๊ะ (ไม่พลาด ไม่ใบ้)' + (level === 'test' ? ' · ใช้เวลา ' + fmtTime(Date.now() - startedAt) : '') })
        ]));

        var off = results.filter(function (r) { return r.miss + r.hint > 0; })
          .sort(function (a, b) { return (b.miss + b.hint) - (a.miss + a.hint); });
        if (off.length) {
          var list = u.el('div', { class: 'card kw-review' }, [u.el('div', { class: 'section-title', text: 'คำที่ยังพลาด' })]);
          off.forEach(function (r) {
            list.appendChild(u.el('div', { class: 'kw-review-row' }, [
              u.el('span', { class: 'kw-review-kana', text: writable(r.e) }),
              u.el('span', { class: 'v-romaji', text: V.romaji(writable(r.e)) }),
              u.el('span', { class: 'kw-review-th', text: r.e.th }),
              u.el('span', { class: 'box-pill', text: 'พลาด ' + r.miss + ' · ใบ้ ' + r.hint })
            ]));
          });
          stage.appendChild(list);
        }

        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:18px' }, [
          u.el('button', { class: 'btn primary', text: 'เขียนอีกรอบ', onclick: function () { restart(); } }),
          weak.length ? u.el('button', { class: 'btn', text: 'เฉพาะคำที่ต้องฝึกเพิ่ม (' + weak.length + ')', onclick: function () { restart(weak.map(function (r) { return r.e; })); } }) : null,
          u.el('button', { class: 'btn ghost', text: 'กลับหน้าบทเรียน', onclick: ctx.back })
        ]));
      }

      ctx.onKey(function (e) {
        if (!word) return;
        if (word.done && e.key === 'Enter') { e.preventDefault(); nextWord(); }
        else if (!word.done && (e.key === 'a' || e.key === 'A')) animate();
        else if (!word.done && (e.key === 'h' || e.key === 'H')) hint();
      });

      restart();
    }
  });
})();
