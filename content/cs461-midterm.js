/* =========================================================
   Content Pack: CS461 Deep Learning — ติวสอบกลางภาค
   อ้างอิงจาก CS461_PracticeExam (เฉลยลายมือของอาจารย์) ใน LessonDoc/DeepLearning

   ข้อสอบจริง 4 ข้อ ตรงกับ 4 Section ของ practice exam
     Section C — Backpropagation ครบทุก weight (แสดงวิธีทำ)
     Section D — CNN หลายชั้น + นับ Parameter
     Section E — Multi-class Evaluation Metrics จาก Confusion Matrix
     Section F — หาบั๊กในโค้ด Keras 3 จุด

   ตัวเลขทุกตัวในเฉลยคำนวณใหม่แล้วตรงกับลายมืออาจารย์
   (yH3=0.6177, netO5=0.8926, yO5=0.7094, δO5=0.0393, δH3=0.0056, δH4=0.0071,
    W53ใหม่=0.6121, Conv1=224, Conv2=1168, Flatten=1024, Dense=65,600)
   ========================================================= */
QL.library.register({
  id: 'cs461-midterm',
  title: 'ติวสอบกลางภาค — Deep Learning',
  category: 'TestMidterm',
  categoryIcon: '📝',
  subject: 'CS461 Deep Learning',
  subjectIcon: '🧠',
  week: 'Midterm',
  icon: '🧠',
  description: 'ครบทุกอย่างที่ต้องใช้ทำข้อสอบ 4 ข้อ — Backpropagation, CNN + นับ Parameter, Multi-class Metrics และ Debug โค้ด Keras พร้อมกระดาษทดให้เขียนด้วยปากกา',

  /* =======================================================
     1) TOPICS — โหมด "อ่านสรุป"
     ======================================================= */
  topics: [
    /* ---------- ภาพรวม ---------- */
    {
      id: 'x-exam-info',
      title: '📋 ข้อมูลการสอบ + กลยุทธ์จัดเวลา',
      summary: 'สอบ **12:30-14:00 น. (90 นาที)** · มาก่อนอย่างน้อย 5 นาที · **เลทเกิน 30 นาที = หมดสิทธิ์สอบ**',
      points: [
        '✅ **Open book** — เปิดสไลด์ เปิดโน้ตที่จดได้',
        '❌ **ห้าม AI / ห้าม Google**',
        '✏️ **ต้องเอาปากกากับดินสอไปด้วย** เพราะมีคิดเลขแสดงวิธีทำ',
        'ข้อสอบ **4 ข้อ** ตรงกับ Section C / D / E / F ใน practice exam',
        'ทุกข้อสั่งว่า **"แสดงวิธีทำทุกขั้นตอน"** — เขียนสูตรก่อนแทนเลขเสมอ ได้คะแนนขั้นตอนแม้เลขพลาด',
        '**ปัดทศนิยม 4 ตำแหน่ง** ตามที่โจทย์ระบุ และปัดทุกขั้น (ไม่ใช่ปัดตอนท้ายอย่างเดียว)'
      ],
      table: {
        head: ['ข้อ', 'เรื่อง', 'เวลาที่ควรใช้', 'ลักษณะ'],
        rows: [
          ['C', 'Backpropagation ครบ 6 weight', '~30 นาที', 'ยาวสุด เลขเยอะ ทำช้า ๆ'],
          ['D', 'CNN + นับ Parameter', '~15 นาที', 'สูตรตายตัว ทำเร็วได้'],
          ['E', 'Multi-class Metrics', '~25 นาที', 'เลขไม่ยาก แต่ต้องอ่าน matrix ให้ถูก'],
          ['F', 'หาบั๊กในโค้ด 3 จุด', '~10 นาที', 'ไม่ต้องคิดเลข ทำก่อนได้แต้มฟรี'],
          ['—', 'เหลือไว้ตรวจทาน', '~10 นาที', 'เช็กการปัดเลขกับหน่วย']
        ]
      },
      code: 'ลำดับที่แนะนำ: F (เร็ว) → D (สูตรตายตัว) → E → C (ยาวสุด เก็บไว้ทีหลังแต่กันเวลาไว้พอ)'
    },

    /* ---------- พื้นฐาน neuron ---------- */
    {
      id: 'x-neuron',
      title: '🔵 Neuron ทำงานยังไง — net input กับ activation',
      summary: 'นิวรอน 1 ตัวทำ 2 สเต็ปเสมอ: **รวมผลคูณถ่วงน้ำหนัก** แล้ว **ส่งผ่าน activation**',
      points: [
        'สเต็ป 1 — หา **net input** (บางที่เรียก z หรือ a): `z = Σ(wᵢ · xᵢ) + b`',
        'สเต็ป 2 — ส่งผ่าน activation: `y = f(z)`',
        'ถ้าโจทย์ไม่ให้ bias มา = **b = 0** (practice exam ข้อ C1 ไม่มี bias)',
        '**ความหมายของเลขห้อย weight**: `W₃₁` = weight จาก node **1** ไป node **3** — ตัวหน้าคือปลายทาง ตัวหลังคือต้นทาง',
        '⚠️ อ่านเลขห้อยผิดคือจุดที่เสียคะแนนง่ายที่สุดในข้อ C'
      ],
      code: 'z_H3 = X1·W31 + X2·W32 + b\ny_H3 = sigmoid(z_H3)\n\nตัวอย่างจากข้อสอบ:\nz_H3 = 0.6(0.2) + 0.9(0.4) = 0.12 + 0.36 = 0.48\ny_H3 = sigmoid(0.48) = 0.6177'
    },
    {
      id: 'x-activation',
      title: '⚡ Activation Function + อนุพันธ์ (ต้องจำ)',
      summary: 'ข้อสอบใช้ **Sigmoid ทุก neuron** แต่ต้องรู้ตัวอื่นเผื่อข้อ Debug กับข้อเลือกตอบ',
      points: [
        '**Sigmoid** `σ(z) = 1/(1+e⁻ᶻ)` → ออกมาในช่วง (0, 1)',
        '**อนุพันธ์ของ sigmoid จำง่ายมาก**: `σ′(z) = y(1−y)` — ใช้ y ที่คำนวณไว้แล้วได้เลย ไม่ต้องหา e อีกรอบ',
        '**ReLU** `max(0, z)` → อนุพันธ์ = 1 ถ้า z>0, = 0 ถ้า z≤0 · ใช้ใน hidden layer เป็นมาตรฐาน เพราะไม่เจอ vanishing gradient',
        '**Tanh** ช่วง (−1, 1) · อนุพันธ์ = 1 − y²',
        '**Softmax** ใช้ที่ output ของ multi-class เท่านั้น — ผลรวมทุกคลาส = 1',
        '**Linear** (ไม่ใส่ activation) ใช้ที่ output ของ **regression** — จุดนี้คือบั๊กข้อ F'
      ],
      table: {
        head: ['Activation', 'สูตร', 'ช่วงผลลัพธ์', 'อนุพันธ์', 'ใช้ตรงไหน'],
        rows: [
          ['Sigmoid', '1/(1+e⁻ᶻ)', '(0, 1)', '**y(1−y)**', 'output ของ binary classification'],
          ['Tanh', '(eᶻ−e⁻ᶻ)/(eᶻ+e⁻ᶻ)', '(−1, 1)', '1 − y²', 'hidden layer (สมัยก่อน)'],
          ['ReLU', 'max(0, z)', '[0, ∞)', '1 ถ้า z>0 · 0 ถ้า z≤0', 'hidden layer (มาตรฐานปัจจุบัน)'],
          ['Softmax', 'eᶻⁱ / Σeᶻʲ', '(0, 1) รวม = 1', '—', 'output ของ multi-class'],
          ['Linear', 'z', '(−∞, ∞)', '1', 'output ของ **regression**']
        ]
      },
      code: 'ค่า sigmoid ที่เจอบ่อย (ไว้เช็กว่าคิดเลขถูกไหม)\n  σ(0)   = 0.5000\n  σ(0.48)= 0.6177\n  σ(0.63)= 0.6525\n  σ(0.89)= 0.7089\n  σ(1)   = 0.7311\n  σ(2)   = 0.8808\n\nถ้าผลออกนอกช่วง 0-1 = คิดผิดแน่นอน'
    },

    /* ---------- backprop ---------- */
    {
      id: 'x-forward',
      title: '➡️ Forward Propagation — เดินจากซ้ายไปขวา',
      summary: 'ไล่ทีละชั้น: input → hidden → output คำนวณ **ทุกตัวในชั้นให้เสร็จก่อน** แล้วค่อยไปชั้นถัดไป',
      points: [
        'ชั้น hidden: หา z ของทุก hidden neuron → ผ่าน activation → ได้ y ของ hidden',
        'ชั้น output: **ใช้ y ของ hidden เป็น input** ไม่ใช่ใช้ x เดิม',
        'จดค่า y ทุกตัวไว้ให้ชัด เพราะ backprop ต้องย้อนมาหยิบไปใช้ทุกตัว',
        '⚠️ ปัดทศนิยม 4 ตำแหน่งตั้งแต่ชั้นแรก แล้วใช้ค่าที่ปัดแล้วคำนวณต่อ — เฉลยอาจารย์ทำแบบนี้'
      ],
      code: 'ชั้น Hidden\n  z_H3 = X1·W31 + X2·W32 = 0.6(0.2)+0.9(0.4) = 0.48  → y_H3 = 0.6177\n  z_H4 = X1·W41 + X2·W42 = 0.6(0.3)+0.9(0.5) = 0.63  → y_H4 = 0.6525\n\nชั้น Output (ใช้ y_H3, y_H4 เป็น input)\n  z_O5 = y_H3·W53 + y_H4·W54 = 0.6177(0.6)+0.6525(0.8) = 0.8926\n  y_O5 = sigmoid(0.8926) = 0.7094'
    },
    {
      id: 'x-backprop-formula',
      title: '⬅️ Backpropagation — 3 สูตรที่ต้องท่องให้ขึ้นใจ',
      summary: 'หัวใจของข้อ C ทั้งข้อคือ 3 สูตรนี้ ท่องให้ได้แล้วข้อนี้คือการแทนเลขล้วน ๆ',
      points: [
        '**① Error ที่ output**  `Error = t − y_O` (t = target)',
        '**② δ ของ output unit**  `δ_O = y_O (1 − y_O)(t − y_O)`',
        '**③ δ ของ hidden unit**  `δ_H = y_H (1 − y_H) · Σ(δ_ถัดไป · W_ที่เชื่อมไป)`',
        '**④ ปรับ weight**  `ΔW_ji = η · δ_j · y_i`  (j = ปลายทาง, i = ต้นทาง)',
        '**⑤ weight ใหม่**  `W_new = W_old + ΔW`  ← **บวก** เพราะสูตร δ นี้คิด (t−y) ไว้แล้ว',
        '⚠️ `y_i` ใน ΔW คือ **output ของ neuron ต้นทาง** — ถ้าต้นทางคือ input layer ก็ใช้ค่า X ตรง ๆ',
        'ลำดับทำ: δ_O ก่อนเสมอ → แล้วค่อยเอาไปหา δ_H → แล้วค่อยหา ΔW ทุกเส้น'
      ],
      code: 'ทำไม δ_H ต้องคูณ W?\n  เพราะ hidden unit ไม่รู้ว่าตัวเองผิดเท่าไร\n  ต้องรับ "ความผิด" จาก output ย้อนกลับมาตามสายที่เชื่อมกันอยู่\n  น้ำหนักมาก (W มาก) = รับผิดชอบมาก\n\nถ้า hidden ต่อไป output หลายตัว ต้องรวมทุกเส้น:\n  δ_H3 = y_H3(1−y_H3) · (δ_O5·W53 + δ_O6·W63 + ...)'
    },
    {
      id: 'x-backprop-order',
      title: '🔢 ลำดับการทำข้อ Backprop (ทำตามนี้ไม่มีพลาด)',
      summary: 'เขียนเป็น checklist ไว้ แล้วไล่ทีละบรรทัดในห้องสอบ',
      points: [
        '**1.** วาดรูป network แล้วเขียน weight กำกับทุกเส้นก่อน (กันอ่านเลขห้อยผิด)',
        '**2.** Forward: หา z และ y ของ hidden ทุกตัว',
        '**3.** Forward: หา z และ y ของ output',
        '**4.** หา Error = t − y_O',
        '**5.** หา δ_O = y_O(1−y_O)(t−y_O)',
        '**6.** หา δ ของ hidden ทุกตัว (ใช้ δ_O ที่เพิ่งได้)',
        '**7.** หา ΔW ทีละเส้น — **เส้นที่เข้า output ใช้ δ_O, เส้นที่เข้า hidden ใช้ δ_H**',
        '**8.** W_new = W_old + ΔW ให้ครบทุกเส้น แล้วเขียนสรุปเป็นตาราง'
      ],
      table: {
        head: ['Weight', 'ปลายทาง (j)', 'ต้นทาง (i)', 'ΔW = η·δⱼ·yᵢ ใช้ตัวไหน'],
        rows: [
          ['W53', 'O5', 'H3', 'η · **δ_O5** · y_H3'],
          ['W54', 'O5', 'H4', 'η · **δ_O5** · y_H4'],
          ['W31', 'H3', 'X1', 'η · **δ_H3** · X1'],
          ['W32', 'H3', 'X2', 'η · **δ_H3** · X2'],
          ['W41', 'H4', 'X1', 'η · **δ_H4** · X1'],
          ['W42', 'H4', 'X2', 'η · **δ_H4** · X2']
        ]
      }
    },
    {
      id: 'x-gd',
      title: '📉 Gradient Descent กับ Learning Rate',
      summary: 'η (eta) บอกว่าจะก้าวทีละเท่าไร — ข้อสอบให้มาเป็นตัวเลข แค่แทนค่า แต่ต้องเข้าใจไว้ตอบข้อเลือกตอบ',
      points: [
        '**η ใหญ่เกินไป** → กระโดดข้ามจุดต่ำสุด loss แกว่งหรือพุ่ง (diverge)',
        '**η เล็กเกินไป** → เรียนช้ามาก ติดอยู่ที่ local minimum ได้',
        '**Batch GD** = ใช้ข้อมูลทั้งชุดต่อ 1 อัปเดต · ช้าแต่นิ่ง',
        '**SGD** = ทีละตัวอย่าง · เร็วแต่แกว่ง',
        '**Mini-batch** = ทีละก้อน (32, 64, 128) · ที่ใช้จริงทั่วไป',
        '**Adam** = optimizer ที่ปรับ learning rate ให้เองรายพารามิเตอร์ — default ที่ใช้บ่อยสุด',
        '**1 Epoch** = เห็นข้อมูลครบทั้งชุด 1 รอบ · **1 Iteration** = อัปเดต weight 1 ครั้ง'
      ],
      code: 'จำนวน iteration ต่อ 1 epoch = จำนวนข้อมูล ÷ batch_size\n  ข้อมูล 1,000 ตัว, batch 32  →  1000/32 = 31.25 → 32 iterations/epoch'
    },
    {
      id: 'x-loss',
      title: '🎯 Loss Function — จับคู่ให้ถูกกับชนิดของงาน',
      summary: 'ข้อ F (debug) วัดเรื่องนี้ตรง ๆ — จำตารางนี้ให้แม่น ได้แต้มฟรี',
      points: [
        '**Regression** (ทำนายตัวเลขต่อเนื่อง เช่น ราคาบ้าน) → `mse` หรือ `mae`',
        '**Binary classification** (2 คลาส) → `binary_crossentropy`',
        '**Multi-class, label เป็น one-hot** → `categorical_crossentropy`',
        '**Multi-class, label เป็นเลขจำนวนเต็ม** → `sparse_categorical_crossentropy`',
        '⚠️ **accuracy ใช้กับ regression ไม่ได้** เพราะค่าทำนายไม่มีทางตรงเป๊ะ → ใช้ `mae` / `mse` / `rmse` เป็น metric แทน'
      ],
      table: {
        head: ['ชนิดงาน', 'Activation ชั้น output', 'จำนวน node ชั้น output', 'Loss', 'Metric'],
        rows: [
          ['**Regression**', '**linear** (ไม่ใส่)', '1', '`mse` / `mae`', '`mae`, `mse`, `rmse`'],
          ['Binary classification', 'sigmoid', '1', '`binary_crossentropy`', '`accuracy`'],
          ['Multi-class (one-hot)', 'softmax', 'จำนวนคลาส', '`categorical_crossentropy`', '`accuracy`'],
          ['Multi-class (integer)', 'softmax', 'จำนวนคลาส', '`sparse_categorical_crossentropy`', '`accuracy`'],
          ['Multi-label', 'sigmoid', 'จำนวนป้าย', '`binary_crossentropy`', '`accuracy`']
        ]
      },
      code: 'MSE = (1/n) Σ(y_จริง − y_ทำนาย)²      ← ลงโทษค่าที่พลาดมากหนัก\nMAE = (1/n) Σ|y_จริง − y_ทำนาย|       ← ทนต่อ outlier มากกว่า\nBCE = −(1/n) Σ[y·log(ŷ) + (1−y)·log(1−ŷ)]'
    },

    /* ---------- CNN ---------- */
    {
      id: 'x-cnn-basic',
      title: '🖼️ CNN — Convolution ทำอะไร',
      summary: 'เลื่อน filter (kernel) ไปทั่วภาพ คูณแล้วบวก ได้ **feature map** ออกมา',
      points: [
        '**Filter / Kernel** = ตารางน้ำหนักเล็ก ๆ เช่น 3×3 ที่เลื่อนไปทั่วภาพ',
        '**ความลึกของ filter ต้องเท่ากับ channel ของ input เสมอ** — input 3 channel ก็ต้องใช้ filter 3×3×**3**',
        '**filter 1 อัน → feature map 1 แผ่น** ดังนั้น 8 filters → output 8 channel',
        '**Parameter sharing** — filter ตัวเดียวใช้ทั้งภาพ จึงมี parameter น้อยกว่า Dense มหาศาล',
        '**Stride** = ก้าวละกี่พิกเซล · stride มาก = output เล็กลง',
        '**Padding** = เติมขอบด้วย 0 เพื่อคุมขนาด output'
      ],
      code: 'เปรียบเทียบจำนวน parameter (ภาพ 32×32×3)\n  Dense ตรง ๆ ไป 8 node  : 3072 × 8 + 8    = 24,584\n  Conv 8 filters 3×3     : (3×3×3+1) × 8   = 224\n  → น้อยกว่า 100 เท่า แต่จับ feature เชิงพื้นที่ได้ดีกว่า'
    },
    {
      id: 'x-cnn-size',
      title: '📐 สูตรหาขนาด Feature Map (ใช้บ่อยสุดในข้อ D)',
      summary: 'จำ 2 กรณีพอ: **same** กับ **valid**',
      points: [
        '**Padding = "same"** + stride 1 → **ขนาดเท่าเดิม** (นี่คือที่มาของชื่อ) · เปลี่ยนแค่จำนวน channel',
        '**Padding = "valid"** (ไม่เติมขอบ) → `Output = ⌊(N − F)/S⌋ + 1`',
        '**สูตรเต็ม** `Output = ⌊(N + 2P − F)/S⌋ + 1`  (N=ขนาด input, F=ขนาด filter, P=padding, S=stride)',
        '**MaxPool 2×2 stride 2** → **หารครึ่ง** ทั้งกว้างและยาว · **channel ไม่เปลี่ยน**',
        '⚠️ Pooling **ไม่มี parameter** ที่เทรนได้เลย (ไม่มี weight ไม่มี bias)',
        'กรณี same + stride > 1: `Output = ⌈N/S⌉`'
      ],
      table: {
        head: ['Layer', 'Input', 'ตั้งค่า', 'Output', 'Parameter'],
        rows: [
          ['Conv same', '32×32×3', '8 filters 3×3, S=1', '32×32×**8**', '224'],
          ['MaxPool', '32×32×8', '2×2, S=2', '**16×16**×8', '**0**'],
          ['Conv same', '16×16×8', '16 filters 3×3, S=1', '16×16×**16**', '1,168'],
          ['MaxPool', '16×16×16', '2×2, S=2', '**8×8**×16', '**0**'],
          ['Flatten', '8×8×16', '—', '**1024**', '**0**'],
          ['Dense', '1024', '64 node', '64', '65,600']
        ]
      },
      code: 'ตัวอย่าง valid padding\n  input 28×28, filter 5×5, stride 1, valid\n  Output = (28 − 5)/1 + 1 = 24  →  24×24\n\nตัวอย่าง stride 2 แบบ valid\n  input 32×32, filter 3×3, stride 2, valid\n  Output = ⌊(32 − 3)/2⌋ + 1 = ⌊14.5⌋ + 1 = 15'
    },
    {
      id: 'x-cnn-params',
      title: '🔢 นับ Trainable Parameter (สูตรที่โจทย์ให้ hint มา)',
      summary: 'ท่องแค่ 2 สูตร: **Conv** กับ **Dense**',
      points: [
        '**Conv layer**  `(F × F × C_in + 1) × จำนวน filter`  ← **+1 คือ bias ของแต่ละ filter**',
        '**Dense layer**  `(จำนวน input + 1) × จำนวน node` หรือเขียนเป็น `input × node + node`',
        '**Pooling / Flatten / Dropout → 0 parameter** ทั้งหมด',
        '⚠️ `C_in` ของ Conv ชั้นที่ 2 คือ **จำนวน filter ของชั้นก่อนหน้า** ไม่ใช่ 3 แล้ว',
        '⚠️ ขนาดหลัง Flatten = `กว้าง × ยาว × channel` ของชั้นก่อนหน้า — ลืมคูณ channel คือพลาดบ่อยสุด',
        'Dense หลัง Flatten มักกิน parameter เกิน 90% ของทั้งโมเดล'
      ],
      code: 'เดินตามข้อสอบ D1\n  Conv1 : (3×3×**3** + 1) × 8  = (27+1) × 8  = 28 × 8   = 224\n  Conv2 : (3×3×**8** + 1) × 16 = (72+1) × 16 = 73 × 16  = 1,168\n  Flatten: 8 × 8 × 16 = 1,024\n  Dense64: 1,024 × 64 + 64 = 65,536 + 64 = 65,600\n  ───────────────────────────────────────\n  รวมทั้งโมเดล = 224 + 1,168 + 65,600 = 66,992'
    },

    /* ---------- metrics ---------- */
    {
      id: 'x-confusion',
      title: '📊 Confusion Matrix — อ่านให้ถูกก่อน แล้วที่เหลือง่าย',
      summary: 'โจทย์บอกชัดว่า **แถว = ค่าจริง, คอลัมน์ = ค่าที่ทาย** จำไว้ว่า *"แถวจริง คอลัมน์ทาย"*',
      points: [
        '**TP ของคลาส X** = ช่องทแยงมุมของคลาสนั้น (แถว X ∩ คอลัมน์ X)',
        '**FP ของคลาส X** = **ผลรวมคอลัมน์ X − TP**  (ทายว่าเป็น X แต่จริง ๆ ไม่ใช่)',
        '**FN ของคลาส X** = **ผลรวมแถว X − TP**  (จริงเป็น X แต่ทายเป็นอย่างอื่น)',
        '**TN ของคลาส X** = ที่เหลือทั้งหมด = total − TP − FP − FN',
        '💡 จำสั้น ๆ: **คอลัมน์ = สิ่งที่โมเดลทาย → เกี่ยวกับ Precision** · **แถว = ความจริง → เกี่ยวกับ Recall**',
        'ผลรวมทุกช่อง = จำนวนตัวอย่างทั้งหมด'
      ],
      code: 'ตัวอย่างจากข้อ E1 (รวม 180 ตัวอย่าง)\n\n          ทาย→  Rock  Paper  Scissors   | รวมแถว\n  จริง Rock       45     10      5      |  60\n  จริง Paper       8     50      2      |  60\n  จริง Scissors   12      3     45      |  60\n  ─────────────────────────────────────\n  รวมคอลัมน์      65     63     52      | 180\n\n  Rock : TP=45, FP=65−45=20, FN=60−45=15\n  Paper: TP=50, FP=63−50=13, FN=60−50=10\n  Scis : TP=45, FP=52−45=7,  FN=60−45=15'
    },
    {
      id: 'x-metrics',
      title: '🎯 Accuracy / Precision / Recall / F1',
      summary: 'สูตร 4 ตัวนี้ออกสอบแน่นอน — และต้องรู้ว่าแต่ละตัว*ตอบคำถามอะไร*',
      points: [
        '**Accuracy** = `ผลรวมเส้นทแยงมุม / ทั้งหมด` — ภาพรวมทั้งระบบ',
        '**Precision** = `TP / (TP + FP)` — *"ที่ทายว่าใช่ ถูกจริงกี่ %"* (ดูคอลัมน์)',
        '**Recall** = `TP / (TP + FN)` — *"ของจริงทั้งหมด จับได้กี่ %"* (ดูแถว)',
        '**F1** = `2 × (P × R) / (P + R)` — ค่าเฉลี่ยฮาร์โมนิก ลงโทษตัวที่ต่ำกว่า',
        '💡 **ทางลัดคิด F1 เร็ว**: `F1 = 2TP / (2TP + FP + FN)` — ไม่ต้องผ่าน P กับ R เลย เลขสวยกว่าเยอะ',
        '**Macro-average** = เฉลี่ยค่าของแต่ละคลาสตรง ๆ หารจำนวนคลาส (ทุกคลาสน้ำหนักเท่ากัน)',
        '**Micro-average** = เอา TP/FP/FN รวมทุกคลาสมาคิดทีเดียว (ในงาน multi-class = accuracy)',
        '**Weighted-average** = ถ่วงน้ำหนักตามจำนวนตัวอย่างจริงของแต่ละคลาส'
      ],
      table: {
        head: ['Metric', 'สูตร', 'ตอบคำถามว่า', 'ใช้เมื่อ'],
        rows: [
          ['Accuracy', '(TP+TN)/ทั้งหมด', 'ถูกกี่ % จากทั้งหมด', 'คลาสสมดุลกัน'],
          ['Precision', 'TP/(TP+FP)', 'ทายว่าใช่แล้วถูกกี่ %', 'ทายผิดแล้วเสียหาย (สแปม)'],
          ['Recall', 'TP/(TP+FN)', 'ของจริงจับได้กี่ %', 'พลาดแล้วเสียหาย (มะเร็ง)'],
          ['F1', '2PR/(P+R)', 'สมดุลของสองตัวบน', 'คลาสไม่สมดุล'],
          ['Macro-F1', 'ΣF1 / จำนวนคลาส', 'เฉลี่ยทุกคลาสเท่ากัน', 'สนใจคลาสเล็กด้วย']
        ]
      },
      code: 'ทางลัด F1 (พิสูจน์แล้วเท่ากับสูตรเต็ม)\n  F1 = 2TP / (2TP + FP + FN)\n\n  Rock : 2(45)/(2(45)+20+15) = 90/125  = 0.7200\n  Paper: 2(50)/(2(50)+13+10) = 100/123 = 0.8130\n  Scis : 2(45)/(2(45)+7+15)  = 90/112  = 0.8036'
    },

    /* ---------- keras / debug ---------- */
    {
      id: 'x-keras',
      title: '⌨️ Keras API ที่ต้องอ่านออก',
      summary: 'ข้อ F ให้โค้ดมาแล้วหาบั๊ก — ต้องรู้ว่าแต่ละบรรทัดทำอะไร',
      points: [
        '`Sequential([...])` = ต่อ layer เรียงกันเป็นชั้น ๆ',
        '`Dense(n, activation=...)` = fully-connected n node',
        '`model.compile(optimizer, loss, metrics)` = ตั้งค่าการเรียน **ต้องเรียกหลังสร้างโมเดล**',
        '`model.fit(X, y, epochs, validation_data, batch_size)` = สั่งเทรน',
        '`model.build(input_shape=...)` = กำหนดรูปร่าง input **ต้องเรียกหลังจากมีตัวโมเดลแล้ว**',
        '`model.summary()` = ดูจำนวน parameter แต่ละชั้น (ตรงกับที่ต้องนับมือในข้อ D)',
        '**Dropout(0.5)** = สุ่มปิด neuron ครึ่งหนึ่งตอนเทรน เพื่อกัน overfitting'
      ],
      code: "โครงมาตรฐานของงาน Regression\n\nmodel = tf.keras.Sequential([\n    tf.keras.layers.Dense(64, activation='relu', input_shape=(10,)),\n    tf.keras.layers.Dense(32, activation='relu'),\n    tf.keras.layers.Dense(1)                      # ← linear ไม่ใส่ activation\n])\n\nmodel.compile(optimizer='adam',\n              loss='mse',                          # ← ไม่ใช่ binary_crossentropy\n              metrics=['mae'])                     # ← ไม่ใช่ accuracy"
    },
    {
      id: 'x-debug',
      title: '🐞 Checklist หาบั๊ก (ข้อ F ใช้ตัวนี้ไล่)',
      summary: 'ไล่ 5 จุดนี้เรียงกัน เจอครบทุกบั๊กที่ข้อสอบชอบซ่อน',
      points: [
        '**1. ชนิดงานคืออะไร** — อ่านโจทย์ให้ออกก่อนว่า regression หรือ classification',
        '**2. activation ชั้นสุดท้ายถูกไหม** — regression ต้อง linear · binary ต้อง sigmoid · multi-class ต้อง softmax',
        '**3. จำนวน node ชั้นสุดท้ายถูกไหม** — regression = 1 · multi-class = จำนวนคลาส',
        '**4. loss เข้าคู่กับงานไหม** — regression ต้อง mse/mae',
        '**5. metric มีความหมายไหม** — regression ใช้ accuracy ไม่ได้',
        'เสริม: ลำดับโค้ด (`build` ก่อนสร้างโมเดล = `NameError`), ลืม normalize ข้อมูล, ไม่มี validation_data'
      ],
      table: {
        head: ['อาการ', 'สาเหตุ', 'วิธีแก้'],
        rows: [
          ['ทำนายราคาแล้วได้ค่า 0-1 ตลอด', 'ชั้น output ใช้ sigmoid', 'เอา activation ออก (linear)'],
          ['loss ติดลบ / nan', 'ใช้ crossentropy กับค่าต่อเนื่อง', 'เปลี่ยนเป็น mse'],
          ['accuracy ค้างที่ 0 ตลอด', 'ใช้ accuracy กับ regression', 'เปลี่ยนเป็น mae'],
          ['`NameError: model`', 'เรียก build ก่อนสร้างโมเดล', 'ย้ายไปไว้หลัง Sequential'],
          ['train ดี test แย่', 'overfitting', 'Dropout / ข้อมูลเพิ่ม / early stopping']
        ]
      }
    },

    /* ---------- cheat sheet ---------- */
    {
      id: 'x-cheatsheet',
      title: '📄 ชีตสูตรรวม — อ่านรอบสุดท้ายก่อนเข้าห้อง',
      summary: 'ทุกสูตรที่ใช้ในข้อสอบ 4 ข้อ อยู่ในตารางเดียวนี้',
      table: {
        head: ['เรื่อง', 'สูตร'],
        rows: [
          ['Net input', '`z = Σ(wᵢxᵢ) + b`'],
          ['Sigmoid', '`y = 1/(1+e⁻ᶻ)`'],
          ['อนุพันธ์ sigmoid', '`y(1−y)`'],
          ['Error', '`t − y_O`'],
          ['δ output', '`δ_O = y_O(1−y_O)(t−y_O)`'],
          ['δ hidden', '`δ_H = y_H(1−y_H)·Σ(δ_next·W)`'],
          ['ปรับ weight', '`ΔW_ji = η·δ_j·y_i` แล้ว `W_new = W_old + ΔW`'],
          ['Conv output (valid)', '`⌊(N−F)/S⌋+1`'],
          ['Conv output (same, S=1)', '`เท่าเดิม`'],
          ['Pool 2×2 S=2', '`หารครึ่ง · channel เท่าเดิม`'],
          ['Conv parameter', '`(F×F×C_in + 1) × จำนวน filter`'],
          ['Dense parameter', '`input × node + node`'],
          ['Flatten size', '`กว้าง × ยาว × channel`'],
          ['Accuracy', '`เส้นทแยงมุม / ทั้งหมด`'],
          ['Precision', '`TP/(TP+FP)` (คอลัมน์)'],
          ['Recall', '`TP/(TP+FN)` (แถว)'],
          ['F1', '`2PR/(P+R)` = `2TP/(2TP+FP+FN)`'],
          ['Macro-F1', '`ΣF1 / จำนวนคลาส`']
        ]
      },
      code: 'เช็กลิสต์ก่อนออกจากบ้าน\n  ☐ ปากกา + ดินสอ + ยางลบ\n  ☐ เครื่องคิดเลข (ถ้าอนุญาต)\n  ☐ สไลด์ + สมุดจด (open book)\n  ☐ ถึงห้องก่อน 12:25\n  ☐ ห้ามเปิด AI / Google เด็ดขาด'
    }
  ],

  /* =======================================================
     2) CARDS — โหมด "แฟลชการ์ด"
     ======================================================= */
  cards: [
    /* -- สูตรหลัก -- */
    { id: 'm1', topic: 'Backprop', front: 'สูตร **net input** ของ neuron', back: '`z = Σ(wᵢ · xᵢ) + b`\n(ถ้าโจทย์ไม่ให้ bias มา = 0)' },
    { id: 'm2', topic: 'Backprop', front: 'สูตร **Sigmoid** และช่วงผลลัพธ์', back: '`σ(z) = 1/(1 + e⁻ᶻ)`\nออกมาในช่วง **(0, 1)**\nถ้าได้ค่านอกช่วงนี้ = คิดผิดแน่' },
    { id: 'm3', topic: 'Backprop', front: '**อนุพันธ์ของ sigmoid** เขียนยังไงให้คิดเร็ว', back: '`σ′(z) = y(1 − y)`\nใช้ y ที่หาไว้แล้วได้เลย ไม่ต้องคำนวณ e ซ้ำ' },
    { id: 'm4', topic: 'Backprop', front: 'สูตร **δ ของ output unit**', back: '`δ_O = y_O (1 − y_O)(t − y_O)`\n= อนุพันธ์ × error', code: 'δ_O5 = 0.7094 × 0.2906 × 0.1906 = 0.0393' },
    { id: 'm5', topic: 'Backprop', front: 'สูตร **δ ของ hidden unit**', back: '`δ_H = y_H (1 − y_H) · Σ(δ_ถัดไป × W_ที่เชื่อม)`\nถ้าต่อ output หลายตัวต้องรวมทุกเส้น', code: 'δ_H3 = 0.6177 × 0.3823 × 0.0393 × 0.6 = 0.0056' },
    { id: 'm6', topic: 'Backprop', front: 'สูตรปรับ weight ΔW และหา W ใหม่', back: '`ΔW_ji = η · δ_j · y_i`\n`W_new = W_old + ΔW`\n(j = ปลายทาง, i = ต้นทาง)' },
    { id: 'm7', topic: 'Backprop', front: 'ใน `ΔW = η·δ·y` ตัว **y** คือค่าของอะไร', back: '**output ของ neuron ต้นทาง**\nถ้าต้นทางเป็น input layer ก็ใช้ค่า X ตรง ๆ' },
    { id: 'm8', topic: 'Backprop', front: '`W₃₁` หมายถึง weight จากไหนไปไหน', back: 'จาก node **1** ไป node **3**\n**ตัวหน้า = ปลายทาง · ตัวหลัง = ต้นทาง**\n(อ่านผิดตรงนี้คือเสียคะแนนง่ายสุด)' },
    { id: 'm9', topic: 'Backprop', front: 'ทำไม W ใหม่ถึง **บวก** ΔW ไม่ใช่ลบ', back: 'เพราะสูตร δ นี้ใส่ `(t − y)` ไว้ในตัวแล้ว\nทิศของการแก้จึงกลับมาเป็นบวก\n(ถ้านิยาม δ เป็น `(y − t)` ถึงจะต้องลบ)' },
    { id: 'm10', topic: 'Backprop', front: 'ลำดับการทำข้อ backprop', back: '1. Forward หา y ของ hidden\n2. Forward หา y ของ output\n3. Error = t − y_O\n4. δ_O\n5. δ_H ทุกตัว\n6. ΔW ทุกเส้น\n7. W_new ทุกเส้น' },

    /* -- activation / loss -- */
    { id: 'm11', topic: 'Activation', front: 'ช่วงผลลัพธ์ของ **ReLU** และอนุพันธ์', back: '`max(0, z)` → ช่วง **[0, ∞)**\nอนุพันธ์ = 1 ถ้า z>0 · 0 ถ้า z≤0' },
    { id: 'm12', topic: 'Activation', front: 'ช่วงผลลัพธ์ของ **tanh** และอนุพันธ์', back: 'ช่วง **(−1, 1)**\nอนุพันธ์ = `1 − y²`' },
    { id: 'm13', topic: 'Activation', front: '**Softmax** ใช้ตรงไหน และมีคุณสมบัติอะไร', back: 'ใช้ที่ **output ของ multi-class**\nผลรวมทุกคลาส = **1** (ตีความเป็นความน่าจะเป็นได้)' },
    { id: 'm14', topic: 'Activation', front: 'ชั้น output ของงาน **regression** ควรใช้ activation อะไร', back: '**linear** (ไม่ใส่ activation เลย)\nเพราะต้องทำนายค่าได้ทุกช่วง ไม่ถูกบีบอยู่ใน 0-1' },
    { id: 'm15', topic: 'Activation', front: 'ทำไม hidden layer นิยมใช้ ReLU มากกว่า sigmoid', back: 'sigmoid มีปัญหา **vanishing gradient** (อนุพันธ์สูงสุดแค่ 0.25 ซ้อนหลายชั้นแล้วเกือบเป็น 0)\nReLU อนุพันธ์ = 1 ตรง ๆ และคำนวณเร็วกว่า' },
    { id: 'm16', topic: 'Loss', front: 'งาน **Regression** ใช้ loss และ metric อะไร', back: 'loss: `mse` หรือ `mae`\nmetric: `mae` / `mse` / `rmse`\n⚠️ ใช้ `accuracy` **ไม่ได้**' },
    { id: 'm17', topic: 'Loss', front: 'งาน **binary classification** ใช้ชุดอะไร', back: 'output: `Dense(1, activation=\'sigmoid\')`\nloss: `binary_crossentropy`\nmetric: `accuracy`' },
    { id: 'm18', topic: 'Loss', front: '`categorical_crossentropy` ต่างจาก `sparse_categorical_crossentropy` ยังไง', back: '`categorical` → label เป็น **one-hot** เช่น [0,1,0]\n`sparse` → label เป็น **เลขจำนวนเต็ม** เช่น 1' },
    { id: 'm19', topic: 'Loss', front: 'สูตร **MSE**', back: '`MSE = (1/n) Σ(y_จริง − y_ทำนาย)²`\nลงโทษค่าที่พลาดมากหนักกว่า MAE' },
    { id: 'm20', topic: 'Gradient', front: '**Learning rate ใหญ่เกินไป** เกิดอะไรขึ้น', back: 'กระโดดข้ามจุดต่ำสุด → loss แกว่งหรือพุ่งขึ้น (diverge)\nเล็กเกินไป → เรียนช้ามาก / ติด local minimum' },
    { id: 'm21', topic: 'Gradient', front: '**Epoch** กับ **Iteration** ต่างกันยังไง', back: '**Epoch** = เห็นข้อมูลครบทั้งชุด 1 รอบ\n**Iteration** = อัปเดต weight 1 ครั้ง (= 1 batch)', code: 'iterations/epoch = จำนวนข้อมูล ÷ batch_size' },
    { id: 'm22', topic: 'Gradient', front: '**Adam** ต่างจาก SGD ยังไง', back: 'Adam ปรับ learning rate ให้เอง **รายพารามิเตอร์**\n(รวม momentum + adaptive rate) — เป็น default ที่ใช้บ่อยสุด' },

    /* -- CNN -- */
    { id: 'm23', topic: 'CNN', front: 'สูตรขนาด output ของ Conv แบบ **valid**', back: '`Output = ⌊(N − F)/S⌋ + 1`\n(N=input, F=filter, S=stride)', code: '28×28, filter 5×5, S=1 → (28−5)/1+1 = 24' },
    { id: 'm24', topic: 'CNN', front: 'Padding = **"same"** กับ stride = 1 ได้ output ขนาดเท่าไร', back: '**เท่าเดิมทุกประการ** (กว้าง×ยาวไม่เปลี่ยน)\nเปลี่ยนแค่จำนวน channel = จำนวน filter' },
    { id: 'm25', topic: 'CNN', front: '**MaxPool 2×2 stride 2** ทำอะไรกับขนาด', back: '**หารครึ่ง** ทั้งกว้างและยาว\n**channel ไม่เปลี่ยน**', code: '32×32×8 → 16×16×8' },
    { id: 'm26', topic: 'CNN', front: 'สูตรนับ parameter ของ **Conv layer**', back: '`(F × F × C_in + 1) × จำนวน filter`\n**+1 = bias ของแต่ละ filter**', code: 'Conv1: (3×3×3 + 1) × 8 = 224' },
    { id: 'm27', topic: 'CNN', front: 'สูตรนับ parameter ของ **Dense layer**', back: '`input × node + node`\nหรือ `(input + 1) × node`', code: 'Dense(64) หลัง Flatten 1024: 1024×64 + 64 = 65,600' },
    { id: 'm28', topic: 'CNN', front: 'Layer ไหนบ้างที่มี **0 parameter**', back: '**MaxPool / AvgPool · Flatten · Dropout · Activation**\nไม่มี weight ไม่มี bias ให้เทรนเลย' },
    { id: 'm29', topic: 'CNN', front: '`C_in` ของ Conv ชั้นที่ 2 คือค่าอะไร', back: '**จำนวน filter ของชั้นก่อนหน้า**\nไม่ใช่ 3 (RGB) อีกแล้ว', code: 'Conv1 มี 8 filters → Conv2 ใช้ C_in = 8\n(3×3×8 + 1) × 16 = 1,168' },
    { id: 'm30', topic: 'CNN', front: 'ขนาดหลัง **Flatten** คำนวณยังไง', back: '`กว้าง × ยาว × channel`\n⚠️ ลืมคูณ channel คือจุดพลาดบ่อยสุด', code: '8 × 8 × 16 = 1,024' },
    { id: 'm31', topic: 'CNN', front: 'ความลึกของ filter ต้องเท่ากับอะไร', back: '**จำนวน channel ของ input** เสมอ\ninput 3 channel → filter เป็น 3×3×**3**' },
    { id: 'm32', topic: 'CNN', front: '**filter 1 อัน** ให้ output กี่แผ่น', back: '**1 แผ่น** (feature map)\nดังนั้นจำนวน filter = จำนวน channel ของ output' },
    { id: 'm33', topic: 'CNN', front: 'ทำไม CNN ถึงมี parameter น้อยกว่า Dense มาก', back: '**Parameter sharing** — filter ตัวเดียวเลื่อนใช้ทั้งภาพ', code: 'ภาพ 32×32×3 → 8 output\n  Dense: 3072×8+8 = 24,584\n  Conv : (3×3×3+1)×8 = 224' },

    /* -- metrics -- */
    { id: 'm34', topic: 'Metrics', front: 'ใน confusion matrix ของข้อสอบ **แถว** กับ **คอลัมน์** คืออะไร', back: '**แถว = ค่าจริง** · **คอลัมน์ = ค่าที่ทาย**\nจำว่า "แถวจริง คอลัมน์ทาย"' },
    { id: 'm35', topic: 'Metrics', front: 'หา **FP** ของคลาส X จาก confusion matrix ยังไง', back: '`FP = ผลรวมคอลัมน์ X − TP`\n(ทายว่าเป็น X แต่จริง ๆ ไม่ใช่)' },
    { id: 'm36', topic: 'Metrics', front: 'หา **FN** ของคลาส X จาก confusion matrix ยังไง', back: '`FN = ผลรวมแถว X − TP`\n(จริงเป็น X แต่ทายเป็นอย่างอื่น)' },
    { id: 'm37', topic: 'Metrics', front: 'สูตร **Accuracy** ของ multi-class', back: '`ผลรวมเส้นทแยงมุม / จำนวนทั้งหมด`', code: '(45+50+45) / 180 = 140/180 = 0.7778' },
    { id: 'm38', topic: 'Metrics', front: 'สูตร **Precision** และมันตอบคำถามอะไร', back: '`TP/(TP+FP)` — ดู**คอลัมน์**\n*"ที่ทายว่าใช่ ถูกจริงกี่ %"*' },
    { id: 'm39', topic: 'Metrics', front: 'สูตร **Recall** และมันตอบคำถามอะไร', back: '`TP/(TP+FN)` — ดู**แถว**\n*"ของจริงทั้งหมด จับได้กี่ %"*' },
    { id: 'm40', topic: 'Metrics', front: 'สูตร **F1-Score** (2 แบบ)', back: 'แบบเต็ม: `2 × (P × R)/(P + R)`\n**ทางลัด**: `2TP / (2TP + FP + FN)` ← เร็วกว่ามาก' },
    { id: 'm41', topic: 'Metrics', front: '**Macro-average F1** คำนวณยังไง', back: 'เฉลี่ย F1 ของทุกคลาสตรง ๆ หารด้วยจำนวนคลาส\nทุกคลาสน้ำหนัก**เท่ากัน** ไม่สนว่าคลาสไหนตัวอย่างเยอะ', code: '(0.7200 + 0.8130 + 0.8036)/3 = 0.7789' },
    { id: 'm42', topic: 'Metrics', front: 'Macro / Micro / Weighted average ต่างกันยังไง', back: '**Macro** = เฉลี่ยตรง ๆ ทุกคลาสเท่ากัน\n**Micro** = รวม TP/FP/FN ทุกคลาสแล้วค่อยคิด (= accuracy ใน multi-class)\n**Weighted** = ถ่วงตามจำนวนตัวอย่างจริงของแต่ละคลาส' },
    { id: 'm43', topic: 'Metrics', front: 'ควรใช้ **Recall** สูงเข้าไว้ในงานแบบไหน', back: 'งานที่ **พลาดแล้วเสียหายมาก** เช่น ตรวจมะเร็ง ตรวจจับการฉ้อโกง\n(ยอมเตือนผิดบ้าง ดีกว่าปล่อยหลุด)' },
    { id: 'm44', topic: 'Metrics', front: 'ควรใช้ **Precision** สูงเข้าไว้ในงานแบบไหน', back: 'งานที่ **เตือนผิดแล้วเสียหาย** เช่น กรองสแปม (อีเมลสำคัญโดนทิ้ง)' },
    { id: 'm45', topic: 'Metrics', front: 'ทำไม Accuracy อย่างเดียวถึงหลอกตาได้', back: 'ถ้าคลาสไม่สมดุล เช่นคลาส A มี 95% แค่ทาย A ตลอดก็ได้ 95% แล้ว\nต้องดู Precision/Recall/F1 ประกอบ' },

    /* -- keras / debug -- */
    { id: 'm46', topic: 'Keras', front: 'โครงมาตรฐานของโมเดล **Regression** ใน Keras', back: 'output: `Dense(1)` (ไม่ใส่ activation)\nloss: `mse`\nmetrics: `[\'mae\']`' },
    { id: 'm47', topic: 'Keras', front: '`model.compile()` ต้องเรียกตอนไหน', back: '**หลังสร้างโมเดลเสร็จ ก่อน fit**\nเรียกก่อนมีโมเดล = NameError' },
    { id: 'm48', topic: 'Keras', front: 'โมเดลทำนายราคาบ้านแต่ได้ค่าออกมา 0-1 ตลอด เพราะอะไร', back: 'ชั้น output ใช้ **sigmoid** ซึ่งบีบค่าไว้ใน (0,1)\nแก้: เอา activation ออก ให้เป็น linear' },
    { id: 'm49', topic: 'Keras', front: 'ทำไมใช้ `accuracy` เป็น metric ของ regression ไม่ได้', back: 'accuracy นับว่า "ทายตรงเป๊ะ" ซึ่งค่าต่อเนื่องแทบไม่มีทางตรง\nค่าจะค้างใกล้ 0 ตลอด → ใช้ `mae` แทน' },
    { id: 'm50', topic: 'Keras', front: '**Dropout** ทำอะไร และใช้ตอนไหน', back: 'สุ่มปิด neuron บางส่วน**ตอนเทรน** เพื่อกัน overfitting\nตอน predict ไม่ปิด (ใช้ทั้งหมด)' },
    { id: 'm51', topic: 'Keras', front: 'อาการ **overfitting** ดูยังไง และแก้ยังไง', back: 'train loss ลด แต่ validation loss เริ่มเพิ่ม\nแก้: Dropout · ข้อมูลเพิ่ม · augmentation · early stopping · ลดขนาดโมเดล' },

    /* -- ตัวเลขจากข้อสอบจริง -- */
    { id: 'm52', topic: 'ตัวเลขข้อสอบ', front: 'ข้อ C1: y_H3 และ y_H4 ได้เท่าไร', back: 'z_H3 = 0.48 → **y_H3 = 0.6177**\nz_H4 = 0.63 → **y_H4 = 0.6525**' },
    { id: 'm53', topic: 'ตัวเลขข้อสอบ', front: 'ข้อ C1: y_O5, Error และ δ_O5', back: 'z_O5 = 0.8926 → **y_O5 = 0.7094**\nError = 0.9 − 0.7094 = **0.1906**\nδ_O5 = **0.0393**' },
    { id: 'm54', topic: 'ตัวเลขข้อสอบ', front: 'ข้อ C1: δ_H3 และ δ_H4', back: 'δ_H3 = **0.0056**\nδ_H4 = **0.0071**' },
    { id: 'm55', topic: 'ตัวเลขข้อสอบ', front: 'ข้อ D1: feature map หลัง Pool1 และ Pool2', back: 'หลัง MaxPool1 = **16×16×8**\nหลัง MaxPool2 = **8×8×16**' },
    { id: 'm56', topic: 'ตัวเลขข้อสอบ', front: 'ข้อ D1: parameter ของ Conv1, Conv2, Dense(64)', back: 'Conv1 = **224**\nConv2 = **1,168**\nDense(64) = **65,600**\n(Flatten = 1,024)' },
    { id: 'm57', topic: 'ตัวเลขข้อสอบ', front: 'ข้อ E1: Accuracy และ Macro-F1', back: 'Accuracy = 140/180 = **0.7778 (77.78%)**\nMacro-F1 = **0.7789**' },
    { id: 'm58', topic: 'ตัวเลขข้อสอบ', front: 'ข้อ E1: F1 ของ Rock / Paper / Scissors', back: 'Rock = **0.7200**\nPaper = **0.8130**\nScissors = **0.8036**' },
    { id: 'm59', topic: 'ตัวเลขข้อสอบ', front: 'ข้อ F1: บั๊กทั้ง 3 จุดคืออะไร', back: '1. `activation=\'sigmoid\'` ที่ output → ต้องเป็น **linear**\n2. `loss=\'binary_crossentropy\'` → ต้องเป็น **mse**\n3. `metrics=[\'accuracy\']` → ต้องเป็น **mae**' }
  ],

  /* =======================================================
     3) QUIZ — โหมด "ควิซ"
     ======================================================= */
  quiz: [
    { id: 'z1', topic: 'Backprop', question: 'อนุพันธ์ของ sigmoid เขียนด้วย y ได้เป็นอะไร', choices: ['y(1−y)', '1−y²', 'y²', '1/(1+e⁻ʸ)'], answer: 0, explain: 'σ′(z) = y(1−y) — ใช้ y ที่หาไว้แล้วได้เลย ส่วน 1−y² เป็นของ tanh' },
    { id: 'z2', topic: 'Backprop', question: 'W₄₂ หมายถึง weight จากไหนไปไหน', choices: ['จาก node 4 ไป node 2', 'จาก node 2 ไป node 4', 'จาก layer 4 ไป layer 2', 'weight ลำดับที่ 42'], answer: 1, explain: 'ตัวหน้าคือปลายทาง ตัวหลังคือต้นทาง — W₄₂ คือจาก 2 ไป 4' },
    { id: 'z3', topic: 'Backprop', question: 'δ ของ output unit คำนวณจากสูตรใด', choices: ['y(1−y)', 'y(1−y)(t−y)', '(t−y)²', 'η·y(1−y)'], answer: 1, explain: 'δ_O = อนุพันธ์ y(1−y) คูณกับ error (t−y)' },
    { id: 'z4', topic: 'Backprop', question: 'hidden unit หา δ ของตัวเองได้ยังไง', choices: ['ใช้ target ตรง ๆ เหมือน output', 'รับ δ จากชั้นถัดไปคูณ weight ที่เชื่อม', 'ใช้ค่า input คูณ learning rate', 'ไม่ต้องหา δ ของ hidden'], answer: 1, explain: 'δ_H = y_H(1−y_H)·Σ(δ_ถัดไป × W) — hidden ไม่รู้ target จึงต้องรับความผิดย้อนมา' },
    { id: 'z5', topic: 'Backprop', question: 'ในสูตร ΔW_ji = η·δ_j·y_i ตัว y_i คืออะไร', choices: ['output ของ neuron ปลายทาง', 'output ของ neuron ต้นทาง', 'ค่า target', 'ค่า error'], answer: 1, explain: 'y_i คือ output ของ neuron ต้นทาง — ถ้าต้นทางเป็น input ก็ใช้ค่า X ตรง ๆ' },
    { id: 'z6', topic: 'Backprop', question: 'ΔW53 ต้องใช้ δ ตัวไหน', choices: ['δ_H3', 'δ_H4', 'δ_O5', 'δ_X1'], answer: 2, explain: 'W53 เป็นเส้นที่เข้า O5 → ใช้ δ ของปลายทางคือ δ_O5 คูณกับ y_H3' },
    { id: 'z7', topic: 'Backprop', question: 'ΔW31 ต้องใช้ δ และ input ตัวไหน', choices: ['δ_O5 × y_H3', 'δ_H3 × X1', 'δ_H3 × X2', 'δ_H4 × X1'], answer: 1, explain: 'W31 คือจาก X1 → H3 ปลายทางคือ H3 ต้นทางคือ X1' },
    { id: 'z8', topic: 'Backprop', question: 'z_H3 = 0.6(0.2) + 0.9(0.4) มีค่าเท่าไร', choices: ['0.48', '0.54', '0.63', '0.36'], answer: 0, explain: '0.12 + 0.36 = 0.48' },
    { id: 'z9', topic: 'Backprop', question: 'ถ้าคำนวณ sigmoid แล้วได้ค่า 1.24 แปลว่าอะไร', choices: ['ปกติ ค่ามากกว่า 1 ได้', 'คิดผิดแน่นอน', 'แปลว่า input ใหญ่มาก', 'ต้องใช้ ReLU แทน'], answer: 1, explain: 'sigmoid ออกมาในช่วง (0,1) เสมอ ได้เกิน 1 = คิดผิด' },
    { id: 'z10', topic: 'Activation', question: 'ชั้น output ของโมเดลทำนายราคาบ้านควรใช้ activation ใด', choices: ['sigmoid', 'softmax', 'linear (ไม่ใส่)', 'tanh'], answer: 2, explain: 'regression ต้องทำนายค่าได้ทุกช่วง จึงใช้ linear' },
    { id: 'z11', topic: 'Activation', question: 'ข้อใดเป็นช่วงผลลัพธ์ของ ReLU', choices: ['(0, 1)', '(−1, 1)', '[0, ∞)', '(−∞, ∞)'], answer: 2, explain: 'ReLU = max(0, z) จึงไม่ติดลบ แต่ไม่มีขอบบน' },
    { id: 'z12', topic: 'Activation', question: 'softmax มีคุณสมบัติพิเศษอะไร', choices: ['ค่าสูงสุดเป็น 1 เสมอ', 'ผลรวมทุกคลาสเท่ากับ 1', 'ไม่มีค่าติดลบและไม่เกิน 0.5', 'เท่ากับ sigmoid ทุกประการ'], answer: 1, explain: 'softmax ทำให้ผลรวมของทุกคลาส = 1 จึงตีความเป็นความน่าจะเป็นได้' },
    { id: 'z13', topic: 'Loss', question: 'งาน regression ควรใช้ loss ใด', choices: ['binary_crossentropy', 'categorical_crossentropy', 'mse', 'hinge'], answer: 2, explain: 'regression ใช้ mse หรือ mae — crossentropy เป็นของงานจำแนก' },
    { id: 'z14', topic: 'Loss', question: 'label เป็นเลขจำนวนเต็ม 0/1/2 ในงาน 3 คลาส ควรใช้ loss ใด', choices: ['categorical_crossentropy', 'sparse_categorical_crossentropy', 'binary_crossentropy', 'mse'], answer: 1, explain: 'label เป็นเลขจำนวนเต็มใช้ sparse_ ส่วน one-hot ใช้ categorical_' },
    { id: 'z15', topic: 'Gradient', question: 'ตั้ง learning rate ใหญ่เกินไปจะเกิดอะไร', choices: ['เรียนช้าแต่แม่น', 'loss แกว่งหรือพุ่งขึ้น', 'ไม่มีผลอะไร', 'parameter ลดลง'], answer: 1, explain: 'ก้าวใหญ่เกินจะกระโดดข้ามจุดต่ำสุด ทำให้ไม่ลู่เข้า' },
    { id: 'z16', topic: 'Gradient', question: 'ข้อมูล 1,000 ตัว batch_size = 100 ใน 1 epoch อัปเดต weight กี่ครั้ง', choices: ['1 ครั้ง', '10 ครั้ง', '100 ครั้ง', '1,000 ครั้ง'], answer: 1, explain: '1000/100 = 10 iterations ต่อ 1 epoch' },
    { id: 'z17', topic: 'CNN', question: 'input 32×32×3 ผ่าน Conv 8 filters 3×3 padding=same stride=1 ได้ขนาดเท่าไร', choices: ['30×30×8', '32×32×8', '32×32×3', '16×16×8'], answer: 1, explain: 'same + stride 1 = ขนาดเท่าเดิม เปลี่ยนแค่ channel เป็นจำนวน filter' },
    { id: 'z18', topic: 'CNN', question: '32×32×8 ผ่าน MaxPool 2×2 stride 2 ได้ขนาดเท่าไร', choices: ['16×16×8', '16×16×4', '32×32×4', '8×8×8'], answer: 0, explain: 'pool หารครึ่งเฉพาะกว้าง×ยาว channel คงเดิม' },
    { id: 'z19', topic: 'CNN', question: 'Conv1: 8 filters 3×3 บน input 3 channel มี parameter กี่ตัว', choices: ['216', '224', '288', '72'], answer: 1, explain: '(3×3×3 + 1) × 8 = 28 × 8 = 224 (อย่าลืม +1 bias)' },
    { id: 'z20', topic: 'CNN', question: 'Conv2: 16 filters 3×3 ต่อจาก Conv1 ที่มี 8 filters มี parameter กี่ตัว', choices: ['1,152', '1,168', '448', '2,320'], answer: 1, explain: 'C_in = 8 (จำนวน filter ชั้นก่อน) → (3×3×8+1)×16 = 73×16 = 1,168' },
    { id: 'z21', topic: 'CNN', question: 'Flatten จาก 8×8×16 ได้ขนาดเท่าไร', choices: ['128', '1,024', '64', '256'], answer: 1, explain: '8 × 8 × 16 = 1,024 — ต้องคูณ channel ด้วย' },
    { id: 'z22', topic: 'CNN', question: 'Dense(64) ต่อจาก Flatten 1,024 มี parameter กี่ตัว', choices: ['65,536', '65,600', '1,088', '64'], answer: 1, explain: '1024×64 + 64 = 65,536 + 64 = 65,600' },
    { id: 'z23', topic: 'CNN', question: 'layer ใดมี trainable parameter เป็น 0', choices: ['Conv2D', 'Dense', 'MaxPooling2D', 'ทุก layer มี parameter'], answer: 2, explain: 'Pooling, Flatten, Dropout ไม่มี weight/bias ให้เทรน' },
    { id: 'z24', topic: 'CNN', question: 'input 28×28 filter 5×5 padding=valid stride=1 ได้ output เท่าไร', choices: ['28', '24', '23', '14'], answer: 1, explain: '(28−5)/1 + 1 = 24' },
    { id: 'z25', topic: 'CNN', question: 'ความลึกของ filter ต้องเท่ากับอะไร', choices: ['จำนวน filter', 'จำนวน channel ของ input', 'ขนาด stride', 'กำหนดเองได้อิสระ'], answer: 1, explain: 'filter ต้องลึกเท่า channel ของ input เสมอ' },
    { id: 'z26', topic: 'Metrics', question: 'ใน confusion matrix ของข้อสอบนี้ แถวหมายถึงอะไร', choices: ['ค่าที่โมเดลทาย', 'ค่าจริง', 'จำนวน epoch', 'ค่า loss'], answer: 1, explain: 'โจทย์ระบุ "แถว=จริง, คอลัมน์=ทาย"' },
    { id: 'z27', topic: 'Metrics', question: 'FP ของคลาส Rock หาจากอะไร', choices: ['ผลรวมแถว Rock − TP', 'ผลรวมคอลัมน์ Rock − TP', 'total − TP', 'TP ของคลาสอื่น'], answer: 1, explain: 'FP = ทายว่าเป็น Rock แต่จริงไม่ใช่ → ดูคอลัมน์' },
    { id: 'z28', topic: 'Metrics', question: 'Accuracy ของ confusion matrix 3×3 คำนวณยังไง', choices: ['TP ของคลาสแรก / total', 'ผลรวมเส้นทแยงมุม / total', 'เฉลี่ย precision ทุกคลาส', 'TP/(TP+FP)'], answer: 1, explain: 'ช่องทแยงมุมคือที่ทายถูกทั้งหมด' },
    { id: 'z29', topic: 'Metrics', question: 'Rock มี TP=45 FP=20 FN=15 ค่า F1 เท่าไร', choices: ['0.7500', '0.6923', '0.7200', '0.8000'], answer: 2, explain: 'ทางลัด F1 = 2(45)/(2(45)+20+15) = 90/125 = 0.72' },
    { id: 'z30', topic: 'Metrics', question: 'Precision ใช้ตอบคำถามว่าอะไร', choices: ['ของจริงทั้งหมดจับได้กี่ %', 'ที่ทายว่าใช่ ถูกจริงกี่ %', 'ถูกทั้งหมดกี่ %', 'ผิดกี่ %'], answer: 1, explain: 'Precision = TP/(TP+FP) มองจากฝั่งที่โมเดลทาย' },
    { id: 'z31', topic: 'Metrics', question: 'งานตรวจมะเร็งควรให้ความสำคัญกับ metric ใดมากที่สุด', choices: ['Precision', 'Recall', 'Accuracy', 'Loss'], answer: 1, explain: 'พลาดคนป่วยคือเสียหายหนัก จึงต้อง Recall สูง' },
    { id: 'z32', topic: 'Metrics', question: 'Macro-average F1 คำนวณยังไง', choices: ['รวม TP/FP/FN ทุกคลาสแล้วคิดทีเดียว', 'เฉลี่ย F1 ทุกคลาสหารจำนวนคลาส', 'ถ่วงน้ำหนักตามจำนวนตัวอย่าง', 'เอา F1 ของคลาสที่ดีที่สุด'], answer: 1, explain: 'Macro = เฉลี่ยตรง ๆ ทุกคลาสน้ำหนักเท่ากัน ส่วนตัวเลือกแรกคือ micro' },
    { id: 'z33', topic: 'Metrics', question: 'ข้อมูลคลาส A 95% คลาส B 5% โมเดลทาย A ตลอดจะได้ accuracy เท่าไร', choices: ['50%', '95%', '5%', '0%'], answer: 1, explain: 'ได้ 95% ทั้งที่โมเดลไร้ประโยชน์ — นี่คือเหตุผลที่ต้องดู F1 ด้วย' },
    { id: 'z34', topic: 'Debug', question: 'โมเดล regression ใช้ activation=\'sigmoid\' ที่ output จะเกิดอะไร', choices: ['ทำนายได้ปกติ', 'ค่าทำนายถูกบีบอยู่ใน 0-1 เท่านั้น', 'โมเดล error ทันที', 'เทรนเร็วขึ้น'], answer: 1, explain: 'sigmoid บีบ output ไว้ (0,1) ทำนายราคาบ้านหลักล้านไม่ได้' },
    { id: 'z35', topic: 'Debug', question: 'ใช้ metrics=[\'accuracy\'] กับงาน regression จะเป็นยังไง', choices: ['ใช้ได้ปกติ', 'ค่าค้างใกล้ 0 เพราะแทบไม่มีทางทายตรงเป๊ะ', 'ค่าจะเป็น 100% เสมอ', 'โปรแกรม crash'], answer: 1, explain: 'accuracy นับว่าต้องตรงเป๊ะ ค่าต่อเนื่องแทบเป็นไปไม่ได้ → ใช้ mae' },
    { id: 'z36', topic: 'Debug', question: 'เรียก model.build() ก่อนบรรทัดที่สร้าง Sequential จะเกิดอะไร', choices: ['ทำงานปกติ', 'NameError เพราะยังไม่มีตัวแปร model', 'โมเดลเทรนช้าลง', 'parameter เป็น 0'], answer: 1, explain: 'ยังไม่มีตัวแปร model ในขณะนั้น Python จึงฟ้อง NameError' },
    { id: 'z37', topic: 'Debug', question: 'train loss ลดเรื่อย ๆ แต่ validation loss เริ่มเพิ่ม แปลว่าอะไร', choices: ['underfitting', 'overfitting', 'learning rate ต่ำไป', 'ข้อมูลน้อยไป'], answer: 1, explain: 'overfitting — โมเดลจำข้อมูลเทรนแต่ generalize ไม่ได้ แก้ด้วย dropout/early stopping' },
    { id: 'z38', topic: 'สอบ', question: 'มาสายกี่นาทีถึงหมดสิทธิ์สอบ', choices: ['15 นาที', '30 นาที', '45 นาที', 'มาสายได้ไม่จำกัด'], answer: 1, explain: 'เลทเกิน 30 นาที หมดสิทธิ์สอบ — สอบ 12:30 ควรถึงก่อน 12:25' }
  ],

  /* =======================================================
     4) WRITE — โหมด "ทดสอบเขียน" (ตอบสั้น ๆ / สูตร / ตัวเลข)
     ======================================================= */
  write: [
    { id: 'v1', topic: 'สูตร', prompt: 'เขียนสูตร **อนุพันธ์ของ sigmoid** ในรูปของ y', hint: 'ไม่ต้องมี e เลย', sample: 'y(1-y)', answers: ['y(1-y)', 'y*(1-y)', 'y(1 - y)'], explain: 'σ′(z) = y(1−y)' },
    { id: 'v2', topic: 'สูตร', prompt: 'เขียนสูตร **δ ของ output unit**', hint: 'อนุพันธ์ × error', sample: 'δ_O = y(1-y)(t-y)', answers: ['δ_O = y(1-y)(t-y)', 'y(1-y)(t-y)', 'δo = y(1-y)(t-y)'], explain: 'δ_O = y_O(1−y_O)(t−y_O)' },
    { id: 'v3', topic: 'สูตร', prompt: 'เขียนสูตร **ΔW** ของ backpropagation', hint: 'learning rate × delta × input', sample: 'ΔW = η·δ·y', answers: ['ΔW = η·δ·y', 'ΔW = ηδy', 'dW = n*delta*y', 'ΔW = η δ y'], explain: 'ΔW_ji = η · δ_j · y_i แล้ว W_new = W_old + ΔW' },
    { id: 'v4', topic: 'สูตร', prompt: 'เขียนสูตรนับ **parameter ของ Conv layer**', hint: 'อย่าลืม bias', sample: '(F*F*C_in + 1) * N_filter', answers: ['(F*F*C_in + 1) * N_filter', '(FxFxC_in+1)xN', '(F×F×C_in+1)×จำนวนfilter'], explain: '(F × F × C_in + 1) × จำนวน filter' },
    { id: 'v5', topic: 'สูตร', prompt: 'เขียนสูตรนับ **parameter ของ Dense layer**', hint: 'input คูณ node บวก bias', sample: 'input * node + node', answers: ['input * node + node', 'input*node+node', '(input+1)*node'], explain: 'input × node + node (bias 1 ตัวต่อ node)' },
    { id: 'v6', topic: 'สูตร', prompt: 'เขียนสูตรขนาด output ของ Conv แบบ **valid**', hint: 'มีการหารด้วย stride', sample: '(N-F)/S + 1', answers: ['(N-F)/S + 1', '(N-F)/S+1', 'floor((N-F)/S)+1'], explain: 'Output = ⌊(N−F)/S⌋ + 1' },
    { id: 'v7', topic: 'สูตร', prompt: 'เขียนสูตร **F1-Score** แบบทางลัด (ใช้ TP FP FN)', hint: 'ไม่ต้องผ่าน precision/recall', sample: '2TP / (2TP + FP + FN)', answers: ['2TP / (2TP + FP + FN)', '2TP/(2TP+FP+FN)', '2*TP/(2*TP+FP+FN)'], explain: 'F1 = 2TP/(2TP+FP+FN) — เท่ากับ 2PR/(P+R) แต่คิดเร็วกว่ามาก' },
    { id: 'v8', topic: 'สูตร', prompt: 'เขียนสูตร **Precision**', hint: 'มองจากฝั่งที่โมเดลทาย', sample: 'TP / (TP + FP)', answers: ['TP / (TP + FP)', 'TP/(TP+FP)'], explain: 'Precision = TP/(TP+FP) — ดูคอลัมน์ของ confusion matrix' },
    { id: 'v9', topic: 'สูตร', prompt: 'เขียนสูตร **Recall**', hint: 'มองจากฝั่งความจริง', sample: 'TP / (TP + FN)', answers: ['TP / (TP + FN)', 'TP/(TP+FN)'], explain: 'Recall = TP/(TP+FN) — ดูแถวของ confusion matrix' },

    { id: 'v10', topic: 'คิดเลข', prompt: 'z_H3 = 0.6(0.2) + 0.9(0.4) = ?', hint: '0.12 + 0.36', sample: '0.48', explain: '0.12 + 0.36 = 0.48' },
    { id: 'v11', topic: 'คิดเลข', prompt: 'z_H4 = 0.6(0.3) + 0.9(0.5) = ?', hint: '0.18 + 0.45', sample: '0.63', explain: '0.18 + 0.45 = 0.63' },
    { id: 'v12', topic: 'คิดเลข', prompt: 'z_O5 = 0.6177(0.6) + 0.6525(0.8) = ?\n(ปัด 4 ตำแหน่ง)', hint: '0.37062 + 0.522', sample: '0.8926', explain: '0.37062 + 0.52200 = 0.89262 → 0.8926' },
    { id: 'v13', topic: 'คิดเลข', prompt: 'Error เมื่อ t = 0.9 และ y_O5 = 0.7094', hint: 't − y', sample: '0.1906', explain: '0.9 − 0.7094 = 0.1906' },
    { id: 'v14', topic: 'คิดเลข', prompt: 'δ_O5 = 0.7094 × 0.2906 × 0.1906 = ?\n(ปัด 4 ตำแหน่ง)', hint: 'y(1−y)(t−y)', sample: '0.0393', explain: '0.7094 × 0.2906 × 0.1906 = 0.039293 → 0.0393' },
    { id: 'v15', topic: 'คิดเลข', prompt: 'ΔW53 เมื่อ η=0.5, δ_O5=0.0393, y_H3=0.6177\n(ปัด 4 ตำแหน่ง)', hint: 'η × δ × y', sample: '0.0121', explain: '0.5 × 0.0393 × 0.6177 = 0.012138 → 0.0121' },
    { id: 'v16', topic: 'คิดเลข', prompt: 'W53 ใหม่ เมื่อ W53 เดิม = 0.6 และ ΔW53 = 0.0121', hint: 'W_old + ΔW', sample: '0.6121', explain: '0.6 + 0.0121 = 0.6121 (ตรงกับเฉลยอาจารย์)' },

    { id: 'v17', topic: 'CNN', prompt: 'input 32×32×3 → Conv 8 filters 3×3 same stride 1 → MaxPool 2×2 stride 2\nขนาด feature map สุดท้าย? (ตอบแบบ กว้างxยาวxchannel)', hint: 'same ไม่เปลี่ยนขนาด แล้ว pool หารครึ่ง', sample: '16x16x8', answers: ['16x16x8', '16×16×8', '16*16*8'], explain: 'Conv same → 32×32×8 แล้ว pool → 16×16×8' },
    { id: 'v18', topic: 'CNN', prompt: 'Conv1: 8 filters ขนาด 3×3 บน input 3 channel\nมี trainable parameter กี่ตัว?', hint: '(F×F×C_in + 1) × N', sample: '224', explain: '(3×3×3 + 1) × 8 = 28 × 8 = 224' },
    { id: 'v19', topic: 'CNN', prompt: 'Conv2: 16 filters ขนาด 3×3 ต่อจากชั้นที่มี 8 channel\nมี trainable parameter กี่ตัว?', hint: 'C_in = 8 ไม่ใช่ 3', sample: '1168', answers: ['1168', '1,168'], explain: '(3×3×8 + 1) × 16 = 73 × 16 = 1,168' },
    { id: 'v20', topic: 'CNN', prompt: 'Flatten จาก feature map 8×8×16 ได้กี่ค่า?', hint: 'คูณทั้ง 3 มิติ', sample: '1024', answers: ['1024', '1,024'], explain: '8 × 8 × 16 = 1,024' },
    { id: 'v21', topic: 'CNN', prompt: 'Dense(64) ต่อจาก Flatten 1,024 มี parameter กี่ตัว?', hint: 'input×node + bias', sample: '65600', answers: ['65600', '65,600'], explain: '1024 × 64 + 64 = 65,536 + 64 = 65,600' },
    { id: 'v22', topic: 'CNN', prompt: 'input 28×28 filter 5×5 padding=valid stride=1\nขนาด output?', hint: '(N−F)/S + 1', sample: '24', answers: ['24', '24x24', '24×24'], explain: '(28 − 5)/1 + 1 = 24' },

    { id: 'v23', topic: 'Metrics', prompt: 'confusion matrix 3×3 ทแยงมุม = 45, 50, 45 รวมทั้งหมด 180\nAccuracy = ? (ทศนิยม 4 ตำแหน่ง)', hint: 'ทแยงมุม / total', sample: '0.7778', explain: '140/180 = 0.7778 (77.78%)' },
    { id: 'v24', topic: 'Metrics', prompt: 'คลาส Rock: TP=45, FP=20, FN=15\nPrecision = ? (ทศนิยม 4 ตำแหน่ง)', hint: 'TP/(TP+FP)', sample: '0.6923', explain: '45/65 = 0.6923' },
    { id: 'v25', topic: 'Metrics', prompt: 'คลาส Rock: TP=45, FP=20, FN=15\nRecall = ?', hint: 'TP/(TP+FN)', sample: '0.75', answers: ['0.75', '0.7500'], explain: '45/60 = 0.75' },
    { id: 'v26', topic: 'Metrics', prompt: 'คลาส Rock: TP=45, FP=20, FN=15\nF1 = ? (ทศนิยม 4 ตำแหน่ง)', hint: 'ใช้ทางลัด 2TP/(2TP+FP+FN)', sample: '0.72', answers: ['0.72', '0.7200'], explain: '90/125 = 0.72' },
    { id: 'v27', topic: 'Metrics', prompt: 'F1 ของ 3 คลาส = 0.7200, 0.8130, 0.8036\nMacro-F1 = ? (ทศนิยม 4 ตำแหน่ง)', hint: 'บวกกันหาร 3', sample: '0.7789', explain: '(0.72+0.813+0.8036)/3 = 0.7789' },

    { id: 'v28', topic: 'Debug', prompt: 'โมเดล regression ชั้น output เขียนว่า\n`Dense(1, activation=\'sigmoid\')`\nต้องแก้เป็นอะไร', hint: 'regression ไม่บีบช่วงค่า', sample: "Dense(1)", answers: ["Dense(1)", "Dense(1, activation='linear')", "tf.keras.layers.Dense(1)"], explain: 'ตัด sigmoid ออกให้เป็น linear เพื่อทำนายค่าได้ทุกช่วง' },
    { id: 'v29', topic: 'Debug', prompt: 'โมเดล regression ใช้ `loss=\'binary_crossentropy\'`\nต้องแก้เป็นอะไร', hint: 'loss ของค่าต่อเนื่อง', sample: "loss='mse'", answers: ["loss='mse'", "mse", "loss='mean_squared_error'", "loss='mae'"], explain: 'regression ใช้ mse (หรือ mae)' },
    { id: 'v30', topic: 'Debug', prompt: 'โมเดล regression ใช้ `metrics=[\'accuracy\']`\nต้องแก้เป็นอะไร', hint: 'metric ของค่าต่อเนื่อง', sample: "metrics=['mae']", answers: ["metrics=['mae']", "mae", "metrics=['mse']", "metrics=['rmse']"], explain: 'accuracy ใช้กับ regression ไม่ได้ ใช้ mae/mse/rmse แทน' }
  ],

  /* =======================================================
     5) WORK — โหมด "แสดงวิธีทำ" (เขียนด้วยปากกา แล้วเทียบเฉลยทีละขั้น)
        4 ข้อแรก = ข้อสอบจริงจาก practice exam
        ที่เหลือ = โจทย์ฝึกเปลี่ยนตัวเลข
     ======================================================= */
  work: [
    /* ---------- Section C (ข้อสอบจริง) ---------- */
    {
      id: 'k1',
      topic: 'Section C · ข้อสอบจริง',
      prompt: '**C1. คำนวณ Backpropagation ครบทุก Weight** — แสดงวิธีทำทุกขั้นตอน',
      given: 'Neural Network: Input X1=0.6, X2=0.9 → Hidden H3, H4 → Output O5\n\nWeight:\n  W31 = 0.2  (X1→H3)      W32 = 0.4  (X2→H3)\n  W41 = 0.3  (X1→H4)      W42 = 0.5  (X2→H4)\n  W53 = 0.6  (H3→O5)      W54 = 0.8  (H4→O5)\n\nTarget (t) = 0.9      Learning Rate (η) = 0.5\nใช้ Sigmoid เป็น Activation ทุก Neuron\nปัดทศนิยม 4 ตำแหน่ง',
      ask: [
        'Forward Propagation: หา y_H3, y_H4, y_O5',
        'Error และ δ_O5 (Output Unit Error)',
        'δ_H3 และ δ_H4 (Hidden Unit Error ทั้งสองตัว)',
        'คำนวณ ΔW และ W ใหม่ ให้ครบทั้ง 6 เส้น (W31, W32, W41, W42, W53, W54)'
      ],
      hint: 'เริ่มจากวาดรูป network เขียน weight กำกับทุกเส้นก่อน แล้วไล่ forward → δ_O → δ_H → ΔW ตามลำดับ',
      steps: [
        {
          title: 'ก) Forward — ชั้น Hidden',
          detail: 'หา net input ของ H3 และ H4 แล้วผ่าน sigmoid (ไม่มี bias เพราะโจทย์ไม่ให้มา)',
          calc: 'z_H3 = X1·W31 + X2·W32\n     = 0.6(0.2) + 0.9(0.4)\n     = 0.12 + 0.36 = 0.48\ny_H3 = 1/(1+e^-0.48) = 0.6177\n\nz_H4 = X1·W41 + X2·W42\n     = 0.6(0.3) + 0.9(0.5)\n     = 0.18 + 0.45 = 0.63\ny_H4 = 1/(1+e^-0.63) = 0.6525'
        },
        {
          title: 'ก) Forward — ชั้น Output',
          detail: 'ชั้นนี้ใช้ **y ของ hidden** เป็น input ไม่ใช่ X เดิม',
          calc: 'z_O5 = y_H3·W53 + y_H4·W54\n     = 0.6177(0.6) + 0.6525(0.8)\n     = 0.37062 + 0.52200 = 0.8926\ny_O5 = 1/(1+e^-0.8926) = 0.7094',
          note: 'จุดพลาดบ่อย: เอา X1, X2 มาคูณ W53/W54 — ต้องใช้ y_H3, y_H4'
        },
        {
          title: 'ข) Error และ δ_O5',
          detail: 'Error = t − y · แล้ว δ_O = y(1−y) × Error',
          calc: 'Error = t − y_O5 = 0.9 − 0.7094 = 0.1906\n\nδ_O5 = y_O5(1 − y_O5)(t − y_O5)\n     = 0.7094 × (1 − 0.7094) × 0.1906\n     = 0.7094 × 0.2906 × 0.1906\n     = 0.0393'
        },
        {
          title: 'ค) δ_H3 และ δ_H4',
          detail: 'hidden รับ δ จาก output ย้อนมาตามสายที่เชื่อม — มี output ตัวเดียวจึงไม่ต้องรวมหลายเส้น',
          calc: 'δ_H3 = y_H3(1 − y_H3) × δ_O5 × W53\n     = 0.6177 × 0.3823 × 0.0393 × 0.6\n     = 0.0056\n\nδ_H4 = y_H4(1 − y_H4) × δ_O5 × W54\n     = 0.6525 × 0.3475 × 0.0393 × 0.8\n     = 0.0071',
          note: 'ใช้ W **ค่าเดิม** ยังไม่อัปเดต — ต้องหา δ ให้ครบก่อนค่อยปรับ weight'
        },
        {
          title: 'ง) ΔW และ W ใหม่ — เส้นที่เข้า Output',
          detail: 'ΔW = η · δ_ปลายทาง · y_ต้นทาง · เส้นพวกนี้ปลายทางคือ O5 จึงใช้ δ_O5',
          calc: 'ΔW53 = η · δ_O5 · y_H3 = 0.5 × 0.0393 × 0.6177 = 0.0121\n  W53ใหม่ = 0.6 + 0.0121 = 0.6121\n\nΔW54 = η · δ_O5 · y_H4 = 0.5 × 0.0393 × 0.6525 = 0.0128\n  W54ใหม่ = 0.8 + 0.0128 = 0.8128'
        },
        {
          title: 'ง) ΔW และ W ใหม่ — เส้นที่เข้า Hidden',
          detail: 'ปลายทางคือ H3/H4 จึงใช้ δ_H3/δ_H4 · ต้นทางเป็น input layer จึงใช้ค่า X ตรง ๆ',
          calc: 'ΔW31 = η · δ_H3 · X1 = 0.5 × 0.0056 × 0.6 = 0.0017\n  W31ใหม่ = 0.2 + 0.0017 = 0.2017\n\nΔW32 = η · δ_H3 · X2 = 0.5 × 0.0056 × 0.9 = 0.0025\n  W32ใหม่ = 0.4 + 0.0025 = 0.4025\n\nΔW41 = η · δ_H4 · X1 = 0.5 × 0.0071 × 0.6 = 0.0021\n  W41ใหม่ = 0.3 + 0.0021 = 0.3021\n\nΔW42 = η · δ_H4 · X2 = 0.5 × 0.0071 × 0.9 = 0.0032\n  W42ใหม่ = 0.5 + 0.0032 = 0.5032'
        }
      ],
      answer: 'y_H3=0.6177 · y_H4=0.6525 · y_O5=0.7094 · Error=0.1906 · δ_O5=0.0393 · δ_H3=0.0056 · δ_H4=0.0071\n\n**W ใหม่ทั้ง 6 เส้น**\nW31=0.2017 · W32=0.4025 · W41=0.3021 · W42=0.5032 · W53=0.6121 · W54=0.8128',
      trap: '① ใช้ X แทน y_H ตอนคำนวณชั้น output · ② อัปเดต W53 ก่อนแล้วเอาค่าใหม่ไปหา δ_H (ต้องใช้ค่าเดิม) · ③ ลืมว่า W_new = W_old **+** ΔW · ④ สลับเลขห้อย W31 กับ W13'
    },

    /* ---------- Section D (ข้อสอบจริง) ---------- */
    {
      id: 'k2',
      topic: 'Section D · ข้อสอบจริง',
      prompt: '**D1. CNN หลายชั้น + นับ Parameter** — แสดงวิธีทำทุกข้อ',
      given: "โครงสร้าง CNN รับภาพ Input ขนาด 32×32×3 (RGB)\n\n  Conv1: 8 Filters, 3×3, Padding='same', Stride=1\n  MaxPool1: 2×2, Stride=2\n  Conv2: 16 Filters, 3×3, Padding='same', Stride=1\n  MaxPool2: 2×2, Stride=2\n  Flatten\n  Dense(64)\n\nHint: Parameter ของ Conv = (F×F×Input_Channel + 1) × จำนวน Filter",
      ask: [
        'ขนาด Feature Map (กว้าง×ยาว×Channel) หลังผ่าน MaxPool1',
        'ขนาด Feature Map หลังผ่าน MaxPool2',
        'จำนวน Trainable Parameter ของ Conv1',
        'จำนวน Trainable Parameter ของ Conv2',
        'ขนาดข้อมูลหลัง Flatten และจำนวน Trainable Parameter ของ Dense(64)'
      ],
      hint: "padding='same' + stride 1 = ขนาดเท่าเดิม เปลี่ยนแค่ channel · MaxPool 2×2 stride 2 = หารครึ่ง channel คงเดิม",
      steps: [
        {
          title: 'ก) ขนาดหลัง MaxPool1',
          detail: "Conv1 เป็น same + stride 1 จึงไม่เปลี่ยนกว้าง×ยาว เปลี่ยนแค่ channel เป็นจำนวน filter",
          calc: "Input           : 32 × 32 × 3\nConv1 (same,S=1): 32 × 32 × 8    ← channel = จำนวน filter\nMaxPool1 (2×2,S=2): 16 × 16 × 8  ← หารครึ่ง channel คงเดิม\n\nตอบ: 16 × 16 × 8"
        },
        {
          title: 'ข) ขนาดหลัง MaxPool2',
          detail: 'ทำแบบเดียวกันอีกรอบ — Conv2 มี 16 filter จึงได้ 16 channel',
          calc: 'Conv2 (same,S=1)  : 16 × 16 × 16\nMaxPool2 (2×2,S=2): 8 × 8 × 16\n\nตอบ: 8 × 8 × 16'
        },
        {
          title: 'ค) Parameter ของ Conv1',
          detail: 'input มี 3 channel (RGB) → filter ลึก 3 · +1 คือ bias ของแต่ละ filter',
          calc: 'Param = (F × F × C_in + 1) × N_filter\n      = (3 × 3 × 3 + 1) × 8\n      = (27 + 1) × 8\n      = 28 × 8\n      = 224'
        },
        {
          title: 'ง) Parameter ของ Conv2',
          detail: 'C_in ของชั้นนี้คือ **8** (จำนวน filter ของ Conv1) ไม่ใช่ 3 แล้ว',
          calc: 'Param = (3 × 3 × 8 + 1) × 16\n      = (72 + 1) × 16\n      = 73 × 16\n      = 1,168',
          note: 'จุดพลาดบ่อยที่สุดของข้อนี้ — ใส่ C_in = 3 ซ้ำจะได้ 448 ซึ่งผิด'
        },
        {
          title: 'จ) Flatten และ Dense(64)',
          detail: 'Flatten = คูณทั้ง 3 มิติ · Dense = input×node + bias(node ตัว)',
          calc: 'Flatten size = 8 × 8 × 16 = 1,024\n\nParam Dense(64) = 1,024 × 64 + 64\n                = 65,536 + 64\n                = 65,600',
          note: 'ลืมคูณ channel (ตอบ 8×8=64) คือพลาดบ่อยอีกจุด'
        },
        {
          title: 'สรุปทั้งโมเดล (ถ้าโจทย์ถามเพิ่ม)',
          calc: 'Conv1    :    224\nMaxPool1 :      0  ← pooling ไม่มี parameter\nConv2    :  1,168\nMaxPool2 :      0\nFlatten  :      0\nDense(64):  65,600\n────────────────────\nรวม      :  66,992'
        }
      ],
      answer: 'ก) **16×16×8** · ข) **8×8×16** · ค) **224** · ง) **1,168** · จ) Flatten = **1,024**, Dense(64) = **65,600**',
      trap: '① ใช้ C_in = 3 กับ Conv2 (ต้องเป็น 8) · ② ลืม +1 bias · ③ Flatten ลืมคูณ channel · ④ คิดว่า MaxPool มี parameter'
    },

    /* ---------- Section E (ข้อสอบจริง) ---------- */
    {
      id: 'k3',
      topic: 'Section E · ข้อสอบจริง',
      prompt: '**E1. Multi-class Evaluation Metrics** — แสดงวิธีทำทุกข้อ',
      given: 'โมเดลจำแนก Rock/Paper/Scissors ให้ผล Confusion Matrix ดังนี้\n(แถว = จริง, คอลัมน์ = ทาย)\n\n  จริง \\ ทาย    Rock   Paper   Scissors\n  Rock           45      10       5\n  Paper           8      50       2\n  Scissors       12       3      45',
      ask: [
        'Overall Accuracy ของโมเดลทั้งระบบ',
        'Precision, Recall, F1-Score ของคลาส Rock',
        'Precision, Recall, F1-Score ของคลาส Paper',
        'Precision, Recall, F1-Score ของคลาส Scissors',
        'Macro-average F1-Score (เฉลี่ย F1 ทั้ง 3 คลาส หารด้วย 3)'
      ],
      hint: 'เขียนผลรวมแถวกับผลรวมคอลัมน์ไว้ข้าง ๆ matrix ก่อน แล้วที่เหลือคือแทนสูตร · FP = คอลัมน์−TP, FN = แถว−TP',
      steps: [
        {
          title: 'เตรียมตาราง — หาผลรวมแถวและคอลัมน์ก่อน',
          detail: 'ขั้นนี้ทำครั้งเดียวแล้วใช้ได้ทั้งข้อ ประหยัดเวลามาก',
          calc: '              Rock  Paper  Scis  | รวมแถว(จริง)\n  Rock          45     10     5   |  60\n  Paper          8     50     2   |  60\n  Scissors      12      3    45   |  60\n  ─────────────────────────────────\n  รวมคอลัมน์    65     63    52   | 180\n\n  Rock : TP=45, FP=65−45=20, FN=60−45=15\n  Paper: TP=50, FP=63−50=13, FN=60−50=10\n  Scis : TP=45, FP=52−45=7,  FN=60−45=15'
        },
        {
          title: 'ก) Overall Accuracy',
          detail: 'ทแยงมุมคือที่ทายถูกทั้งหมด หารด้วยจำนวนตัวอย่างทั้งหมด',
          calc: 'Accuracy = (45 + 50 + 45) / 180\n         = 140 / 180\n         = 0.7778  (77.78%)'
        },
        {
          title: 'ข) คลาส Rock',
          detail: 'Precision ดูคอลัมน์ · Recall ดูแถว · F1 ใช้ทางลัดเร็วกว่า',
          calc: 'Precision = TP/(TP+FP) = 45/65 = 0.6923\nRecall    = TP/(TP+FN) = 45/60 = 0.7500\nF1 = 2TP/(2TP+FP+FN) = 90/(90+20+15) = 90/125 = 0.7200\n\n(ตรวจด้วยสูตรเต็ม: 2(0.6923)(0.75)/(0.6923+0.75) = 0.7200 ✓)'
        },
        {
          title: 'ค) คลาส Paper',
          calc: 'Precision = 50/63 = 0.7937\nRecall    = 50/60 = 0.8333\nF1 = 100/(100+13+10) = 100/123 = 0.8130'
        },
        {
          title: 'ง) คลาส Scissors',
          calc: 'Precision = 45/52 = 0.8654\nRecall    = 45/60 = 0.7500\nF1 = 90/(90+7+15) = 90/112 = 0.8036'
        },
        {
          title: 'จ) Macro-average F1',
          detail: 'เฉลี่ย F1 ทั้ง 3 คลาสตรง ๆ ทุกคลาสน้ำหนักเท่ากัน',
          calc: 'Macro-F1 = (0.7200 + 0.8130 + 0.8036) / 3\n         = 2.3366 / 3\n         = 0.7789',
          note: 'อย่าสับสนกับ Micro-average ที่ต้องรวม TP/FP/FN ทุกคลาสก่อนแล้วค่อยคิด (ซึ่งจะได้ = Accuracy)'
        }
      ],
      answer: 'ก) Accuracy = **0.7778 (77.78%)**\nข) Rock: P=**0.6923** R=**0.7500** F1=**0.7200**\nค) Paper: P=**0.7937** R=**0.8333** F1=**0.8130**\nง) Scissors: P=**0.8654** R=**0.7500** F1=**0.8036**\nจ) Macro-F1 = **0.7789**',
      trap: '① สลับแถวกับคอลัมน์ → Precision กับ Recall สลับกันหมด · ② หา FP จากแถวแทนคอลัมน์ · ③ คิด Macro-F1 โดยเอา macro-P กับ macro-R มาเข้าสูตร F1 (ต้องเฉลี่ย F1 ตรง ๆ)'
    },

    /* ---------- Section F (ข้อสอบจริง) ---------- */
    {
      id: 'k4',
      topic: 'Section F · ข้อสอบจริง',
      prompt: '**F1. หาบั๊กในโค้ด** — โค้ดนี้ตั้งใจสร้างโมเดล Regression ทำนายราคาบ้าน (ค่าตัวเลขต่อเนื่อง) แต่มีข้อผิดพลาดซ่อนอยู่ **3 จุด**\n\nระบุว่าอยู่บรรทัดไหน ผิดเพราะอะไร และแก้ให้ถูกต้อง',
      given: "model.build(input_shape=(None, 10))\n\nmodel = tf.keras.Sequential([\n    tf.keras.layers.Dense(64, activation='relu'),\n    tf.keras.layers.Dense(32, activation='relu'),\n    tf.keras.layers.Dense(1, activation='sigmoid')\n])\n\nmodel.compile(optimizer='adam',\n              loss='binary_crossentropy',\n              metrics=['accuracy'])\n\nhistory = model.fit(X_train, y_train, epochs=10,\n                     validation_data=(X_val, y_val))",
      ask: [
        'บั๊กจุดที่ 1 — บรรทัดไหน ผิดเพราะอะไร แก้เป็นอะไร',
        'บั๊กจุดที่ 2 — บรรทัดไหน ผิดเพราะอะไร แก้เป็นอะไร',
        'บั๊กจุดที่ 3 — บรรทัดไหน ผิดเพราะอะไร แก้เป็นอะไร'
      ],
      hint: 'ถามตัวเองว่า "งานนี้คือ regression" แล้วไล่เช็ก 3 จุดนี้: activation ชั้นสุดท้าย → loss → metric',
      steps: [
        {
          title: 'บั๊กที่ 1 — activation ของชั้น output',
          detail: '`Dense(1, activation=\'sigmoid\')` · sigmoid บีบค่าออกมาอยู่ในช่วง (0, 1) เท่านั้น ทำนายราคาบ้านหลักแสนหลักล้านไม่ได้เลย',
          calc: "ผิด : tf.keras.layers.Dense(1, activation='sigmoid')\nถูก : tf.keras.layers.Dense(1)\n      (หรือเขียน activation='linear' ก็ได้ ผลเหมือนกัน)\n\nเหตุผล: regression ต้องให้ output เป็นค่าต่อเนื่องได้ทุกช่วง"
        },
        {
          title: 'บั๊กที่ 2 — loss function',
          detail: '`binary_crossentropy` เป็น loss ของงานจำแนก 2 คลาส ใช้กับค่าต่อเนื่องไม่ได้',
          calc: "ผิด : loss='binary_crossentropy'\nถูก : loss='mse'\n      (หรือ 'mae' / 'mean_squared_error')\n\nเหตุผล: regression วัดความต่างของตัวเลข ไม่ใช่ความน่าจะเป็นของคลาส"
        },
        {
          title: 'บั๊กที่ 3 — metric',
          detail: '`accuracy` นับว่าทายตรงเป๊ะถึงจะถูก ซึ่งค่าต่อเนื่องแทบไม่มีทางตรง ค่าจะค้างใกล้ 0 ตลอด',
          calc: "ผิด : metrics=['accuracy']\nถูก : metrics=['mae']\n      (หรือ 'mse' / 'rmse')\n\nเหตุผล: regression ต้องวัดว่า \"พลาดไปเท่าไร\" ไม่ใช่ \"ถูกกี่ครั้ง\""
        },
        {
          title: 'โบนัส — จุดที่ 4 ที่ซ่อนอยู่',
          detail: 'บรรทัด `model.build(...)` อยู่**ก่อน**บรรทัดที่สร้าง `model` → Python จะฟ้อง `NameError: name \'model\' is not defined`',
          calc: 'แก้: ย้าย model.build(input_shape=(None, 10))\n     ไปไว้**หลัง** Sequential([...])\n\nหรือใส่ input_shape ใน layer แรกไปเลย:\n  tf.keras.layers.Dense(64, activation=\'relu\', input_shape=(10,))',
          note: 'โจทย์ถามแค่ 3 จุด แต่ถ้าเขียนจุดนี้เพิ่มไปด้วยก็ไม่เสียหาย อาจได้คะแนนพิเศษ'
        },
        {
          title: 'โค้ดที่แก้ครบแล้ว',
          calc: "model = tf.keras.Sequential([\n    tf.keras.layers.Dense(64, activation='relu', input_shape=(10,)),\n    tf.keras.layers.Dense(32, activation='relu'),\n    tf.keras.layers.Dense(1)                      # linear\n])\n\nmodel.compile(optimizer='adam',\n              loss='mse',\n              metrics=['mae'])\n\nhistory = model.fit(X_train, y_train, epochs=10,\n                    validation_data=(X_val, y_val))"
        }
      ],
      answer: '**1.** `Dense(1, activation=\'sigmoid\')` → `Dense(1)` (linear) — sigmoid บีบค่าไว้ใน 0-1\n**2.** `loss=\'binary_crossentropy\'` → `loss=\'mse\'` — crossentropy เป็นของงานจำแนก\n**3.** `metrics=[\'accuracy\']` → `metrics=[\'mae\']` — accuracy ใช้กับค่าต่อเนื่องไม่ได้\n\n(โบนัส: `model.build()` ต้องย้ายไปหลัง Sequential ไม่งั้น NameError)',
      trap: 'อย่าตอบแค่ "แก้เป็นอะไร" — โจทย์สั่งให้บอก **บรรทัดไหน + ผิดเพราะอะไร + แก้เป็นอะไร** ครบ 3 ส่วนทุกจุด'
    },

    /* ---------- โจทย์ฝึกเพิ่ม ---------- */
    {
      id: 'k5',
      topic: 'ฝึกเพิ่ม · Backprop',
      prompt: '**ฝึก Backprop (เปลี่ยนตัวเลข)** — ทำให้ครบเหมือนข้อสอบจริง',
      given: 'X1=0.5, X2=0.8 → H3, H4 → O5\n\n  W31 = 0.1   W32 = 0.3\n  W41 = 0.4   W42 = 0.6\n  W53 = 0.7   W54 = 0.2\n\nTarget t = 0.8   Learning Rate η = 0.4\nSigmoid ทุก neuron · ปัด 4 ตำแหน่ง',
      ask: ['หา y_H3, y_H4, y_O5', 'หา Error และ δ_O5', 'หา δ_H3, δ_H4', 'หา ΔW และ W ใหม่ทั้ง 6 เส้น'],
      hint: 'ขั้นตอนเหมือนข้อ C1 ทุกประการ เปลี่ยนแค่ตัวเลข — ลองทำโดยไม่เปิดเฉลย',
      steps: [
        {
          title: 'Forward',
          calc: 'z_H3 = 0.5(0.1) + 0.8(0.3) = 0.05 + 0.24 = 0.29\ny_H3 = sigmoid(0.29) = 0.5720\n\nz_H4 = 0.5(0.4) + 0.8(0.6) = 0.20 + 0.48 = 0.68\ny_H4 = sigmoid(0.68) = 0.6637\n\nz_O5 = 0.5720(0.7) + 0.6637(0.2) = 0.4004 + 0.1327 = 0.5331\ny_O5 = sigmoid(0.5331) = 0.6302'
        },
        {
          title: 'Error และ δ_O5',
          calc: 'Error = 0.8 − 0.6302 = 0.1698\n\nδ_O5 = 0.6302 × 0.3698 × 0.1698 = 0.0396'
        },
        {
          title: 'δ ของ hidden',
          calc: 'δ_H3 = 0.5720 × 0.4280 × 0.0396 × 0.7 = 0.0068\nδ_H4 = 0.6637 × 0.3363 × 0.0396 × 0.2 = 0.0018'
        },
        {
          title: 'ΔW และ W ใหม่ (η = 0.4)',
          calc: 'ΔW53 = 0.4 × 0.0396 × 0.5720 = 0.0091  → W53 = 0.7091\nΔW54 = 0.4 × 0.0396 × 0.6637 = 0.0105  → W54 = 0.2105\nΔW31 = 0.4 × 0.0068 × 0.5    = 0.0014  → W31 = 0.1014\nΔW32 = 0.4 × 0.0068 × 0.8    = 0.0022  → W32 = 0.3022\nΔW41 = 0.4 × 0.0018 × 0.5    = 0.0004  → W41 = 0.4004\nΔW42 = 0.4 × 0.0018 × 0.8    = 0.0006  → W42 = 0.6006'
        }
      ],
      answer: 'y_H3=0.5720 · y_H4=0.6637 · y_O5=0.6302 · Error=0.1698 · δ_O5=0.0396 · δ_H3=0.0068 · δ_H4=0.0018\nW ใหม่: W31=0.1014 · W32=0.3022 · W41=0.4004 · W42=0.6006 · W53=0.7091 · W54=0.2105',
      trap: 'สังเกตว่า δ_H4 เล็กมากเพราะ W54 แค่ 0.2 — weight น้อย = รับผิดชอบ error น้อย = ถูกปรับน้อย'
    },
    {
      id: 'k6',
      topic: 'ฝึกเพิ่ม · CNN',
      prompt: '**ฝึก CNN + นับ Parameter (เปลี่ยนตัวเลข)**',
      given: "Input 64×64×3 (RGB)\n\n  Conv1: 16 Filters, 5×5, Padding='same', Stride=1\n  MaxPool1: 2×2, Stride=2\n  Conv2: 32 Filters, 3×3, Padding='same', Stride=1\n  MaxPool2: 2×2, Stride=2\n  Flatten\n  Dense(128)",
      ask: ['ขนาดหลัง MaxPool1', 'ขนาดหลัง MaxPool2', 'Parameter ของ Conv1', 'Parameter ของ Conv2', 'Flatten size และ Parameter ของ Dense(128)'],
      hint: 'สูตรเดิมทุกอย่าง ระวัง C_in ของ Conv2 คือ 16 และ filter เป็น 5×5 ในชั้นแรก',
      steps: [
        { title: 'ขนาด feature map', calc: 'Input            : 64 × 64 × 3\nConv1 (same,S=1) : 64 × 64 × 16\nMaxPool1         : 32 × 32 × 16   ← ตอบข้อ ก\nConv2 (same,S=1) : 32 × 32 × 32\nMaxPool2         : 16 × 16 × 32   ← ตอบข้อ ข' },
        { title: 'Parameter ของ Conv1', detail: 'filter 5×5 บน input 3 channel', calc: '(5 × 5 × 3 + 1) × 16\n= (75 + 1) × 16\n= 76 × 16\n= 1,216' },
        { title: 'Parameter ของ Conv2', detail: 'C_in = 16 (filter ของ Conv1)', calc: '(3 × 3 × 16 + 1) × 32\n= (144 + 1) × 32\n= 145 × 32\n= 4,640' },
        { title: 'Flatten และ Dense(128)', calc: 'Flatten = 16 × 16 × 32 = 8,192\n\nDense(128) = 8,192 × 128 + 128\n           = 1,048,576 + 128\n           = 1,048,704', note: 'สังเกตว่า Dense กินไปล้านกว่าตัว เทียบกับ Conv ที่รวมกันแค่ 5,856 — นี่คือเหตุผลที่โมเดลจริงนิยมใช้ GlobalAveragePooling แทน Flatten' }
      ],
      answer: 'ก) **32×32×16** · ข) **16×16×32** · ค) **1,216** · ง) **4,640** · จ) Flatten = **8,192**, Dense(128) = **1,048,704**',
      trap: 'ใส่ C_in ของ Conv2 เป็น 3 แทน 16 · ลืมว่า filter ชั้นแรกเป็น 5×5 ไม่ใช่ 3×3'
    },
    {
      id: 'k7',
      topic: 'ฝึกเพิ่ม · Metrics',
      prompt: '**ฝึก Multi-class Metrics (เปลี่ยนตัวเลข)**',
      given: 'โมเดลจำแนก Cat/Dog/Bird (แถว = จริง, คอลัมน์ = ทาย)\n\n  จริง \\ ทาย    Cat   Dog   Bird\n  Cat            40     5     5\n  Dog            10    35     5\n  Bird            6     4    40',
      ask: ['Overall Accuracy', 'P / R / F1 ของ Cat', 'P / R / F1 ของ Dog', 'P / R / F1 ของ Bird', 'Macro-average F1'],
      hint: 'เขียนผลรวมแถวและคอลัมน์ก่อนเสมอ — แถว Cat/Dog/Bird = 50 ทุกตัว แต่คอลัมน์ไม่เท่ากัน',
      steps: [
        {
          title: 'เตรียมตาราง',
          calc: '              Cat   Dog  Bird | รวมแถว\n  Cat          40     5     5  |  50\n  Dog          10    35     5  |  50\n  Bird          6     4    40  |  50\n  ───────────────────────────────\n  รวมคอลัมน์   56    44    50  | 150\n\n  Cat : TP=40, FP=56−40=16, FN=50−40=10\n  Dog : TP=35, FP=44−35=9,  FN=50−35=15\n  Bird: TP=40, FP=50−40=10, FN=50−40=10'
        },
        { title: 'ก) Accuracy', calc: '(40 + 35 + 40) / 150 = 115/150 = 0.7667  (76.67%)' },
        { title: 'ข) Cat', calc: 'P = 40/56 = 0.7143\nR = 40/50 = 0.8000\nF1 = 2(40)/(2(40)+16+10) = 80/106 = 0.7547' },
        { title: 'ค) Dog', calc: 'P = 35/44 = 0.7955\nR = 35/50 = 0.7000\nF1 = 70/(70+9+15) = 70/94 = 0.7447' },
        { title: 'ง) Bird', calc: 'P = 40/50 = 0.8000\nR = 40/50 = 0.8000\nF1 = 80/(80+10+10) = 80/100 = 0.8000', note: 'Bird มี P = R พอดี F1 จึงเท่ากับทั้งคู่' },
        { title: 'จ) Macro-F1', calc: '(0.7547 + 0.7447 + 0.8000)/3 = 2.2994/3 = 0.7665' }
      ],
      answer: 'ก) **0.7667 (76.67%)**\nข) Cat: P=**0.7143** R=**0.8000** F1=**0.7547**\nค) Dog: P=**0.7955** R=**0.7000** F1=**0.7447**\nง) Bird: P=**0.8000** R=**0.8000** F1=**0.8000**\nจ) Macro-F1 = **0.7665**',
      trap: 'คอลัมน์ Bird รวมได้ 50 เท่ากับแถวพอดี อย่าเผลอคิดว่า FP = 0'
    },
    {
      id: 'k8',
      topic: 'ฝึกเพิ่ม · Debug',
      prompt: '**ฝึกหาบั๊ก (ชุดใหม่)** — โค้ดนี้ตั้งใจทำ **จำแนกภาพ 10 คลาส** (label เป็นเลข 0-9) แต่มีข้อผิดพลาด **3 จุด** หาให้เจอและแก้ให้ถูก',
      given: "model = tf.keras.Sequential([\n    tf.keras.layers.Conv2D(32, (3,3), activation='relu', input_shape=(28,28,1)),\n    tf.keras.layers.MaxPooling2D((2,2)),\n    tf.keras.layers.Flatten(),\n    tf.keras.layers.Dense(64, activation='relu'),\n    tf.keras.layers.Dense(1, activation='sigmoid')\n])\n\nmodel.compile(optimizer='adam',\n              loss='mse',\n              metrics=['accuracy'])",
      ask: ['บั๊กจุดที่ 1', 'บั๊กจุดที่ 2', 'บั๊กจุดที่ 3'],
      hint: 'งานนี้คือ multi-class 10 คลาส label เป็นเลขจำนวนเต็ม → เช็กจำนวน node, activation และ loss',
      steps: [
        { title: 'บั๊กที่ 1 — จำนวน node ชั้น output', detail: 'มี 10 คลาส แต่ให้ node เดียว', calc: "ผิด : Dense(1, activation='sigmoid')\nถูก : Dense(10, ...)\n\nเหตุผล: multi-class ต้องมี node เท่าจำนวนคลาส" },
        { title: 'บั๊กที่ 2 — activation ชั้น output', detail: 'sigmoid ให้ความน่าจะเป็นแยกอิสระแต่ละ node ไม่รวมเป็น 1', calc: "ผิด : activation='sigmoid'\nถูก : activation='softmax'\n\nเหตุผล: multi-class ต้องให้ผลรวมทุกคลาส = 1 เพื่อเลือกคลาสที่มั่นใจสุด" },
        { title: 'บั๊กที่ 3 — loss function', detail: 'mse เป็น loss ของ regression · label เป็นเลขจำนวนเต็ม 0-9 (ไม่ใช่ one-hot)', calc: "ผิด : loss='mse'\nถูก : loss='sparse_categorical_crossentropy'\n\n(ถ้า label เป็น one-hot ให้ใช้ 'categorical_crossentropy')" },
        { title: 'โค้ดที่แก้แล้ว', calc: "model = tf.keras.Sequential([\n    tf.keras.layers.Conv2D(32, (3,3), activation='relu', input_shape=(28,28,1)),\n    tf.keras.layers.MaxPooling2D((2,2)),\n    tf.keras.layers.Flatten(),\n    tf.keras.layers.Dense(64, activation='relu'),\n    tf.keras.layers.Dense(10, activation='softmax')\n])\n\nmodel.compile(optimizer='adam',\n              loss='sparse_categorical_crossentropy',\n              metrics=['accuracy'])" }
      ],
      answer: '**1.** `Dense(1, ...)` → `Dense(10, ...)` — ต้องมี node เท่าจำนวนคลาส\n**2.** `activation=\'sigmoid\'` → `activation=\'softmax\'` — multi-class ต้องให้ผลรวม = 1\n**3.** `loss=\'mse\'` → `loss=\'sparse_categorical_crossentropy\'` — label เป็นเลขจำนวนเต็ม\n\n(`metrics=[\'accuracy\']` ข้อนี้**ถูกแล้ว** เพราะเป็นงานจำแนก)',
      trap: 'อย่าเผลอแก้ metrics เป็น mae — งานนี้เป็น classification ใช้ accuracy ถูกต้องแล้ว'
    },
    {
      id: 'k9',
      topic: 'ฝึกเพิ่ม · Forward',
      prompt: '**วอร์มอัพ: Forward Propagation อย่างเดียว** (ฝึกให้คิด sigmoid คล่อง)',
      given: 'X1 = 1.0, X2 = 0.5\n  W31 = 0.5   W32 = 0.4   (→ H3)\n  W41 = 0.2   W42 = 0.8   (→ H4)\n  W53 = 0.9   W54 = 0.3   (→ O5)\nSigmoid ทุก neuron · ปัด 4 ตำแหน่ง',
      ask: ['หา z และ y ของ H3', 'หา z และ y ของ H4', 'หา z และ y ของ O5'],
      hint: 'ชั้น output ใช้ y ของ hidden เป็น input ไม่ใช่ X',
      steps: [
        { title: 'Hidden H3', calc: 'z_H3 = 1.0(0.5) + 0.5(0.4) = 0.5 + 0.2 = 0.70\ny_H3 = sigmoid(0.70) = 0.6682' },
        { title: 'Hidden H4', calc: 'z_H4 = 1.0(0.2) + 0.5(0.8) = 0.2 + 0.4 = 0.60\ny_H4 = sigmoid(0.60) = 0.6457' },
        { title: 'Output O5', calc: 'z_O5 = 0.6682(0.9) + 0.6457(0.3)\n     = 0.60138 + 0.19371\n     = 0.7951\ny_O5 = sigmoid(0.7951) = 0.6890', note: 'ถ้าเผลอใช้ X1, X2 คูณ W53/W54 จะได้ 1.05 ซึ่งผิด' }
      ],
      answer: 'y_H3 = **0.6682** · y_H4 = **0.6457** · y_O5 = **0.6890**',
      trap: 'ใช้ X แทน y ของ hidden ในชั้น output'
    },
    {
      id: 'k10',
      topic: 'ฝึกเพิ่ม · ขนาด feature map',
      prompt: '**ฝึกสูตรขนาด output ของ Conv** — ทำให้ครบทั้ง 4 กรณี',
      given: 'คำนวณขนาด output (กว้าง×ยาว) ของแต่ละกรณี\n\n  ก) input 28×28, filter 5×5, padding=valid, stride=1\n  ข) input 32×32, filter 3×3, padding=same,  stride=1\n  ค) input 32×32, filter 3×3, padding=valid, stride=2\n  ง) input 64×64 ผ่าน MaxPool 2×2 stride 2 สองครั้งติดกัน',
      ask: ['ตอบทั้ง 4 กรณี พร้อมแสดงสูตรที่ใช้'],
      hint: 'valid ใช้ ⌊(N−F)/S⌋+1 · same + stride 1 = เท่าเดิม · pool 2×2 s2 = หารครึ่ง',
      steps: [
        { title: 'ก) valid, stride 1', calc: 'Output = ⌊(N − F)/S⌋ + 1\n       = (28 − 5)/1 + 1\n       = 23 + 1 = 24\n\nตอบ: 24 × 24' },
        { title: 'ข) same, stride 1', detail: 'กฎลัด: same + stride 1 = ขนาดเท่าเดิมเสมอ', calc: 'Output = 32 × 32  (ไม่เปลี่ยน)' },
        { title: 'ค) valid, stride 2', calc: 'Output = ⌊(32 − 3)/2⌋ + 1\n       = ⌊29/2⌋ + 1\n       = ⌊14.5⌋ + 1\n       = 14 + 1 = 15\n\nตอบ: 15 × 15', note: 'ต้องปัด**ลง**ก่อนบวก 1 — ปัดขึ้นจะได้ 16 ซึ่งผิด' },
        { title: 'ง) pool 2 ครั้ง', calc: '64 → 32 → 16\n\nตอบ: 16 × 16  (channel ไม่เปลี่ยนตลอด)' }
      ],
      answer: 'ก) **24×24** · ข) **32×32** · ค) **15×15** · ง) **16×16**',
      trap: 'ข้อ ค) ปัดขึ้นแทนปัดลง · ลืมว่า same + stride > 1 ใช้ ⌈N/S⌉ ไม่ใช่เท่าเดิม'
    }
  ]
});
