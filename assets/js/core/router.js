/* =========================================================
   QLibrary / core / router.js
   router แบบ hash ง่าย ๆ ทำงานได้แม้เปิดไฟล์ตรง ๆ (file://)

   เส้นทางที่ใช้:
     #/                      หน้าแรก (รายการบทเรียน)
     #/deck/<deckId>         หน้าเลือกโหมดของบทเรียนนั้น
     #/deck/<deckId>/<mode>  เข้าโหมดเรียน
   ========================================================= */
window.QL = window.QL || {};

QL.router = (function () {
  var handlers = [];   // [{ pattern: [..], fn }]
  var current = null;

  /** ลงทะเบียนเส้นทาง เช่น on('deck/:id/:mode', fn) */
  function on(pattern, fn) {
    handlers.push({ parts: pattern.split('/').filter(Boolean), fn: fn });
  }

  function parse() {
    var hash = location.hash.replace(/^#\/?/, '');
    return hash.split('/').filter(Boolean);
  }

  function match(parts, route) {
    if (route.parts.length !== parts.length) return null;
    var params = {};
    for (var i = 0; i < parts.length; i++) {
      var p = route.parts[i];
      if (p.charAt(0) === ':') params[p.slice(1)] = decodeURIComponent(parts[i]);
      else if (p !== parts[i]) return null;
    }
    return params;
  }

  function resolve() {
    var parts = parse();
    for (var i = 0; i < handlers.length; i++) {
      var params = match(parts, handlers[i]);
      if (params) {
        current = { parts: parts, params: params };
        window.scrollTo(0, 0);
        handlers[i].fn(params);
        return;
      }
    }
    go('');   // ไม่ตรงกับอะไรเลย กลับหน้าแรก
  }

  function go(path) {
    var target = '#/' + String(path || '').replace(/^\/+/, '');
    if (location.hash === target) resolve();
    else location.hash = target;
  }

  function start() {
    window.addEventListener('hashchange', resolve);
    resolve();
  }

  return { on: on, go: go, start: start, current: function () { return current; } };
})();
