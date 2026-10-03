/* =========================================================
   QLibrary / modes / browse.js
   โหมด "อ่านสรุป" — เปิดดูเนื้อหาทั้งบทแบบชีทสรุป มีช่องค้นหา
   ไม่มีการให้คะแนน ไม่แตะระบบความจำ ใช้เปิดทวนก่อนสอบ
   ========================================================= */
(function () {
  var u = QL.util;

  QL.modes.register({
    id: 'browse',
    name: 'อ่านสรุป',
    icon: '📖',
    description: 'ชีทสรุปทั้งบท พร้อมช่องค้นหา เปิดทวนเร็ว ๆ ก่อนสอบ',
    available: function (pack) { return pack.topics.length > 0; },

    mount: function (root, ctx) {
      var pack = ctx.pack;
      var isText = pack.answerStyle === 'text';
      var codeClass = 'code' + (isText ? ' lang' : '');
      function jp(text) { return isText ? u.miniJP(text, true) : u.mini(text); }

      var search = u.el('input', {
        class: 'search-input',
        type: 'search',
        placeholder: 'ค้นหาในบทนี้ เช่น form, table, semantic...'
      });

      var listWrap = u.el('div', { style: 'margin-top:16px' });

      root.appendChild(u.el('div', { class: 'study-head' }, [
        u.el('div', {}, [
          u.el('h2', { style: 'margin:0;font-size:19px', text: 'สรุปเนื้อหา ' + pack.title }),
          u.el('div', { class: 'study-meta', text: pack.topics.length + ' หัวข้อ' })
        ]),
        u.el('button', { class: 'btn ghost', text: '← กลับ', onclick: ctx.back })
      ]));
      root.appendChild(search);
      root.appendChild(listWrap);

      function topicNode(t) {
        var body = u.el('div', { class: 'topic-body' });

        if (t.summary) body.appendChild(u.el('p', { html: jp(t.summary) }));

        if (t.points && t.points.length) {
          var ul = u.el('ul');
          t.points.forEach(function (p) { ul.appendChild(u.el('li', { html: jp(p) })); });
          body.appendChild(ul);
        }

        // ตาราง (ไม่ใส่ก็ได้) — { head: ['คอลัมน์...'], rows: [['ช่อง...']] }
        // ใช้กับข้อมูลที่ต้องเรียงเป็นคอลัมน์ เช่น ตารางตัวเลข ซึ่งจัดด้วย pre ไม่ตรง
        if (t.table && t.table.rows && t.table.rows.length) {
          body.appendChild(tableNode(t.table));
        }

        if (t.code) body.appendChild(u.jpBlock(t.code, codeClass, isText));

        var d = u.el('details', { class: 'topic' }, [
          u.el('summary', { text: t.title }),
          body
        ]);
        return d;
      }

      function tableNode(spec) {
        var table = u.el('table', { class: 'ref-table' });
        if (spec.head && spec.head.length) {
          var thead = u.el('thead');
          thead.appendChild(u.el('tr', {}, spec.head.map(function (h) {
            return u.el('th', { html: u.mini(h) });
          })));
          table.appendChild(thead);
        }
        var tbody = u.el('tbody');
        spec.rows.forEach(function (row) {
          tbody.appendChild(u.el('tr', {}, row.map(function (cell) {
            return u.el('td', { html: jp(cell) });
          })));
        });
        table.appendChild(tbody);
        return u.el('div', { class: 'ref-table-wrap' }, [table]);
      }

      function render(keyword) {
        listWrap.innerHTML = '';
        var kw = (keyword || '').trim().toLowerCase();

        var topics = pack.topics.filter(function (t) {
          if (!kw) return true;
          var hay = [t.title, t.summary, (t.points || []).join(' '), t.code || ''].join(' ').toLowerCase();
          return hay.indexOf(kw) !== -1;
        });

        if (!topics.length) {
          listWrap.appendChild(u.el('div', { class: 'empty' }, [
            u.el('div', { class: 'empty-icon', text: '🔍' }),
            u.el('div', { text: 'ไม่พบหัวข้อที่ตรงกับ "' + keyword + '"' })
          ]));
          return;
        }

        topics.forEach(function (t, i) {
          var node = topicNode(t);
          if (kw || i === 0) node.setAttribute('open', 'open');   // ค้นหาแล้วกางให้เลย
          listWrap.appendChild(node);
        });
      }

      search.addEventListener('input', function () { render(search.value); });
      render('');
    }
  });
})();
