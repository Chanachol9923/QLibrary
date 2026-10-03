/* =========================================================
   QLibrary / modes / flashcards.js
   โหมด "แฟลชการ์ด" — เห็นด้านหน้า นึกคำตอบ แล้วพลิกดูเฉลย
   จากนั้นให้คะแนนตัวเอง 3 ระดับ ระบบจะจัดคิวทบทวนให้เอง (Leitner)

   คีย์ลัด:  Space/Enter = พลิก   1 = ยังไม่ได้   2 = ไม่แน่ใจ   3 = จำได้
   ========================================================= */
(function () {
  var u = QL.util;

  QL.modes.register({
    id: 'flashcards',
    name: 'แฟลชการ์ด',
    icon: '🃏',
    description: 'พลิกการ์ดทบทวนทีละใบ ระบบจัดคิวตัวที่ยังไม่แม่นมาให้บ่อยขึ้น',
    available: function (pack) { return pack.cards.length > 0; },

    mount: function (root, ctx) {
      var pack = ctx.pack;
      var isText = pack.answerStyle === 'text';
      var codeClass = 'code' + (isText ? ' lang' : '');
      /** ข้อความบทเรียน — pack ภาษาจะมีคำอ่านโรมาจิกำกับใต้บรรทัดญี่ปุ่นให้ */
      function jp(text) { return isText ? u.miniJP(text, true) : u.mini(text); }
      var deckId = ctx.deckId;

      // ---- จัดคิว: เอาใบที่ยังไม่แม่น/ถึงกำหนดทบทวนขึ้นก่อน ----
      var queue = QL.store.orderByPriority(deckId, pack.cards, function (c) { return 'card:' + c.id; });

      var idx = 0;
      var flipped = false;
      var stats = { good: 0, hard: 0, again: 0 };

      var stage = u.el('div', { class: 'study-stage' });
      var head = u.el('div', { class: 'study-head' });
      root.appendChild(head);
      root.appendChild(stage);

      function renderHead() {
        head.innerHTML = '';
        head.appendChild(u.el('div', {}, [
          u.el('h2', { style: 'margin:0;font-size:19px', text: '🃏 แฟลชการ์ด' }),
          u.el('div', { class: 'study-meta', text: 'ใบที่ ' + Math.min(idx + 1, queue.length) + ' จาก ' + queue.length })
        ]));
        head.appendChild(u.el('button', { class: 'btn ghost', text: '← กลับ', onclick: ctx.back }));
      }

      function render() {
        renderHead();
        stage.innerHTML = '';

        if (idx >= queue.length) return renderSummary();

        var card = queue[idx];
        var mem = QL.store.item(deckId, 'card:' + card.id);

        var face = u.el('div', { class: 'prompt-card flash' });

        face.appendChild(u.el('div', { class: 'prompt-topic', text: card.topic || pack.title }));
        face.appendChild(u.el('div', { class: 'prompt-text', html: jp(card.front) }));

        if (flipped) {
          var back = u.el('div', { class: 'flash-face-back answer-text', html: jp(card.back) });
          face.appendChild(back);
          if (card.code) face.appendChild(u.jpBlock(card.code, codeClass, isText));
        } else {
          face.appendChild(u.el('div', { class: 'flash-hint', text: 'คลิกหรือกด Space เพื่อพลิก' }));
        }

        face.addEventListener('click', flip);
        stage.appendChild(face);

        // แถบสถานะความจำของใบนี้
        stage.appendChild(u.el('div', { style: 'margin:14px 0 4px;display:flex;gap:10px;align-items:center;flex-wrap:wrap' }, [
          u.el('span', { class: 'box-pill', text: 'กล่อง ' + (mem.box || 0) + '/' + QL.store.MAX_BOX }),
          u.el('span', { class: 'study-meta', text: mem.seen ? ('เคยเจอ ' + mem.seen + ' ครั้ง · ทบทวนอีกครั้ง ' + u.formatDate(mem.due)) : 'ยังไม่เคยเจอใบนี้' })
        ]));

        // ปุ่มให้คะแนนตัวเอง — โผล่หลังพลิกแล้วเท่านั้น
        if (flipped) {
          stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:12px' }, [
            u.el('button', { class: 'btn bad', html: 'ยังไม่ได้ <span class="kbd">1</span>', onclick: function () { grade(false, false); } }),
            u.el('button', { class: 'btn warn', html: 'ไม่แน่ใจ <span class="kbd">2</span>', onclick: function () { grade(true, true); } }),
            u.el('button', { class: 'btn ok', html: 'จำได้ <span class="kbd">3</span>', onclick: function () { grade(true, false); } })
          ]));
        } else {
          stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:12px' }, [
            u.el('button', { class: 'btn primary', html: 'พลิกดูเฉลย <span class="kbd">Space</span>', onclick: flip }),
            u.el('button', { class: 'btn ghost', text: 'ข้ามใบนี้', onclick: next })
          ]));
        }

        stage.appendChild(u.el('div', { style: 'margin-top:18px' }, [
          u.bar(idx, queue.length, { label: 'ความคืบหน้า', text: idx + '/' + queue.length })
        ]));
      }

      function flip() {
        if (idx >= queue.length) return;
        flipped = !flipped;
        render();
      }

      function grade(good, hard) {
        var card = queue[idx];
        QL.store.grade(deckId, 'card:' + card.id, good, hard);
        if (!good) stats.again++; else if (hard) stats.hard++; else stats.good++;
        next();
      }

      function next() {
        idx++;
        flipped = false;
        render();
      }

      function renderSummary() {
        QL.store.logSession(deckId, 'flashcards', stats.good, queue.length);

        stage.appendChild(u.el('div', { class: 'card result-big' }, [
          u.el('div', { class: 'result-score', text: stats.good + '/' + queue.length }),
          u.el('div', { class: 'result-label', text: 'ใบที่จำได้แม่นในรอบนี้' })
        ]));

        stage.appendChild(u.el('div', { class: 'grid cols-3', style: 'margin-top:14px' }, [
          statBox(stats.good, 'จำได้'),
          statBox(stats.hard, 'ไม่แน่ใจ'),
          statBox(stats.again, 'ยังไม่ได้')
        ]));

        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:18px' }, [
          u.el('button', {
            class: 'btn primary', text: 'ทบทวนอีกรอบ', onclick: function () {
              queue = QL.store.orderByPriority(deckId, pack.cards, function (c) { return 'card:' + c.id; });
              idx = 0; flipped = false; stats = { good: 0, hard: 0, again: 0 };
              render();
            }
          }),
          u.el('button', {
            class: 'btn', text: 'เฉพาะใบที่ยังไม่ได้', onclick: function () {
              var weak = pack.cards.filter(function (c) {
                return (QL.store.item(deckId, 'card:' + c.id).box || 0) < 3;
              });
              if (!weak.length) return u.toast('เยี่ยม! ไม่มีใบที่ยังไม่แม่นแล้ว');
              queue = weak; idx = 0; flipped = false; stats = { good: 0, hard: 0, again: 0 };
              render();
            }
          }),
          u.el('button', { class: 'btn ghost', text: 'กลับหน้าบทเรียน', onclick: ctx.back })
        ]));
      }

      function statBox(v, label) {
        return u.el('div', { class: 'stat' }, [
          u.el('div', { class: 'stat-value', text: String(v) }),
          u.el('div', { class: 'stat-label', text: label })
        ]);
      }

      // ---- คีย์ลัด ----
      ctx.onKey(function (e) {
        if (idx >= queue.length) return;
        if (e.key === ' ' || e.code === 'Space' || e.key === 'Spacebar' || e.key === 'Enter') { e.preventDefault(); flip(); }
        else if (flipped && e.key === '1') grade(false, false);
        else if (flipped && e.key === '2') grade(true, true);
        else if (flipped && e.key === '3') grade(true, false);
      });

      render();
    }
  });
})();
