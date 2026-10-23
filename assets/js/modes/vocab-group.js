/* =========================================================
   QLibrary / modes / vocab-group.js
   โหมด "ควิซตามหมวด" — แยกศัพท์เป็นหมวด (อาหาร, ยานพาหนะ, เวลา ...)
   แต่ละหมวดมีควิซของตัวเอง ทำทีละหมวดจนแม่น แล้วค่อยไปหมวดถัดไป

   หมวดมาจาก field group ของศัพท์แต่ละคำ
     - เลือก "ทุกบท"   → หมวดชื่อเดียวกันข้ามบทรวมเป็นหมวดเดียว (เช่น กริยา บท 4+5+6)
     - เลือกบทที่ N    → เฉพาะหมวดของบทนั้น

   ควิซมี 2 แบบ
     เลือกตอบ    — คละทิศ ไทย→ญี่ปุ่น / ญี่ปุ่น→ไทย 4 ตัวเลือก (ตัวหลอกมาจากหมวดเดียวกันก่อน)
     พิมพ์คำตอบ  — ไทย→ญี่ปุ่น พิมพ์เองเหมือนข้อสอบตอนที่ 1 (ตรวจชนิดตัวอักษรด้วย)

   ผลตอบเข้าระบบ Leitner ร่วมกับโหมดฝึกจำศัพท์ (id เดียวกัน 'vocab:<id>')
   คะแนนดีที่สุดของแต่ละหมวดจำไว้ในเครื่อง

   คีย์ลัด: 1-4 เลือกตอบ · Enter ตรวจ/ข้อถัดไป
   ========================================================= */
