/* =========================================================
   QLibrary / core / util.js
   ฟังก์ชันช่วยเล็ก ๆ ที่ใช้ซ้ำทั้งระบบ
   ========================================================= */
window.QL = window.QL || {};

QL.util = (function () {

  /** เลือก element ตัวเดียว */
  function $(sel, root) { return (root || document).querySelector(sel); }

  /** เลือก element หลายตัว คืนเป็น array */
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /** สร้าง element พร้อม attribute และลูก */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else if (k.indexOf('on') === 0 && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    });
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  /** escape ข้อความก่อนยัดลง innerHTML */
  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /**
   * markdown จิ๋ว ๆ สำหรับเนื้อหาบทเรียน รองรับเท่านี้พอ:
   *   `code`  **bold**  *italic*  ขึ้นบรรทัดใหม่ด้วย \n
   * (escape ก่อนเสมอ เลยปลอดภัยกับ tag HTML ที่เราต้องการ "แสดงเป็นตัวอักษร")
   */
  function mini(text) {
    return esc(text)
      .replace(/`([^`]+)`/g, '<code class="inline">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/\n/g, '<br>');
  }

  /** สลับลำดับ array (Fisher-Yates) โดยไม่แก้ต้นฉบับ */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /** สุ่มหยิบ n ตัว */
  function sample(arr, n) { return shuffle(arr).slice(0, n); }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }

  /** วันนี้เวลาเที่ยงคืน (ms) — ใช้เทียบกำหนดทบทวน */
  function today() {
    var d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime();
  }

  function daysFromNow(days) { return today() + days * 86400000; }

  function formatDate(ts) {
    if (!ts) return '-';
    var d = new Date(ts);
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  }

  /** แถบ progress */
  function bar(value, total, opts) {
    opts = opts || {};
    var p = pct(value, total);
    var wrap = el('div', { class: 'bar-row' });
    if (opts.label) wrap.appendChild(el('span', { text: opts.label }));
    var b = el('div', { class: 'bar' + (p >= 100 ? ' ok' : '') });
    b.appendChild(el('i', { style: 'width:' + p + '%' }));
    wrap.appendChild(b);
    wrap.appendChild(el('span', { text: opts.text || (value + '/' + total) }));
    return wrap;
  }

  /** ข้อความเด้งมุมล่าง */
  var toastTimer = null;
  function toast(msg) {
    var old = $('.toast'); if (old) old.remove();
    var t = el('div', { class: 'toast', text: msg });
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.remove(); }, 1900);
  }

  /** modal ง่าย ๆ */
  function modal(title, bodyNode) {
    var root = $('#modal-root');
    root.innerHTML = '';
    var box = el('div', { class: 'modal' }, [el('h3', { text: title }), bodyNode]);
    var close = el('div', { class: 'btn-row', style: 'margin-top:16px;justify-content:flex-end' }, [
      el('button', { class: 'btn', onclick: function () { root.innerHTML = ''; }, text: 'ปิด' })
    ]);
    box.appendChild(close);
    var back = el('div', {
      class: 'modal-backdrop',
      onclick: function (e) { if (e.target === back) root.innerHTML = ''; }
    }, [box]);
    root.appendChild(back);
  }

  /**
   * normalize คำตอบของโหมด "ทดสอบเขียน"
   * ให้ยืดหยุ่นพอที่คนพิมพ์จริงจะผ่าน แต่ยังตรวจความถูกต้องได้
   *  - ตัดช่องว่างหัวท้าย + ยุบช่องว่างซ้ำ
   *  - ตัดช่องว่างรอบ < > = /
   *  - แปลง " ' ให้เป็นแบบเดียวกัน
   *  - ตัวพิมพ์เล็กทั้งหมด
   */
  function normalizeCode(s) {
    return String(s || '')
      .replace(/[“”‘’]/g, '"')
      .replace(/'/g, '"')
      .replace(/\s+/g, ' ')
      .replace(/\s*([<>=\/])\s*/g, '$1')
      .trim()
      .toLowerCase();
  }

  /**
   * normalize คำตอบแบบ "ข้อความ" (ใช้กับวิชาภาษา เช่น ญี่ปุ่น)
   * ต่างจาก normalizeCode ตรงที่ภาษาญี่ปุ่นไม่เว้นวรรคระหว่างคำ
   *  - แปลงอักษรเต็มความกว้าง (Ａ１（） ฯลฯ) เป็นครึ่งความกว้าง
   *  - ตัดช่องว่างทุกชนิดทิ้ง รวมช่องว่างญี่ปุ่น (U+3000)
   *  - ตัด 。、ท้ายประโยคออก (ใส่หรือไม่ใส่ก็ถือว่าถูก)
   *  - ตัวพิมพ์เล็กทั้งหมด
   */
  function normalizeText(s) {
    return String(s || '')
      .replace(/[！-～]/g, function (c) {
        return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
      })
      .replace(/[“”‘’]/g, '"')
      .replace(/[\s　]+/g, '')
      .replace(/[。、.,]+$/g, '')
      .toLowerCase();
  }

  /** เลือกตัวตรวจคำตอบให้เหมาะกับชนิดของ pack ('text' = ภาษา, นอกนั้น = โค้ด) */
  function normalizerFor(pack) {
    return (pack && pack.answerStyle === 'text') ? normalizeText : normalizeCode;
  }

  /* =========================================================
     คำอ่านโรมาจิ (เฮ็ปเบิร์น) — แปลงจากคานะอัตโนมัติ
     ใช้กำกับใต้ตัวอักษรญี่ปุ่นในทุกโหมด จะได้อ่านออกตั้งแต่ยังจำคานะไม่แม่น

     ขอบเขต: แปลงเฉพาะฮิรางานะ/คาตากานะ ตัวคันจิจะถูกตัดทิ้งจากบรรทัดโรมาจิ
     (เพราะอ่านแทนไม่ได้ ในเนื้อหาเราเขียนคำอ่านเป็นคานะไว้ให้อยู่แล้ว)
     ถ้าตัวแปลงอ่านผิด กำหนดเองได้ด้วย `romajiFix` ใน content pack
     (map จาก "บรรทัดภาษาญี่ปุ่น" → "คำอ่านที่ต้องการ" ใช้ได้กับทุกโหมด)
     ========================================================= */

  var KANA = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'o', 'ゔ': 'vu',
    'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o',
    'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'ゎ': 'wa',
    // เสียงควบ
    'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
    'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
    'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho', 'しぇ': 'she',
    'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo', 'じぇ': 'je',
    'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho', 'ちぇ': 'che',
    'ぢゃ': 'ja', 'ぢゅ': 'ju', 'ぢょ': 'jo',
    'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
    'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
    'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
    'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
    'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
    'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
    // เสียงที่มาจากคำทับศัพท์ (คาตากานะ)
    'ふぁ': 'fa', 'ふぃ': 'fi', 'ふぇ': 'fe', 'ふぉ': 'fo', 'ふゅ': 'fyu',
    'てぃ': 'ti', 'でぃ': 'di', 'とぅ': 'tu', 'どぅ': 'du',
    'うぃ': 'wi', 'うぇ': 'we', 'うぉ': 'wo',
    'ゔぁ': 'va', 'ゔぃ': 'vi', 'ゔぇ': 've', 'ゔぉ': 'vo',
    'くぁ': 'kwa', 'ぐぁ': 'gwa', 'つぁ': 'tsa', 'つぃ': 'tsi', 'つぇ': 'tse', 'つぉ': 'tso'
  };

  var JP_PUNCT = { '。': '.', '、': ',', '・': ' ', '「': '"', '」': '"', '？': '?', '！': '!', '　': ' ', '（': '(', '）': ')', '：': ':', '～': '~', '〜': '~' };

  function isVowel(c) { return 'aiueo'.indexOf(c) >= 0; }

  /** คาตากานะ → ฮิรางานะ (จะได้ใช้ตารางเดียว) */
  function toHiragana(s) {
    return String(s || '').replace(/[ァ-ヶ]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) - 0x60);
    });
  }

  /** อ่าน 1 พยางค์ที่ตำแหน่ง i คืน [โรมาจิ, จำนวนตัวอักษรที่กิน] */
  function readSyllable(s, i) {
    var two = s.substr(i, 2);
    if (KANA[two]) return [KANA[two], 2];
    var one = s.charAt(i);
    if (KANA[one]) return [KANA[one], 1];
    return [null, 1];
  }

  /**
   * แปลงข้อความญี่ปุ่นเป็นโรมาจิ
   * จุดที่ใส่ใจเป็นพิเศษ (เพราะเป็นเนื้อหาที่กำลังสอบพอดี):
   *   - คำช่วย は อ่านว่า "wa" ไม่ใช่ "ha" — ตรวจจากตำแหน่ง (ตามด้วยเว้นวรรค/เครื่องหมาย/จบบรรทัด)
   *   - っ ซ้ำพยัญชนะตัวถัดไป · ー ยืดสระตัวหน้า · ん เติม ' หน้าสระเพื่อกันอ่านผิด
   *   - ตัด です/ますออกเป็นคำ จะได้อ่านเป็นวรรคเหมือนที่พูดจริง
   */
  var romajiFix = {};

  /** ลงทะเบียนคำอ่านที่กำหนดเอง — ทับผลของตัวแปลงอัตโนมัติ (ใช้ field romajiFix ใน content pack) */
  function addRomajiFix(map) {
    Object.keys(map || {}).forEach(function (k) { romajiFix[k.trim()] = map[k]; });
  }

  function romaji(text) {
    var s = String(text === undefined || text === null ? '' : text);

    if (romajiFix[s.trim()] !== undefined) return romajiFix[s.trim()];

    s = s.replace(/\*\*|`|\*/g, '');   // ตัดมาร์กอัปของ mini() ออก ไม่ให้ไปโผล่ในคำอ่าน

    // ตัดวงเล็บที่ใส่คันจิกำกับไว้ทิ้งก่อน เช่น せんせい (先生) → せんせい
    // (อ่านคันจิแทนไม่ได้ และในเนื้อหาเขียนคำอ่านเป็นคานะไว้ให้แล้ว)
    // ระวังไม่ไปโดนช่องว่างเติมคำ （　）ซึ่งต้องคงไว้ให้เห็น
    s = s.replace(/[（(]([^（()）]*)[)）]/g, function (all, inner) {
      return /[々一-鿿]/.test(inner) ? '' : all;
    });

    s = toHiragana(s);

    /* ---- ตัดคำก่อนแปลง เพื่อให้โรมาจิอ่านเป็นวรรคเหมือนที่พูดจริง ----
       ลำดับสำคัญ: では ต้องมาก่อนกฎคำช่วย は ไม่งั้นจะถูกกินไปก่อน */
    s = s.replace(/では(?=[\s　])/g, ' \u0002');              // では ありません → dewa arimasen
    s = s.replace(/じゃ(?=[\s　])/g, ' じゃ');                // ～じゃ ありません
    s = s.replace(/は(?=[\s　。、？！?!」』）)]|$)/g, '\u0001'); // คำช่วย は อ่านว่า wa
    s = s.replace(/も(?=[\s　。、？！?!]|$)/g, ' も');          // คำช่วย も
    // คำช่วย の ที่คั่นคำนาม — ยกเว้น この/その/あの/どの ซึ่ง の เป็นส่วนหนึ่งของคำ
    s = s.replace(/([^こそあど])の(?=[\s　で])/g, '$1 の');
    // คำต่อท้ายชื่อ/สัญชาติ — ตัดเฉพาะตอนที่ตามด้วยขอบคำจริง ๆ
    // (กัน さん ในตัวเลขอย่าง いちまんさんぜん ถูกตัดผิด)
    s = s.replace(/(さん|ちゃん|じん)(?=[\s　。、？！?!」』（）()]|も|の|で|じゃ|か|$)/g, ' $1');
    // ～から きました — แต่ これから / それから เป็นคำเดียว ไม่ต้องตัด
    s = s.replace(/(.?)から(?=[\s　])/g, function (all, before) {
      return before === 'れ' ? all : before + ' から';
    });
    s = s.replace(/(.)ですか/g, '$1 です か');
    s = s.replace(/(.)(です|でした|でしょう)/g, '$1 $2');

    var out = [];
    var i = 0;

    while (i < s.length) {
      var ch = s.charAt(i);

      if (ch === '\u0001') { out.push(' wa'); i++; continue; }
      if (ch === '\u0002') { out.push('dewa'); i++; continue; }

      // สระยาว ー → ซ้ำสระตัวสุดท้าย
      if (ch === 'ー' || ch === '―' || ch === '‐') {
        var prev = out.length ? out[out.length - 1] : '';
        var last = prev.charAt(prev.length - 1);
        out.push(isVowel(last) ? last : '');
        i++;
        continue;
      }

      // ตัวสะกดคู่ っ → ซ้ำพยัญชนะตัวแรกของพยางค์ถัดไป
      if (ch === 'っ') {
        var nxt = readSyllable(s, i + 1);
        if (nxt[0]) out.push(nxt[0].indexOf('ch') === 0 ? 't' : nxt[0].charAt(0));
        i++;
        continue;
      }

      // ん → n แต่เติม ' หน้าสระหรือ y เพื่อไม่ให้อ่านติดกัน (เช่น きん + い)
      if (ch === 'ん') {
        var after = readSyllable(s, i + 1)[0];
        out.push(after && (isVowel(after.charAt(0)) || after.charAt(0) === 'y') ? "n'" : 'n');
        i++;
        continue;
      }

      var syl = readSyllable(s, i);
      if (syl[0]) { out.push(syl[0]); i += syl[1]; continue; }

      if (JP_PUNCT[ch]) { out.push(JP_PUNCT[ch]); i++; continue; }

      out.push(ch);
      i++;
    }

    return out.join('')
      .replace(/[々一-鿿豈-﫿]/g, '')      // ตัดคันจิที่เหลือทิ้ง (อ่านแทนไม่ได้)
      .replace(/\(\s+/g, '(').replace(/\s+\)/g, ')')           // ตัดช่องว่างที่ชิดในวงเล็บ
      .replace(/\(\)/g, '( )')                                 // วงเล็บเติมคำ — คงช่องว่างไว้ให้เห็น
      .replace(/([^\s(])\(/g, '$1 (')                          // เว้นวรรคก่อนวงเล็บ
      .replace(/\)([^\s.,?!)\]])/g, ') $1')                    // เว้นวรรคหลังวงเล็บ
      .replace(/\s*([.,?!])/g, '$1')                           // ไม่เว้นวรรคหน้าเครื่องหมาย
      // เว้นวรรคหลังเครื่องหมาย แต่ไม่แตะจุลภาคในตัวเลข (1,500)
      .replace(/([^0-9\s])([.,?!])(?=[^\s.,?!)\]"])/g, '$1$2 ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** มีคานะไหม */
  function hasKana(s) { return /[ぁ-ゖァ-ヺ]/.test(String(s || '')); }

  /** บรรทัดนี้เป็นภาษาญี่ปุ่นล้วนไหม (มีคานะ และไม่มีอักษรไทยปน) */
  function isJapaneseLine(s) {
    var line = String(s || '');
    if (!hasKana(line) || /[฀-๿]/.test(line)) return false;
    // มีคันจิอยู่นอกวงเล็บ = อ่านแทนไม่ได้ทั้งบรรทัด ไม่ต้องใส่คำอ่านดีกว่าใส่แล้วขาด
    return !/[々一-鿿]/.test(line.replace(/[（(][^（()）]*[)）]/g, ''));
  }

  /**
   * mini() แบบแยกบรรทัด + แปะโรมาจิใต้บรรทัดที่เป็นภาษาญี่ปุ่น
   * ใช้เฉพาะ pack ภาษา (answerStyle: 'text') — pack โค้ดยังใช้ mini() เดิมทุกอย่าง
   */
  function miniJP(text, withRomaji) {
    var lines = String(text === undefined || text === null ? '' : text).split('\n');
    return lines.map(function (line) {
      var body = line.trim() === '' ? '&nbsp;' : mini(line);
      var rom = withRomaji && isJapaneseLine(line) ? romaji(line) : '';
      return '<span class="jp-line">' + body +
        (rom ? '<span class="romaji">' + esc(rom) + '</span>' : '') + '</span>';
    }).join('');
  }

  /** บล็อกตัวอย่างประโยค — แต่ละบรรทัดมีโรมาจิกำกับใต้บรรทัด */
  function jpBlock(text, cls, withRomaji) {
    var pre = el('pre', { class: cls });
    String(text || '').split('\n').forEach(function (line) {
      var rom = withRomaji && isJapaneseLine(line) ? romaji(line) : '';
      pre.appendChild(el('span', { class: 'jp-line', text: line || ' ' }));
      if (rom) pre.appendChild(el('span', { class: 'romaji', text: rom }));
    });
    return pre;
  }

  return {
    $: $, $$: $$, el: el, esc: esc, mini: mini,
    shuffle: shuffle, sample: sample, clamp: clamp, pct: pct,
    today: today, daysFromNow: daysFromNow, formatDate: formatDate,
    bar: bar, toast: toast, modal: modal,
    normalizeCode: normalizeCode, normalizeText: normalizeText, normalizerFor: normalizerFor,
    romaji: romaji, addRomajiFix: addRomajiFix, hasKana: hasKana, isJapaneseLine: isJapaneseLine,
    miniJP: miniJP, jpBlock: jpBlock
  };
})();
