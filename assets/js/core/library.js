/* =========================================================
   QLibrary / core / library.js
   ทะเบียนเนื้อหา (content pack) ทั้งหมดในระบบ

   วิธีเพิ่มบทเรียนใหม่:
     1) สร้างไฟล์ใน content/ เช่น content/cs319-w3-css.js
     2) ในไฟล์นั้นเรียก QL.library.register({ ... })
     3) เพิ่ม <script src="content/cs319-w3-css.js"></script> ใน index.html
   ไม่ต้องแก้โค้ดส่วนอื่นเลย หน้าแรกจะขึ้นการ์ดใหม่ให้เอง

   โครงของ content pack:
   {
     id, title, subject, week, icon, description,
     category,               // หมวดใหญ่สุด เช่น 'TestMidterm' — หน้าแรกเลือกหมวดก่อน แล้วค่อยเลือกวิชา
     categoryIcon,           // ไอคอนของหมวด (ไม่ใส่ก็ใช้ 📂)
     subjectIcon,            // ไอคอนของ "วิชา" ที่จะไปโชว์ในแถบเลือกวิชา (ไม่ใส่ก็ใช้ icon)
     romajiFix,              // { 'บรรทัดญี่ปุ่น': 'คำอ่านที่ต้องการ' } ทับคำอ่านอัตโนมัติ
     answerStyle,            // 'code' (ค่าเริ่มต้น) หรือ 'text' สำหรับวิชาภาษา — มีผลกับการตรวจคำตอบ
     topics: [ { id, title, summary, points: [], code } ],
     cards:  [ { id, front, back, topic, tags } ],
     quiz:   [ { id, question, choices: [], answer: <index>, explain, topic } ],
     write:  [ { id, prompt, hint, answers: [], sample, topic } ],
     work:   [ { id, prompt, given, hint, steps: [], answer, topic } ]   // โจทย์แสดงวิธีทำ (เขียนด้วยปากกา)
   }
   ทุก section เป็น optional — pack ที่มีแค่ cards ก็ใช้ได้ โหมดที่ไม่มีข้อมูลจะถูกซ่อน
   ========================================================= */
window.QL = window.QL || {};

QL.library = (function () {
  var packs = [];
  var byId = {};

  function register(pack) {
    if (!pack || !pack.id) {
      console.error('[QLibrary] content pack ต้องมี id');
      return;
    }
    if (byId[pack.id]) {
      console.warn('[QLibrary] มี pack id ซ้ำ:', pack.id);
      return;
    }
    // เติมค่า default ให้ครบ จะได้ไม่ต้องเช็ค undefined ทุกที่
    pack.topics = pack.topics || [];
    pack.cards = pack.cards || [];
    pack.quiz = pack.quiz || [];
    pack.write = pack.write || [];
    pack.work = pack.work || [];
    pack.icon = pack.icon || '📘';
    pack.subject = pack.subject || 'อื่น ๆ';
    pack.category = pack.category || 'อื่น ๆ';
    pack.answerStyle = pack.answerStyle || 'code';   // 'code' = โค้ด, 'text' = ภาษา/ข้อความ

    // คำอ่านโรมาจิที่ pack กำหนดเอง (ถ้าตัวแปลงอัตโนมัติอ่านผิด)
    if (pack.romajiFix) QL.util.addRomajiFix(pack.romajiFix);

    // ถ้ารายการไหนไม่ได้ตั้ง id มาเอง ให้สร้างให้อัตโนมัติ (กันพลาดเวลาคนเขียนเนื้อหาเร็ว ๆ)
    ['cards', 'quiz', 'write', 'work'].forEach(function (kind) {
      pack[kind].forEach(function (row, i) {
        if (!row.id) row.id = kind.slice(0, 1) + (i + 1);
      });
    });

    packs.push(pack);
    byId[pack.id] = pack;
  }

  function all() { return packs.slice(); }

  function get(id) { return byId[id] || null; }

  /** รวม id ของทุกรายการใน pack เพื่อคำนวณความคืบหน้ารวม */
  function itemIds(pack) {
    var ids = [];
    pack.cards.forEach(function (c) { ids.push('card:' + c.id); });
    pack.quiz.forEach(function (q) { ids.push('quiz:' + q.id); });
    pack.write.forEach(function (w) { ids.push('write:' + w.id); });
    pack.work.forEach(function (w) { ids.push('work:' + w.id); });
    return ids;
  }

  /**
   * จัดกลุ่มบทเรียนตาม "วิชา"
   * คืน [{ name, icon, packs: [] }] เรียงตามลำดับที่วิชานั้นถูกลงทะเบียนครั้งแรก
   * ไอคอนของวิชา = subjectIcon ของ pack แรก (ไม่ใส่ก็ใช้ icon ของ pack แรกแทน)
   */
  function subjects() {
    var order = [];
    var map = {};
    packs.forEach(function (p) {
      var name = p.subject;
      if (!map[name]) {
        map[name] = { name: name, icon: p.subjectIcon || p.icon, packs: [] };
        order.push(map[name]);
      }
      if (p.subjectIcon) map[name].icon = p.subjectIcon;
      map[name].packs.push(p);
    });
    return order;
  }

  /** บทเรียนทั้งหมดของวิชานั้น (ส่ง null/'' = เอาทุกวิชา) */
  function bySubject(name) {
    if (!name) return all();
    return packs.filter(function (p) { return p.subject === name; });
  }

  /**
   * จัดกลุ่มตาม "หมวด" (ชั้นบนสุด เช่น TestMidterm / TestFinal)
   * คืน [{ name, icon, packs: [] }] เรียงตามลำดับที่หมวดนั้นถูกลงทะเบียนครั้งแรก
   */
  function categories() {
    var order = [];
    var map = {};
    packs.forEach(function (p) {
      var name = p.category;
      if (!map[name]) {
        map[name] = { name: name, icon: p.categoryIcon || '📂', packs: [] };
        order.push(map[name]);
      }
      if (p.categoryIcon) map[name].icon = p.categoryIcon;
      map[name].packs.push(p);
    });
    return order;
  }

  /** กรอง pack ตามหมวด + วิชา (ส่ง null/'' = ไม่กรองชั้นนั้น) */
  function filter(category, subject) {
    return packs.filter(function (p) {
      return (!category || p.category === category) && (!subject || p.subject === subject);
    });
  }

  /** วิชาที่มีอยู่ในหมวดนั้น */
  function subjectsIn(category) {
    return subjects().map(function (s) {
      var list = category ? s.packs.filter(function (p) { return p.category === category; }) : s.packs;
      return { name: s.name, icon: s.icon, packs: list };
    }).filter(function (s) { return s.packs.length > 0; });
  }

  return {
    register: register, all: all, get: get, itemIds: itemIds,
    subjects: subjects, bySubject: bySubject,
    categories: categories, subjectsIn: subjectsIn, filter: filter
  };
})();