(function () {
  var u = QL.util;
  var V = QL.vocab;

  QL.modes.register({
    id: 'vocabgroup',
    name: 'ควิซตามหมวด',
    icon: '🧩',
    description: 'แยกศัพท์เป็นหมวด (อาหาร ยานพาหนะ เวลา ...) แต่ละหมวดมีควิซของตัวเอง ทั้งแบบเลือกตอบและพิมพ์ มีเสียงอ่าน 🔊',
    available: function (pack) { return pack.vocab.length > 0; },

    mount: function (root, ctx) {
      var pack = ctx.pack;
      var deckId = ctx.deckId;
      var itemId = function (v) { return 'vocab:' + v.id; };

      var ch = null;                                        // null = ทุกบท
      var style = QL.store.setting('vgStyle') || 'choice';  // 'choice' | 'type'
      var group = null;                                     // { key, name, items }
      var qs = [];                                          // ข้อสอบรอบนี้
      var idx = 0;
      var answered = false;
      var score = 0;
      var wrong = [];
      var typedInput = null;

      var head = u.el('div', { class: 'study-head' });
      var stage = u.el('div', { class: 'study-stage' });
      root.appendChild(head);
      root.appendChild(stage);

      /* =====================================================
         จัดหมวด
         ===================================================== */
      function pool() {
        return pack.vocab.filter(function (v) { return ch === null || (v.ch || 1) === ch; });
      }

      /** [{ key, name, chs: [], items: [] }] — รวมตามชื่อหมวดในขอบเขตที่เลือก */
      function groupList() {
        var order = [], map = {};
        pool().forEach(function (v) {
          var name = v.group || 'อื่น ๆ';
          if (!map[name]) { map[name] = { key: (ch || 'all') + '|' + name, name: name, chs: [], items: [] }; order.push(map[name]); }
          var g = map[name];
          if (g.chs.indexOf(v.ch || 1) < 0) g.chs.push(v.ch || 1);
          g.items.push(v);
        });
        return order;
      }

      function bestMap() {
        var all = QL.store.setting('vgBest') || {};
        return all[deckId] || {};
      }

      function saveBest(key, s, total) {
        var all = QL.store.setting('vgBest') || {};
        var mine = all[deckId] || {};
        var p = u.pct(s, total);
        if (!mine[key] || p > mine[key]) mine[key] = p;
        all[deckId] = mine;
        QL.store.setting('vgBest', all);
      }

      function mastered(items) {
        return items.filter(function (v) { return (QL.store.item(deckId, itemId(v)).box || 0) >= 3; }).length;
      }

      function renderHead(meta, backFn) {
        head.innerHTML = '';
        head.appendChild(u.el('div', {}, [
          u.el('h2', { style: 'margin:0;font-size:19px', text: '🧩 ควิซตามหมวด' + (group ? ' · ' + group.name : '') }),
          u.el('div', { class: 'study-meta', text: meta })
        ]));
        head.appendChild(u.el('button', { class: 'btn ghost', text: '← ' + (backFn ? 'เลือกหมวด' : 'กลับ'), onclick: backFn || ctx.back }));
      }

      /* =====================================================
         หน้าเลือกหมวด
         ===================================================== */
      function renderPicker() {
        group = null;
        var groups = groupList();
        renderHead(groups.length + ' หมวด · ' + pool().length + ' คำ — เลือกหมวดที่อยากฝึก');
        stage.innerHTML = '';

        stage.appendChild(V.chapterChips(pack, ch, function (c) { ch = c; renderPicker(); }));

        var seg = u.el('div', { class: 'seg', role: 'group', 'aria-label': 'แบบควิซ' });
        [['choice', 'เลือกตอบ'], ['type', 'พิมพ์คำตอบ (เหมือนข้อสอบ)']].forEach(function (o) {
          seg.appendChild(u.el('button', {
            type: 'button', class: style === o[0] ? 'active' : '', text: o[1],
            onclick: function () { style = o[0]; QL.store.setting('vgStyle', style); renderPicker(); }
          }));
        });
        stage.appendChild(u.el('div', { class: 'v-controls' }, [
          u.el('div', { class: 'v-seg-wrap' }, [u.el('span', { class: 'v-seg-label', text: 'แบบควิซ' }), seg])
        ]));

        var best = bestMap();
        var grid = u.el('div', { class: 'vg-grid' });
        groups.forEach(function (g) {
          var m = mastered(g.items);
          var b = best[g.key];
          var preview = u.el('div', { class: 'vg-pics' });
          g.items.slice(0, 4).forEach(function (v) { preview.appendChild(V.pic(v, 'vg-pic')); });

          var tile = u.el('button', { class: 'card vg-tile' + (m === g.items.length ? ' done' : ''), type: 'button' }, [
            preview,
            u.el('div', { class: 'vg-name', text: g.name }),
            u.el('div', { class: 'vg-meta', text: g.items.length + ' คำ · บทที่ ' + g.chs.join(', ') }),
            u.bar(m, g.items.length, { label: 'แม่นแล้ว', text: m + '/' + g.items.length }),
            u.el('div', { class: 'vg-best', text: b !== undefined ? 'คะแนนดีสุด ' + b + '%' : 'ยังไม่เคยทำ' })
          ]);
          tile.addEventListener('click', function () { start(g); });
          grid.appendChild(tile);
        });
        stage.appendChild(grid);
      }

      /* =====================================================
         ควิซ
         ===================================================== */
      function start(g, onlyItems) {
        group = g;
        var items = u.shuffle(onlyItems || g.items);
        qs = items.map(function (v) {
          var dir = style === 'type' ? 'type' : (Math.random() < 0.5 ? 'th2jp' : 'jp2th');
          return { v: v, dir: dir, choices: dir === 'type' ? null : buildChoices(v, dir) };
        });
        idx = 0; score = 0; wrong = [];
        renderQuestion();
      }

      /** ตัวเลือก 4 ข้อ — ตัวหลอกจากหมวดเดียวกันก่อน ไม่พอค่อยดึงจากบทเดียวกัน แล้วค่อยทั้ง pack */
      function buildChoices(v, dir) {
        var label = function (x) { return dir === 'th2jp' ? x.kana : x.th; };
        var seen = {};
        seen[label(v)] = 1;
        var picks = [];
        [group.items, pack.vocab.filter(function (x) { return (x.ch || 1) === (v.ch || 1); }), pack.vocab].forEach(function (src) {
          u.shuffle(src).forEach(function (x) {
            if (picks.length >= 3 || x === v) return;
            var l = label(x);
            if (seen[l]) return;
            seen[l] = 1;
            picks.push(x);
          });
        });
        return u.shuffle([v].concat(picks));
      }

      function renderQuestion() {
        answered = false;
        typedInput = null;
        renderHead('ข้อ ' + Math.min(idx + 1, qs.length) + ' / ' + qs.length + ' · ถูก ' + score + ' ข้อ', renderPicker);
        stage.innerHTML = '';
        if (idx >= qs.length) return renderSummary();

        var q = qs[idx];
        var v = q.v;
        var card = u.el('div', { class: 'prompt-card v-flash' });
        card.appendChild(u.el('div', { class: 'prompt-topic', text: 'บทที่ ' + (v.ch || 1) + ' · ' + (v.group || '') + ' · ' +
          (q.dir === 'jp2th' ? 'ญี่ปุ่น → ไทย' : 'ไทย → ญี่ปุ่น') }));

        if (q.dir === 'jp2th') {
          // โชว์คำญี่ปุ่น + เสียงอ่าน ซ่อนรูปไว้ก่อน (รูปบอกความหมาย)
          card.appendChild(V.japaneseBlock(v, 'lg'));
          card.appendChild(V.speakBtn(v));
        } else {
          card.appendChild(V.pic(v, 'v-pic-lg'));
          card.appendChild(u.el('div', { class: 'v-ask', text: v.th }));
          if (q.dir === 'type') {
            card.appendChild(u.el('div', { class: 'study-meta', style: 'margin-top:6px',
              text: 'เขียนเป็น ' + V.SCRIPT_LABEL[V.script(v)] }));
          }
        }
        stage.appendChild(card);

        if (q.dir === 'type') {
          typedInput = u.el('input', {
            class: 'search-input text-input vg-input', type: 'text', autocomplete: 'off', autocapitalize: 'off',
            spellcheck: 'false', placeholder: 'พิมพ์คำญี่ปุ่นที่นี่ แล้วกด Enter'
          });
          typedInput.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter') { ev.preventDefault(); answered ? next() : checkTyped(); }
          });
          stage.appendChild(u.el('div', { style: 'margin-top:14px' }, [typedInput]));
          stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:12px' }, [
            u.el('button', { class: 'btn primary', html: 'ตรวจคำตอบ <span class="kbd">↵</span>', onclick: checkTyped }),
            u.el('button', { class: 'btn ghost', text: 'ไม่รู้ ดูเฉลย', onclick: function () { finish(false, 'ยอมแพ้'); } })
          ]));
          setTimeout(function () { typedInput.focus(); }, 0);
        } else {
          var box = u.el('div', { class: 'vg-choices', style: 'margin-top:14px' });
          q.choices.forEach(function (c, i) {
            var inner = q.dir === 'th2jp'
              ? [u.el('span', { class: 'vg-c-kana', text: c.kana }),
                 V.romaji(c.kana) ? u.el('span', { class: 'vg-c-rom', text: V.romaji(c.kana) }) : null]
              : [u.el('span', { text: c.th })];
            var btn = u.el('button', { class: 'choice', type: 'button', 'data-i': i }, [
              u.el('span', { class: 'choice-key', text: String(i + 1) }),
              u.el('span', { class: 'vg-c-body' }, inner)
            ]);
            btn.addEventListener('click', function () { pick(i); });
            box.appendChild(btn);
          });
          stage.appendChild(box);
        }

        stage.appendChild(u.el('div', { id: 'vg-result' }));
        stage.appendChild(u.el('div', { style: 'margin-top:18px' }, [
          u.bar(idx, qs.length, { label: 'ความคืบหน้า', text: idx + '/' + qs.length })
        ]));
      }

      function pick(i) {
        if (answered) return;
        var q = qs[idx];
        var ok = q.choices[i] === q.v;
        u.$$('.vg-choices .choice', stage).forEach(function (b, j) {
          b.disabled = true;
          if (q.choices[j] === q.v) b.classList.add('correct');
          else if (j === i) b.classList.add('wrong');
        });
        finish(ok);
      }

      function checkTyped() {
        if (answered || !typedInput) return;
        var r = V.check(qs[idx].v, typedInput.value);
        if (r.kind === 'empty') return u.toast('ยังไม่ได้พิมพ์อะไรเลย');
        var msg = r.kind === 'script' ? 'คำถูก แต่ผิดชนิดตัวอักษร — ต้องเขียนเป็น ' + V.SCRIPT_LABEL[V.script(qs[idx].v)]
          : r.kind === 'romaji' ? 'คำถูก แต่พิมพ์เป็นโรมาจิ — ในข้อสอบต้องเขียนตัวญี่ปุ่น' : '';
        typedInput.disabled = true;
        finish(r.ok, msg);
      }

      /** เฉลย: รูป + ญี่ปุ่น + โรมาจิ + ไทย + 🔊 ครบทุกอย่าง แล้วเล่นเสียงให้เลย */
      function finish(ok, msg) {
        answered = true;
        var v = qs[idx].v;
        if (ok) score++; else wrong.push(v);
        QL.store.grade(deckId, itemId(v), ok, false);

        var box = u.$('#vg-result', stage);
        box.innerHTML = '';
        box.appendChild(u.el('div', { class: 'feedback ' + (ok ? 'ok' : 'bad') }, [
          u.el('strong', { text: ok ? '✓ ถูกต้อง!' : '✗ ยังไม่ถูก' }),
          msg ? u.el('span', { text: msg }) : null
        ]));
        box.appendChild(u.el('div', { class: 'card vg-answer' }, [
          V.pic(v),
          u.el('div', { class: 'v-body' }, [
            V.japaneseBlock(v),
            u.el('div', { class: 'v-th', text: v.th }),
            v.note ? u.el('div', { class: 'v-note', text: v.note }) : null
          ]),
          V.speakBtn(v)
        ]));
        box.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:12px' }, [
          u.el('button', { class: 'btn primary', html: (idx + 1 >= qs.length ? 'ดูผลสรุป' : 'ข้อถัดไป') + ' <span class="kbd">↵</span>', onclick: next })
        ]));
        if (V.canSpeak && QL.store.setting('vgAutoSpeak') !== false) V.speak(v.kana);
      }

      function next() { idx++; renderQuestion(); }

      function renderSummary() {
        QL.store.logSession(deckId, 'vocabgroup', score, qs.length);
        saveBest(group.key, score, qs.length);
        var p = u.pct(score, qs.length);
        renderHead('จบหมวด ' + group.name, renderPicker);

        stage.appendChild(u.el('div', { class: 'card result-big' }, [
          u.el('div', { class: 'result-score', text: score + '/' + qs.length }),
          u.el('div', { class: 'result-label', text: p === 100 ? 'หมวดนี้แม่นแล้ว 🎉 ไปหมวดถัดไปได้เลย' : p >= 80 ? 'เกือบแม่นแล้ว ทวนคำที่ผิดอีกนิด' : 'ทวนคำที่ผิดแล้วลองใหม่' })
        ]));

        if (wrong.length) {
          stage.appendChild(u.el('div', { class: 'section-title' }, [
            u.el('h2', { text: 'คำที่ยังผิด' }), u.el('span', { text: wrong.length + ' คำ · แตะ 🔊 ฟังเสียง' })
          ]));
          var grid = u.el('div', { class: 'v-grid' });
          wrong.forEach(function (v) {
            grid.appendChild(u.el('div', { class: 'vcard revealed' }, [
              V.pic(v),
              u.el('div', { class: 'v-body' }, [V.japaneseBlock(v), u.el('div', { class: 'v-th', text: v.th })]),
              V.speakBtn(v)
            ]));
          });
          stage.appendChild(grid);
        }

        var missed = wrong.slice();
        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:18px' }, [
          missed.length ? u.el('button', { class: 'btn primary', text: 'ทำเฉพาะคำที่ผิด (' + missed.length + ')', onclick: function () { start(group, missed); } }) : null,
          u.el('button', { class: missed.length ? 'btn' : 'btn primary', text: 'ทำหมวดนี้อีกรอบ', onclick: function () { start(group); } }),
          u.el('button', { class: 'btn ghost', text: 'เลือกหมวดอื่น', onclick: renderPicker })
        ]));
      }

      ctx.onKey(function (e) {
        if (!group || idx >= qs.length) return;
        var q = qs[idx];
        if (q.dir !== 'type' && !answered && /^[1-4]$/.test(e.key)) {
          var i = Number(e.key) - 1;
          if (i < q.choices.length) pick(i);
        } else if (answered && e.key === 'Enter') {
          e.preventDefault(); next();
        }
      });

      renderPicker();
    }
  });
})();
