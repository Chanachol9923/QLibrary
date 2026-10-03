/* =========================================================
   QLibrary / views / home.js
   หน้าแรก — เลือกวิชา แล้วดูบทเรียนของวิชานั้น + ภาพรวมความคืบหน้า

   วิชาไหนมีบ้างมาจาก field `subject` ของ content pack
   ไม่ต้องมาแก้ไฟล์นี้เวลาเพิ่มวิชาใหม่ แค่ตั้ง subject ในไฟล์เนื้อหาก็พอ
   ========================================================= */
window.QL = window.QL || {};

QL.views = QL.views || {};

QL.views.home = function (root) {
  var u = QL.util;
  var categories = QL.library.categories();

  // หมวด + วิชาที่เลือกไว้ล่าสุด ('' = ทั้งหมด) — จำไว้ในเครื่อง
  var cat = QL.store.setting('category') || '';
  if (cat && !categories.some(function (c) { return c.name === cat; })) cat = '';

  var subjects = QL.library.subjectsIn(cat);

  var picked = QL.store.setting('subject') || '';
  if (picked && !subjects.some(function (s) { return s.name === picked; })) picked = '';

  var packs = QL.library.filter(cat, picked);

  root.appendChild(u.el('div', { class: 'page-head' }, [
    u.el('h1', { text: 'คลังทบทวนบทเรียน' }),
    u.el('p', { text: 'เลือกหมวด → เลือกวิชา → เลือกบทที่อยากทวน — ความคืบหน้าถูกบันทึกไว้ในเครื่องนี้อัตโนมัติ' })
  ]));

  // ---------- แถบเลือกหมวด (ชั้นบนสุด) ----------
  if (categories.length > 1 || (categories.length === 1 && categories[0].name !== 'อื่น ๆ')) {
    root.appendChild(u.el('div', { class: 'section-title' }, [
      u.el('h2', { text: 'หมวด' }),
      u.el('span', { text: categories.length + ' หมวดในคลัง' })
    ]));

    var catChips = u.el('div', { class: 'chips' });
    if (categories.length > 1) {
      catChips.appendChild(chip('🗂️', 'ทุกหมวด', '', QL.library.all().length, 'category'));
    }
    categories.forEach(function (c) {
      catChips.appendChild(chip(c.icon, c.name, c.name, c.packs.length, 'category'));
    });
    root.appendChild(catChips);
  }

  // ---------- แถบเลือกวิชา ----------
  if (subjects.length > 1) {
    root.appendChild(u.el('div', { class: 'section-title' }, [
      u.el('h2', { text: 'วิชา' }),
      u.el('span', { text: subjects.length + ' วิชา' + (cat ? 'ในหมวดนี้' : 'ในคลัง') })
    ]));

    var chips = u.el('div', { class: 'chips' });
    chips.appendChild(chip('📚', 'ทุกวิชา', '', QL.library.filter(cat, '').length, 'subject'));
    subjects.forEach(function (s) {
      chips.appendChild(chip(s.icon, s.name, s.name, s.packs.length, 'subject'));
    });
    root.appendChild(chips);
  }

  // ---------- ภาพรวม (เฉพาะวิชาที่เลือก) ----------
  var totalItems = 0, totalLearned = 0, totalDue = 0, totalSessions = 0;
  packs.forEach(function (p) {
    var s = QL.store.deckStats(p.id, QL.library.itemIds(p));
    totalItems += s.total;
    totalLearned += s.learned;
    totalDue += s.due;
    totalSessions += s.sessions;
  });

  root.appendChild(u.el('div', { class: 'grid cols-4' }, [
    stat(packs.length, 'บทเรียน'),
    stat(totalItems, 'รายการทั้งหมด'),
    stat(totalLearned, 'จำได้แม่นแล้ว'),
    stat(totalDue, 'ถึงคิวทบทวน')
  ]));

  // ---------- รายการบทเรียน ----------
  if (!packs.length) {
    root.appendChild(u.el('div', { class: 'empty' }, [
      u.el('div', { class: 'empty-icon', text: '📭' }),
      u.el('div', { text: 'ยังไม่มีบทเรียนในคลัง — เพิ่มไฟล์ใน content/ แล้วผูกใน index.html' })
    ]));
    return;
  }

  // เลือก "ทุกวิชา" → แยกหัวข้อตามวิชา / เลือกวิชาเดียว → ลิสต์รวดเดียว
  if (!picked) {
    subjects.forEach(function (s) {
      root.appendChild(u.el('div', { class: 'section-title' }, [
        u.el('h2', { text: s.icon + '  ' + s.name }),
        u.el('span', { text: s.packs.length + ' บท' })
      ]));
      root.appendChild(deckGrid(s.packs));
    });
  } else {
    root.appendChild(u.el('div', { class: 'section-title' }, [
      u.el('h2', { text: 'บทเรียน' }),
      u.el('span', { text: 'ทบทวนไปแล้ว ' + totalSessions + ' รอบ' })
    ]));
    root.appendChild(deckGrid(packs));
  }

  // ---------- ท้ายหน้า ----------
  root.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:26px' }, [
    u.el('button', {
      class: 'btn ghost', text: 'ล้างความคืบหน้าทั้งหมด', onclick: function () {
        if (confirm('ลบความคืบหน้าของทุกบทเรียนในเครื่องนี้? ย้อนกลับไม่ได้นะ')) {
          QL.store.resetAll();
          QL.router.go('');
          u.toast('ล้างข้อมูลแล้ว');
        }
      }
    })
  ]));

  /* ------------------------------------------------------- */

  function chip(icon, label, value, count, kind) {
    var activeValue = kind === 'category' ? cat : picked;
    return u.el('button', {
      class: 'chip' + (activeValue === value ? ' active' : '') + (kind === 'category' ? ' chip-lg' : ''),
      onclick: function () {
        QL.store.setting(kind, value);
        // เปลี่ยนหมวดแล้ววิชาที่เลือกไว้อาจไม่มีในหมวดใหม่ ล้างทิ้งก่อน
        if (kind === 'category') QL.store.setting('subject', '');
        QL.router.go('');
      }
    }, [
      u.el('span', { class: 'chip-icon', text: icon }),
      u.el('span', { text: label }),
      u.el('span', { class: 'chip-count', text: String(count) })
    ]);
  }

  function deckGrid(list) {
    var grid = u.el('div', { class: 'grid cols-2' });
    list.forEach(function (p) { grid.appendChild(deckCard(p)); });
    return grid;
  }

  function stat(v, label) {
    return u.el('div', { class: 'stat' }, [
      u.el('div', { class: 'stat-value', text: String(v) }),
      u.el('div', { class: 'stat-label', text: label })
    ]);
  }

  function deckCard(pack) {
    var ids = QL.library.itemIds(pack);
    var s = QL.store.deckStats(pack.id, ids);

    var counts = [];
    if (pack.cards.length) counts.push(pack.cards.length + ' การ์ด');
    if (pack.quiz.length) counts.push(pack.quiz.length + ' ข้อควิซ');
    if (pack.write.length) counts.push(pack.write.length + ' โจทย์เขียน');
    if (pack.work.length) counts.push(pack.work.length + ' โจทย์แสดงวิธีทำ');

    var card = u.el('div', { class: 'card deck-card' }, [
      u.el('div', { class: 'deck-top' }, [
        u.el('div', { class: 'deck-icon', text: pack.icon }),
        u.el('div', {}, [
          u.el('h3', { text: pack.title }),
          u.el('div', { class: 'deck-sub', text: [pack.subject, pack.week].filter(Boolean).join(' · ') })
        ])
      ]),
      u.el('p', { text: pack.description || '' }),
      u.el('div', {}, counts.map(function (c) { return u.el('span', { class: 'tag', text: c }); })),
      u.bar(s.learned, s.total, { label: 'จำได้แม่น', text: u.pct(s.learned, s.total) + '%' }),
      u.el('div', { class: 'btn-row' }, [
        u.el('button', { class: 'btn primary', text: 'เปิดบทเรียน' }),
        s.due ? u.el('span', { class: 'tag', style: 'align-self:center', text: '⏰ ถึงคิว ' + s.due + ' รายการ' }) : null
      ])
    ]);

    card.addEventListener('click', function () { QL.router.go('deck/' + pack.id); });
    return card;
  }
};
