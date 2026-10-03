/* =========================================================
   QLibrary / app.js
   จุดเริ่มต้นของแอป — ผูก route, ธีม, คีย์ลัด แล้วสั่ง router.start()
   ไฟล์นี้ต้องโหลดเป็นไฟล์สุดท้ายใน index.html
   ========================================================= */
(function () {
  var u = QL.util;
  var app = u.$('#app');

  /* ---------- ตัวจัดการคีย์ลัดของโหมดที่กำลังเปิดอยู่ ----------
     แต่ละโหมดเรียก ctx.onKey(fn) เพื่อขอรับคีย์
     พอเปลี่ยนหน้า handler เดิมจะถูกล้างอัตโนมัติ กันคีย์ค้าง */
  QL.keys = (function () {
    var handler = null;

    document.addEventListener('keydown', function (e) {
      // อยู่ในช่องพิมพ์ ปล่อยให้พิมพ์ตามปกติ ยกเว้นคีย์ผสม Ctrl/Cmd
      var tag = (e.target.tagName || '').toLowerCase();
      var typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
      if (typing && !(e.ctrlKey || e.metaKey)) return;

      if (handler) handler(e);
    });

    return {
      set: function (fn) { handler = fn; },
      clear: function () { handler = null; }
    };
  })();

  /* ---------- ธีม ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    QL.store.setting('theme', theme);
  }

  function initTheme() {
    var saved = QL.store.setting('theme');
    if (!saved) {
      saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    applyTheme(saved);
  }

  u.$('#btn-theme').addEventListener('click', function () {
    var now = document.documentElement.getAttribute('data-theme');
    applyTheme(now === 'dark' ? 'light' : 'dark');
  });

  /* ---------- หน้าต่างคีย์ลัด ---------- */
  u.$('#btn-help').addEventListener('click', function () {
    var rows = [
      ['Space / ↵', 'พลิกการ์ด (โหมดแฟลชการ์ด)'],
      ['1 / 2 / 3', 'ให้คะแนนตัวเอง: ยังไม่ได้ / ไม่แน่ใจ / จำได้'],
      ['1 - 4', 'เลือกคำตอบ (โหมดควิซ)'],
      ['↵', 'ไปข้อถัดไปหลังเฉลย'],
      ['Ctrl + ↵', 'ตรวจคำตอบ (โหมดทดสอบเขียน)']
    ];
    var table = u.el('table');
    rows.forEach(function (r) {
      table.appendChild(u.el('tr', {}, [
        u.el('td', {}, [u.el('span', { class: 'kbd', text: r[0] })]),
        u.el('td', { text: r[1] })
      ]));
    });
    u.modal('คีย์ลัด', table);
  });

  /* ---------- route ---------- */
  function render(fn) {
    QL.keys.clear();          // ล้างคีย์ลัดของหน้าเดิมก่อนเสมอ
    app.innerHTML = '';
    fn(app);
  }

  QL.router.on('', function () {
    document.title = 'QLibrary — คลังทบทวนบทเรียน';
    render(function (root) { QL.views.home(root); });
  });

  QL.router.on('deck/:id', function (p) {
    var pack = QL.library.get(p.id);
    document.title = (pack ? pack.title + ' — ' : '') + 'QLibrary';
    render(function (root) { QL.views.deck(root, p.id); });
  });

  QL.router.on('deck/:id/:mode', function (p) {
    var pack = QL.library.get(p.id);
    var mode = QL.modes.get(p.mode);
    document.title = [mode && mode.name, pack && pack.title, 'QLibrary'].filter(Boolean).join(' — ');
    render(function (root) { QL.views.study(root, p.id, p.mode); });
  });

  /* ---------- go ---------- */
  initTheme();
  QL.router.start();

  console.log('[QLibrary] พร้อมใช้งาน — บทเรียนในคลัง:', QL.library.all().map(function (p) { return p.id; }));
})();
