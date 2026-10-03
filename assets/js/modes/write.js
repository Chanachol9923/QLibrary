/* =========================================================
   QLibrary / modes / write.js
   โหมด "ทดสอบเขียน" — อ่านโจทย์แล้วพิมพ์โค้ดเอง ระบบตรวจให้

   การตรวจใช้การ normalize ก่อนเทียบ (ตัดช่องว่างเกิน, ไม่สนตัวพิมพ์เล็กใหญ่,
   ' กับ " ถือว่าเหมือนกัน) เพราะเป้าหมายคือวัดว่า "จำโครงสร้างได้ไหม"
   ไม่ใช่จับผิดช่องว่าง

   คีย์ลัด: Ctrl+Enter ตรวจคำตอบ / ไปข้อถัดไป
   ========================================================= */
(function () {
  var u = QL.util;

  QL.modes.register({
    id: 'write',
    name: 'ทดสอบเขียน',
    icon: '⌨️',
    description: 'อ่านโจทย์แล้วพิมพ์คำตอบเอง ระบบตรวจให้ทันที พร้อมใบ้และเฉลย',
    available: function (pack) { return pack.write.length > 0; },

    mount: function (root, ctx) {
      var pack = ctx.pack;
      var deckId = ctx.deckId;
      var isText = pack.answerStyle === 'text';     // วิชาภาษา → ตรวจแบบข้อความ ไม่ใช่แบบโค้ด
      var norm = u.normalizerFor(pack);
      var codeClass = 'code' + (isText ? ' lang' : '');

      var tasks = QL.store.orderByPriority(deckId, pack.write, function (w) { return 'write:' + w.id; });
      var idx = 0;
      var checked = false;
      var score = 0;

      var head = u.el('div', { class: 'study-head' });
      var stage = u.el('div', { class: 'study-stage' });
      root.appendChild(head);
      root.appendChild(stage);

      var input = null;

      function renderHead() {
        head.innerHTML = '';
        head.appendChild(u.el('div', {}, [
          u.el('h2', { style: 'margin:0;font-size:19px', text: '⌨️ ทดสอบเขียน' }),
          u.el('div', { class: 'study-meta', text: 'ข้อ ' + Math.min(idx + 1, tasks.length) + ' / ' + tasks.length + ' · ผ่าน ' + score + ' ข้อ' })
        ]));
        head.appendChild(u.el('button', { class: 'btn ghost', text: '← กลับ', onclick: ctx.back }));
      }

      function render() {
        renderHead();
        stage.innerHTML = '';
        checked = false;

        if (idx >= tasks.length) return renderSummary();

        var t = tasks[idx];

        var card = u.el('div', { class: 'prompt-card' });
        card.appendChild(u.el('div', { class: 'prompt-topic', text: t.topic || pack.title }));
        card.appendChild(u.el('div', { class: 'prompt-text',
          html: highlightBlanks(isText ? u.miniJP(t.prompt, true) : u.mini(t.prompt)) }));
        if (t.given) card.appendChild(u.jpBlock(t.given, codeClass, isText));
        stage.appendChild(card);

        input = u.el('textarea', {
          class: 'code-input' + (isText ? ' text-input' : ''),
          spellcheck: 'false',
          placeholder: isText ? 'พิมพ์คำตอบที่นี่...' : 'พิมพ์โค้ดของคุณที่นี่...'
        });
        stage.appendChild(u.el('div', { style: 'margin-top:14px' }, [input]));

        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:12px' }, [
          u.el('button', { class: 'btn primary', html: 'ตรวจคำตอบ <span class="kbd">Ctrl+↵</span>', onclick: check }),
          t.hint ? u.el('button', { class: 'btn', text: '💡 ขอคำใบ้', onclick: showHint }) : null,
          u.el('button', { class: 'btn ghost', text: 'ยอมแพ้ ดูเฉลย', onclick: giveUp })
        ]));

        stage.appendChild(u.el('div', { id: 'write-result' }));

        stage.appendChild(u.el('div', { style: 'margin-top:18px' }, [
          u.bar(idx, tasks.length, { label: 'ความคืบหน้า', text: idx + '/' + tasks.length })
        ]));

        input.focus();
      }

      /** ทำช่องว่าง（　）ในโจทย์เติมคำช่วยให้เห็นชัดขึ้น */
      function highlightBlanks(html) {
        return html.replace(/（[\s　]*）/g, '<span class="blank">（　）</span>');
      }

      function resultBox() { return u.$('#write-result', stage); }

      function showHint() {
        var t = tasks[idx];
        var box = resultBox();
        if (u.$('.hint', box)) return;
        box.appendChild(u.el('div', { class: 'hint', html: '<b>คำใบ้:</b> ' + u.mini(t.hint) }));
      }

      /** คำตอบถูกไหม — ผ่านถ้าตรงกับรูปแบบใดรูปแบบหนึ่งที่ยอมรับ */
      function isCorrect(t, raw) {
        var got = norm(raw);
        if (!got) return false;
        var accepted = (t.answers && t.answers.length ? t.answers : [t.sample]);
        return accepted.some(function (a) {
          return norm(a) === got;
        });
      }

      function check() {
        if (checked) return next();

        var t = tasks[idx];
        var raw = input.value;
        if (!raw.trim()) return u.toast('ยังไม่ได้พิมพ์อะไรเลย');

        var ok = isCorrect(t, raw);
        finish(ok, raw);
      }

      function giveUp() {
        if (checked) return;
        finish(false, input.value, true);
      }

      function finish(ok, raw, surrendered) {
        checked = true;
        var t = tasks[idx];
        if (ok) score++;
        QL.store.grade(deckId, 'write:' + t.id, ok, false);

        var box = resultBox();
        box.innerHTML = '';

        box.appendChild(u.el('div', { class: 'feedback ' + (ok ? 'ok' : 'bad') }, [
          u.el('strong', {
            text: ok ? '✓ ถูกต้อง!' : (surrendered ? 'เฉลยข้อนี้' : '✗ ยังไม่ตรง ลองเทียบกับเฉลยดู')
          }),
          u.el('span', { html: u.mini(t.explain || 'เทียบกับเฉลยด้านล่างว่าต่างกันตรงไหน') })
        ]));

        box.appendChild(u.el('div', { style: 'margin-top:12px' }, [
          u.el('div', { class: 'study-meta', text: 'เฉลย' }),
          u.jpBlock(t.sample, codeClass, isText)
        ]));

        if (!ok && raw.trim()) {
          box.appendChild(u.el('div', { style: 'margin-top:10px' }, [
            u.el('div', { class: 'study-meta', text: 'คำตอบของคุณ' }),
            u.jpBlock(raw.trim(), codeClass, isText)
          ]));
        }

        box.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:14px' }, [
          u.el('button', {
            class: 'btn primary',
            html: (idx + 1 >= tasks.length ? 'ดูผลสรุป' : 'ข้อถัดไป') + ' <span class="kbd">Ctrl+↵</span>',
            onclick: next
          }),
          !ok ? u.el('button', {
            class: 'btn', text: 'ลองข้อนี้ใหม่', onclick: function () { render(); }
          }) : null
        ]));
      }

      function next() {
        idx++;
        render();
      }

      function renderSummary() {
        QL.store.logSession(deckId, 'write', score, tasks.length);
        var p = u.pct(score, tasks.length);

        stage.appendChild(u.el('div', { class: 'card result-big' }, [
          u.el('div', { class: 'result-score', text: score + '/' + tasks.length }),
          u.el('div', { class: 'result-label', text: p >= 80 ? 'เขียนเองได้แล้ว 💪' : 'ทวนเฉลยอีกรอบแล้วลองใหม่' })
        ]));

        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:18px' }, [
          u.el('button', {
            class: 'btn primary', text: 'ทำอีกรอบ', onclick: function () {
              tasks = QL.store.orderByPriority(deckId, pack.write, function (w) { return 'write:' + w.id; });
              idx = 0; score = 0; render();
            }
          }),
          u.el('button', { class: 'btn ghost', text: 'กลับหน้าบทเรียน', onclick: ctx.back })
        ]));
      }

      ctx.onKey(function (e) {
        if (idx >= tasks.length) return;
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          checked ? next() : check();
        }
      });

      render();
    }
  });
})();
