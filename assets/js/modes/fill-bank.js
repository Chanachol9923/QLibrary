/* =========================================================
   QLibrary / modes / fill-bank.js
   โหมด "เติมคำ a–t" — จำลองข้อสอบแบบ "เลือกคำที่กำหนดให้ a–t มาเติมในประโยค"
   ทำเหมือนกระดาษข้อสอบ: ประโยค 20 ข้อ + คลังคำ 20 คำ (a–t) ในหน้าเดียว แล้วตรวจทีเดียว

   วิธีเล่น (ออกแบบให้ใช้นิ้ว/ปากกาบน iPad)
     แตะช่องว่างในประโยค → แตะคำในคลัง → คำไปเติมในช่องนั้น แล้วเลื่อนไปช่องว่างถัดไปเอง
     แตะช่องที่เติมแล้ว = เลือกช่องนั้นเพื่อเปลี่ยนคำ · แตะซ้ำอีกครั้ง = ล้างช่อง
     คอมพิวเตอร์: กดตัวอักษร a–t เติมช่องที่เลือกอยู่ได้เลย

   ข้อมูล (pack.fill[]):
     { id, ch, page, text: 'ประโยค ที่มี （　） 1 ช่อง (ขึ้นบรรทัดใหม่ด้วย \n)', answer: 'คำในคลัง',
       alt: ['คำอื่นที่ถือว่าถูก'], th: 'คำแปลไทย', note: 'อธิบาย' }

   กันโจทย์กำกวม: ในชุดเดียวกัน คำตอบต้องไม่ซ้ำ และคำตอบของข้อหนึ่งต้องไม่อยู่ใน alt ของอีกข้อ
   → ทุกช่องมีคำถูกจากคลังได้คำเดียว
   ========================================================= */
