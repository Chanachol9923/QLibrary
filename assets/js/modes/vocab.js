/* =========================================================
   QLibrary / modes / vocab.js
   โหมด "ท่องศัพท์" — ตารางศัพท์ทั้งบท มีรูป + ตัวญี่ปุ่น (ฮิรางานะ/คาตากานะ) + โรมาจิ + ความหมาย
   ปิดไทย หรือ ปิดญี่ปุ่น แล้วแตะการ์ดเพื่อเปิดดู = ทายตัวเองได้
   ไม่แตะระบบความจำ (ใช้โหมด "ฝึกจำศัพท์" ถ้าอยากให้ระบบจัดคิวให้)
   ========================================================= */
(function () {
  var u = QL.util;
  var V = QL.vocab;

  QL.modes.register({
    id: 'vocab',
    name: 'ท่องศัพท์',
    icon: '🔤',
    description: 'ตารางศัพท์พร้อมรูป — ตัวญี่ปุ่น + โรมาจิ + ความหมาย ปิดไทยหรือปิดญี่ปุ่นแล้วแตะเพื่อทายตัวเองได้',
    available: function (pack) { return pack.vocab.length > 0; },

    mount: function (root, ctx) {
      var pack = ctx.pack;

      var state = {
        ch: null,                                        // null = ทุกบท
        script: '',                                      // '' | 'hira' | 'kata'
        cover: QL.store.setting('vocabCover') || 'none', // 'none' | 'th' | 'jp'
        kw: ''
      };

      root.appendChild(u.el('div', { class: 'study-head' }, [
        u.el('div', {}, [
          u.el('h2', { style: 'margin:0;font-size:19px', text: '🔤 ท่องศัพท์' }),
          u.el('div', { class: 'study-meta', text: pack.vocab.length + ' คำ' })
        ]),
        u.el('button', { class: 'btn ghost', text: '← กลับ', onclick: ctx.back })
      ]));

      var chapterBar = u.el('div');
      var controls = u.el('div', { class: 'v-controls' });
      var search = u.el('input', {
        class: 'search-input', type: 'search', 'aria-label': 'ค้นหาศัพท์',
        placeholder: 'ค้นหา: ภาษาไทย / かな / โรมาจิ เช่น ครู, sensei, ほん'
      });
      var summary = u.el('div', { class: 'study-meta', style: 'margin:12px 0 4px' });
      var listWrap = u.el('div');

      root.appendChild(chapterBar);
      root.appendChild(controls);
      root.appendChild(search);
      root.appendChild(summary);
      root.appendChild(listWrap);

      /* ---------- แถบควบคุม ---------- */
      function seg(label, options, current, onPick) {
        var wrap = u.el('div', { class: 'v-seg-wrap' }, [u.el('span', { class: 'v-seg-label', text: label })]);
        var group = u.el('div', { class: 'seg', role: 'group', 'aria-label': label });
        options.forEach(function (o) {
          group.appendChild(u.el('button', {
            type: 'button', class: current === o[0] ? 'active' : '', text: o[1],
            onclick: function () { onPick(o[0]); }
          }));
        });
        wrap.appendChild(group);
        return wrap;
      }

      function renderControls() {
        chapterBar.innerHTML = '';
        chapterBar.appendChild(V.chapterChips(pack, state.ch, function (c) { state.ch = c; renderAll(); }));

        controls.innerHTML = '';
        controls.appendChild(seg('ตัวอักษร', [['', 'ทั้งหมด'], ['hira', 'ひらがな'], ['kata', 'カタカナ']], state.script,
          function (v) { state.script = v; renderAll(); }));
        controls.appendChild(seg('ทายตัวเอง', [['none', 'โชว์ทั้งหมด'], ['th', 'ปิดไทย'], ['jp', 'ปิดญี่ปุ่น']], state.cover,
          function (v) { state.cover = v; QL.store.setting('vocabCover', v); renderAll(); }));
      }

      /* ---------- การ์ดศัพท์ 1 ใบ ---------- */
      function card(e) {
        var th = u.el('div', { class: 'v-th', text: e.th });
        var note = e.note ? u.el('div', { class: 'v-note', text: e.note }) : null;

        var el = u.el('div', { class: 'vcard', tabindex: '0', role: 'button' }, [
          V.pic(e),
          u.el('div', { class: 'v-body' }, [V.japaneseBlock(e), th, note]),
          V.speakBtn(e)
        ]);

        function toggle() { el.classList.toggle('revealed'); }
        el.addEventListener('click', toggle);
        el.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); }
        });
        return el;
      }

      /* ---------- รายการ ---------- */
      function visible() {
        var kw = state.kw.trim().toLowerCase();
        return pack.vocab.filter(function (v) {
          if (state.ch !== null && (v.ch || 1) !== state.ch) return false;
          if (state.script && V.script(v) !== state.script) return false;
          if (!kw) return true;
          var hay = [v.th, v.kana, v.kanji, v.alt, V.romaji(v.kana), V.romaji(v.alt), v.note, v.group].join(' ').toLowerCase();
          return hay.indexOf(kw) !== -1;
        });
      }

      function renderList() {
        listWrap.innerHTML = '';
        listWrap.className = 'v-cover-' + state.cover;

        var items = visible();
        summary.textContent = 'แสดง ' + items.length + ' จาก ' + pack.vocab.length + ' คำ' +
          (state.cover !== 'none' ? ' · แตะการ์ดเพื่อเปิดดูคำตอบ' : '');

        if (!items.length) {
          listWrap.appendChild(u.el('div', { class: 'empty' }, [
            u.el('div', { class: 'empty-icon', text: '🔍' }),
            u.el('div', { text: 'ไม่พบคำที่ตรงกับเงื่อนไข' })
          ]));
          return;
        }

        V.groups(items).forEach(function (g) {
          var title = 'บทที่ ' + g.ch + (g.group ? ' · ' + g.group : '');
          var meta = (g.pages.length ? 'หน้า ' + g.pages.join(', ') + ' · ' : '') + g.items.length + ' คำ';
          listWrap.appendChild(u.el('div', { class: 'section-title v-group-title' }, [
            u.el('h2', { text: title }),
            u.el('span', { text: meta })
          ]));
          var grid = u.el('div', { class: 'v-grid' });
          g.items.forEach(function (e) { grid.appendChild(card(e)); });
          listWrap.appendChild(grid);
        });

        listWrap.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:22px' }, [
          u.el('button', {
            class: 'btn', text: 'ปิดการ์ดทั้งหมดอีกครั้ง', onclick: function () {
              u.$$('.vcard.revealed', listWrap).forEach(function (c) { c.classList.remove('revealed'); });
            }
          }),
          u.el('button', {
            class: 'btn', text: 'เปิดการ์ดทั้งหมด', onclick: function () {
              u.$$('.vcard', listWrap).forEach(function (c) { c.classList.add('revealed'); });
            }
          })
        ]));
      }

      function renderAll() { renderControls(); renderList(); }

      search.addEventListener('input', function () { state.kw = search.value; renderList(); });

      renderAll();
    }
  });
})();
