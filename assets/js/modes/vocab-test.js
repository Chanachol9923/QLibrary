/* =========================================================
   QLibrary / modes / vocab-test.js
   โหมด "จำลองสอบศัพท์" — ซ้อมข้อสอบตอนที่ 1: โจทย์เป็นภาษาไทย พิมพ์คำญี่ปุ่นเอง
   ทำทุกข้อในหน้าเดียวเหมือนกระดาษข้อสอบ แล้วกดตรวจทีเดียว

   - รูปซ่อนไว้เหมือนข้อสอบจริง กด 💡 ถ้าต้องการใบ้
   - ตรวจเข้มตามข้อสอบ: ต้องเขียนเป็นตัวญี่ปุ่น และต้องถูกชนิด (ฮิรางานะ/คาตากานะ)
   - ตอบเป็นคันจิก็ถือว่าถูก · พิมพ์โรมาจิจะไม่นับ แต่ระบบจะบอกว่าคำถูก
   ========================================================= */
(function () {
  var u = QL.util;
  var V = QL.vocab;

  QL.modes.register({
    id: 'vocabtest',
    name: 'จำลองสอบศัพท์',
    icon: '📝',
    description: 'ซ้อมข้อสอบแปลไทย→ญี่ปุ่น พิมพ์เองทุกข้อในหน้าเดียว แล้วตรวจทีเดียวพร้อมเฉลยรูป + โรมาจิ',
    available: function (pack) { return pack.vocab.length > 0; },

    mount: function (root, ctx) {
      var pack = ctx.pack;
      var deckId = ctx.deckId;

      var cfg = { ch: null, count: 20 };   // ch: null = ทุกบท · count: 10 | 20 | 0 (= ทุกคำ)
      var paper = [];                      // ข้อสอบรอบนี้
      var checked = false;

      var head = u.el('div', { class: 'study-head' });
      var stage = u.el('div', { class: 'study-stage' });
      root.appendChild(head);
      root.appendChild(stage);

      function pool() {
        return pack.vocab.filter(function (v) {
          return v.exam !== false && (cfg.ch === null || (v.ch || 1) === cfg.ch);
        });
      }

      function renderHead(meta) {
        head.innerHTML = '';
        head.appendChild(u.el('div', {}, [
          u.el('h2', { style: 'margin:0;font-size:19px', text: '📝 จำลองสอบศัพท์' }),
          u.el('div', { class: 'study-meta', text: meta })
        ]));
        head.appendChild(u.el('button', { class: 'btn ghost', text: '← กลับ', onclick: ctx.back }));
      }

      /* ---------- หน้าตั้งค่า ---------- */
      function renderSetup() {
        renderHead('เลือกขอบเขตก่อนเริ่ม');
        stage.innerHTML = '';
        checked = false;
        paper = [];
        inputs = [];

        var avail = pool().length;
        var box = u.el('div', { class: 'card' });

        box.appendChild(u.el('h3', { style: 'margin:0 0 10px', text: 'ขอบเขต' }));
        box.appendChild(V.chapterChips(pack, cfg.ch, function (c) { cfg.ch = c; renderSetup(); }));

        box.appendChild(u.el('h3', { style: 'margin:14px 0 10px', text: 'จำนวนข้อ' }));
        var seg = u.el('div', { class: 'seg', role: 'group', 'aria-label': 'จำนวนข้อ' });
        [[10, '10 ข้อ'], [20, '20 ข้อ (เท่าข้อสอบจริง)'], [0, 'ทุกคำ']].forEach(function (o) {
          seg.appendChild(u.el('button', {
            type: 'button', class: cfg.count === o[0] ? 'active' : '', text: o[1],
            onclick: function () { cfg.count = o[0]; renderSetup(); }
          }));
        });
        box.appendChild(seg);

        var n = cfg.count ? Math.min(cfg.count, avail) : avail;
        box.appendChild(u.el('p', {
          class: 'study-meta', style: 'margin:14px 0 0',
          text: 'จะสุ่ม ' + n + ' คำจาก ' + avail + ' คำในขอบเขตนี้ (ไม่รวมชื่อเฉพาะสมมุติ) · ' +
            'ตอนที่ 1 ของข้อสอบจริงสุ่มจากคำศัพท์หน้า 48-49, 62-63, 76-77'
        }));

        stage.appendChild(box);
        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:16px' }, [
          u.el('button', {
            class: 'btn primary', text: 'เริ่มทำข้อสอบ', disabled: avail ? null : 'disabled',
            onclick: start
          })
        ]));
      }

      /* ---------- กระดาษข้อสอบ ---------- */
      function start() {
        var all = pool();
        // ยังไม่เคยเจอ/ยังไม่แม่น มาก่อน แต่สุ่มลำดับในกลุ่มเดียวกัน — ไม่ให้ได้ข้อเดิมซ้ำทุกรอบ
        var ordered = QL.store.orderByPriority(deckId, u.shuffle(all), function (v) { return 'vocab:' + v.id; });
        var n = cfg.count ? Math.min(cfg.count, ordered.length) : ordered.length;
        paper = u.shuffle(ordered.slice(0, n));
        checked = false;
        renderPaper();
      }

      var inputs = [];

      function renderPaper() {
        renderHead(paper.length + ' ข้อ · พิมพ์คำญี่ปุ่นของความหมายที่โจทย์ให้');
        stage.innerHTML = '';
        inputs = [];

        stage.appendChild(u.el('div', { class: 'v-paper-note' }, [
          u.el('span', { text: '✍️ พิมพ์เป็นฮิรางานะ/คาตากานะ (ตอบเป็นคันจิก็ได้) · คำต่างชาติต้องเป็นคาตากานะ · กด Enter เพื่อไปช่องถัดไป' })
        ]));

        var list = u.el('div', { class: 'v-paper' });
        paper.forEach(function (e, i) {
          var input = u.el('input', {
            class: 'search-input text-input v-answer-input', type: 'text', lang: 'ja',
            autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
            'aria-label': 'คำตอบข้อ ' + (i + 1), placeholder: 'ตอบที่นี่'
          });
          inputs.push(input);
          input.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter' && !ev.isComposing) {
              ev.preventDefault();
              if (inputs[i + 1]) inputs[i + 1].focus(); else submit();
            }
          });

          var hint = u.el('div', { class: 'v-hint', hidden: 'hidden' }, [V.pic(e)]);
          var hintBtn = u.el('button', {
            class: 'btn ghost v-hint-btn', type: 'button', text: '💡 ดูรูปช่วย',
            onclick: function () { hint.hidden = !hint.hidden; }
          });

          list.appendChild(u.el('div', { class: 'v-q', id: 'vq-' + i }, [
            u.el('div', { class: 'v-qnum', text: String(i + 1) }),
            u.el('div', { class: 'v-qmain' }, [
              u.el('div', { class: 'v-qth', text: e.th }),
              hint,
              input
            ]),
            hintBtn
          ]));
        });
        stage.appendChild(list);

        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:18px' }, [
          u.el('button', { class: 'btn primary', html: 'ตรวจข้อสอบ <span class="kbd">Ctrl+↵</span>', onclick: submit }),
          u.el('button', { class: 'btn ghost', text: 'เปลี่ยนขอบเขต', onclick: renderSetup })
        ]));
        if (inputs[0]) inputs[0].focus();
      }

      /* ---------- ตรวจ ---------- */
      function submit() {
        if (checked) return;
        var answered = inputs.filter(function (i) { return i.value.trim(); }).length;
        if (answered < paper.length && !confirm('ยังไม่ได้ตอบ ' + (paper.length - answered) + ' ข้อ ตรวจเลยไหม?')) return;
        checked = true;

        var results = paper.map(function (e, i) {
          var r = V.check(e, inputs[i].value);
          QL.store.grade(deckId, 'vocab:' + e.id, r.ok, false);
          return { e: e, input: inputs[i].value.trim(), r: r };
        });
        var score = results.filter(function (x) { return x.r.ok; }).length;
        QL.store.logSession(deckId, 'vocabtest', score, paper.length);
        renderResult(results, score);
      }

      var KIND_TEXT = {
        empty: 'ไม่ได้ตอบ',
        wrong: 'ไม่ตรงกับคำศัพท์',
        script: 'คำถูก แต่ชนิดตัวอักษรผิด — ข้อสอบจะไม่ให้คะแนน (คำต่างชาติต้องเป็นคาตากานะ / คำญี่ปุ่นต้องเป็นฮิรางานะ)',
        romaji: 'คำถูก แต่พิมพ์เป็นโรมาจิ — ข้อสอบต้องเขียนเป็นตัวญี่ปุ่น'
      };

      function renderResult(results, score) {
        renderHead('ผลการตรวจ');
        stage.innerHTML = '';
        var p = u.pct(score, paper.length);

        stage.appendChild(u.el('div', { class: 'card result-big' }, [
          u.el('div', { class: 'result-score', text: score + '/' + paper.length }),
          u.el('div', { class: 'result-label', text: p >= 90 ? 'แม่นมาก พร้อมสอบ 💪' : p >= 70 ? 'ใกล้แล้ว ทวนข้อที่ผิดอีกนิด' : 'ยังต้องท่องเพิ่ม ดูข้อที่ผิดด้านล่าง' })
        ]));

        var wrong = results.filter(function (x) { return !x.r.ok; });
        var right = results.filter(function (x) { return x.r.ok; });

        function section(title, list) {
          if (!list.length) return;
          stage.appendChild(u.el('div', { class: 'section-title' }, [
            u.el('h2', { text: title }), u.el('span', { text: list.length + ' ข้อ' })
          ]));
          var box = u.el('div', { class: 'v-result' });
          list.forEach(function (x) {
            var ok = x.r.ok;
            box.appendChild(u.el('div', { class: 'v-res ' + (ok ? 'ok' : 'bad') }, [
              V.pic(x.e),
              u.el('div', { class: 'v-body' }, [
                u.el('div', { class: 'v-th', text: (results.indexOf(x) + 1) + '. ' + x.e.th }),
                V.japaneseBlock(x.e),
                ok ? null : u.el('div', { class: 'v-yours' }, [
                  u.el('span', { text: 'คุณตอบ: ' }),
                  u.el('strong', { text: x.input || '—' }),
                  u.el('div', { class: 'v-note', text: KIND_TEXT[x.r.kind] })
                ]),
                ok && x.e.note ? u.el('div', { class: 'v-note', text: x.e.note }) : null
              ]),
              u.el('div', { class: 'v-mark', text: ok ? '✓' : '✗' })
            ]));
          });
          stage.appendChild(box);
        }

        section('ข้อที่ต้องทบทวน', wrong);
        section('ตอบถูก', right);

        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:18px' }, [
          u.el('button', { class: 'btn primary', text: 'สุ่มชุดใหม่', onclick: start }),
          wrong.length ? u.el('button', {
            class: 'btn', text: 'ทำเฉพาะข้อที่ผิดซ้ำ', onclick: function () {
              paper = u.shuffle(wrong.map(function (x) { return x.e; }));
              checked = false;
              renderPaper();
            }
          }) : null,
          u.el('button', { class: 'btn ghost', text: 'เปลี่ยนขอบเขต', onclick: renderSetup }),
          u.el('button', { class: 'btn ghost', text: 'กลับหน้าบทเรียน', onclick: ctx.back })
        ]));
      }

      ctx.onKey(function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && paper.length && !checked && inputs.length) {
          e.preventDefault();
          submit();
        }
      });

      renderSetup();
    }
  });
})();