(function () {
  var u = QL.util;
  var BLANK = /（[\s　]*）/;
  var LETTERS = 'abcdefghijklmnopqrstuvwxyz';

  QL.modes.register({
    id: 'fillbank',
    name: 'เติมคำ a–t',
    icon: '🔡',
    description: 'จำลองข้อสอบตอนที่ 2: ประโยค 20 ข้อ + คลังคำ a–t เลือกคำมาเติมให้ถูก ตรวจทีเดียวพร้อมคำแปลและเสียงอ่าน',
    available: function (pack) { return pack.fill.length >= 4; },

    mount: function (root, ctx) {
      var pack = ctx.pack;
      var deckId = ctx.deckId;
      var V = QL.vocab;

      var cfg = { ch: null, count: QL.store.setting('fillCount') || 20 };
      var paper = [];       // [{ item, pick: index ในคลัง | null }]
      var bank = [];        // [คำ] ตามลำดับตัวอักษร a, b, c ...
      var active = 0;       // ช่องที่กำลังเลือก
      var checked = false;

      var head = u.el('div', { class: 'study-head' });
      var stage = u.el('div', { class: 'study-stage' });
      root.appendChild(head);
      root.appendChild(stage);

      function chapters() {
        var seen = {}, list = [];
        pack.fill.forEach(function (f) { if (!seen[f.ch]) { seen[f.ch] = 1; list.push(f.ch); } });
        return list.sort(function (a, b) { return a - b; });
      }

      function pool() {
        return pack.fill.filter(function (f) { return cfg.ch === null || f.ch === cfg.ch; });
      }

      /** คำตอบที่ถือว่าถูกของข้อนี้ */
      function okWords(f) { return [f.answer].concat(f.alt || []); }

      /** สุ่มชุดข้อสอบ: คำตอบไม่ซ้ำ และไม่ไปชนกับ alt ของข้ออื่น */
      function buildPaper(items, n) {
        var picked = [], answers = {}, alts = {};
        u.shuffle(items).forEach(function (f) {
          if (picked.length >= n) return;
          if (answers[f.answer] || alts[f.answer]) return;
          if ((f.alt || []).some(function (a) { return answers[a]; })) return;
          picked.push(f);
          answers[f.answer] = 1;
          (f.alt || []).forEach(function (a) { alts[a] = 1; });
        });
        return picked;
      }

      function renderHead(meta, backFn, backLabel) {
        head.innerHTML = '';
        head.appendChild(u.el('div', {}, [
          u.el('h2', { style: 'margin:0;font-size:19px', text: '🔡 เติมคำ a–t' }),
          u.el('div', { class: 'study-meta', text: meta })
        ]));
        head.appendChild(u.el('button', { class: 'btn ghost', text: '← ' + (backLabel || 'กลับ'), onclick: backFn || ctx.back }));
      }

      /* =====================================================
         หน้าตั้งค่า
         ===================================================== */
      function renderSetup() {
        renderHead('เลือกขอบเขตก่อนเริ่ม');
        stage.innerHTML = '';
        var box = u.el('div', { class: 'card' });

        var chips = u.el('div', { class: 'chips' });
        function chip(label, value, count) {
          chips.appendChild(u.el('button', {
            class: 'chip' + (cfg.ch === value ? ' active' : ''), type: 'button',
            onclick: function () { cfg.ch = value; renderSetup(); }
          }, [u.el('span', { text: label }), u.el('span', { class: 'chip-count', text: String(count) })]));
        }
        chip('ทุกบท', null, pack.fill.length);
        chapters().forEach(function (c) {
          chip('บทที่ ' + c, c, pack.fill.filter(function (f) { return f.ch === c; }).length);
        });
        box.appendChild(u.el('h3', { style: 'margin:0 0 10px', text: 'ขอบเขต' }));
        box.appendChild(chips);

        var seg = u.el('div', { class: 'seg', role: 'group', 'aria-label': 'จำนวนข้อ' });
        [[10, '10 ข้อ'], [20, '20 ข้อ (เหมือนข้อสอบ)']].forEach(function (o) {
          seg.appendChild(u.el('button', {
            type: 'button', class: cfg.count === o[0] ? 'active' : '', text: o[1],
            onclick: function () { cfg.count = o[0]; QL.store.setting('fillCount', cfg.count); renderSetup(); }
          }));
        });
        box.appendChild(u.el('div', { class: 'v-seg-wrap', style: 'margin-top:6px' }, [u.el('span', { class: 'v-seg-label', text: 'จำนวนข้อ' }), seg]));

        var preview = buildPaper(pool(), cfg.count);
        box.appendChild(u.el('div', { class: 'study-meta', style: 'margin-top:12px',
          text: 'ได้ ' + preview.length + ' ข้อ (คำตอบไม่ซ้ำกันในชุด) · คลังคำ ' + LETTERS.charAt(0) + '–' + LETTERS.charAt(Math.max(preview.length - 1, 0)) }));
        box.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:14px' }, [
          u.el('button', { class: 'btn primary', text: '▶ เริ่มทำข้อสอบ', disabled: preview.length ? null : 'disabled', onclick: function () { start(preview); } })
        ]));
        stage.appendChild(box);

        stage.appendChild(u.el('div', { class: 'hint', style: 'margin-top:14px', html:
          '<b>วิธีทำ:</b> แตะช่องว่าง <b>（ ? ）</b> ในประโยค แล้วแตะคำในคลังด้านบน · ' +
          'คอมพิวเตอร์กดตัวอักษร a–t ได้เลย · ทำครบแล้วกด "ตรวจคำตอบ"' }));
      }

      /* =====================================================
         กระดาษข้อสอบ
         ===================================================== */
      function start(items) {
        paper = items.map(function (f) { return { item: f, pick: null }; });
        bank = u.shuffle(items.map(function (f) { return f.answer; }));
        active = 0;
        checked = false;
        renderPaper();
      }

      function filled() { return paper.filter(function (p) { return p.pick !== null; }).length; }

      function renderPaper() {
        renderHead(checked ? 'ตรวจแล้ว' : 'เติมแล้ว ' + filled() + '/' + paper.length + ' ข้อ', function () {
          if (!checked && filled() && !confirm('ออกจากข้อสอบชุดนี้? คำตอบที่เติมไว้จะหายไป')) return;
          renderSetup();
        }, 'เปลี่ยนชุด');
        stage.innerHTML = '';

        // ---------- คลังคำ a–t (ติดขอบบนตอนเลื่อน จะได้เห็นตลอด) ----------
        var used = {};
        paper.forEach(function (p) { if (p.pick !== null) used[p.pick] = (used[p.pick] || 0) + 1; });
        var bankBox = u.el('div', { class: 'fb-bank' });
        bank.forEach(function (w, i) {
          var b = u.el('button', { class: 'fb-word' + (used[i] ? ' used' : ''), type: 'button', disabled: checked ? 'disabled' : null }, [
            u.el('span', { class: 'fb-letter', text: LETTERS.charAt(i) }),
            u.el('span', { class: 'fb-w', text: w })
          ]);
          b.addEventListener('click', function () { put(i); });
          bankBox.appendChild(b);
        });
        stage.appendChild(u.el('div', { class: 'fb-bank-wrap' }, [
          u.el('div', { class: 'study-meta', style: 'margin-bottom:6px', text: 'คลังคำ — เลือกมาเติมในช่องว่าง' }),
          bankBox
        ]));

        // ---------- ประโยค ----------
        var list = u.el('ol', { class: 'fb-list' });
        paper.forEach(function (p, i) { list.appendChild(questionNode(p, i)); });
        stage.appendChild(list);

        // ---------- ปุ่ม ----------
        if (!checked) {
          stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:16px' }, [
            u.el('button', { class: 'btn primary', text: '✓ ตรวจคำตอบ', onclick: check }),
            u.el('button', { class: 'btn ghost', text: 'ล้างทั้งหมด', onclick: function () {
              if (!filled() || confirm('ล้างคำตอบทั้งหมด?')) { paper.forEach(function (p) { p.pick = null; }); active = 0; renderPaper(); }
            } })
          ]));
        } else {
          renderResult();
        }
      }

      function questionNode(p, i) {
        var f = p.item;
        var parts = f.text.split(BLANK);
        var blankText = p.pick === null ? '?' : LETTERS.charAt(p.pick) + '. ' + bank[p.pick];

        var right = checked && okWords(f).indexOf(p.pick === null ? '' : bank[p.pick]) >= 0;
        var cls = 'fb-blank' + (p.pick === null ? ' empty' : ' filled') + (!checked && i === active ? ' active' : '') +
          (checked ? (right ? ' right' : ' wrong') : '');
        var blank = u.el('button', { class: cls, type: 'button', text: '（ ' + blankText + ' ）', disabled: checked ? 'disabled' : null });
        blank.addEventListener('click', function () {
          if (active === i && p.pick !== null) { p.pick = null; }   // แตะช่องที่เลือกอยู่ซ้ำ = ล้าง
          active = i;
          renderPaper();
        });

        // ประโยคอาจมีหลายบรรทัด (ถาม……ตอบ) — วางช่องว่างไว้ในบรรทัดที่มี （　）
        var sentence = u.el('div', { class: 'fb-sentence' });
        sentence.appendChild(document.createTextNode(parts[0]));
        sentence.appendChild(blank);
        sentence.appendChild(document.createTextNode(parts.slice(1).join('（　）')));

        var li = u.el('li', { class: 'fb-q' + (checked ? (right ? ' is-right' : ' is-wrong') : '') }, [sentence]);

        // โรมาจิของประโยค (ซ่อนได้ด้วยปุ่ม Ro เหมือนทุกหน้า)
        var rom = f.text.split('\n').map(function (l) { return u.isJapaneseLine(l) ? u.romaji(l) : ''; }).filter(Boolean).join(' / ');
        if (rom) li.appendChild(u.el('div', { class: 'romaji', text: rom }));

        if (checked) {
          var full = f.text.replace(BLANK, f.answer);
          li.appendChild(u.el('div', { class: 'fb-explain' }, [
            !right ? u.el('div', { class: 'fb-correct', html: 'คำตอบที่ถูก: <b>' + u.esc(LETTERS.charAt(bank.indexOf(f.answer)) + '. ' + f.answer) + '</b>' +
              ((f.alt || []).length ? ' <span class="study-meta">(ตอบ ' + u.esc(f.alt.join(' / ')) + ' ก็ได้)</span>' : '') }) : null,
            f.th ? u.el('div', { class: 'v-th', text: f.th }) : null,
            f.note ? u.el('div', { class: 'v-note', text: f.note }) : null,
            V ? V.speakTextBtn(full) : null
          ]));
        }
        return li;
      }

      /** เติมคำ i ลงช่องที่เลือกอยู่ แล้วเลื่อนไปช่องว่างถัดไป */
      function put(i) {
        if (checked) return;
        paper[active].pick = i;
        var next = -1;
        for (var k = 1; k <= paper.length; k++) {
          var j = (active + k) % paper.length;
          if (paper[j].pick === null) { next = j; break; }
        }
        if (next >= 0) active = next;
        renderPaper();
        // เลื่อนให้เห็นช่องที่กำลังเลือก
        var a = u.$('.fb-blank.active', stage);
        if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }

      function check() {
        var empty = paper.length - filled();
        if (empty && !confirm('ยังเหลือช่องว่าง ' + empty + ' ข้อ ตรวจเลยไหม?')) return;
        checked = true;
        paper.forEach(function (p) {
          var ok = p.pick !== null && okWords(p.item).indexOf(bank[p.pick]) >= 0;
          QL.store.grade(deckId, 'fill:' + p.item.id, ok, false);
        });
        renderPaper();
        window.scrollTo(0, 0);
      }

      function renderResult() {
        var score = paper.filter(function (p) { return p.pick !== null && okWords(p.item).indexOf(bank[p.pick]) >= 0; }).length;
        QL.store.logSession(deckId, 'fillbank', score, paper.length);
        var p = u.pct(score, paper.length);

        stage.insertBefore(u.el('div', { class: 'card result-big', style: 'margin-bottom:14px' }, [
          u.el('div', { class: 'result-score', text: score + '/' + paper.length }),
          u.el('div', { class: 'result-label', text: (paper.length === 20 ? 'คิดเป็น ' + (score / 2) + ' / 10 คะแนน · ' : '') +
            (p >= 90 ? 'พร้อมสอบแล้ว 🎉' : p >= 70 ? 'ดีแล้ว ทวนข้อที่ผิดอีกนิด' : 'อ่านคำแปลข้อที่ผิด แล้วลองชุดใหม่') })
        ]), stage.firstChild);

        var wrongItems = paper.filter(function (x) { return !(x.pick !== null && okWords(x.item).indexOf(bank[x.pick]) >= 0); })
          .map(function (x) { return x.item; });
        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:18px' }, [
          u.el('button', { class: 'btn primary', text: 'ทำชุดใหม่', onclick: function () { start(buildPaper(pool(), cfg.count)); } }),
          wrongItems.length >= 2 ? u.el('button', { class: 'btn', text: 'ทำเฉพาะข้อที่ผิด (' + wrongItems.length + ')',
            onclick: function () { start(buildPaper(wrongItems, wrongItems.length)); } }) : null,
          u.el('button', { class: 'btn ghost', text: 'เปลี่ยนขอบเขต', onclick: renderSetup })
        ]));
      }

      // a–t บนคีย์บอร์ด = เลือกคำในคลัง (ดู e.code จะได้ใช้ได้แม้คีย์บอร์ดเป็นภาษาไทย)
      ctx.onKey(function (e) {
        if (checked || !paper.length || e.ctrlKey || e.metaKey || e.altKey) return;
        var m = /^Key([A-Z])$/.exec(e.code || '');
        if (!m || m[1] === 'R') return;        // R สงวนไว้ให้ปุ่มซ่อนโรมาจิ
        var i = LETTERS.indexOf(m[1].toLowerCase());
        if (i >= 0 && i < bank.length) { e.preventDefault(); put(i); }
      });

      renderSetup();
    }
  });
})();
