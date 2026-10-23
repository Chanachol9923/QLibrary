/* =========================================================
   QLibrary / modes / vocab-match.js
   โหมด "เกมจับคู่" — แตะคำญี่ปุ่นฝั่งซ้าย แล้วแตะความหมายที่ตรงกันฝั่งขวา
   ออกแบบให้เล่นบน iPad ด้วยนิ้ว/ปากกา (ไม่ต้องลาก)

   - เลือกขอบเขต: บท + หมวด (หมวดเดียวกับ "ควิซตามหมวด")
   - จับคู่ได้ 2 แบบ: ญี่ปุ่น ↔ ไทย · ญี่ปุ่น ↔ รูป
   - รอบละ 6 หรือ 8 คู่ เล่นต่อจนครบทุกคำในขอบเขต
   - จับเวลา + นับครั้งที่ผิด · ให้ดาว · จำเวลาดีที่สุดของแต่ละชุด
   - จับคู่ถูกแล้วอ่านออกเสียงให้ (ปิดได้)
   - ผลเข้าระบบ Leitner ร่วมกับโหมดศัพท์อื่น: คู่ที่จับถูกตั้งแต่ครั้งแรก = จำได้ · เคยจับผิด = ยังไม่ได้

   กันคู่กำกวม: ในรอบเดียวกันจะไม่มีคำที่ความหมายไทยซ้ำกัน หรือรูปซ้ำกัน (แบบรูป)
   ========================================================= */
