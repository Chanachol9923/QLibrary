/* =========================================================
   QLibrary / core / vocab.js
   ตัวช่วยของ "ท่องศัพท์" — ใช้ร่วมกันทั้ง 3 โหมด (ท่องศัพท์ / ฝึกจำ / จำลองสอบ)

   รายการศัพท์ 1 คำ (pack.vocab[]):
   {
     id,                 // ต้องไม่ซ้ำใน pack (ใช้เก็บความจำ Leitner)
     ch: 1,              // บทที่ (ใช้กรอง/จัดกลุ่ม)
     page: 48,           // หน้าในหนังสือ (ไม่ใส่ก็ได้)
     group: 'อาชีพ',     // หมวดย่อยในบทนั้น
     pic: '👨‍🏫',         // รูป: อีโมจิ 1 ตัว | ['👉','📍'] ซ้อนหลายตัว | '1,000' ตัวอักษรล้วน
     flag: 'th',         // หรือรูปธงชาติ (th us uk in id kr cn de jp br it ch fr) — ใช้แทน pic
     kana: 'せんせい',    // คำเขียนด้วยฮิรางานะ/คาตากานะ (หัวใจของการ์ด) — โรมาจิสร้างให้อัตโนมัติ
     kanji: '先生',       // คันจิ (ไม่ใส่ก็ได้ — โชว์ตัวเล็ก ๆ เป็นของแถม)
     th: 'คุณครู',        // ความหมายภาษาไทย
     alt: 'おいくつ',     // รูปสุภาพ/คำที่ใช้แทนกันได้ (ไม่ใส่ก็ได้ — ตรวจเป็นคำตอบที่ถูกด้วย)
     note: 'หมายเหตุ',    // จุดที่ต้องระวัง (ไม่ใส่ก็ได้)
     exam: false         // false = ไม่เอาไปสุ่มในโหมดจำลองสอบ (เช่น ชื่อบริษัทสมมุติ)
   }
   [..] ในคำ = ส่วนที่ใส่หรือไม่ใส่ก็ได้ (เช่น [お]みやげ) · ～ = ตัวเลข/คำนามที่ตามมา (ตอนตรวจจะไม่นับ)
   ========================================================= */
window.QL = window.QL || {};

