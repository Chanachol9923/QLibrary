/* =========================================================
   QLibrary / modes / work.js
   โหมด "แสดงวิธีทำ" — โจทย์คำนวณที่ต้องเขียนมือ

   มีกระดาษทดในตัว เขียนด้วย Apple Pencil / สไตลัส / เมาส์ / นิ้ว ได้
   ใช้ Pointer Events ตัวเดียวคุมทุกอุปกรณ์
     - ปากกาที่ส่งแรงกดมา (pressure) เส้นจะหนา-บางตามน้ำหนักมือ
     - ถ้าเคยเขียนด้วยปากกาแล้ว ระบบจะตัด input แบบนิ้วทิ้ง (palm rejection)
       จะได้วางมือบนจอ iPad แล้วเขียนได้โดยไม่มีเส้นเลอะ
     - ปุ่มยางลบใช้ลบจริง (destination-out) ไม่ใช่ทับด้วยสีขาว ธีมมืดจึงไม่เพี้ยน

   ภาพที่วาดเก็บไว้ในหน่วยความจำของรอบนั้น (ไม่ลง localStorage เพราะกินพื้นที่)
   สลับไป-กลับระหว่างโจทย์/เฉลยได้ ลายมือไม่หาย แต่รีเฟรชแล้วหาย

   ตรวจเองหลังดูเฉลย — กดว่า "ยังไม่ได้ / เกือบได้ / ทำได้" แล้วเข้าระบบ Leitner ปกติ
   ========================================================= */
