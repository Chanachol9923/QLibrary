/* =========================================================
   QLibrary / modes / quiz.js
   โหมด "ควิซ" — ปรนัย 4 ตัวเลือก ตอบแล้วเฉลยทันทีพร้อมคำอธิบาย
   จบรอบมีสรุปคะแนน + ทบทวนเฉพาะข้อที่ผิด

   คีย์ลัด: 1-4 เลือกคำตอบ, Enter ไปข้อถัดไป
   ========================================================= */
(function () {
  var u = QL.util;
  var QUIZ_SIZE = 10;          // จำนวนข้อต่อ 1 รอบ (ถ้าคลังมีน้อยกว่านี้ก็ใช้เท่าที่มี)

  QL.modes.register({
    id: 'quiz',
    name: 'ควิซ',
    icon: '🎯',
    description: 'ปรนัยพร้อมเฉลยทันที จบรอบมีสรุปคะแนนและทบทวนข้อที่ผิด',
    available: function (pack) { return pack.quiz.length > 0; },

    mount: function (root, ctx) {
      var pack = ctx.pack;
      var isText = pack.answerStyle === 'text';
      var codeClass = 'code' + (isText ? ' lang' : '');
      function jp(text) { return isText ? u.miniJP(text, true) : u.mini(text); }
      var deckId = ctx.deckId;

      var questions = [];
      var idx = 0;
      var answered = false;
      var score = 0;
      var wrongList = [];
      var order = [];              // ลำดับตัวเลือกที่สลับแล้วของข้อปัจจุบัน

      var head = u.el('div', { class: 'study-head' });
      var stage = u.el('div', { class: 'study-stage' });
      root.appendChild(head);
      root.appendChild(stage);

      function startRound(pool) {
        var ordered = QL.store.orderByPriority(deckId, pool, function (q) { return 'quiz:' + q.id; });
        questions = ordered.slice(0, Math.min(QUIZ_SIZE, ordered.length));
        questions = u.shuffle(questions);
        idx = 0; score = 0; answered = false; wrongList = [];
        render();
      }

      function renderHead() {
        head.innerHTML = '';
        head.appendChild(u.el('div', {}, [
          u.el('h2', { style: 'margin:0;font-size:19px', text: '🎯 ควิซ' }),
          u.el('div', { class: 'study-meta', text: 'ข้อ ' + Math.min(idx + 1, questions.length) + ' / ' + questions.length + ' · ได้ ' + score + ' คะแนน' })
        ]));
        head.appendChild(u.el('button', { class: 'btn ghost', text: '← กลับ', onclick: ctx.back }));
      }

      function render() {
        renderHead();
        stage.innerHTML = '';

        if (idx >= questions.length) return renderSummary();

        var q = questions[idx];

        // สลับตัวเลือกทุกครั้ง กันจำตำแหน่งคำตอบ
        order = u.shuffle(q.choices.map(function (c, i) { return i; }));

        var card = u.el('div', { class: 'prompt-card' });
        card.appendChild(u.el('div', { class: 'prompt-topic', text: q.topic || pack.title }));
        card.appendChild(u.el('div', { class: 'prompt-text', html: jp(q.question) }));
        if (isText && QL.vocab) { var sb = QL.vocab.speakTextBtn(q.question); if (sb) card.appendChild(sb); }
        if (q.code) card.appendChild(u.jpBlock(q.code, codeClass, isText));
        stage.appendChild(card);

        var box = u.el('div', { style: 'margin-top:14px' });
        order.forEach(function (origIndex, pos) {
          var btn = u.el('button', { class: 'choice', 'data-pos': pos }, [
            u.el('span', { class: 'choice-key', text: String(pos + 1) }),
            u.el('span', { html: jp(q.choices[origIndex]) })
          ]);
          btn.addEventListener('click', function () { pick(pos); });
          box.appendChild(btn);
        });
        stage.appendChild(box);

        stage.appendChild(u.el('div', { style: 'margin-top:18px' }, [
          u.bar(idx, questions.length, { label: 'ความคืบหน้า', text: idx + '/' + questions.length })
        ]));
      }

      function pick(pos) {
        if (answered) return;
        answered = true;

        var q = questions[idx];
        var chosen = order[pos];
        var isRight = chosen === q.answer;

        if (isRight) score++;
        else wrongList.push({ q: q, chosen: chosen });

        QL.store.grade(deckId, 'quiz:' + q.id, isRight, false);

        // ระบายสีตัวเลือก
        u.$$('.choice', stage).forEach(function (btn, i) {
          btn.disabled = true;
          var orig = order[i];
          if (orig === q.answer) btn.classList.add('correct');
          else if (i === pos) btn.classList.add('wrong');
        });

        var fb = u.el('div', { class: 'feedback ' + (isRight ? 'ok' : 'bad') }, [
          u.el('strong', { text: isRight ? '✓ ถูกต้อง' : '✗ ยังไม่ใช่ — คำตอบคือ ' + q.choices[q.answer] }),
          u.el('span', { html: u.mini(q.explain || '') })
        ]);
        stage.insertBefore(fb, stage.lastChild);

        stage.insertBefore(u.el('div', { class: 'btn-row', style: 'margin-top:14px' }, [
          u.el('button', {
            class: 'btn primary',
            html: (idx + 1 >= questions.length ? 'ดูผลสรุป' : 'ข้อถัดไป') + ' <span class="kbd">Enter</span>',
            onclick: next
          })
        ]), stage.lastChild);
      }

      function next() {
        if (!answered) return;
        idx++;
        answered = false;
        render();
      }

      function renderSummary() {
        QL.store.logSession(deckId, 'quiz', score, questions.length);
        var p = u.pct(score, questions.length);

        stage.appendChild(u.el('div', { class: 'card result-big' }, [
          u.el('div', { class: 'result-score', text: score + '/' + questions.length }),
          u.el('div', { class: 'result-label', text: p >= 80 ? 'แม่นแล้ว! 🎉' : p >= 50 ? 'ใกล้แล้ว ทวนอีกนิด' : 'ยังต้องทวนอีกเยอะ สู้ ๆ' })
        ]));

        if (wrongList.length) {
          stage.appendChild(u.el('div', { class: 'section-title' }, [
            u.el('h2', { text: 'ข้อที่ตอบผิด' }),
            u.el('span', { text: wrongList.length + ' ข้อ' })
          ]));

          var box = u.el('div', { class: 'card' });
          wrongList.forEach(function (w) {
            box.appendChild(u.el('div', { class: 'review-item' }, [
              u.el('div', { class: 'review-q', html: u.mini(w.q.question) }),
              u.el('div', { class: 'review-line', html: 'คุณตอบ: <b>' + u.esc(w.q.choices[w.chosen]) + '</b>' }),
              u.el('div', { class: 'review-line', html: 'คำตอบที่ถูก: <b>' + u.esc(w.q.choices[w.q.answer]) + '</b>' }),
              w.q.explain ? u.el('div', { class: 'review-line', style: 'margin-top:4px', html: u.mini(w.q.explain) }) : null
            ]));
          });
          stage.appendChild(box);
        }

        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:18px' }, [
          u.el('button', { class: 'btn primary', text: 'เล่นอีกรอบ', onclick: function () { startRound(pack.quiz); } }),
          wrongList.length ? u.el('button', {
            class: 'btn', text: 'ทวนเฉพาะข้อที่ผิด', onclick: function () {
              startRound(wrongList.map(function (w) { return w.q; }));
            }
          }) : null,
          u.el('button', { class: 'btn ghost', text: 'กลับหน้าบทเรียน', onclick: ctx.back })
        ]));
      }

      ctx.onKey(function (e) {
        if (idx >= questions.length) return;
        if (!answered && e.key >= '1' && e.key <= '9') {
          var pos = parseInt(e.key, 10) - 1;
          if (pos < order.length) { e.preventDefault(); pick(pos); }
        } else if (answered && e.key === 'Enter') {
          e.preventDefault();
          next();
        }
      });

      startRound(pack.quiz);
    }
  });
})();
