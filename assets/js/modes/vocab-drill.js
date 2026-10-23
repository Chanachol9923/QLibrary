/* =========================================================
   QLibrary / modes / vocab-drill.js
   โหมด "ฝึกจำศัพท์" — แฟลชการ์ดศัพท์ที่มีรูป เลือกทิศทางได้
     ไทย → ญี่ปุ่น  (เหมือนข้อสอบ: เห็นความหมาย นึกคำญี่ปุ่น)
     ญี่ปุ่น → ไทย  (เห็นคำญี่ปุ่น นึกความหมาย)
   พลิกดูเฉลยแล้วให้คะแนนตัวเอง 3 ระดับ เข้าระบบ Leitner เหมือนโหมดแฟลชการ์ด

   คีย์ลัด:  Space/Enter = พลิก   1 = ยังไม่ได้   2 = ไม่แน่ใจ   3 = จำได้
   ========================================================= */
(function () {
  var u = QL.util;
  var V = QL.vocab;

  QL.modes.register({
    id: 'vocabdrill',
    name: 'ฝึกจำศัพท์',
    icon: '🎴',
    description: 'แฟลชการ์ดศัพท์พร้อมรูป เลือกทายไทย→ญี่ปุ่น หรือกลับกัน ระบบจัดคิวคำที่ยังไม่แม่นให้บ่อยขึ้น',
    available: function (pack) { return pack.vocab.length > 0; },

    mount: function (root, ctx) {
      var pack = ctx.pack;
      var deckId = ctx.deckId;
      var itemId = function (v) { return 'vocab:' + v.id; };

      var dir = QL.store.setting('vocabDir') || 'th2jp';     // 'th2jp' | 'jp2th'
      var ch = null;                                         // กรองตามบท
      var queue = [];
      var idx = 0;
      var flipped = false;
      var stats = { good: 0, hard: 0, again: 0 };

      var head = u.el('div', { class: 'study-head' });
      var bar = u.el('div');
      var stage = u.el('div', { class: 'study-stage' });
      root.appendChild(head);
      root.appendChild(bar);
      root.appendChild(stage);

      function pool() {
        return pack.vocab.filter(function (v) { return ch === null || (v.ch || 1) === ch; });
      }

      function restart(list) {
        queue = list || QL.store.orderByPriority(deckId, pool(), itemId);
        idx = 0; flipped = false; stats = { good: 0, hard: 0, again: 0 };
        render();
      }

      function renderHead() {
        head.innerHTML = '';
        head.appendChild(u.el('div', {}, [
          u.el('h2', { style: 'margin:0;font-size:19px', text: '🎴 ฝึกจำศัพท์' }),
          u.el('div', { class: 'study-meta', text: 'ใบที่ ' + Math.min(idx + 1, queue.length) + ' จาก ' + queue.length })
        ]));
        head.appendChild(u.el('button', { class: 'btn ghost', text: '← กลับ', onclick: ctx.back }));

        bar.innerHTML = '';
        bar.appendChild(V.chapterChips(pack, ch, function (c) { ch = c; restart(); }));
        var seg = u.el('div', { class: 'seg', role: 'group', 'aria-label': 'ทิศทางการทาย', style: 'margin-bottom:14px' });
        [['th2jp', 'ไทย → ญี่ปุ่น'], ['jp2th', 'ญี่ปุ่น → ไทย']].forEach(function (o) {
          seg.appendChild(u.el('button', {
            type: 'button', class: dir === o[0] ? 'active' : '', text: o[1],
            onclick: function () { dir = o[0]; QL.store.setting('vocabDir', dir); flipped = false; render(); }
          }));
        });
        bar.appendChild(seg);
      }

      function render() {
        renderHead();
        stage.innerHTML = '';
        if (!queue.length) return stage.appendChild(u.el('div', { class: 'empty' }, [
          u.el('div', { class: 'empty-icon', text: '📭' }), u.el('div', { text: 'ไม่มีศัพท์ในบทที่เลือก' })
        ]));
        if (idx >= queue.length) return renderSummary();

        var e = queue[idx];
        var mem = QL.store.item(deckId, itemId(e));

        var face = u.el('div', { class: 'prompt-card flash v-flash' });
        face.appendChild(u.el('div', { class: 'prompt-topic', text: 'บทที่ ' + (e.ch || 1) + (e.group ? ' · ' + e.group : '') }));

        if (dir === 'th2jp') {
          face.appendChild(V.pic(e, 'v-pic-lg'));
          face.appendChild(u.el('div', { class: 'v-ask', text: e.th }));
          if (flipped) {
            face.appendChild(u.el('div', { class: 'flash-face-back v-answer' }, [
              V.japaneseBlock(e, 'lg'), e.note ? u.el('div', { class: 'v-note', text: e.note }) : null, V.speakBtn(e)
            ]));
          }
        } else {
          face.appendChild(V.japaneseBlock(e, 'lg'));
          face.appendChild(V.speakBtn(e));   // ทิศนี้ฟังเสียงก่อนพลิกได้ ไม่เฉลยความหมาย
          if (flipped) {
            face.appendChild(u.el('div', { class: 'flash-face-back v-answer' }, [
              V.pic(e, 'v-pic-lg'),
              u.el('div', { class: 'v-ask', text: e.th }),
              e.note ? u.el('div', { class: 'v-note', text: e.note }) : null
            ]));
          }
        }
        if (!flipped) face.appendChild(u.el('div', { class: 'flash-hint', text: 'คลิกหรือกด Space เพื่อพลิก' }));
        face.addEventListener('click', flip);
        stage.appendChild(face);

        stage.appendChild(u.el('div', { style: 'margin:14px 0 4px;display:flex;gap:10px;align-items:center;flex-wrap:wrap' }, [
          u.el('span', { class: 'box-pill', text: 'กล่อง ' + (mem.box || 0) + '/' + QL.store.MAX_BOX }),
          u.el('span', { class: 'study-meta', text: mem.seen ? ('เคยเจอ ' + mem.seen + ' ครั้ง · ทบทวนอีกครั้ง ' + u.formatDate(mem.due)) : 'ยังไม่เคยเจอคำนี้' })
        ]));

        if (flipped) {
          stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:12px' }, [
            u.el('button', { class: 'btn bad', html: 'ยังไม่ได้ <span class="kbd">1</span>', onclick: function () { grade(false, false); } }),
            u.el('button', { class: 'btn warn', html: 'ไม่แน่ใจ <span class="kbd">2</span>', onclick: function () { grade(true, true); } }),
            u.el('button', { class: 'btn ok', html: 'จำได้ <span class="kbd">3</span>', onclick: function () { grade(true, false); } })
          ]));
        } else {
          stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:12px' }, [
            u.el('button', { class: 'btn primary', html: 'พลิกดูเฉลย <span class="kbd">Space</span>', onclick: flip }),
            u.el('button', { class: 'btn ghost', text: 'ข้ามคำนี้', onclick: next })
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
        QL.store.grade(deckId, itemId(queue[idx]), good, hard);
        if (!good) stats.again++; else if (hard) stats.hard++; else stats.good++;
        next();
      }

      function next() { idx++; flipped = false; render(); }

      function statBox(v, label) {
        return u.el('div', { class: 'stat' }, [
          u.el('div', { class: 'stat-value', text: String(v) }),
          u.el('div', { class: 'stat-label', text: label })
        ]);
      }

      function renderSummary() {
        QL.store.logSession(deckId, 'vocabdrill', stats.good, queue.length);

        stage.appendChild(u.el('div', { class: 'card result-big' }, [
          u.el('div', { class: 'result-score', text: stats.good + '/' + queue.length }),
          u.el('div', { class: 'result-label', text: 'คำที่จำได้แม่นในรอบนี้' })
        ]));
        stage.appendChild(u.el('div', { class: 'grid cols-3', style: 'margin-top:14px' }, [
          statBox(stats.good, 'จำได้'), statBox(stats.hard, 'ไม่แน่ใจ'), statBox(stats.again, 'ยังไม่ได้')
        ]));
        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:18px' }, [
          u.el('button', { class: 'btn primary', text: 'ทบทวนอีกรอบ', onclick: function () { restart(); } }),
          u.el('button', {
            class: 'btn', text: 'เฉพาะคำที่ยังไม่แม่น', onclick: function () {
              var weak = pool().filter(function (v) { return (QL.store.item(deckId, itemId(v)).box || 0) < 3; });
              if (!weak.length) return u.toast('เยี่ยม! ไม่มีคำที่ยังไม่แม่นแล้ว');
              restart(weak);
            }
          }),
          u.el('button', { class: 'btn ghost', text: 'กลับหน้าบทเรียน', onclick: ctx.back })
        ]));
      }

      ctx.onKey(function (e) {
        if (idx >= queue.length) return;
        if (e.key === ' ' || e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); flip(); }
        else if (flipped && e.key === '1') grade(false, false);
        else if (flipped && e.key === '2') grade(true, true);
        else if (flipped && e.key === '3') grade(true, false);
      });

      restart();
    }
  });
})();