(function () {
  var u = QL.util;

  QL.modes.register({
    id: 'work',
    name: 'แสดงวิธีทำ',
    icon: '✍️',
    description: 'โจทย์คำนวณแบบข้อสอบจริง มีกระดาษทดให้เขียนด้วยปากกา แล้วเทียบเฉลยทีละขั้น',
    available: function (pack) { return pack.work.length > 0; },

    mount: function (root, ctx) {
      var pack = ctx.pack;
      var deckId = ctx.deckId;

      var tasks = QL.store.orderByPriority(deckId, pack.work, function (w) { return 'work:' + w.id; });
      var idx = 0;
      var revealed = false;
      var score = 0;

      // ลายมือของแต่ละข้อในรอบนี้ (key = id ของโจทย์ → dataURL)
      var sketches = {};
      var pad = null;

      var head = u.el('div', { class: 'study-head' });
      var stage = u.el('div', { class: 'study-stage' });
      root.appendChild(head);
      root.appendChild(stage);

      function renderHead() {
        head.innerHTML = '';
        head.appendChild(u.el('div', {}, [
          u.el('h2', { style: 'margin:0;font-size:19px', text: '✍️ แสดงวิธีทำ' }),
          u.el('div', { class: 'study-meta', text: 'ข้อ ' + Math.min(idx + 1, tasks.length) + ' / ' + tasks.length + ' · ทำได้ ' + score + ' ข้อ' })
        ]));
        head.appendChild(u.el('button', { class: 'btn ghost', text: '← กลับ', onclick: ctx.back }));
      }

      function render() {
        // เก็บลายมือข้อเดิมไว้ก่อนวาดหน้าใหม่
        saveSketch();
        renderHead();
        stage.innerHTML = '';
        pad = null;

        if (idx >= tasks.length) return renderSummary();

        var t = tasks[idx];

        // ---------- โจทย์ ----------
        var card = u.el('div', { class: 'prompt-card' });
        card.appendChild(u.el('div', { class: 'prompt-topic', text: t.topic || pack.title }));
        card.appendChild(u.el('div', { class: 'prompt-text', html: u.mini(t.prompt) }));
        if (t.given) card.appendChild(u.el('pre', { class: 'code', text: t.given }));
        if (t.ask && t.ask.length) {
          var ol = u.el('ol', { class: 'ask-list' });
          t.ask.forEach(function (a) { ol.appendChild(u.el('li', { html: u.mini(a) })); });
          card.appendChild(ol);
        }
        stage.appendChild(card);

        // ---------- กระดาษทด ----------
        stage.appendChild(u.el('div', { class: 'section-title', style: 'margin-top:20px' }, [
          u.el('h2', { text: '📝 กระดาษทด' }),
          u.el('span', { text: 'เขียนด้วยปากกา สไตลัส หรือเมาส์ก็ได้' })
        ]));
        pad = makePad(sketches[t.id]);
        stage.appendChild(pad.node);

        // ---------- ปุ่ม ----------
        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:14px' }, [
          u.el('button', { class: 'btn primary', text: revealed ? 'ซ่อนเฉลย' : '✓ ดูเฉลยทีละขั้น', onclick: toggleAnswer }),
          t.hint ? u.el('button', { class: 'btn', text: '💡 ขอคำใบ้', onclick: showHint }) : null
        ]));

        stage.appendChild(u.el('div', { id: 'work-result' }));

        stage.appendChild(u.el('div', { style: 'margin-top:18px' }, [
          u.bar(idx, tasks.length, { label: 'ความคืบหน้า', text: idx + '/' + tasks.length })
        ]));

        if (revealed) renderAnswer();
      }

      function resultBox() { return u.$('#work-result', stage); }

      function showHint() {
        var box = resultBox();
        if (u.$('.hint', box)) return;
        box.insertBefore(
          u.el('div', { class: 'hint', html: '<b>คำใบ้:</b> ' + u.mini(tasks[idx].hint) }),
          box.firstChild
        );
      }

      function toggleAnswer() {
        revealed = !revealed;
        saveSketch();
        render();
      }

      /** เฉลยแบบไล่ทีละขั้น — ขั้นละการ์ด จะได้เทียบกับที่เขียนเองได้ทีละบรรทัด */
      function renderAnswer() {
        var t = tasks[idx];
        var box = resultBox();

        var wrap = u.el('div', { class: 'solution', style: 'margin-top:16px' });
        wrap.appendChild(u.el('div', { class: 'section-title' }, [u.el('h2', { text: 'เฉลยทีละขั้น' })]));

        (t.steps || []).forEach(function (st, i) {
          var step = u.el('div', { class: 'solution-step' }, [
            u.el('div', { class: 'step-no', text: String(i + 1) }),
            u.el('div', { class: 'step-body' }, [
              st.title ? u.el('div', { class: 'step-title', html: u.mini(st.title) }) : null,
              st.detail ? u.el('div', { class: 'step-detail', html: u.mini(st.detail) }) : null,
              st.calc ? u.el('pre', { class: 'code calc', text: st.calc }) : null,
              st.note ? u.el('div', { class: 'step-note', html: '⚠️ ' + u.mini(st.note) }) : null
            ])
          ]);
          wrap.appendChild(step);
        });

        if (t.answer) {
          wrap.appendChild(u.el('div', { class: 'feedback ok', style: 'margin-top:14px' }, [
            u.el('strong', { text: 'คำตอบสุดท้าย' }),
            u.el('span', { html: u.mini(t.answer) })
          ]));
        }

        if (t.trap) {
          wrap.appendChild(u.el('div', { class: 'feedback bad', style: 'margin-top:10px' }, [
            u.el('strong', { text: 'จุดที่คนพลาดบ่อย' }),
            u.el('span', { html: u.mini(t.trap) })
          ]));
        }

        // ให้คะแนนตัวเอง
        wrap.appendChild(u.el('div', { class: 'section-title', style: 'margin-top:18px' }, [
          u.el('h2', { text: 'เทียบกับที่เขียนแล้ว เป็นยังไง' })
        ]));
        wrap.appendChild(u.el('div', { class: 'btn-row' }, [
          u.el('button', { class: 'btn bad', text: 'ยังไม่ได้', onclick: function () { grade(false); } }),
          u.el('button', { class: 'btn warn', text: 'เกือบได้ ติดบางขั้น', onclick: function () { grade(false); } }),
          u.el('button', { class: 'btn ok', text: 'ทำได้เอง', onclick: function () { grade(true); } })
        ]));

        box.appendChild(wrap);
      }

      function grade(ok) {
        var t = tasks[idx];
        QL.store.grade(deckId, 'work:' + t.id, ok, false);
        if (ok) score++;
        saveSketch();
        idx++;
        revealed = false;
        render();
      }

      function saveSketch() {
        if (pad && idx < tasks.length) {
          var data = pad.toDataURL();
          if (data) sketches[tasks[idx].id] = data;
        }
      }

      function renderSummary() {
        QL.store.logSession(deckId, 'work', score, tasks.length);
        var p = u.pct(score, tasks.length);

        stage.appendChild(u.el('div', { class: 'card result-big' }, [
          u.el('div', { class: 'result-score', text: score + '/' + tasks.length }),
          u.el('div', { class: 'result-label', text: p >= 80 ? 'พร้อมสอบแล้ว 💪' : 'ทวนขั้นที่ยังติดอีกรอบ แล้วลองเขียนใหม่' })
        ]));

        stage.appendChild(u.el('div', { class: 'btn-row', style: 'margin-top:18px' }, [
          u.el('button', {
            class: 'btn primary', text: 'ทำอีกรอบ', onclick: function () {
              tasks = QL.store.orderByPriority(deckId, pack.work, function (w) { return 'work:' + w.id; });
              idx = 0; score = 0; revealed = false; sketches = {}; render();
            }
          }),
          u.el('button', { class: 'btn ghost', text: 'กลับหน้าบทเรียน', onclick: ctx.back })
        ]));
      }

      /* =====================================================
         กระดาษทด
         ===================================================== */
      function makePad(restoreData) {
        var tool = 'pen';            // 'pen' | 'eraser'
        var padHeight = 460;         // กดเพิ่มพื้นที่ได้ถ้าเขียนไม่พอ (ข้อ backprop ยาว)
        var penSize = 2.2;
        var eraserSize = 26;
        var strokes = [];            // เก็บไว้เพื่อ undo (เส้นละ array ของจุด)
        var restored = null;         // ลายมือที่กู้คืนมาจากข้อเดิม วาดเป็นพื้นหลังไว้ก่อน
        var current = null;
        var sawPen = false;          // เคยมี input จากปากกาไหม → ถ้าเคย ตัดนิ้วทิ้ง
        var drawing = false;

        var canvas = u.el('canvas', { class: 'pad-canvas' });
        var ctx2d = canvas.getContext('2d');

        var toolbar = u.el('div', { class: 'pad-tools' }, [
          toolBtn('✏️', 'ปากกา', function () { setTool('pen'); }, 'pen'),
          toolBtn('🧽', 'ยางลบ', function () { setTool('eraser'); }, 'eraser'),
          u.el('span', { class: 'pad-sep' }),
          u.el('button', { class: 'btn ghost pad-btn', text: '↩ ย้อน', onclick: undo }),
          u.el('button', { class: 'btn ghost pad-btn', text: '🗑 ล้างทั้งหมด', onclick: clearAll }),
          u.el('button', { class: 'btn ghost pad-btn', text: '＋ เพิ่มพื้นที่', onclick: grow }),
          u.el('span', { class: 'pad-hint', text: 'วางมือบนจอได้ ถ้าเขียนด้วยปากกา' })
        ]);

        var wrap = u.el('div', { class: 'pad' }, [toolbar, u.el('div', { class: 'pad-paper' }, [canvas])]);

        function toolBtn(icon, label, fn, id) {
          var b = u.el('button', {
            class: 'btn pad-btn' + (tool === id ? ' primary' : ''),
            'data-tool': id,
            text: icon + ' ' + label,
            onclick: fn
          });
          return b;
        }

        function setTool(t) {
          tool = t;
          u.$$('.pad-btn[data-tool]', wrap).forEach(function (b) {
            b.classList.toggle('primary', b.getAttribute('data-tool') === t);
          });
        }

        /** ปรับ canvas ให้คมบนจอ retina และกว้างเต็มกล่อง */
        function fit() {
          var dpr = window.devicePixelRatio || 1;
          var rect = canvas.parentNode.getBoundingClientRect();
          var w = Math.max(320, Math.floor(rect.width));
          var h = padHeight;
          canvas.style.width = w + 'px';
          canvas.style.height = h + 'px';
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
          ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
          redraw();
        }

        function inkColor() {
          // อ่านสีจากธีมปัจจุบัน จะได้เขียนแล้วเห็นทั้งธีมสว่างและมืด
          return getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#000';
        }

        function redraw() {
          ctx2d.save();
          ctx2d.setTransform(1, 0, 0, 1, 0, 0);
          ctx2d.clearRect(0, 0, canvas.width, canvas.height);
          ctx2d.restore();

          if (restored && restored.complete) {
            ctx2d.save();
            ctx2d.setTransform(1, 0, 0, 1, 0, 0);
            // วาดตามขนาดเดิมของภาพ ไม่ยืดให้เต็มผืนใหม่ (กดเพิ่มพื้นที่แล้วลายมือจะได้ไม่บิด)
            ctx2d.drawImage(restored, 0, 0);
            ctx2d.restore();
          }

          var color = inkColor();
          strokes.forEach(function (s) { paint(s, color); });
        }

        function paint(stroke, color) {
          if (!stroke.points.length) return;
          ctx2d.save();
          ctx2d.lineCap = 'round';
          ctx2d.lineJoin = 'round';
          if (stroke.tool === 'eraser') {
            ctx2d.globalCompositeOperation = 'destination-out';
            ctx2d.strokeStyle = 'rgba(0,0,0,1)';
          } else {
            ctx2d.globalCompositeOperation = 'source-over';
            ctx2d.strokeStyle = color;
          }

          var pts = stroke.points;
          if (pts.length === 1) {
            ctx2d.beginPath();
            ctx2d.arc(pts[0].x, pts[0].y, Math.max(stroke.size * pts[0].p, 0.6), 0, Math.PI * 2);
            ctx2d.fillStyle = stroke.tool === 'eraser' ? 'rgba(0,0,0,1)' : color;
            ctx2d.fill();
          } else {
            // ลากทีละช่วง เพื่อให้ความหนาเปลี่ยนตามแรงกดปากกาได้
            for (var i = 1; i < pts.length; i++) {
              ctx2d.beginPath();
              ctx2d.lineWidth = Math.max(stroke.size * ((pts[i].p + pts[i - 1].p) / 2), 0.5);
              ctx2d.moveTo(pts[i - 1].x, pts[i - 1].y);
              ctx2d.lineTo(pts[i].x, pts[i].y);
              ctx2d.stroke();
            }
          }
          ctx2d.restore();
        }

        function pos(e) {
          var r = canvas.getBoundingClientRect();
          return { x: e.clientX - r.left, y: e.clientY - r.top };
        }

        /** แรงกด: ปากกาส่งค่ามาจริง ส่วนเมาส์/นิ้วให้คงที่ */
        function pressure(e) {
          if (e.pointerType === 'pen' && e.pressure > 0) return 0.45 + e.pressure * 1.1;
          return 1;
        }

        function shouldIgnore(e) {
          // เคยเขียนด้วยปากกาแล้ว → นิ้ว/ฝ่ามือที่แตะจอไม่ต้องวาด
          return sawPen && e.pointerType === 'touch';
        }

        canvas.addEventListener('pointerdown', function (e) {
          if (e.pointerType === 'pen') sawPen = true;
          if (shouldIgnore(e)) return;
          e.preventDefault();
          try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ไม่รองรับก็วาดต่อได้ */ }
          drawing = true;
          var p = pos(e);
          current = {
            tool: (e.button === 5 || e.buttons === 32) ? 'eraser' : tool,  // ปลายยางลบของสไตลัส
            size: tool === 'eraser' ? eraserSize : penSize * 3,
            points: [{ x: p.x, y: p.y, p: pressure(e) }]
          };
          strokes.push(current);
          paint(current, inkColor());
        });

        canvas.addEventListener('pointermove', function (e) {
          if (!drawing || !current || shouldIgnore(e)) return;
          e.preventDefault();

          // ถ้าเบราว์เซอร์เก็บจุดระหว่างเฟรมไว้ให้ ใช้ด้วย เส้นจะลื่นกว่า
          // (บางกรณีคืน array ว่างมา ต้องถอยมาใช้ event ตัวเองเสมอ ไม่งั้นเส้นหาย)
          var events = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
          if (!events || !events.length) events = [e];
          var color = inkColor();
          events.forEach(function (ev) {
            var pt = pos(ev);
            var pr = pressure(ev);
            var pts = current.points;
            var last = pts[pts.length - 1];
            if (last && Math.abs(last.x - pt.x) < 0.4 && Math.abs(last.y - pt.y) < 0.4) return;
            pts.push({ x: pt.x, y: pt.y, p: pr });

            ctx2d.save();
            ctx2d.lineCap = 'round';
            ctx2d.lineJoin = 'round';
            if (current.tool === 'eraser') {
              ctx2d.globalCompositeOperation = 'destination-out';
              ctx2d.strokeStyle = 'rgba(0,0,0,1)';
            } else {
              ctx2d.globalCompositeOperation = 'source-over';
              ctx2d.strokeStyle = color;
            }
            ctx2d.beginPath();
            ctx2d.lineWidth = Math.max(current.size * ((pr + last.p) / 2), 0.5);
            ctx2d.moveTo(last.x, last.y);
            ctx2d.lineTo(pt.x, pt.y);
            ctx2d.stroke();
            ctx2d.restore();
          });
        });

        function endStroke(e) {
          if (!drawing) return;
          drawing = false;
          current = null;
          try {
            if (e && canvas.hasPointerCapture && canvas.hasPointerCapture(e.pointerId)) {
              canvas.releasePointerCapture(e.pointerId);
            }
          } catch (err) { /* ปล่อยผ่าน */ }
        }
        canvas.addEventListener('pointerup', endStroke);
        canvas.addEventListener('pointercancel', endStroke);
        canvas.addEventListener('pointerleave', endStroke);

        function grow() { padHeight += 320; fit(); }

        function undo() { strokes.pop(); redraw(); }
        function clearAll() {
          if ((strokes.length || restored) && !confirm('ล้างกระดาษทดข้อนี้ทั้งหมด?')) return;
          strokes = [];
          restored = null;
          redraw();
        }

        // วาดใหม่เมื่อสลับธีม (สีหมึกเปลี่ยนตามตัวหนังสือ)
        var themeWatch = new MutationObserver(redraw);
        themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        var resizeTimer = null;
        function onResize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(fit, 120); }
        window.addEventListener('resize', onResize);

        // รอให้ layout นิ่งก่อนค่อยวัดขนาด
        setTimeout(function () {
          fit();
          if (restoreData) {
            var img = new Image();
            img.onload = function () { restored = img; redraw(); };
            img.src = restoreData;
          }
        }, 0);

        return {
          node: wrap,
          toDataURL: function () {
            try {
              return (strokes.length || restored) ? canvas.toDataURL('image/png') : null;
            } catch (err) { return null; }
          }
        };
      }

      ctx.onKey(function (e) {
        if (idx >= tasks.length) return;
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); toggleAnswer(); }
      });

      render();
    }
  });
})();
