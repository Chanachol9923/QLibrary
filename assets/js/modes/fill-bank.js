/* =========================================================
   QLibrary / modes / fill-bank.js
   โหมด "เติมคำ a–t" — ฝึกข้อสอบแบบ "เลือกคำที่กำหนดให้ a–t มาเติมในประโยค"

   มี 2 แบบ
     🎯 ฝึกทีละข้อ   — ทีละประโยค เลือกจาก 6 คำ (มีความหมายกำกับ) ตอบแล้วเห็นเฉลยทันที
                       พร้อมประโยคเต็ม คำแปล "ทำไมถึงเป็นคำนี้" และเสียงอ่าน  ← ใช้ทำความเข้าใจ
     📄 ทำทั้งชุด     — เหมือนกระดาษข้อสอบ: 20 ประโยค + คลังคำ a–t ติดขอบบน ตรวจทีเดียว
                       มีปุ่ม 💡 ช่วยรายข้อ และเลือกโชว์/ซ่อนความหมายคำในคลังได้ ← ใช้วัดผล

   ข้อมูล
     pack.fill[]   = { id, ch, page, text: 'ประโยค （　） 1 ช่อง (\n = ขึ้นบรรทัด)', answer, alt: [], th, clue }
     pack.fillGloss = { 'คำ': 'ความหมาย' } — ความหมายของคำในคลัง

   กันโจทย์กำกวม: ในชุดเดียวกัน คำตอบไม่ซ้ำ และคำตอบของข้อหนึ่งต้องไม่อยู่ใน alt ของอีกข้อ
   → ทุกช่องมีคำถูกในคลัง/ตัวเลือกได้คำเดียว
   ========================================================= */
