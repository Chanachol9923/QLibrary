/* =========================================================
   QLibrary / modes / vocab-write.js
   โหมด "เขียนด้วยปากกา" — เขียนคำศัพท์ทั้งคำด้วยนิ้วหรือ Apple Pencil (แนว Write It! Japanese)

   กระดานเป็นแถวช่องสี่เหลี่ยม (แบบกระดาษ 原稿用紙) ช่องละ 1 ตัว เขียนต่อกันได้ทั้งคำในหน้าเดียว
   ทุกช่องตรวจพร้อมกันทีละเส้น: ลำดับเส้น · ทิศทาง · รูปร่าง (Hanzi Writer เทียบกับเส้นกลางของตัวอักษร)

   3 ระดับ
     🖍️ ลากตามโครง   เห็นโครงตัวอักษร พลาด 1 ครั้งมีเส้นใบ้ (เหมือนหัดเขียน)
     ✍️ เขียนเอง      ไม่มีโครง เห็นโรมาจิ พลาด 3 ครั้งค่อยใบ้
     🧪 ทดสอบ         เห็นแค่ความหมายภาษาไทย (เหมือนข้อสอบตอนที่ 1) จับเวลา ผลเข้าระบบ Leitner

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

  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }

  QL.modes.register({
    id: 'vocabwrite',
    name: 'เขียนด้วยปากกา',
    icon: '✍️',
    description: 'เขียนคำศัพท์ทั้งคำด้วยนิ้วหรือ Apple Pencil ตรวจลำดับเส้น ทิศทาง และรูปร่างทันที มีลากตามโครง · เขียนเอง · ทดสอบจับเวลา',
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
      var word = null;
      var results = [];     // { e, miss, hint }
      var startedAt = 0, timer = null;
      var ui = {};          // ชิ้นส่วนของหน้าคำปัจจุบัน: ask, board, cells[], status, actions

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
        var zero = function () { return chars.map(function () { return 0; }); };
        word = {
          e: e, chars: chars,
          miss: zero(), hint: zero(), strokeAt: zero(),
          fin: chars.map(function () { return false; }),
          given: [], writers: [], active: 0, done: false, peek: false
        };
        renderWord();
      }

      function renderAsk() {
        var e = word.e;
        var ask = u.el('div', { class: 'prompt-card kw-ask' });
        ask.appendChild(u.el('div', { class: 'prompt-topic', text: 'บทที่ ' + (e.ch || 1) + (e.group ? ' · ' + e.group : '') }));
        ask.appendChild(V.pic(e, 'kw-pic'));
        ask.appendChild(u.el('div', { class: 'v-ask', text: e.th }));
        if (level !== 'test' || word.peek || word.done) ask.appendChild(u.el('div', { class: 'v-romaji kw-rom', text: V.romaji(word.chars.join('')) }));
        if (level === 'trace' || word.done) ask.appendChild(u.el('div', { class: 'kw-kana', text: word.chars.join('') }));
        if (word.done) {
          if (e.kanji) ask.appendChild(u.el('div', { class: 'v-kanji', text: e.kanji }));
          ask.appendChild(V.speakBtn(e));
        }
        if (ui.ask) ui.ask.replaceWith(ask);
        ui.ask = ask;
        return ask;
      }

      /** ขนาดช่อง: ทั้งคำอยู่แถวเดียวถ้าทำได้ ช่องไม่เล็กกว่า ~104px (เขียนด้วยปากกาได้สบาย) ยาวเกินก็ขึ้นแถวใหม่ */
      function layout(n) {
        var gap = 8;
        var avail = Math.min((root.clientWidth || 360) - 4, 1100);
        var perRow = Math.max(1, Math.min(n, Math.floor((avail + gap) / (104 + gap))));
        var cell = Math.floor(Math.min(240, (avail - gap * (perRow - 1)) / perRow, window.innerHeight * 0.42));
        return { gap: gap, perRow: perRow, cell: Math.max(84, cell) };
      }

      function renderWord() {
        stage.innerHTML = '';
        ui = {};
        stage.appendChild(renderAsk());

        var L = layout(word.chars.length);
        var board = u.el('div', {
          class: 'kw-board', 'aria-label': 'กระดานเขียนคำ',
          style: 'grid-template-columns:repeat(' + L.perRow + ',' + L.cell + 'px);gap:' + L.gap + 'px'
        });
        ui.cells = word.chars.map(function (c, i) {
          var cell = u.el('div', { class: 'kw-pad' + (i === 0 ? ' now' : ''), style: 'width:' + L.cell + 'px;height:' + L.cell + 'px' });
          cell.appendChild(u.el('div', { class: 'kw-grid' }));
          var target = u.el('div', { class: 'kw-target' });
          cell.appendChild(target);
          // แตะช่องไหน = ช่องนั้นคือช่องที่ปุ่ม ดูลำดับเส้น / ใบ้ จะใช้
          ['touchstart', 'mousedown'].forEach(function (t) {
            cell.addEventListener(t, function () { setActive(i); }, { capture: true, passive: true });
          });
          board.appendChild(cell);
          return { el: cell, target: target };
        });
        guardPalm(board);
        ui.board = board;
        stage.appendChild(u.el('div', { class: 'kw-board-wrap' }, [board]));

        ui.status = u.el('div', { class: 'kw-status', text: 'กำลังโหลดตัวอักษร…' });
        stage.appendChild(ui.status);

        ui.actions = u.el('div');
        stage.appendChild(ui.actions);
        renderActions();

        loadCells(L.cell);
      }

      function renderActions() {
        ui.actions.innerHTML = '';
        if (word.done) return renderWordResult();
        ui.actions.appendChild(u.el('div', { class: 'btn-row kw-actions' }, [
          u.el('button', { class: 'btn', html: '▶ ดูลำดับเส้น <span class="kbd">A</span>', onclick: animate }),
          u.el('button', { class: 'btn', html: '💡 ใบ้เส้นถัดไป <span class="kbd">H</span>', onclick: hint }),
          level === 'test' && !word.peek ? u.el('button', { class: 'btn', text: '👀 ดูโรมาจิ', onclick: peek }) : null,
          u.el('button', { class: 'btn ghost', text: '↺ เขียนใหม่ทั้งคำ', onclick: startWord }),
          u.el('button', { class: 'btn ghost', text: 'ข้ามคำ', onclick: skipWord })
        ]));
        ui.actions.appendChild(u.el('div', { class: 'kw-credit', html: 'ตรวจเส้นด้วย <a href="https://github.com/chanind/hanzi-writer" target="_blank" rel="noopener">Hanzi Writer</a> · ข้อมูลลำดับเส้นจาก AnimCJK' }));
      }

      /* ---------- Apple Pencil: กันฝ่ามือ ----------
         Hanzi Writer ฟัง touch/mouse ที่ตัว svg — เราดักที่กรอบนอกในช่วง capture
         ถ้าเคยเจอปากกาแล้ว ทัชที่ไม่ใช่ stylus จะไม่ถึงกระดานเลย */
      function guardPalm(el) {
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
          el.addEventListener(type, onTouch, { capture: true, passive: false });
        });
      }

      /* ---------- โหลดทุกช่องของคำพร้อมกัน ---------- */
      function loadCells(size) {
        var myWord = word;
        setStatus('', 'กำลังโหลดตัวอักษร…');
        loadWriter().then(function () {
          return Promise.all(word.chars.map(function (c) {
            return charData(c).then(function () { return null; }, function (err) { return err; });
          }));
        }).then(function (errs) {
          if (word !== myWord) return;
          var netErr = errs.filter(function (e) { return e && !e.missing; })[0];
          if (netErr) throw netErr;
          var opts = {
            width: size, height: size, padding: Math.round(size * 0.07),
            showCharacter: false,
            showOutline: level === 'trace',
            strokeColor: cssVar('--text', '#16181d'),
            outlineColor: cssVar('--border', '#dfe3ea'),
            highlightColor: cssVar('--accent', '#3b5bdb'),
            drawingColor: cssVar('--accent', '#3b5bdb'),
            drawingWidth: Math.max(8, Math.round(size / 24)),
            strokeAnimationSpeed: 1.4, delayBetweenStrokes: 180,
            charDataLoader: function (c2, onLoad, onError) { charData(c2).then(onLoad, onError); }
          };
          word.chars.forEach(function (c, i) {
            if (errs[i]) {
              // ตัวที่ไม่มีข้อมูลเส้น (สัญลักษณ์พิเศษ) — เติมให้เลย ไม่ต้องเขียน
              word.given.push(i); word.fin[i] = true;
              ui.cells[i].target.appendChild(u.el('div', { class: 'kw-given-char', style: 'font-size:' + Math.round(size * 0.6) + 'px', text: c }));
              ui.cells[i].el.classList.add('given');
              return;
            }
            word.writers[i] = HanziWriter.create(ui.cells[i].target, c, opts);
            quiz(i);
          });
          setActive(firstOpen());
          promptStatus();
          if (word.fin.every(Boolean)) finishWord();
        }).catch(function () {
          if (word !== myWord) return;
          setStatus('bad', '⚠️ โหลดไม่สำเร็จ — โหมดนี้ต้องต่ออินเทอร์เน็ต ลองกด "↺ เขียนใหม่ทั้งคำ"');
        });
      }

      function quiz(i) {
        var w = word.writers[i];
        if (!w) return;
        var myWord = word;
        w.quiz({
          leniency: level === 'test' ? 1.15 : 1.35,
          showHintAfterMisses: lv().hintAfter,
          highlightOnComplete: true,
          onCorrectStroke: function (d) {
            if (word !== myWord) return;
            word.strokeAt[i] = d.strokeNum + 1;
            setActive(i);
            if (d.strokesRemaining > 0) setStatus('', '✓ ' + label(i) + ' เส้นที่ ' + (d.strokeNum + 1) + ' ถูก — ต่อเส้นที่ ' + (d.strokeNum + 2) + ' จาก ' + (d.strokeNum + 1 + d.strokesRemaining));
          },
          onMistake: function (d) {
            if (word !== myWord) return;
            word.miss[i]++;
            setActive(i);
            setStatus('bad', '✗ ' + label(i) + ' เส้นที่ ' + (d.strokeNum + 1) + ' ยังไม่ใช่ — ดูลำดับ ทิศทาง หรือรูปร่าง' +
              (d.mistakesOnStroke >= lv().hintAfter ? ' (มีเส้นใบ้ให้แล้ว)' : ''));
          },
          onComplete: function () {
            if (word !== myWord) return;
            word.fin[i] = true;
            var m = word.miss[i] + word.hint[i];
            ui.cells[i].el.classList.add(m === 0 ? 'ok' : 'warn');
            if (word.fin.every(Boolean)) return setTimeout(function () { if (word === myWord) finishWord(); }, 350);
            setActive(firstOpen());
            setStatus('ok', (m === 0 ? '🎉 ' : '✓ ') + label(i) + ' เสร็จ — ต่อ' + label(word.active));
          }
        });
      }

      function label(i) {
        return level === 'test' && !word.peek ? 'ตัวที่ ' + (i + 1) : 'ตัว「' + word.chars[i] + '」';
      }

      function firstOpen() {
        for (var i = 0; i < word.fin.length; i++) if (!word.fin[i]) return i;
        return word.fin.length - 1;
      }

      /** ช่องที่จะใช้กับปุ่มดูลำดับเส้น / ใบ้ — ถ้าช่องนั้นเขียนเสร็จแล้ว ใช้ช่องแรกที่ยังไม่เสร็จแทน */
      function openActive() {
        return word.fin[word.active] ? firstOpen() : word.active;
      }

      function setActive(i) {
        if (!word || word.done) return;
        word.active = i;
        ui.cells.forEach(function (c, k) { c.el.classList.toggle('now', k === i && !word.fin[k]); });
      }

      function setStatus(kind, text) {
        if (!ui.status) return;
        ui.status.className = 'kw-status' + (kind ? ' ' + kind : '');
        ui.status.textContent = text;
      }

      function promptStatus() {
        var n = word.chars.length - word.given.length;
        setStatus('', n > 1 ? 'เขียนทั้งคำ ' + n + ' ตัว เรียงจากซ้ายไปขวา — ตรวจทีละเส้นทุกช่อง' : 'เขียน' + label(0));
      }

      function animate() {
        if (word.done) return;
        var i = openActive(), w = word.writers[i];
        if (!w) return;
        if (level === 'test') word.hint[i]++;
        setActive(i);
        w.cancelQuiz();
        setStatus('', 'ดูลำดับเส้น' + label(i) + '…');
        var myWord = word;
        w.animateCharacter({
          onComplete: function () {
            setTimeout(function () {
              if (word !== myWord || word.done) return;
              w.hideCharacter(); quiz(i); promptStatus();
            }, 500);
          }
        });
      }

      function hint() {
        if (word.done) return;
        var i = openActive(), w = word.writers[i];
        if (!w) return;
        word.hint[i]++;
        setActive(i);
        w.highlightStroke(word.strokeAt[i]);
      }

      function peek() { word.peek = true; word.hint[openActive()]++; renderAsk(); renderActions(); }

      function skipWord() {
        word.fin.forEach(function (f, i) { if (!f) word.miss[i] += 3; });   // ข้าม = ตัวที่ยังไม่เสร็จนับว่ายังเขียนไม่ได้
        finishWord();
      }

      /* ---------- จบคำ ---------- */
      function finishWord() {
        if (word.done) return;
        word.done = true;
        // ช่องที่ยังไม่เสร็จ (กดข้าม) — โชว์ตัวที่ถูกให้ดูในช่องเลย
        word.writers.forEach(function (w, i) {
          if (!w || word.fin[i]) return;
          w.cancelQuiz(); w.showCharacter();
          ui.cells[i].el.classList.add('bad');
        });
        ui.cells.forEach(function (c) { c.el.classList.remove('now'); });

        var miss = sum(word.miss), hints = sum(word.hint);
        results.push({ e: word.e, miss: miss, hint: hints });
        if (level === 'test') {
          var total = miss + hints;
          QL.store.grade(deckId, itemId(word.e), total <= 2, total > 0 && total <= 2);
        }
        if (V.canSpeak) V.speak(word.e.kana);
        setStatus('', '');
        renderAsk();
        renderActions();
      }

      function renderWordResult() {
        var r = results[results.length - 1];
        var total = r.miss + r.hint;
        var verdict = total === 0 ? ['ok', '🎉 เขียนได้เป๊ะทั้งคำ'] : total <= 2 ? ['warn', '👍 เกือบเป๊ะ — พลาด ' + r.miss + ' · ใบ้ ' + r.hint] : ['bad', '📝 ต้องฝึกเพิ่ม — พลาด ' + r.miss + ' · ใบ้ ' + r.hint];
        ui.actions.appendChild(u.el('div', { class: 'kw-verdict ' + verdict[0], text: verdict[1] }));
        if (word.e.note) ui.actions.appendChild(u.el('div', { class: 'v-note', text: word.e.note }));
        ui.actions.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:14px' }, [
          u.el('button', { class: 'btn primary', html: (idx + 1 < queue.length ? 'คำถัดไป →' : 'ดูสรุป') + ' <span class="kbd">Enter</span>', onclick: nextWord }),
          u.el('button', { class: 'btn ghost', text: '↺ เขียนคำนี้อีกรอบ', onclick: function () { results.pop(); startWord(); } })
        ]));
        ui.actions.appendChild(u.el('div', { style: 'margin-top:18px' }, [u.bar(idx + 1, queue.length, { label: 'ความคืบหน้า', text: (idx + 1) + '/' + queue.length })]));
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