(function () {
  var u = QL.util;
  var V = QL.vocab;

  QL.modes.register({
    id: 'vocabmatch',
    name: 'เกมจับคู่',
    icon: '🧲',
    description: 'จับคู่คำญี่ปุ่นกับความหมายหรือรูป แข่งกับเวลา แยกเล่นทีละหมวดได้ มีเสียงอ่านตอนจับคู่ถูก',
    available: function (pack) { return pack.vocab.length >= 4; },

    mount: function (root, ctx) {
      var pack = ctx.pack;
      var deckId = ctx.deckId;
      var itemId = function (v) { return 'vocab:' + v.id; };

      var cfg = {
        ch: null,                                         // null = ทุกบท
        group: '',                                        // '' = ทุกหมวด
        style: QL.store.setting('matchStyle') || 'th',    // 'th' | 'pic'
        size: QL.store.setting('matchSize') || 6,         // คู่ต่อรอบ
        sound: QL.store.setting('matchSound') !== false
      };

      var rounds = [];          // [[v, v, ...], ...]
      var roundIdx = 0;
      var board = null;         // สถานะรอบปัจจุบัน
      var totals = null;        // สรุปทุกรอบ
      var timer = null;

      var head = u.el('div', { class: 'study-head' });
      var stage = u.el('div', { class: 'study-stage' });
      root.appendChild(head);
      root.appendChild(stage);

      /* ---------- ข้อมูล ---------- */
      function inScope() {
        return pack.vocab.filter(function (v) {
          return v.exam !== false &&
            (cfg.ch === null || (v.ch || 1) === cfg.ch) &&
            (!cfg.group || (v.group || 'อื่น ๆ') === cfg.group);
        });
      }

      function groupNames() {
        var seen = {}, list = [];
        pack.vocab.forEach(function (v) {
          if (v.exam === false || (cfg.ch !== null && (v.ch || 1) !== cfg.ch)) return;
          var n = v.group || 'อื่น ๆ';
          if (!seen[n]) { seen[n] = 0; list.push(n); }
          seen[n]++;
        });
        return list.map(function (n) { return { name: n, count: seen[n] }; });
      }

      function scopeKey() { return deckId + '|' + (cfg.ch || 'all') + '|' + (cfg.group || 'all') + '|' + cfg.style; }

      function picKey(v) { return v.flag ? 'flag:' + v.flag : JSON.stringify(v.pic || ''); }

      /** แบ่งเป็นรอบ — คำที่ชนกัน (ความหมาย/รูป/คานะซ้ำ) จะถูกเลื่อนไปรอบถัดไป */
      function buildRounds(items) {
        var rest = u.shuffle(items), out = [];
        while (rest.length) {
          var round = [], used = {}, later = [];
          rest.forEach(function (v) {
            var keys = ['th:' + v.th, 'kana:' + v.kana];
            if (cfg.style === 'pic') keys.push('pic:' + picKey(v));
            var clash = keys.some(function (k) { return used[k]; });
            if (round.length < cfg.size && !clash) {
              round.push(v);
              keys.forEach(function (k) { used[k] = 1; });
            } else {
              later.push(v);
            }
          });
          // กันวนไม่จบ: ถ้ารอบนี้ได้ไม่ถึง 2 คู่ ก็ตัดที่เหลือทิ้ง (ชนกันหมดแล้ว)
          if (round.length < 2) break;
          out.push(round);
          rest = later;
        }
        return out;
      }

      /* ---------- หัวหน้า ---------- */
      function renderHead(meta, backFn, backLabel) {
        head.innerHTML = '';
        head.appendChild(u.el('div', {}, [
          u.el('h2', { style: 'margin:0;font-size:19px', text: '🧲 เกมจับคู่' }),
          u.el('div', { class: 'study-meta', id: 'mt-meta', text: meta })
        ]));
        head.appendChild(u.el('button', { class: 'btn ghost', text: '← ' + (backLabel || 'กลับ'), onclick: backFn || ctx.back }));
      }

      function seg(label, options, value, onPick) {
        var g = u.el('div', { class: 'seg', role: 'group', 'aria-label': label });
        options.forEach(function (o) {
          g.appendChild(u.el('button', {
            type: 'button', class: String(value) === String(o[0]) ? 'active' : '', text: o[1],
            onclick: function () { onPick(o[0]); }
          }));
        });
        return u.el('div', { class: 'v-seg-wrap' }, [u.el('span', { class: 'v-seg-label', text: label }), g]);
      }

      /* =====================================================
         หน้าตั้งค่า
         ===================================================== */
      /** แยกหมวดหมู่: หมวดละ 1 แผ่น แตะแล้วเริ่มเล่นหมวดนั้นทันที (เหมือนหน้า "ควิซตามหมวด") */
      function renderSetup() {
        stopTimer();
        board = null;
        var groups = groupNames();
        renderHead(groups.length + ' หมวด — แตะหมวดที่อยากเล่น');
        stage.innerHTML = '';

        stage.appendChild(V.chapterChips(pack, cfg.ch, function (c) { cfg.ch = c; cfg.group = ''; renderSetup(); }));

        stage.appendChild(u.el('div', { class: 'v-controls' }, [
          seg('จับคู่กับ', [['th', 'ความหมายไทย'], ['pic', 'รูป']], cfg.style,
            function (v) { cfg.style = v; QL.store.setting('matchStyle', v); renderSetup(); }),
          seg('คู่ต่อรอบ', [[6, '6'], [8, '8']], cfg.size,
            function (v) { cfg.size = Number(v); QL.store.setting('matchSize', cfg.size); renderSetup(); }),
          V.canSpeak ? seg('เสียงอ่าน', [['on', '🔊 เปิด'], ['off', 'ปิด']], cfg.sound ? 'on' : 'off',
            function (v) { cfg.sound = v === 'on'; QL.store.setting('matchSound', cfg.sound); renderSetup(); }) : null
        ]));

        var bests = QL.store.setting('matchBest') || {};
        var grid = u.el('div', { class: 'vg-grid' });

        /** แผ่นหมวด 1 แผ่น — name '' = ทุกหมวดรวมกัน (สุ่ม) */
        function tile(name, items, title) {
          cfg.group = name;                       // ใช้คำนวณ key ของสถิติหมวดนี้
          var key = scopeKey();
          var best = bests[key];
          var plan = buildRounds(items.filter(function (v) { return v.exam !== false; }));
          if (!plan.length) return;               // หมวดที่จับคู่ไม่ได้ (คำน้อย/ชนกันหมด) ไม่ต้องโชว์
          var pairs = plan.reduce(function (a, r) { return a + r.length; }, 0);

          var preview = u.el('div', { class: 'vg-pics' });
          items.slice(0, 4).forEach(function (v) { preview.appendChild(V.pic(v, 'vg-pic')); });

          var t = u.el('button', { class: 'card vg-tile' + (best ? ' done' : '') + (name ? '' : ' mt-all'), type: 'button' }, [
            preview,
            u.el('div', { class: 'vg-name', text: title }),
            u.el('div', { class: 'vg-meta', text: pairs + ' คู่ · ' + plan.length + ' รอบ' }),
            u.el('div', { class: 'vg-best', text: best ? '🏆 ' + fmtTime(best.ms) + ' · ผิด ' + best.miss + ' ครั้ง' : 'ยังไม่เคยเล่น' })
          ]);
          t.addEventListener('click', function () { cfg.group = name; startGame(buildRounds(inScope())); });
          grid.appendChild(t);
        }

        var all = pack.vocab.filter(function (v) { return cfg.ch === null || (v.ch || 1) === cfg.ch; });
        tile('', u.shuffle(all), '🎲 ทุกหมวด (สุ่ม)');
        groups.forEach(function (g) {
          tile(g.name, all.filter(function (v) { return (v.group || 'อื่น ๆ') === g.name; }), g.name);
        });
        cfg.group = '';
        stage.appendChild(grid);
      }

      /* =====================================================
         เล่น
         ===================================================== */
      function startGame(plan) {
        rounds = plan;
        roundIdx = 0;
        totals = { ms: 0, miss: 0, missed: {} };
        startRound();
      }

      function startRound() {
        var words = rounds[roundIdx];
        board = {
          words: words,
          left: u.shuffle(words),
          right: u.shuffle(words),
          pickL: null, pickR: null,
          done: 0, miss: 0, missed: {},
          t0: 0, ms: 0, busy: false
        };
        renderBoard();
      }

      function fmtTime(ms) {
        var s = Math.floor(ms / 1000);
        return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2) + '.' + Math.floor((ms % 1000) / 100);
      }

      function metaText() {
        return 'รอบ ' + (roundIdx + 1) + '/' + rounds.length + ' · ⏱ ' + fmtTime(board.t0 ? Date.now() - board.t0 : 0) +
          ' · ผิด ' + board.miss + ' ครั้ง · เหลือ ' + (board.words.length - board.done) + ' คู่';
      }

      function startTimer() {
        stopTimer();
        board.t0 = Date.now();
        timer = setInterval(function () {
          // ออกจากหน้านี้ไปแล้ว → หยุดตัวจับเวลา
          if (!document.body.contains(root)) return stopTimer();
          var m = u.$('#mt-meta', head);
          if (m) m.textContent = metaText();
        }, 200);
      }

      function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

      function renderBoard() {
        renderHead(metaText(), function () {
          if (board && board.done < board.words.length && !confirm('ออกจากเกมนี้? เวลาที่เล่นไปจะไม่ถูกบันทึก')) return;
          renderSetup();
        }, 'เปลี่ยนชุด');
        stage.innerHTML = '';

        var grid = u.el('div', { class: 'mt-board' + (cfg.style === 'pic' ? ' is-pic' : '') });
        var colL = u.el('div', { class: 'mt-col' });
        var colR = u.el('div', { class: 'mt-col' });

        board.left.forEach(function (v) {
          var rom = V.romaji(v.kana);
          var t = u.el('button', { class: 'mt-tile mt-jp', type: 'button', 'data-id': v.id }, [
            u.el('span', { class: 'mt-kana', text: v.kana }),
            rom ? u.el('span', { class: 'mt-rom', text: rom }) : null
          ]);
          t.addEventListener('click', function () { tap('L', v, t); });
          colL.appendChild(t);
        });

        board.right.forEach(function (v) {
          var t = cfg.style === 'pic'
            ? u.el('button', { class: 'mt-tile mt-pic', type: 'button', 'data-id': v.id, 'aria-label': v.th }, [V.pic(v, 'mt-v-pic')])
            : u.el('button', { class: 'mt-tile mt-th', type: 'button', 'data-id': v.id }, [u.el('span', { text: v.th })]);
          t.addEventListener('click', function () { tap('R', v, t); });
          colR.appendChild(t);
        });

        grid.appendChild(colL);
        grid.appendChild(colR);
        stage.appendChild(grid);

        stage.appendChild(u.el('div', { style: 'margin-top:16px' }, [
          u.bar(roundIdx, rounds.length, { label: 'รอบ', text: roundIdx + '/' + rounds.length })
        ]));
      }

      function tap(side, v, tile) {
        if (board.busy || tile.classList.contains('matched')) return;
        if (!board.t0) startTimer();

        var key = side === 'L' ? 'pickL' : 'pickR';
        // แตะซ้ำตัวเดิม = ยกเลิกการเลือก
        if (board[key] && board[key].tile === tile) {
          tile.classList.remove('selected');
          board[key] = null;
          return;
        }
        if (board[key]) board[key].tile.classList.remove('selected');
        board[key] = { v: v, tile: tile };
        tile.classList.add('selected');

        // เลือกฝั่งซ้ายแล้วอ่านออกเสียงให้ฟังด้วย ช่วยจำเสียง
        if (side === 'L' && cfg.sound && V.canSpeak) V.speak(v.kana);

        if (board.pickL && board.pickR) judge();
      }

      function judge() {
        var L = board.pickL, R = board.pickR;
        board.pickL = board.pickR = null;

        if (L.v === R.v) {
          [L.tile, R.tile].forEach(function (t) { t.classList.remove('selected'); t.classList.add('matched'); t.disabled = true; });
          board.done++;
          QL.store.grade(deckId, itemId(L.v), !board.missed[L.v.id], false);
          if (board.done === board.words.length) return finishRound();
        } else {
          board.miss++;
          // นับว่าทั้งสองคำ "ยังไม่แม่น" — คำซ้ายเลือกผิดความหมาย คำขวาถูกเข้าใจผิด
          board.missed[L.v.id] = L.v;
          board.missed[R.v.id] = R.v;
          board.busy = true;
          [L.tile, R.tile].forEach(function (t) { t.classList.remove('selected'); t.classList.add('wrong'); });
          setTimeout(function () {
            [L.tile, R.tile].forEach(function (t) { t.classList.remove('wrong'); });
            board.busy = false;
          }, 450);
        }
        var m = u.$('#mt-meta', head);
        if (m) m.textContent = metaText();
      }

      function stars(miss, n) {
        return miss === 0 ? 3 : miss <= Math.max(1, Math.floor(n / 4)) ? 2 : 1;
      }

      function finishRound() {
        stopTimer();
        board.ms = Date.now() - board.t0;
        totals.ms += board.ms;
        totals.miss += board.miss;
        Object.keys(board.missed).forEach(function (id) { totals.missed[id] = board.missed[id]; });

        var last = roundIdx + 1 >= rounds.length;
        var st = stars(board.miss, board.words.length);
        renderHead('จบรอบ ' + (roundIdx + 1) + '/' + rounds.length, renderSetup, 'เปลี่ยนชุด');
        stage.innerHTML = '';

        stage.appendChild(u.el('div', { class: 'card result-big mt-result' }, [
          u.el('div', { class: 'mt-stars', text: '★★★'.slice(0, st) + '☆☆☆'.slice(0, 3 - st) }),
          u.el('div', { class: 'result-score', text: fmtTime(board.ms) }),
          u.el('div', { class: 'result-label', text: board.words.length + ' คู่ · ผิด ' + board.miss + ' ครั้ง' })
        ]));

        if (last) return finishGame();

        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:16px' }, [
          u.el('button', { class: 'btn primary', html: 'รอบถัดไป ▶ <span class="kbd">↵</span>', onclick: nextRound }),
          u.el('button', { class: 'btn ghost', text: 'จบเกม', onclick: finishGame })
        ]));
      }

      function nextRound() { roundIdx++; startRound(); }

      function finishGame() {
        stopTimer();
        var played = rounds.slice(0, roundIdx + 1).reduce(function (a, r) { return a + r.length; }, 0);
        var complete = roundIdx + 1 >= rounds.length;
        QL.store.logSession(deckId, 'vocabmatch', played - Object.keys(totals.missed).length, played);

        // เวลาดีที่สุด — นับเฉพาะตอนเล่นครบทุกรอบ
        var isBest = false;
        if (complete) {
          var all = QL.store.setting('matchBest') || {};
          var prev = all[scopeKey()];
          if (!prev || totals.ms < prev.ms) { all[scopeKey()] = { ms: totals.ms, miss: totals.miss }; QL.store.setting('matchBest', all); isBest = true; }
        }

        renderHead(complete ? 'เล่นครบทุกรอบแล้ว' : 'จบเกม', renderSetup, 'เปลี่ยนชุด');
        stage.innerHTML = '';
        stage.appendChild(u.el('div', { class: 'card result-big' }, [
          u.el('div', { class: 'result-score', text: fmtTime(totals.ms) }),
          u.el('div', { class: 'result-label', text: played + ' คู่ · ผิดรวม ' + totals.miss + ' ครั้ง' + (isBest ? ' · 🏆 สถิติใหม่!' : '') })
        ]));

        var missed = Object.keys(totals.missed).map(function (id) { return totals.missed[id]; });
        if (missed.length) {
          stage.appendChild(u.el('div', { class: 'section-title' }, [
            u.el('h2', { text: 'คำที่จับคู่ผิด' }), u.el('span', { text: missed.length + ' คำ · แตะ 🔊 ฟังเสียง' })
          ]));
          var grid = u.el('div', { class: 'v-grid' });
          missed.forEach(function (v) {
            grid.appendChild(u.el('div', { class: 'vcard revealed' }, [
              V.pic(v),
              u.el('div', { class: 'v-body' }, [V.japaneseBlock(v), u.el('div', { class: 'v-th', text: v.th })]),
              V.speakBtn(v)
            ]));
          });
          stage.appendChild(grid);
        }

        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:18px' }, [
          missed.length >= 2 ? u.el('button', {
            class: 'btn primary', text: 'เล่นเฉพาะคำที่ผิด (' + missed.length + ')',
            onclick: function () { startGame(buildRounds(missed)); }
          }) : null,
          u.el('button', { class: missed.length >= 2 ? 'btn' : 'btn primary', text: 'เล่นชุดนี้อีกครั้ง', onclick: function () { startGame(buildRounds(inScope())); } }),
          u.el('button', { class: 'btn ghost', text: 'เปลี่ยนชุด', onclick: renderSetup })
        ]));
      }

      ctx.onKey(function (e) {
        if (e.key === 'Enter' && board && board.done === board.words.length && roundIdx + 1 < rounds.length && !timer) {
          e.preventDefault();
          nextRound();
        }
      });

      renderSetup();
    }
  });
})();
