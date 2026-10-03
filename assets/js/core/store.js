/* =========================================================
   QLibrary / core / store.js
   เก็บความคืบหน้าการเรียนไว้ใน localStorage ของเครื่องตัวเอง
   (ไม่มี server ไม่มีบัญชี เปิดจากไฟล์ตรง ๆ ก็ทำงานได้)

   โครงข้อมูลที่เก็บ:
   {
     version: 1,
     settings: { theme: 'light' | 'dark' },
     decks: {
       "<deckId>": {
         items: { "<itemId>": { box, due, seen, correct, wrong, last } },
         sessions: [ { mode, at, score, total } ]
       }
     }
   }

   itemId ใช้รูปแบบ "<ประเภท>:<id>" เช่น "card:doctype", "quiz:q1"
   ทำให้ทุกโหมดใช้ตารางความจำร่วมกันได้โดยไม่ชนกัน
   ========================================================= */
window.QL = window.QL || {};

QL.store = (function () {
  var KEY = 'qlibrary:v1';

  /** ระบบทบทวนแบบ Leitner: ยิ่งกล่องสูง ยิ่งเว้นวันนาน */
  var BOX_DAYS = [0, 1, 2, 4, 8, 16];   // index = box (1..5)
  var MAX_BOX = 5;

  var data = load();

  function blank() {
    return { version: 1, settings: { theme: null }, decks: {} };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return blank();
      parsed.settings = parsed.settings || {};
      parsed.decks = parsed.decks || {};
      return parsed;
    } catch (e) {
      console.warn('[QLibrary] อ่านข้อมูลเดิมไม่ได้ เริ่มใหม่', e);
      return blank();
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[QLibrary] บันทึกไม่สำเร็จ', e);
    }
  }

  function deck(deckId) {
    if (!data.decks[deckId]) data.decks[deckId] = { items: {}, sessions: [] };
    var d = data.decks[deckId];
    d.items = d.items || {};
    d.sessions = d.sessions || [];
    return d;
  }

  function item(deckId, itemId) {
    var d = deck(deckId);
    if (!d.items[itemId]) {
      d.items[itemId] = { box: 0, due: 0, seen: 0, correct: 0, wrong: 0, last: 0 };
    }
    return d.items[itemId];
  }

  /**
   * บันทึกผลการตอบ 1 ครั้ง
   * @param {boolean} good  ตอบถูก / จำได้
   * @param {boolean} hard  จำได้แบบไม่มั่นใจ (คงกล่องเดิม)
   */
  function grade(deckId, itemId, good, hard) {
    var it = item(deckId, itemId);
    it.seen++;
    it.last = Date.now();

    if (good) {
      it.correct++;
      it.box = hard ? Math.max(1, it.box) : Math.min(MAX_BOX, (it.box || 0) + 1);
    } else {
      it.wrong++;
      it.box = 1;
    }
    it.due = QL.util.daysFromNow(BOX_DAYS[it.box] || 1);
    save();
    return it;
  }

  /** การ์ด/ข้อนี้ถึงกำหนดทบทวนหรือยัง (ยังไม่เคยเจอ = ถึงกำหนด) */
  function isDue(deckId, itemId) {
    var d = data.decks[deckId];
    var it = d && d.items[itemId];
    if (!it || !it.seen) return true;
    return (it.due || 0) <= QL.util.today();
  }

  /** สรุปสถิติของ deck เทียบกับรายการทั้งหมดที่มี */
  function deckStats(deckId, allItemIds) {
    var d = data.decks[deckId] || { items: {}, sessions: [] };
    var total = allItemIds.length;
    var seen = 0, learned = 0, due = 0, correct = 0, answered = 0;

    allItemIds.forEach(function (id) {
      var it = d.items[id];
      if (!it || !it.seen) { due++; return; }
      seen++;
      answered += it.correct + it.wrong;
      correct += it.correct;
      if (it.box >= 4) learned++;
      if ((it.due || 0) <= QL.util.today()) due++;
    });

    return {
      total: total,
      seen: seen,
      learned: learned,
      due: due,
      accuracy: answered ? Math.round((correct / answered) * 100) : 0,
      sessions: d.sessions.length,
      lastSession: d.sessions.length ? d.sessions[d.sessions.length - 1] : null
    };
  }

  /** เรียงรายการให้ "ที่ต้องทบทวน" มาก่อน แล้วค่อยตัวที่แม่นแล้ว */
  function orderByPriority(deckId, items, idOf) {
    var d = data.decks[deckId] || { items: {} };
    return items.slice().sort(function (a, b) {
      var ia = d.items[idOf(a)] || { box: 0, due: 0, seen: 0 };
      var ib = d.items[idOf(b)] || { box: 0, due: 0, seen: 0 };
      if (!ia.seen !== !ib.seen) return ia.seen ? 1 : -1;      // ยังไม่เคยเจอ มาก่อน
      if (ia.box !== ib.box) return ia.box - ib.box;            // กล่องต่ำ (ยังไม่แม่น) มาก่อน
      return (ia.due || 0) - (ib.due || 0);
    });
  }

  function logSession(deckId, mode, score, total) {
    var d = deck(deckId);
    d.sessions.push({ mode: mode, at: Date.now(), score: score, total: total });
    if (d.sessions.length > 50) d.sessions = d.sessions.slice(-50);
    save();
  }

  function resetDeck(deckId) {
    delete data.decks[deckId];
    save();
  }

  function resetAll() {
    data = blank();
    save();
  }

  function setting(key, value) {
    if (arguments.length === 1) return data.settings[key];
    data.settings[key] = value;
    save();
    return value;
  }

  function exportJSON() { return JSON.stringify(data, null, 2); }

  return {
    grade: grade,
    isDue: isDue,
    item: item,
    deckStats: deckStats,
    orderByPriority: orderByPriority,
    logSession: logSession,
    resetDeck: resetDeck,
    resetAll: resetAll,
    setting: setting,
    exportJSON: exportJSON,
    BOX_DAYS: BOX_DAYS,
    MAX_BOX: MAX_BOX
  };
})();