QL.vocab = (function () {
  var u = QL.util;

  /* ---------- รูปธงชาติ (SVG วาดเอง ไม่พึ่งอะไรข้างนอก) ----------
     ไม่ใช้อีโมจิธง เพราะ Windows ไม่แสดงเป็นธง (ขึ้นเป็นตัวอักษร US / JP แทน) */
  function star(cx, cy, r, rot) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var rr = i % 2 ? r * 0.382 : r;
      var a = (-90 + i * 36 + (rot || 0)) * Math.PI / 180;
      pts.push((cx + rr * Math.cos(a)).toFixed(2) + ',' + (cy + rr * Math.sin(a)).toFixed(2));
    }
    return '<polygon points="' + pts.join(' ') + '" fill="#ffde00"/>';
  }

  function stripesH(colors, ratio) {
    var total = ratio.reduce(function (a, b) { return a + b; }, 0), y = 0, out = '';
    colors.forEach(function (c, i) {
      var h = 40 * ratio[i] / total;
      out += '<rect y="' + y.toFixed(2) + '" width="60" height="' + (h + 0.1).toFixed(2) + '" fill="' + c + '"/>';
      y += h;
    });
    return out;
  }

  function stripesV(colors) {
    return colors.map(function (c, i) {
      return '<rect x="' + (i * 20) + '" width="20.1" height="40" fill="' + c + '"/>';
    }).join('');
  }

  /** trigram ของธงเกาหลี: broken = [true,false,true] (true = เส้นขาด) */
  function trigram(cx, cy, rot, broken) {
    var bars = '';
    broken.forEach(function (b, i) {
      var y = (i - 1) * 3.4 - 0.8;
      bars += b
        ? '<rect x="-5" y="' + y + '" width="4.2" height="1.6"/><rect x="0.8" y="' + y + '" width="4.2" height="1.6"/>'
        : '<rect x="-5" y="' + y + '" width="10" height="1.6"/>';
    });
    return '<g fill="#111" transform="translate(' + cx + ' ' + cy + ') rotate(' + rot + ')">' + bars + '</g>';
  }

  var FLAGS = {
    th: function () { return stripesH(['#a51931', '#f4f5f8', '#2d2a4a', '#f4f5f8', '#a51931'], [1, 1, 2, 1, 1]); },
    us: function () {
      var s = '';
      for (var i = 0; i < 13; i++) {
        s += '<rect y="' + (i * 40 / 13).toFixed(2) + '" width="60" height="' + (40 / 13 + 0.1).toFixed(2) + '" fill="' + (i % 2 ? '#fff' : '#b22234') + '"/>';
      }
      s += '<rect width="26" height="21.6" fill="#3c3b6e"/>';
      for (var r = 0; r < 4; r++) for (var c = 0; c < 5; c++) {
        s += '<circle cx="' + (3.6 + c * 4.7) + '" cy="' + (3.6 + r * 4.9) + '" r="1" fill="#fff"/>';
      }
      return s;
    },
    uk: function () {
      var d = 'M0 0L60 40M60 0L0 40', c = 'M30 0V40M0 20H60';
      return '<rect width="60" height="40" fill="#012169"/>' +
        '<path d="' + d + '" stroke="#fff" stroke-width="6"/><path d="' + d + '" stroke="#c8102e" stroke-width="2"/>' +
        '<path d="' + c + '" stroke="#fff" stroke-width="10"/><path d="' + c + '" stroke="#c8102e" stroke-width="6"/>';
    },
    in: function () {
      return stripesH(['#ff9933', '#ffffff', '#138808'], [1, 1, 1]) +
        '<circle cx="30" cy="20" r="5" fill="none" stroke="#000080" stroke-width="1"/><circle cx="30" cy="20" r="1" fill="#000080"/>';
    },
    id: function () { return stripesH(['#e70011', '#f4f5f8'], [1, 1]); },
    kr: function () {
      return '<rect width="60" height="40" fill="#f4f5f8"/>' +
        '<path d="M21 20A9 9 0 0 1 39 20Z" fill="#cd2e3a"/><path d="M21 20A9 9 0 0 0 39 20Z" fill="#0047a0"/>' +
        '<circle cx="25.5" cy="20" r="4.5" fill="#cd2e3a"/><circle cx="34.5" cy="20" r="4.5" fill="#0047a0"/>' +
        trigram(10, 8, -57, [false, false, false]) + trigram(50, 32, -57, [true, true, true]) +
        trigram(50, 8, 57, [true, false, true]) + trigram(10, 32, 57, [false, true, false]);
    },
    cn: function () {
      return '<rect width="60" height="40" fill="#de2910"/>' + star(10, 10, 5.6) +
        star(20, 4.5, 1.9, 20) + star(24, 9, 1.9, 40) + star(24, 15, 1.9, 10) + star(20, 19.5, 1.9, 30);
    },
    de: function () { return stripesH(['#111', '#dd0000', '#ffce00'], [1, 1, 1]); },
    jp: function () { return '<rect width="60" height="40" fill="#f4f5f8"/><circle cx="30" cy="20" r="11" fill="#bc002d"/>'; },
    br: function () {
      return '<rect width="60" height="40" fill="#009b3a"/><polygon points="30,4 56,20 30,36 4,20" fill="#fedf00"/>' +
        '<circle cx="30" cy="20" r="8.5" fill="#002776"/><path d="M22 18.5Q30 15 38 21.5" stroke="#fff" stroke-width="1.5" fill="none"/>';
    },
    it: function () { return stripesV(['#009246', '#f4f5f8', '#ce2b37']); },
    ch: function () {
      return '<rect width="60" height="40" fill="#e9ecf0"/><rect x="10" width="40" height="40" fill="#d52b1e"/>' +
        '<path d="M30 9V31M19 20H41" stroke="#fff" stroke-width="7"/>';
    },
    fr: function () { return stripesV(['#0055a4', '#f4f5f8', '#ef4135']); }
  };

  /** รูปของคำศัพท์ — คืน <span class="v-pic"> */
  function pic(e, extraClass) {
    var wrap = u.el('span', { class: 'v-pic' + (extraClass ? ' ' + extraClass : ''), 'aria-hidden': 'true' });
    if (e.flag && FLAGS[e.flag]) {
      wrap.classList.add('is-flag');
      wrap.innerHTML = '<svg viewBox="0 0 60 40" preserveAspectRatio="xMidYMid meet">' + FLAGS[e.flag]() + '</svg>';
    } else if (Array.isArray(e.pic)) {
      wrap.classList.add('is-multi');
      e.pic.forEach(function (p) { wrap.appendChild(u.el('span', { text: p })); });
    } else if (/^[\x20-\x7e]+$/.test(e.pic || '')) {
      wrap.classList.add('is-text');
      wrap.textContent = e.pic;
    } else {
      wrap.textContent = e.pic || '🔤';
    }
    return wrap;
  }

  /* ---------- ชนิดตัวอักษร ---------- */
  /** 'kata' | 'hira' | 'latin' — ดูจากคานะตัวแรกที่เจอ (คำผสมอย่าง パワーでんき ถือเป็น kata) */
  function script(e) {
    var k = String(e.kana || '');
    if (/[ァ-ヺ]/.test(k)) return 'kata';
    if (/[ぁ-ゖ]/.test(k)) return 'hira';
    return 'latin';
  }

  var SCRIPT_LABEL = { hira: 'ひらがな', kata: 'カタカナ', latin: 'ABC' };

  function toHira(s) {
    return String(s || '').replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); });
  }

  /** โรมาจิของคำ (ว่างถ้าไม่มีคานะ เช่น AKC) */
  function romaji(text) {
    return u.isJapaneseLine(text) ? u.romaji(text) : '';
  }

  /** ข้อความสำหรับให้เครื่องอ่านออกเสียง — ตัด [ ] ～ ออก */
  function speakable(text) {
    return String(text || '').replace(/[\[\]～〜]/g, '').replace(/[。？]/g, '');
  }

  function speak(text) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      return u.toast('เบราว์เซอร์นี้ไม่รองรับเสียงอ่าน');
    }
    try {
      var ut = new SpeechSynthesisUtterance(speakable(text));
      ut.lang = 'ja-JP';
      ut.rate = 0.85;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(ut);
    } catch (err) {
      u.toast('เล่นเสียงไม่สำเร็จ');
    }
  }

  var canSpeak = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);

  /** ปุ่ม 🔊 — ไม่โผล่ถ้าเบราว์เซอร์ไม่มีเสียงอ่าน */
  function speakBtn(e) {
    if (!canSpeak) return null;
    return u.el('button', {
      class: 'v-speak', type: 'button', title: 'ฟังเสียงอ่าน', 'aria-label': 'ฟังเสียงอ่าน',
      text: '🔊',
      onclick: function (ev) { ev.stopPropagation(); speak(e.kana); }
    });
  }

  /* ---------- ตรวจคำตอบ ---------- */
  /** คลี่ [..] ออกเป็นทั้งแบบใส่และไม่ใส่ เช่น [お]みやげ → おみやげ, みやげ */
  function expand(s) {
    var m = /\[([^\]]*)\]/.exec(s);
    if (!m) return [s];
    var pre = s.slice(0, m.index);
    var out = [];
    expand(s.slice(m.index + m[0].length)).forEach(function (rest) {
      out.push(pre + m[1] + rest);
      out.push(pre + rest);
    });
    return out;
  }

  function norm(s) {
    return u.normalizeText(s).replace(/[～〜~?？!！。、.,・\/]/g, '');
  }

  /** ทุกรูปที่ถือว่าตอบถูก (normalize แล้ว) */
  function accepted(e) {
    var seen = {}, out = [];
    [e.kana, e.alt, e.kanji, e.altKanji].concat(e.answers || []).forEach(function (raw) {
      if (!raw) return;
      expand(raw).forEach(function (f) {
        var n = norm(f);
        if (n && !seen[n]) { seen[n] = 1; out.push(n); }
      });
    });
    return out;
  }

  /**
   * ตรวจคำตอบที่พิมพ์
   * คืน { ok, kind } — kind: 'ok' | 'script' (ถูกคำแต่ผิดชนิดตัวอักษร) | 'romaji' (พิมพ์โรมาจิ) | 'wrong' | 'empty'
   */
  function check(e, input) {
    var n = norm(input);
    if (!n) return { ok: false, kind: 'empty' };
    var list = accepted(e);
    if (list.indexOf(n) >= 0) return { ok: true, kind: 'ok' };

    var h = toHira(n);
    if (list.some(function (a) { return toHira(a) === h; })) return { ok: false, kind: 'script' };

    var plain = n.replace(/[^a-z0-9]/g, '');
    if (plain && [e.kana, e.alt].some(function (k) {
      return k && expand(k).some(function (f) { return romaji(f).toLowerCase().replace(/[^a-z0-9]/g, '') === plain; });
    })) return { ok: false, kind: 'romaji' };

    return { ok: false, kind: 'wrong' };
  }

  /* ---------- จัดกลุ่ม ---------- */
  function chapters(pack) {
    var seen = {}, list = [];
    pack.vocab.forEach(function (v) {
      var c = v.ch || 1;
      if (!seen[c]) { seen[c] = 1; list.push(c); }
    });
    return list.sort(function (a, b) { return a - b; });
  }

  /** [{ ch, group, pages: [], items: [] }] เรียงตามบท แล้วตามลำดับที่หมวดย่อยปรากฏ */
  function groups(items) {
    var order = [], map = {};
    items.forEach(function (v) {
      var key = (v.ch || 1) + '|' + (v.group || '');
      if (!map[key]) {
        map[key] = { ch: v.ch || 1, group: v.group || '', pages: [], items: [] };
        order.push(map[key]);
      }
      if (v.page && map[key].pages.indexOf(v.page) < 0) map[key].pages.push(v.page);
      map[key].items.push(v);
    });
    return order.sort(function (a, b) { return a.ch - b.ch; });   // sort เสถียร — ลำดับในบทคงเดิม
  }

  /** แถบเลือกบท [ทุกบท | บทที่ 1 | ...] — onPick(chOrNull) */
  function chapterChips(pack, current, onPick) {
    var wrap = u.el('div', { class: 'chips', style: 'margin-bottom:12px' });
    function chip(label, value, count) {
      wrap.appendChild(u.el('button', {
        class: 'chip' + (current === value ? ' active' : ''), type: 'button',
        onclick: function () { onPick(value); }
      }, [
        u.el('span', { text: label }),
        u.el('span', { class: 'chip-count', text: String(count) })
      ]));
    }
    chip('ทุกบท', null, pack.vocab.length);
    chapters(pack).forEach(function (c) {
      chip('บทที่ ' + c, c, pack.vocab.filter(function (v) { return (v.ch || 1) === c; }).length);
    });
    return wrap;
  }

  /** โรมาจิ + ชนิดตัวอักษร + คันจิ ของคำ — ใช้ซ้ำในหลายโหมด */
  function japaneseBlock(e, size) {
    var kana = u.el('div', { class: 'v-kana' + (size ? ' ' + size : '') }, [
      u.el('span', { text: e.kana }),
      u.el('span', { class: 'v-script ' + script(e), text: SCRIPT_LABEL[script(e)] })
    ]);
    var box = u.el('div', { class: 'v-jp' }, [kana]);
    if (e.kanji) box.appendChild(u.el('div', { class: 'v-kanji', text: e.kanji }));
    var rom = romaji(e.kana);
    if (rom) box.appendChild(u.el('div', { class: 'v-romaji', text: rom }));
    if (e.alt) {
      var altRom = romaji(e.alt);
      box.appendChild(u.el('div', { class: 'v-alt' }, [
        u.el('span', { text: 'หรือ ' + e.alt }),
        altRom ? u.el('span', { class: 'v-romaji', text: ' · ' + altRom }) : null
      ]));
    }
    return box;
  }

  return {
    pic: pic, script: script, SCRIPT_LABEL: SCRIPT_LABEL, romaji: romaji,
    speak: speak, speakBtn: speakBtn, canSpeak: canSpeak,
    accepted: accepted, check: check,
    chapters: chapters, groups: groups, chapterChips: chapterChips,
    japaneseBlock: japaneseBlock
  };
})();
