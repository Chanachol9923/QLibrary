/* =========================================================
   QLibrary / views / deck.js
   หน้าบทเรียน — สรุปสถิติของบทนั้น + เลือกโหมด
   และเป็นตัวเรียก mount() ของโหมดที่เลือก
   ========================================================= */
window.QL = window.QL || {};
QL.views = QL.views || {};

/** หน้าเลือกโหมด */
QL.views.deck = function (root, deckId) {
  var u = QL.util;
  var pack = QL.library.get(deckId);
  if (!pack) return QL.router.go('');

  var ids = QL.library.itemIds(pack);
  var s = QL.store.deckStats(deckId, ids);

  root.appendChild(u.el('div', { class: 'crumbs' }, [
    u.el('a', { href: '#/', text: 'คลังบทเรียน' }),
    u.el('span', { text: '/' }),
    u.el('span', { text: pack.title })
  ]));

  root.appendChild(u.el('div', { class: 'page-head' }, [
    u.el('h1', { text: pack.icon + ' ' + pack.title }),
    u.el('div', { class: 'deck-sub', style: 'margin-bottom:6px', text: [pack.category, pack.subject, pack.week].filter(Boolean).join(' · ') }),
    u.el('p', { text: pack.description || '' })
  ]));

  root.appendChild(u.el('div', { class: 'grid cols-4' }, [
    stat(s.total, 'รายการทั้งหมด'),
    stat(s.learned, 'จำได้แม่น'),
    stat(s.due, 'ถึงคิวทบทวน'),
    stat(s.accuracy + '%', 'ความแม่นยำ')
  ]));

  root.appendChild(u.el('div', { style: 'margin-top:14px' }, [
    u.bar(s.learned, s.total, { label: 'ความคืบหน้าบทนี้', text: u.pct(s.learned, s.total) + '%' })
  ]));

  // ---------- โหมด ----------
  root.appendChild(u.el('div', { class: 'section-title' }, [
    u.el('h2', { text: 'เลือกโหมดทบทวน' }),
    s.lastSession ? u.el('span', { text: 'ครั้งล่าสุด ' + u.formatDate(s.lastSession.at) + ' · ' + s.lastSession.score + '/' + s.lastSession.total }) : null
  ]));

  var grid = u.el('div', { class: 'grid cols-2' });
  QL.modes.forPack(pack).forEach(function (m) {
    var card = u.el('div', { class: 'card mode-card' }, [
      u.el('div', { class: 'mode-icon', text: m.icon }),
      u.el('h3', { text: m.name }),
      u.el('p', { text: m.description })
    ]);
    card.addEventListener('click', function () { QL.router.go('deck/' + deckId + '/' + m.id); });
    grid.appendChild(card);
  });
  root.appendChild(grid);

  // ---------- จัดการข้อมูล ----------
  root.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:26px' }, [
    u.el('button', {
      class: 'btn ghost', text: 'รีเซ็ตความคืบหน้าบทนี้', onclick: function () {
        if (confirm('ล้างความคืบหน้าของ "' + pack.title + '" ?')) {
          QL.store.resetDeck(deckId);
          QL.router.go('deck/' + deckId);
          u.toast('รีเซ็ตแล้ว');
        }
      }
    })
  ]));

  function stat(v, label) {
    return u.el('div', { class: 'stat' }, [
      u.el('div', { class: 'stat-value', text: String(v) }),
      u.el('div', { class: 'stat-label', text: label })
    ]);
  }
};

/** หน้าเรียนจริง — ห่อ mount() ของโหมดไว้ พร้อม context มาตรฐาน */
QL.views.study = function (root, deckId, modeId) {
  var u = QL.util;
  var pack = QL.library.get(deckId);
  var mode = QL.modes.get(modeId);

  if (!pack) return QL.router.go('');
  if (!mode || !mode.available(pack)) return QL.router.go('deck/' + deckId);

  root.appendChild(u.el('div', { class: 'crumbs' }, [
    u.el('a', { href: '#/', text: 'คลังบทเรียน' }),
    u.el('span', { text: '/' }),
    u.el('a', { href: '#/deck/' + deckId, text: pack.title }),
    u.el('span', { text: '/' }),
    u.el('span', { text: mode.name })
  ]));

  var host = u.el('div');
  root.appendChild(host);

  mode.mount(host, {
    pack: pack,
    deckId: deckId,
    back: function () { QL.router.go('deck/' + deckId); },
    onKey: QL.keys.set
  });
};
