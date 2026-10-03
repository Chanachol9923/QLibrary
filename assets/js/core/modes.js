/* =========================================================
   QLibrary / core / modes.js
   ทะเบียนโหมดการเรียน

   วิธีเพิ่มโหมดใหม่:
     1) สร้างไฟล์ assets/js/modes/<ชื่อ>.js
     2) เรียก QL.modes.register({
          id, name, icon, description,
          available: function (pack) { return pack.cards.length > 0; },
          mount: function (root, ctx) { ... }
        })
     3) เพิ่ม <script> ใน index.html
   ctx ที่โหมดได้รับ = { pack, deckId, back(), done() }
   ========================================================= */
window.QL = window.QL || {};

QL.modes = (function () {
  var list = [];
  var byId = {};

  function register(mode) {
    if (!mode || !mode.id || typeof mode.mount !== 'function') {
      console.error('[QLibrary] mode ต้องมี id และ mount()');
      return;
    }
    if (!mode.available) mode.available = function () { return true; };
    list.push(mode);
    byId[mode.id] = mode;
  }

  function all() { return list.slice(); }
  function get(id) { return byId[id] || null; }

  /** เฉพาะโหมดที่ pack นี้มีข้อมูลรองรับ */
  function forPack(pack) {
    return list.filter(function (m) { return m.available(pack); });
  }

  return { register: register, all: all, get: get, forPack: forPack };
})();