(function () {
  var u = QL.util;
  var BLANK = /（[\s　]*）/;
  var LETTERS = 'abcdefghijklmnopqrstuvwxyz';

  QL.modes.register({
    id: 'fillbank',
    name: 'เติมคำ a–t',
    icon: '🔡',
    description: 'ฝึกเติมคำในประโยค — ทีละข้อพร้อมคำอธิบาย "ทำไมถึงเป็นคำนี้" หรือทำทั้งชุด 20 ข้อ + คลังคำ a–t เหมือนข้อสอบจริง',
    available: function (pack) { return pack.fill.length >= 4; },

    mount: function (root, ctx) {
      var pack = ctx.pack;
      var deckId = ctx.deckId;
      var V = QL.vocab;
      var gloss = pack.fillGloss || {};

      var cfg = {
        ch: null,
        style: QL.store.setting('fillStyle') || 'step',        // 'step' | 'paper'
        count: QL.store.setting('fillCount') || 20,
        showGloss: QL.store.setting('fillShowGloss') !== false
      };

      var head = u.el('div', { class: 'study-head' });
      var stage = u.el('div', { class: 'study-stage' });
      root.appendChild(head);
      root.appendChild(stage);

      /* =====================================================
         ข้อมูล
         ===================================================== */
      function chapters() {
        var seen = {}, list = [];
        pack.fill.forEach(function (f) { if (!seen[f.ch]) { seen[f.ch] = 1; list.push(f.ch); } });
        return list.sort(function (a, b) { return a - b; });
      }

      function pool() { return pack.fill.filter(function (f) { return cfg.ch === null || f.ch === cfg.ch; }); }

      function okWords(f) { return [f.answer].concat(f.alt || []); }

      function isRight(f, word) { return word !== null && word !== undefined && okWords(f).indexOf(word) >= 0; }

      /** สุ่มชุด: คำตอบไม่ซ้ำ และไม่ชนกับ alt ของข้ออื่น */
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

      /** ตัวเลือก 6 คำของข้อ f (โหมดทีละข้อ) — ตัวหลอกต้องไม่ใช่คำที่เติมแล้วก็ถูก */
      function choicesFor(f) {
        var ok = okWords(f), seen = {}, out = [f.answer];
        seen[f.answer] = 1;
        // ตัวหลอกจากบทเดียวกันก่อน (หน้าตาใกล้เคียงกว่า) แล้วค่อยทุกบท
        [pack.fill.filter(function (x) { return x.ch === f.ch; }), pack.fill].forEach(function (src) {
          u.shuffle(src).forEach(function (x) {
            var w = x.answer;
            if (out.length >= 6 || seen[w] || ok.indexOf(w) >= 0) return;
            seen[w] = 1;
            out.push(w);
          });
        });
        return u.shuffle(out);
      }

      /* =====================================================
         ส่วนประกอบที่ใช้ซ้ำ
         ===================================================== */
      function renderHead(meta, backFn, backLabel) {
        head.innerHTML = '';
        head.appendChild(u.el('div', {}, [
          u.el('h2', { style: 'margin:0;font-size:19px', text: '🔡 เติมคำ a–t' }),
          u.el('div', { class: 'study-meta', text: meta })
        ]));
        head.appendChild(u.el('button', { class: 'btn ghost', text: '← ' + (backLabel || 'กลับ'), onclick: backFn || ctx.back }));
      }

      /** ประโยคที่มีช่องว่าง — blankNode = ปุ่ม/กล่องที่จะวางแทน （　） */
      function sentenceNode(f, blankNode, cls) {
        var parts = f.text.split(BLANK);
        var s = u.el('div', { class: 'fb-sentence' + (cls ? ' ' + cls : '') });
        s.appendChild(document.createTextNode(parts[0]));
        s.appendChild(blankNode);
        s.appendChild(document.createTextNode(parts.slice(1).join('（　）')));
        return s;
      }

      /** ประโยคเต็มที่เติมคำตอบแล้ว (คำตอบไฮไลต์) */
      function filledSentence(f) {
        return sentenceNode(f, u.el('mark', { class: 'fb-mark', text: f.answer }), 'fb-filled');
      }

      function romajiOf(f) {
        return f.text.split('\n').map(function (l) { return u.isJapaneseLine(l) ? u.romaji(l) : ''; })
          .filter(Boolean).join(' / ');
      }

      /** คำ + ความหมาย (ใช้ในคลังคำ / ตัวเลือก) */
      function wordBody(w, showMeaning) {
        var nodes = [u.el('span', { class: 'fb-w', text: w })];
        if (showMeaning && gloss[w]) nodes.push(u.el('span', { class: 'fb-gloss', text: gloss[w] }));
        return u.el('span', { class: 'fb-wbody' }, nodes);
      }

      /** กล่องเฉลย: ประโยคเต็ม + คำแปล + ทำไม + 🔊 */
      function explainBox(f, chosen) {
        var right = isRight(f, chosen);
        // เว้นวรรครอบคำตอบ (ภาษาญี่ปุ่นในหนังสือเว้นวรรคระหว่างคำ) — โรมาจิจะได้ไม่ติดกันเป็น "eiga omimasu"
        var full = f.text.replace(BLANK, ' ' + f.answer + ' ').replace(/ {2,}/g, ' ');
        var box = u.el('div', { class: 'fb-why ' + (right ? 'ok' : 'bad') }, [
          u.el('div', { class: 'fb-why-head', html: right
            ? '✓ ถูกต้อง' + (chosen !== f.answer ? ' <span class="study-meta">(คำตอบหลักคือ ' + u.esc(f.answer) + ')</span>' : '')
            : (chosen ? '✗ ไม่ใช่ <b>' + u.esc(chosen) + '</b>' + (gloss[chosen] ? ' <span class="study-meta">(' + u.esc(gloss[chosen]) + ')</span>' : '') + ' — ' : '✗ ') +
              'คำตอบคือ <b>' + u.esc(f.answer) + '</b>' + (gloss[f.answer] ? ' <span class="study-meta">(' + u.esc(gloss[f.answer]) + ')</span>' : '') }),
          filledSentence(f),
          romajiOf({ text: full }) ? u.el('div', { class: 'romaji', text: romajiOf({ text: full }) }) : null,
          f.th ? u.el('div', { class: 'fb-th', text: 'แปล: ' + f.th }) : null,
          f.clue ? u.el('div', { class: 'fb-clue', html: '<b>💡 ดูตรงไหน:</b> ' + u.esc(f.clue) }) : null,
          (f.alt || []).length ? u.el('div', { class: 'study-meta', text: 'ตอบ ' + f.alt.join(' / ') + ' ก็ถูกเหมือนกัน' }) : null,
          V ? V.speakTextBtn(full) : null
        ]);
        return box;
      }

      /* =====================================================
         หน้าตั้งค่า
         ===================================================== */
      function renderSetup() {
        renderHead('เลือกวิธีฝึกและขอบเขต');
        stage.innerHTML = '';

        // ---------- วิธีฝึก (การ์ดใหญ่ 2 ใบ) ----------
        var styles = u.el('div', { class: 'grid cols-2 fb-styles' });
        [
          ['step', '🎯', 'ฝึกทีละข้อ', 'ทีละประโยค เลือกจาก 6 คำ ตอบแล้วเห็นคำอธิบายทันทีว่าทำไมถึงเป็นคำนี้ — เหมาะกับตอนเริ่มทำความเข้าใจ'],
          ['paper', '📄', 'ทำทั้งชุดเหมือนข้อสอบ', 'ประโยค ' + cfg.count + ' ข้อ + คลังคำ a–t ในหน้าเดียว ตรวจทีเดียวคิดคะแนนเต็ม 10 — เหมาะกับตอนวัดผลก่อนสอบ']
        ].forEach(function (o) {
          var c = u.el('button', { class: 'card mode-card fb-style' + (cfg.style === o[0] ? ' active' : ''), type: 'button' }, [
            u.el('div', { class: 'mode-icon', text: o[1] }),
            u.el('h3', { text: o[2] }),
            u.el('p', { text: o[3] })
          ]);
          c.addEventListener('click', function () { cfg.style = o[0]; QL.store.setting('fillStyle', cfg.style); renderSetup(); });
          styles.appendChild(c);
        });
        stage.appendChild(styles);

        // ---------- ขอบเขต ----------
        var chips = u.el('div', { class: 'chips', style: 'margin-top:16px' });
        function chip(label, value, count) {
          chips.appendChild(u.el('button', {
            class: 'chip' + (cfg.ch === value ? ' active' : ''), type: 'button',
            onclick: function () { cfg.ch = value; renderSetup(); }
          }, [u.el('span', { text: label }), u.el('span', { class: 'chip-count', text: String(count) })]));
        }
        chip('ทุกบท', null, pack.fill.length);
        chapters().forEach(function (c) { chip('บทที่ ' + c, c, pack.fill.filter(function (f) { return f.ch === c; }).length); });
        stage.appendChild(chips);

        var controls = u.el('div', { class: 'v-controls' });
        if (cfg.style === 'paper') {
          var seg = u.el('div', { class: 'seg', role: 'group', 'aria-label': 'จำนวนข้อ' });
          [[10, '10 ข้อ'], [20, '20 ข้อ (เท่าข้อสอบ)']].forEach(function (o) {
            seg.appendChild(u.el('button', {
              type: 'button', class: cfg.count === o[0] ? 'active' : '', text: o[1],
              onclick: function () { cfg.count = o[0]; QL.store.setting('fillCount', cfg.count); renderSetup(); }
            }));
          });
          controls.appendChild(u.el('div', { class: 'v-seg-wrap' }, [u.el('span', { class: 'v-seg-label', text: 'จำนวนข้อ' }), seg]));

          var gseg = u.el('div', { class: 'seg', role: 'group', 'aria-label': 'ความหมายคำในคลัง' });
          [[true, 'โชว์ความหมาย'], [false, 'ซ่อน (เหมือนข้อสอบ)']].forEach(function (o) {
            gseg.appendChild(u.el('button', {
              type: 'button', class: cfg.showGloss === o[0] ? 'active' : '', text: o[1],
              onclick: function () { cfg.showGloss = o[0]; QL.store.setting('fillShowGloss', cfg.showGloss); renderSetup(); }
            }));
          });
          controls.appendChild(u.el('div', { class: 'v-seg-wrap' }, [u.el('span', { class: 'v-seg-label', text: 'ความหมายคำในคลัง' }), gseg]));
        }
        stage.appendChild(controls);

        var n = cfg.style === 'paper' ? buildPaper(pool(), cfg.count).length : pool().length;
        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:6px' }, [
          u.el('button', {
            class: 'btn primary', text: cfg.style === 'paper' ? '▶ เริ่มทำข้อสอบ (' + n + ' ข้อ)' : '▶ เริ่มฝึก (' + n + ' ข้อ)',
            disabled: n ? null : 'disabled',
            onclick: function () { cfg.style === 'paper' ? startPaper(buildPaper(pool(), cfg.count)) : startStep(pool()); }
          })
        ]));

        stage.appendChild(u.el('div', { class: 'hint', style: 'margin-top:16px', html:
          '<b>เคล็ดลับ:</b> แทบทุกข้อมีคำใบ้อยู่ <b>ติดกับช่องว่าง</b> — เช่น หลังช่องมี <b>な</b> = คุณศัพท์ な · ' +
          'หลังช่องเป็นรูปปฏิเสธ = <b>あまり / ぜんぜん</b> · คำตอบลงท้าย <b>～から</b> = คำถามใช้ <b>どうして</b> ' +
          '<br>ดูตารางเต็มได้ที่หน้า <b>อ่านสรุป → 🧭 วิธีหาคำตอบ</b>' }));
      }

      /* =====================================================
         🎯 ฝึกทีละข้อ
         ===================================================== */
      var step = null;   // { list, idx, score, wrong, picked, choices, showHint }

      function startStep(items) {
        step = { list: QL.store.orderByPriority(deckId, items, function (f) { return 'fill:' + f.id; }), idx: 0, score: 0, wrong: [] };
        renderStep();
      }

      function renderStep() {
        if (step.idx >= step.list.length) return renderStepSummary();
        var f = step.list[step.idx];
        if (!step.choices) step.choices = choicesFor(f);
        var answered = step.picked !== undefined;

        renderHead('ข้อ ' + (step.idx + 1) + ' / ' + step.list.length + ' · ถูก ' + step.score + ' ข้อ', renderSetup, 'เปลี่ยนวิธีฝึก');
        stage.innerHTML = '';

        var card = u.el('div', { class: 'prompt-card fb-step-card' });
        card.appendChild(u.el('div', { class: 'prompt-topic', text: 'บทที่ ' + f.ch + ' · หน้า ' + f.page }));
        var blank = u.el('span', {
          class: 'fb-blank big' + (answered ? (isRight(f, step.picked) ? ' right' : ' wrong') : ' active'),
          text: answered ? step.picked : '？'
        });
        card.appendChild(sentenceNode(f, blank));
        var rom = romajiOf(f);
        if (rom) card.appendChild(u.el('div', { class: 'romaji', text: rom }));
        if (V) { var sb = V.speakTextBtn(f.text); if (sb) card.appendChild(sb); }

        // ปุ่มช่วย (ก่อนตอบ)
        if (!answered) {
          var help = u.el('div', { class: 'fb-help' });
          if (step.showHint) {
            if (f.th) help.appendChild(u.el('div', { class: 'fb-th', text: 'แปล: ' + f.th }));
            if (f.clue) help.appendChild(u.el('div', { class: 'fb-clue', html: '<b>💡 ดูตรงไหน:</b> ' + u.esc(f.clue.split('→')[0]) + (f.clue.indexOf('→') > 0 ? '→ …' : '') }));
          } else {
            help.appendChild(u.el('button', { class: 'btn ghost', text: '💡 ขอคำใบ้ + คำแปล', onclick: function () { step.showHint = true; renderStep(); } }));
          }
          card.appendChild(help);
        }
        stage.appendChild(card);

        // ตัวเลือก 6 คำ พร้อมความหมาย
        var box = u.el('div', { class: 'fb-choices' });
        step.choices.forEach(function (w, i) {
          var cls = 'choice fb-choice';
          if (answered) {
            if (isRight(f, w)) cls += ' correct';
            else if (w === step.picked) cls += ' wrong';
          }
          var b = u.el('button', { class: cls, type: 'button', disabled: answered ? 'disabled' : null }, [
            u.el('span', { class: 'choice-key', text: String(i + 1) }),
            wordBody(w, true)
          ]);
          b.addEventListener('click', function () { pickStep(w); });
          box.appendChild(b);
        });
        stage.appendChild(box);

        if (answered) {
          stage.appendChild(explainBox(f, step.picked));
          stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:14px' }, [
            u.el('button', { class: 'btn primary', html: (step.idx + 1 >= step.list.length ? 'ดูผลสรุป' : 'ข้อถัดไป') + ' <span class="kbd">↵</span>', onclick: nextStep })
          ]));
        }

        stage.appendChild(u.el('div', { style: 'margin-top:18px' }, [
          u.bar(step.idx, step.list.length, { label: 'ความคืบหน้า', text: step.idx + '/' + step.list.length })
        ]));
      }

      function pickStep(w) {
        if (step.picked !== undefined) return;
        var f = step.list[step.idx];
        step.picked = w;
        var ok = isRight(f, w);
        if (ok) step.score++; else step.wrong.push(f);
        // ขอคำใบ้ก่อนตอบ = ยังไม่แม่น → นับเป็น "ไม่แน่ใจ"
        QL.store.grade(deckId, 'fill:' + f.id, ok, ok && !!step.showHint);
        renderStep();
        var why = u.$('.fb-why', stage);
        if (why && why.scrollIntoView) why.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }

      function nextStep() {
        step.idx++;
        step.picked = undefined;
        step.choices = null;
        step.showHint = false;
        renderStep();
        window.scrollTo(0, 0);
      }

      function renderStepSummary() {
        QL.store.logSession(deckId, 'fillbank-step', step.score, step.list.length);
        renderHead('จบการฝึก', renderSetup, 'เปลี่ยนวิธีฝึก');
        stage.innerHTML = '';
        var p = u.pct(step.score, step.list.length);
        stage.appendChild(u.el('div', { class: 'card result-big' }, [
          u.el('div', { class: 'result-score', text: step.score + '/' + step.list.length }),
          u.el('div', { class: 'result-label', text: p >= 90 ? 'เข้าใจแล้ว 🎉 ลองทำทั้งชุดเหมือนข้อสอบได้เลย' : 'ทวนข้อที่ผิดด้านล่าง แล้วฝึกเฉพาะข้อที่ผิดอีกรอบ' })
        ]));
        renderWrongList(step.wrong);
        var wrong = step.wrong.slice();
        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:18px' }, [
          wrong.length ? u.el('button', { class: 'btn primary', text: 'ฝึกเฉพาะข้อที่ผิด (' + wrong.length + ')', onclick: function () { startStep(wrong); } }) : null,
          u.el('button', { class: wrong.length ? 'btn' : 'btn primary', text: 'ทำทั้งชุดเหมือนข้อสอบ', onclick: function () {
            cfg.style = 'paper'; QL.store.setting('fillStyle', 'paper'); startPaper(buildPaper(pool(), cfg.count));
          } }),
          u.el('button', { class: 'btn ghost', text: 'กลับหน้าตั้งค่า', onclick: renderSetup })
        ]));
      }

      function renderWrongList(list) {
        if (!list.length) return;
        stage.appendChild(u.el('div', { class: 'section-title' }, [
          u.el('h2', { text: 'ข้อที่ผิด — อ่านคำอธิบายอีกรอบ' }), u.el('span', { text: list.length + ' ข้อ' })
        ]));
        list.forEach(function (f) { stage.appendChild(explainBox(f, null)); });
      }

      /* =====================================================
         📄 ทำทั้งชุดเหมือนข้อสอบ
         ===================================================== */
      var paper = [], bank = [], active = 0, checked = false;

      function startPaper(items) {
        paper = items.map(function (f) { return { item: f, pick: null, hint: false }; });
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

        // ---------- คลังคำ a–t (ติดขอบบน) ----------
        var used = {};
        paper.forEach(function (p) { if (p.pick !== null) used[p.pick] = 1; });
        var bankBox = u.el('div', { class: 'fb-bank' });
        bank.forEach(function (w, i) {
          var b = u.el('button', { class: 'fb-word' + (used[i] ? ' used' : ''), type: 'button', disabled: checked ? 'disabled' : null }, [
            u.el('span', { class: 'fb-letter', text: LETTERS.charAt(i) }),
            wordBody(w, cfg.showGloss)
          ]);
          b.addEventListener('click', function () { put(i); });
          bankBox.appendChild(b);
        });
        stage.appendChild(u.el('div', { class: 'fb-bank-wrap' }, [
          u.el('div', { class: 'study-meta', style: 'margin-bottom:6px',
            text: checked ? 'คลังคำ' : 'คลังคำ — แตะช่องว่าง（ ? ）ในประโยค แล้วแตะคำ · คำที่ใช้แล้วจะจางลง' }),
          bankBox
        ]));

        if (checked) renderPaperScore();

        // ---------- ประโยค ----------
        var list = u.el('ol', { class: 'fb-list' });
        paper.forEach(function (p, i) { list.appendChild(paperQuestion(p, i)); });
        stage.appendChild(list);

        if (!checked) {
          stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:16px' }, [
            u.el('button', { class: 'btn primary', text: '✓ ตรวจคำตอบ', onclick: checkPaper }),
            u.el('button', { class: 'btn ghost', text: 'ล้างทั้งหมด', onclick: function () {
              if (!filled() || confirm('ล้างคำตอบทั้งหมด?')) { paper.forEach(function (p) { p.pick = null; }); active = 0; renderPaper(); }
            } })
          ]));
        } else {
          var wrongItems = paper.filter(function (x) { return !isRight(x.item, x.pick === null ? null : bank[x.pick]); }).map(function (x) { return x.item; });
          stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:18px' }, [
            u.el('button', { class: 'btn primary', text: 'ทำชุดใหม่', onclick: function () { startPaper(buildPaper(pool(), cfg.count)); } }),
            wrongItems.length ? u.el('button', { class: 'btn', text: '🎯 ฝึกทีละข้อเฉพาะข้อที่ผิด (' + wrongItems.length + ')', onclick: function () { startStep(wrongItems); } }) : null,
            u.el('button', { class: 'btn ghost', text: 'กลับหน้าตั้งค่า', onclick: renderSetup })
          ]));
        }
      }

      function paperQuestion(p, i) {
        var f = p.item;
        var word = p.pick === null ? null : bank[p.pick];
        var right = checked && isRight(f, word);
        var cls = 'fb-blank' + (p.pick === null ? ' empty' : ' filled') + (!checked && i === active ? ' active' : '') +
          (checked ? (right ? ' right' : ' wrong') : '');
        var blank = u.el('button', {
          class: cls, type: 'button', disabled: checked ? 'disabled' : null,
          text: '（ ' + (p.pick === null ? '?' : LETTERS.charAt(p.pick) + '. ' + word) + ' ）'
        });
        blank.addEventListener('click', function () {
          if (active === i && p.pick !== null) p.pick = null;   // แตะช่องที่เลือกอยู่ซ้ำ = ล้าง
          active = i;
          renderPaper();
        });

        var li = u.el('li', { class: 'fb-q' + (checked ? (right ? ' is-right' : ' is-wrong') : '') + (!checked && i === active ? ' is-active' : '') }, [
          sentenceNode(f, blank)
        ]);
        var rom = romajiOf(f);
        if (rom) li.appendChild(u.el('div', { class: 'romaji', text: rom }));

        if (!checked) {
          // 💡 ช่วยรายข้อ: คำแปล (ซ่อนคำตอบ) + คำใบ้ว่าดูตรงไหน
          if (p.hint) {
            li.appendChild(u.el('div', { class: 'fb-help' }, [
              f.th ? u.el('div', { class: 'fb-th', text: 'แปล: ' + f.th }) : null,
              f.clue ? u.el('div', { class: 'fb-clue', html: '<b>💡 ดูตรงไหน:</b> ' + u.esc(f.clue.split('→')[0]) + (f.clue.indexOf('→') > 0 ? '→ …' : '') }) : null
            ]));
          } else {
            li.appendChild(u.el('button', { class: 'fb-hint-btn', type: 'button', text: '💡 ช่วย', onclick: function () { p.hint = true; renderPaper(); } }));
          }
        } else if (!right) {
          li.appendChild(explainBox(f, word));
        } else {
          li.appendChild(u.el('div', { class: 'fb-th', text: 'แปล: ' + (f.th || '') }));
        }
        return li;
      }

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
        var a = u.$('.fb-blank.active', stage);
        if (a && a.scrollIntoView) a.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }

      function checkPaper() {
        var empty = paper.length - filled();
        if (empty && !confirm('ยังเหลือช่องว่าง ' + empty + ' ข้อ ตรวจเลยไหม?')) return;
        checked = true;
        paper.forEach(function (p) {
          QL.store.grade(deckId, 'fill:' + p.item.id, isRight(p.item, p.pick === null ? null : bank[p.pick]), p.hint);
        });
        renderPaper();
        window.scrollTo(0, 0);
      }

      function renderPaperScore() {
        var score = paper.filter(function (p) { return isRight(p.item, p.pick === null ? null : bank[p.pick]); }).length;
        var hints = paper.filter(function (p) { return p.hint; }).length;
        QL.store.logSession(deckId, 'fillbank', score, paper.length);
        var pc = u.pct(score, paper.length);
        stage.appendChild(u.el('div', { class: 'card result-big', style: 'margin:4px 0 10px' }, [
          u.el('div', { class: 'result-score', text: score + '/' + paper.length }),
          u.el('div', { class: 'result-label', text:
            (paper.length === 20 ? 'คิดเป็น ' + (score / 2) + ' / 10 คะแนน · ' : '') +
            (hints ? 'ใช้ตัวช่วย ' + hints + ' ข้อ · ' : '') +
            (pc >= 90 ? 'พร้อมสอบแล้ว 🎉' : pc >= 70 ? 'ดีแล้ว อ่านคำอธิบายข้อที่ผิดด้านล่าง' : 'อ่านคำอธิบายข้อที่ผิด แล้วฝึกทีละข้ออีกรอบ') })
        ]));
      }

      /* =====================================================
         คีย์ลัด
         ===================================================== */
      ctx.onKey(function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        // ทีละข้อ: 1-6 เลือก · Enter ข้อถัดไป
        if (step && step.idx < step.list.length && u.$('.fb-step-card', stage)) {
          if (step.picked === undefined && /^[1-6]$/.test(e.key)) {
            var w = step.choices[Number(e.key) - 1];
            if (w) { e.preventDefault(); pickStep(w); }
          } else if (step.picked !== undefined && e.key === 'Enter') {
            e.preventDefault(); nextStep();
          }
          return;
        }
        // ทั้งชุด: a–t เลือกคำในคลัง (R สงวนให้ปุ่มซ่อนโรมาจิ)
        if (paper.length && !checked && u.$('.fb-bank', stage)) {
          var m = /^Key([A-Z])$/.exec(e.code || '');
          if (!m || m[1] === 'R') return;
          var i = LETTERS.indexOf(m[1].toLowerCase());
          if (i >= 0 && i < bank.length) { e.preventDefault(); put(i); }
        }
      });

      renderSetup();
    }
  });
})();
