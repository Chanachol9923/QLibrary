/* =========================================================
   Content Pack: CS319 Internet Programming I — Week 2 (HTML)
   สรุปจากคาบเรียนสัปดาห์ที่ 2 + สไลด์ Web Structure with HTML

   โครงไฟล์นี้เป็นแม่แบบของ pack อื่น ๆ ด้วย
   อยากเพิ่มบทใหม่ ก็ copy โครงนี้ไปแล้วเปลี่ยนเนื้อหา
   ========================================================= */
QL.library.register({
  id: 'cs319-w2-html',
  title: 'HTML — โครงสร้างหน้าเว็บ',
  category: 'TestMidterm',
  categoryIcon: '📝',
  subject: 'CS319 Internet Programming I',
  subjectIcon: '🌐',
  week: 'Week 2',
  icon: '🌐',
  description: 'ทุกอย่างที่ต้องรู้จากคาบสัปดาห์ที่ 2: แท็กพื้นฐาน ตาราง ฟอร์ม การส่งข้อมูลแบบ GET และ semantic element',

  /* =======================================================
     1) TOPICS — ใช้ในโหมด "อ่านสรุป"
     ======================================================= */
  topics: [
    {
      id: 'what-is-html',
      title: 'HTML คืออะไร',
      summary: 'HTML ย่อจาก **HyperText Markup Language** เป็นภาษา *markup* ไม่ใช่ภาษาโปรแกรม',
      points: [
        'หน้าที่: สร้าง **โครงสร้าง (structure)** ของหน้าเว็บ บอกว่ามี element อะไรบ้าง และบอก browser ว่าจะแสดง content อย่างไร',
        'Markup = การใส่สัญลักษณ์กำกับข้อความว่ามีคุณสมบัติอะไร (เหมือน Word ที่รู้ว่าข้อความไหนตัวหนา ข้อความไหนเป็น heading)',
        'ไม่ใช่ภาษาโปรแกรม: ไม่มี compiler ไม่มี process ภายใน ตัว HTML **คือ output** เลย ทุกอย่างขึ้นกับ browser ที่ render',
        'เขียนผิดแล้วเว็บยังทำงานต่อได้ ไม่ error เหมือน Python',
        'เขียนด้วย Text Editor ธรรมดาก็ได้ (Notepad) ไม่จำเป็นต้องมี IDE'
      ]
    },
    {
      id: 'history',
      title: 'ประวัติ องค์กร และ HTML vs XHTML',
      summary: 'มี 2 องค์กรที่ดูแลมาตรฐานเว็บ และเคยขัดแย้งกันเรื่องทิศทางของ HTML',
      points: [
        '**W3C** — ก่อตั้งโดย Tim Berners-Lee รวมบริษัท/มหาวิทยาลัย/องค์กรต่าง ๆ ผลักดัน **XHTML** เป็นมาตรฐานปี 2000 และหยุดพัฒนา HTML ไว้ตั้งแต่ปี 1998',
        '**WHATWG** (Web Hypertext Application Technology Working Group) — ก่อตั้งโดย Apple + Mozilla ทีหลัง Google เข้าร่วม ราวปี 2004 และปี 2007 ประกาศว่าควรใช้ HTML เป็นมาตรฐานแทน XHTML',
        'HTML เกิดครั้งแรกปี 1990 และพัฒนาต่อเนื่องจนได้ **HTML5** ที่ใช้กันทุกวันนี้',
        'ต่างกันตรงไหน: HTML เขียนสั้นกว่า ประกาศ doctype สั้นกว่า ไม่บังคับปิดแท็กทุกตัว และ **เขียนผิดแล้ว browser ยัง render ต่อได้**',
        'XHTML เข้มงวดมาก เขียนผิดนิดเดียว = error ทั้งหน้า'
      ]
    },
    {
      id: 'html5-features',
      title: 'ความสามารถของ HTML5 และเรื่อง browser',
      points: [
        'มีโครงสร้างชัดเจนด้วย semantic element → ทำ **SEO** ได้ดีกว่า และอ่านโค้ดง่ายกว่า',
        'เล่น video / audio ได้ในตัว ไม่ต้องลง plugin เพิ่ม',
        'มี built-in input type และ attribute สำหรับตรวจความถูกต้องของข้อมูล (validation)',
        'รองรับการเปิดเว็บแบบ offline, เชื่อมต่อ API, Web Worker (รัน script เบื้องหลัง), Web Socket',
        '**แต่ละ browser render ภาพไม่เหมือนกัน** เช่น Edge / Chrome / Firefox แสดง input วันที่คนละหน้าตา',
        'บาง browser ไม่รองรับทุกฟีเจอร์ (เช่น date input, Internet Explorer) ควรเช็คก่อนใช้'
      ]
    },
    {
      id: 'tools',
      title: 'เครื่องมือ: VS Code + Extension',
      points: [
        'เปิดงานแบบ **Open Folder** เสมอ แล้วกด Trust folder (Restricted Mode → Manage → Trust)',
        'Extension ที่แนะนำ: **HTML CSS Support**, **Live Server**, **Prettier Code Formatter**, **Auto Rename Tag**, **Material Icon Theme**',
        '**Live Server** = คลิกขวาที่ไฟล์ → Open with Live Server กดเซฟแล้วเว็บอัปเดตทันที ไม่ต้องกด refresh เอง',
        'จัดรูปแบบโค้ด: `Shift + Alt + F` หรือเปิด Settings → ค้น "format on save"',
        'Auto Rename Tag = แก้ชื่อแท็กเปิด แท็กปิดเปลี่ยนตามให้เอง',
        'ดู document ของแต่ละแท็กได้จาก **MDN** (เอาเมาส์ชี้ที่แท็กแล้วกด MDN Reference) และ **W3Schools**'
      ]
    },
    {
      id: 'dom',
      title: 'DOM และโครงเอกสาร',
      summary: '**DOM = Document Object Model** มองภาพเป็นต้นไม้ / ตัวต่อ Lego ที่ซ้อนกันเป็นชั้น ๆ',
      points: [
        '`<!DOCTYPE html>` บอกว่าเอกสารนี้เป็น HTML5 ต้องอยู่บรรทัดแรก และไม่มีแท็กปิด',
        '`<html>` = **root node** (โหนดราก) แตกกิ่งเป็น `<head>` และ `<body>`',
        '`<head>` = ข้อมูลของเอกสารที่มองไม่เห็นบนหน้าเว็บ เช่น charset, title, การโหลดไฟล์ CSS',
        '`<body>` = ทุกอย่างที่ผู้ใช้เห็น ข้อความ รูป ลิงก์ ฟอร์ม'
      ],
      code:
        '<!DOCTYPE html>\n' +
        '<html lang="th">\n' +
        '<head>\n' +
        '  <meta charset="UTF-8">\n' +
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
        '  <title>My First Page</title>\n' +
        '</head>\n' +
        '<body>\n' +
        '  <h1>Hello World</h1>\n' +
        '  <p>This is my paragraph</p>\n' +
        '  <!-- นี่คือคอมเมนต์ กด Ctrl + / -->\n' +
        '</body>\n' +
        '</html>'
    },
    {
      id: 'meta',
      title: 'meta ที่ต้องใส่ทุกหน้า',
      points: [
        '`<meta charset="UTF-8">` — ถ้าไม่ใส่ ภาษาไทยจะกลายเป็นตัวอักษรต่างดาว',
        '`<meta name="viewport" content="width=device-width, initial-scale=1.0">` — ให้เว็บสเกลตามขนาดจอของอุปกรณ์ที่เปิด',
        '`<title>` — ชื่อที่ขึ้นบนแท็บของ browser',
        'ใน `<head>` ยังใช้โหลดไฟล์อื่นก่อนเข้าหน้าเว็บได้ เช่นไฟล์ CSS'
      ]
    },
    {
      id: 'basic-tags',
      title: 'แท็กข้อความพื้นฐาน',
      points: [
        '`<h1>` ถึง `<h6>` = Heading 6 ระดับ h1 ใหญ่สุด (เหมือน Heading ใน Word)',
        '`<p>` = paragraph ย่อหน้า',
        '`<hr>` = เส้นคั่นแนวนอน **ไม่มีแท็กปิด**',
        '`<br>` = ขึ้นบรรทัดใหม่ **ไม่มีแท็กปิด**',
        '**สำคัญ:** กด Enter ในโค้ดไม่ทำให้ขึ้นบรรทัดใหม่ในหน้าเว็บ ต้องใช้ `<br>` เท่านั้น',
        'คอมเมนต์เขียนว่า `<!-- ข้อความ -->` คีย์ลัดคือ Ctrl + /'
      ]
    },
    {
      id: 'anchor',
      title: 'ลิงก์ — แท็ก a (anchor)',
      summary: '`href` ย่อจาก **Hyperlink Reference** คือปลายทางของลิงก์',
      points: [
        'ลิงก์ออกเว็บนอก: `<a href="https://www.bu.ac.th">BU</a>`',
        'เปิดแท็บใหม่: เพิ่ม `target="_blank"` ถ้าไม่ใส่จะเปลี่ยนหน้าเดิม',
        'ลิงก์ไปไฟล์ในโฟลเดอร์เดียวกัน (local link): `<a href="page2.html">หน้า 2</a>`',
        '`href="#top"` = เลื่อนกลับขึ้นบนสุดของหน้า',
        '`href="#ชื่อid"` = เลื่อนไปหา element ที่มี `id` ตรงกันในหน้าเดียวกัน',
        '`<a>` เป็น **inline element** อยากขึ้นบรรทัดใหม่ต้องใส่ `<br>` ต่อท้าย'
      ],
      code:
        '<a href="https://www.bu.ac.th" target="_blank">มหาวิทยาลัยกรุงเทพ</a>\n' +
        '<a href="my-first-page.html">ไฟล์ในเครื่อง</a>\n' +
        '<a href="#top">กลับขึ้นบนสุด</a>\n' +
        '<a href="#section2">ไปหัวข้อที่ 2</a>\n\n' +
        '<h2 id="section2">หัวข้อที่ 2</h2>'
    },
    {
      id: 'lists',
      title: 'ลิสต์ — ul / ol / li',
      points: [
        '`<ul>` = Unordered List ลิสต์แบบจุด (bullet)',
        '`<ol>` = Ordered List ลิสต์แบบตัวเลข 1. 2. 3.',
        '`<li>` = List Item หนึ่งรายการ ต้องอยู่ข้างใน `<ul>` หรือ `<ol>`',
        'ซ้อนแท็กอื่นไว้ใน `<li>` ได้ เช่นใส่ลิงก์หรือตัวหนา'
      ],
      code:
        '<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n</ul>\n\n' +
        '<ol>\n  <li>เปิด VS Code</li>\n  <li>สร้างไฟล์ .html</li>\n</ol>'
    },
    {
      id: 'table',
      title: 'ตาราง — table / tr / th / td',
      points: [
        '`<table>` = ตัวตาราง',
        '`<tr>` = table row หนึ่งแถว',
        '`<th>` = table header ช่องหัวตาราง ตัวหนา + จัดกึ่งกลางให้อัตโนมัติ',
        '`<td>` = table data ช่องข้อมูลธรรมดา',
        '1 `<td>` หรือ 1 `<th>` = 1 คอลัมน์ อยากได้แถวเพิ่มก็เพิ่ม `<tr>`'
      ],
      code:
        '<table border="1">\n' +
        '  <tr>\n    <th>ชื่อ</th>\n    <th>อายุ</th>\n  </tr>\n' +
        '  <tr>\n    <td>Ann</td>\n    <td>21</td>\n  </tr>\n' +
        '</table>'
    },
    {
      id: 'image',
      title: 'รูปภาพ — แท็ก img',
      points: [
        '`<img>` ไม่มีแท็กปิด',
        '`src` = แหล่งของรูป ใส่ได้ 2 แบบ: **ลิงก์จากอินเทอร์เน็ต** (คลิกขวาที่รูป → Copy image address) หรือ **local link** ไฟล์ในโฟลเดอร์เดียวกัน',
        '`width` / `height` = ขนาดหน่วยพิกเซล',
        'ถ้าใส่แค่ด้านเดียว รูปจะสเกลตามสัดส่วนจริงให้เอง ไม่บิดเบี้ยว',
        '`alt` = ข้อความที่แสดงแทนเวลารูปโหลดไม่ขึ้น',
        '`<img>` เป็น **inline element**'
      ],
      code: '<img src="images/cat.jpg" width="300" alt="รูปแมว">'
    },
    {
      id: 'block-inline',
      title: 'Block element vs Inline element',
      summary: 'เรื่องนี้อาจารย์ย้ำว่า **ออกสอบ** และสำคัญมากตอนทำ CSS',
      points: [
        '**Block element** = ขึ้นบรรทัดใหม่เสมอ และกินพื้นที่เต็มความกว้าง เช่น `<p>` `<div>` `<h1>` `<ul>` `<table>` `<form>`',
        '**Inline element** = อยู่บรรทัดเดียวกัน ไม่ขึ้นบรรทัดใหม่ เช่น `<a>` `<img>` `<b>` `<span>` `<input>` `<label>`',
        'อยากให้ inline ขึ้นบรรทัดใหม่ ต้องใส่ `<br>` ต่อท้ายเอง',
        'เวลาใส่พื้นหลังด้วย CSS block จะกินเต็มแถว ส่วน inline จะกินแค่ความกว้างเนื้อหา'
      ]
    },
    {
      id: 'text-format',
      title: 'จัดรูปแบบข้อความ (Text Formatting)',
      points: [
        '`<b>` ตัวหนา — หนาเฉย ๆ ไม่มีความหมายพิเศษ',
        '`<strong>` ตัวหนา + บอกว่าข้อความนี้สำคัญ (มีผลกับ SEO)',
        '`<i>` ตัวเอียง',
        '`<small>` ตัวเล็ก',
        '`<mark>` ไฮไลต์พื้นหลังสีเหลือง',
        '`<sub>` ตัวห้อย เช่น H2O · `<sup>` ตัวยก เช่น เลขยกกำลัง',
        '`<ins>` ขีดเส้นใต้ (ข้อความที่เพิ่มเข้ามา) · `<del>` ขีดฆ่า (ข้อความที่ถูกลบ)'
      ]
    },
    {
      id: 'form-basic',
      title: 'ฟอร์ม — แท็ก form',
      points: [
        '`<form>` คือกล่องที่รวบข้อมูลจาก input ทั้งหมดแล้วส่งไป server',
        'ถ้าไม่ครอบด้วย `<form>` จะไม่มีระบบ validation ให้ (เช่น type email จะไม่เตือน)',
        '`action` = ปลายทางที่ส่งข้อมูลไป',
        '`method` = วิธีส่ง (get / post)',
        'ปุ่มที่อยู่ในฟอร์ม ถ้าไม่กำหนด type ค่า default คือ **submit**'
      ],
      code: '<form action="https://postman-echo.com/get" method="get">\n  ...\n</form>'
    },
    {
      id: 'input-types',
      title: 'input type ที่ใช้บ่อย',
      points: [
        '`text` — ข้อความบรรทัดเดียว',
        '`password` — พิมพ์แล้วขึ้นเป็นดอกจัน',
        '`email` — ถ้าไม่มี @ จะขึ้นเตือนอัตโนมัติ',
        '`tel` — เบอร์โทร',
        '`number` — ตัวเลข ใส่ `min` / `max` จำกัดช่วงได้',
        '`date` — ปฏิทินเลือกวันที่',
        '`file` — อัปโหลดไฟล์จากเครื่อง',
        '`hidden` — ไม่แสดงบนหน้าเว็บ ใช้แอบเก็บข้อมูล เช่น token',
        '`button` — ปุ่มทั่วไป ปกติเอาไปผูกกับ JavaScript',
        '`submit` — ปุ่มส่งฟอร์มไปที่ action ทันที',
        '`reset` — ล้างค่าที่กรอกทั้งหมด',
        '`checkbox` — เลือกได้หลายข้อ · `radio` — เลือกได้ข้อเดียว'
      ]
    },
    {
      id: 'input-attr',
      title: 'attribute ของ input ที่ต้องจำ',
      points: [
        '`id` = ชื่อเฉพาะของ element ใช้ผูกกับ `<label for="...">` และใช้ query ด้วย JavaScript',
        '`name` = **คีย์ของข้อมูล** ที่ถูกส่งไป server เหมือน key ของ dictionary — ถ้าไม่ใส่ ข้อมูลช่องนั้นจะไม่ถูกส่ง',
        '`value` = ค่าที่ถูกส่งไปจริง ๆ (คนละอย่างกับข้อความยาว ๆ ที่ผู้ใช้เห็น)',
        '`placeholder` = ข้อความจาง ๆ บอกใบ้ในช่อง',
        '`required` = บังคับกรอก ไม่กรอกแล้วกดส่งไม่ผ่าน',
        '`disabled` = กดไม่ได้ · `readonly` = อ่านได้อย่างเดียว · `maxlength` = จำกัดจำนวนตัวอักษร',
        '`<label for="id">` ทำให้คลิกที่ข้อความเท่ากับคลิกเข้าไปในช่อง กดง่ายขึ้นบนมือถือ'
      ],
      code:
        '<label for="username">Username</label>\n' +
        '<input type="text" id="username" name="username" placeholder="กรอกชื่อผู้ใช้" required>'
    },
    {
      id: 'choice-select',
      title: 'ตัวเลือก: radio / checkbox / select / textarea / datalist / fieldset',
      points: [
        '**radio และ checkbox ต้องใช้ `name` เดียวกัน** ในกลุ่มเดียวกัน browser ถึงจะรู้ว่าเป็นชุดเดียวกัน',
        '`<select>` + `<option value="...">` = dropdown, จัดหมวดด้วย `<optgroup label="...">`',
        '`<textarea rows cols>` = ช่องข้อความหลายบรรทัด เป็นแท็กเปิด-ปิด',
        '`<datalist>` = autocomplete ให้ผู้ใช้พิมพ์แล้วมีตัวเลือกเด้งขึ้นมา',
        '`<fieldset>` = กรอบจัดกลุ่ม input, `<legend>` = ชื่อหัวข้อของกรอบ'
      ],
      code:
        '<input type="radio" id="m" name="gender" value="male">\n' +
        '<label for="m">ชาย</label>\n\n' +
        '<select id="faculty" name="faculty">\n' +
        '  <optgroup label="สายไอที">\n' +
        '    <option value="cs">Computer Science</option>\n' +
        '  </optgroup>\n' +
        '</select>\n\n' +
        '<fieldset>\n  <legend>Account Security</legend>\n  ...\n</fieldset>'
    },
    {
      id: 'submit-http',
      title: 'การส่งฟอร์ม GET / POST และ HTTP Request',
      summary: 'อาจารย์บอกว่าเรื่องนี้ **ต้องจำให้ขึ้นใจ** เพราะเกี่ยวกับการบ้านและ midterm',
      points: [
        '**GET** = ดึง/ส่งข้อมูลแบบเห็นค่าใน URL ต่อท้ายเป็น `?fname=A&lname=B` เรียกส่วนนี้ว่า **URL parameter / query string**',
        '**POST** = ส่งข้อมูลไปอัปเดต database ไม่โชว์ค่าใน URL',
        'ปลายทางที่ใช้ทดลองในคาบ: `w3schools.com/action_page.php` (รับ GET เท่านั้น) และ `postman-echo.com/get` (ตอบกลับเป็น **JSON**)',
        'ลำดับที่เกิดขึ้น: ผู้ใช้กรอก → กด submit → browser ส่ง **HTTP Request** ไป web server → server ส่ง **HTML Response** กลับ → browser render เป็นภาพ',
        'ส่วนประกอบของ URL: scheme (http/https) + host หรือ domain name + path + query parameter'
      ],
      code:
        '<form action="https://postman-echo.com/get" method="get">\n' +
        '  <label for="fname">First name</label>\n' +
        '  <input type="text" id="fname" name="fname">\n' +
        '  <input type="submit" value="Send Data">\n' +
        '</form>\n\n' +
        'ผลลัพธ์บน URL:\n' +
        'https://postman-echo.com/get?fname=Norapat&lname=Labchurat'
    },
    {
      id: 'semantic',
      title: 'Semantic vs Non-semantic element',
      summary: 'ไม่มีผลกับหน้าตา แต่มีผลกับ **SEO** และความเป็นระเบียบตอนทำงานเป็นทีม',
      points: [
        '**Non-semantic** = `<div>` (block) และ `<span>` (inline) มีหน้าที่แค่ grouping กับ styling ไม่มีผลกับ SEO',
        '**Semantic** = แท็กที่มีความหมายในตัว บอก browser ว่าเนื้อหาส่วนนี้คืออะไร',
        '`<header>` ส่วนหัว · `<nav>` กลุ่มลิงก์นำทาง · `<section>` แบ่งส่วนเนื้อหา',
        '`<article>` ข้อความ/บล็อกโพสต์/การ์ดสินค้า · `<aside>` ข้อมูลเสริมข้าง ๆ',
        '`<footer>` ส่วนท้าย ใส่ลิขสิทธิ์ ช่องทางติดต่อ · `<figure>` + `<figcaption>` รูปพร้อมคำบรรยาย',
        '`class` = ชื่อกลุ่มที่เราตั้งเอง เอาไว้ให้ CSS เลือกไปตกแต่ง (คล้าย id และ name ตรงที่เป็นแค่ชื่อ)',
        '**SEO = Search Engine Optimization** คือการทำให้ Google เข้าใจว่าเว็บเรามีอะไร'
      ],
      code:
        '<header>\n  <h1>TechGear Store</h1>\n  <nav>\n    <a href="products.html">Products</a>\n  </nav>\n</header>\n\n' +
        '<section class="product-card">\n  <article>...</article>\n</section>\n\n' +
        '<footer>\n  <p>&copy; 2026 TechGear</p>\n</footer>'
    },
    {
      id: 'devtools',
      title: 'Developer Tools (F12)',
      points: [
        'กด **F12** หรือคลิกขวา → Inspect เพื่อเปิด DevTools',
        '**Elements** — ดูและแก้ HTML/CSS ของเว็บสด ๆ ได้ทันที ใช้ลูกศรมุมซ้ายบนจิ้มดู element ที่ต้องการ',
        '**Console** — ดู error ของ JavaScript และรันคำสั่งทดสอบ',
        '**Network** — ดู HTTP request ที่ส่งออกไป (GET/POST), พารามิเตอร์ที่แนบไป และ response ที่ server ตอบกลับ'
      ]
    }
  ],

  /* =======================================================
     2) CARDS — ใช้ในโหมด "แฟลชการ์ด"
     ======================================================= */
  cards: [
    { id: 'abbr', topic: 'พื้นฐาน', front: 'HTML ย่อมาจากอะไร', back: '**HyperText Markup Language**' },
    { id: 'is-lang', topic: 'พื้นฐาน', front: 'HTML เป็นภาษาโปรแกรมหรือไม่ เพราะอะไร', back: '**ไม่ใช่** — เป็น markup language ไม่มี compiler ไม่มี process ภายใน ตัวมันคือ output เลย ทุกอย่างขึ้นกับ browser ที่ render' },
    { id: 'html-role', topic: 'พื้นฐาน', front: 'หน้าที่หลักของ HTML คืออะไร', back: 'สร้างโครงสร้างของหน้าเว็บ บอกว่ามี element อะไรบ้าง และบอก browser ว่าจะแสดง content อย่างไร' },
    { id: 'w3c', topic: 'ประวัติ', front: 'W3C คือใคร ผลักดันอะไร', back: 'องค์กรที่ก่อตั้งโดย Tim Berners-Lee ผลักดัน **XHTML** เป็นมาตรฐานปี 2000 และหยุดพัฒนา HTML ไว้ปี 1998' },
    { id: 'whatwg', topic: 'ประวัติ', front: 'WHATWG คือใคร ก่อตั้งโดยใคร', back: 'Web Hypertext Application Technology Working Group ก่อตั้งโดย **Apple + Mozilla** (ภายหลัง Google เข้าร่วม) ผลักดันให้ใช้ HTML แทน XHTML จนได้ HTML5' },
    { id: 'xhtml-diff', topic: 'ประวัติ', front: 'HTML ต่างจาก XHTML อย่างไร', back: 'HTML เขียนสั้นกว่า ไม่บังคับปิดแท็กทุกตัว และ **เขียนผิดแล้วยัง render ได้** ส่วน XHTML เข้มงวด ผิดนิดเดียว error ทั้งหน้า' },
    { id: 'html5-cap', topic: 'HTML5', front: 'ยกความสามารถเด่นของ HTML5 มา 3 อย่าง', back: 'semantic structure ที่ดีต่อ SEO · เล่น video/audio ได้โดยไม่ต้องลง plugin · มี input type และ validation ในตัว (ยังมี offline, API, Web Worker, Web Socket)' },
    { id: 'browser-diff', topic: 'HTML5', front: 'ทำไมต้องรู้ว่าแต่ละ browser render ต่างกัน', back: 'เพราะหน้าตา element เดียวกันอาจไม่เหมือนกันในแต่ละ browser และบาง browser ยังไม่รองรับบางฟีเจอร์ของ HTML5 เช่น date input' },
    { id: 'doctype', topic: 'โครงสร้าง', front: 'บรรทัดแรกของไฟล์ HTML ต้องเขียนอะไร', back: '`<!DOCTYPE html>` — บอกว่าเป็น HTML5 และเป็นแท็กพิเศษที่ไม่มีแท็กปิด' },
    { id: 'dom', topic: 'โครงสร้าง', front: 'DOM ย่อมาจากอะไร และหมายถึงอะไร', back: '**Document Object Model** — โครงสร้างของเอกสารที่ซ้อนกันเป็นชั้นแบบต้นไม้ เริ่มจาก root node' },
    { id: 'root-node', topic: 'โครงสร้าง', front: 'root node ของหน้าเว็บคือแท็กอะไร แตกกิ่งเป็นอะไรบ้าง', back: '`<html>` แตกกิ่งเป็น `<head>` และ `<body>`' },
    { id: 'head-body', topic: 'โครงสร้าง', front: '`<head>` กับ `<body>` ต่างกันอย่างไร', back: '`<head>` เก็บข้อมูลของเอกสารที่มองไม่เห็น (charset, title, โหลดไฟล์ CSS) ส่วน `<body>` คือทุกอย่างที่ผู้ใช้เห็น' },
    { id: 'charset', topic: 'โครงสร้าง', front: 'ถ้าไม่ใส่ `<meta charset="UTF-8">` จะเกิดอะไรขึ้น', back: 'ภาษาไทยจะกลายเป็นตัวอักษรต่างดาว (อ่านไม่ออก)' },
    { id: 'viewport', topic: 'โครงสร้าง', front: 'meta viewport มีไว้ทำอะไร', back: 'ให้หน้าเว็บสเกลตามขนาดจอของอุปกรณ์ที่เปิด — `<meta name="viewport" content="width=device-width, initial-scale=1.0">`' },
    { id: 'title', topic: 'โครงสร้าง', front: '`<title>` แสดงผลตรงไหน', back: 'ชื่อบนแท็บของ browser' },
    { id: 'comment', topic: 'พื้นฐาน', front: 'คอมเมนต์ใน HTML เขียนอย่างไร คีย์ลัดคืออะไร', back: '`<!-- ข้อความ -->` คีย์ลัดคือ **Ctrl + /**' },
    { id: 'heading', topic: 'แท็กข้อความ', front: 'heading มีกี่ระดับ อะไรใหญ่สุด', back: '6 ระดับ `<h1>` ถึง `<h6>` โดย h1 ใหญ่สุด h6 เล็กสุด' },
    { id: 'hr', topic: 'แท็กข้อความ', front: '`<hr>` คืออะไร มีแท็กปิดไหม', back: 'Horizontal Rule เส้นคั่นแนวนอน — **ไม่มีแท็กปิด**' },
    { id: 'enter', topic: 'แท็กข้อความ', front: 'กด Enter ในโค้ด HTML แล้วหน้าเว็บขึ้นบรรทัดใหม่ไหม', back: '**ไม่ขึ้น** ต้องใช้แท็ก `<br>` เท่านั้น' },
    { id: 'no-close', topic: 'แท็กข้อความ', front: 'ยกตัวอย่างแท็กที่ไม่มีแท็กปิด', back: '`<!DOCTYPE html>` · `<hr>` · `<br>` · `<img>` · `<input>` · `<meta>`' },
    { id: 'a-href', topic: 'ลิงก์', front: 'href ย่อมาจากอะไร', back: '**Hyperlink Reference** คือปลายทางของลิงก์' },
    { id: 'a-blank', topic: 'ลิงก์', front: 'อยากให้ลิงก์เปิดแท็บใหม่ต้องใส่อะไร', back: '`target="_blank"` ถ้าไม่ใส่จะเปลี่ยนหน้าเดิม' },
    { id: 'a-hash', topic: 'ลิงก์', front: '`href="#top"` กับ `href="#about"` ทำอะไร', back: '`#top` เลื่อนขึ้นบนสุดของหน้า ส่วน `#about` เลื่อนไปหา element ที่มี `id="about"` ในหน้าเดียวกัน' },
    { id: 'a-local', topic: 'ลิงก์', front: 'ลิงก์ไปไฟล์ HTML อื่นในโฟลเดอร์เดียวกันเขียนอย่างไร', back: '`<a href="page2.html">ไปหน้า 2</a>` เรียกว่า local link' },
    { id: 'ul-ol', topic: 'ลิสต์', front: '`<ul>` ต่างจาก `<ol>` อย่างไร', back: '`<ul>` = Unordered List ลิสต์แบบจุด · `<ol>` = Ordered List ลิสต์แบบตัวเลข ทั้งคู่ใช้ `<li>` ข้างใน' },
    { id: 'li', topic: 'ลิสต์', front: '`<li>` ย่อมาจากอะไร', back: '**List Item** = หนึ่งรายการในลิสต์' },
    { id: 'table-tags', topic: 'ตาราง', front: 'แท็กของตารางมีอะไรบ้าง แต่ละตัวคืออะไร', back: '`<table>` ตัวตาราง · `<tr>` table row 1 แถว · `<th>` table header หัวตาราง (ตัวหนา จัดกลางอัตโนมัติ) · `<td>` table data ช่องข้อมูล' },
    { id: 'table-col', topic: 'ตาราง', front: 'ถ้าอยากเพิ่ม 1 แถวและ 1 คอลัมน์ ทำอย่างไร', back: 'เพิ่มแถว = เพิ่ม `<tr>` · เพิ่มคอลัมน์ = เพิ่ม `<td>` หรือ `<th>` ในแถวนั้น' },
    { id: 'img-src', topic: 'รูปภาพ', front: '`src` ของ `<img>` ใส่ได้กี่แบบ', back: '2 แบบ — ลิงก์จากอินเทอร์เน็ต (Copy image address) และไฟล์ในเครื่อง เช่น `images/cat.jpg` เรียกว่า local link' },
    { id: 'img-scale', topic: 'รูปภาพ', front: 'ถ้าใส่แค่ height อย่างเดียวจะเกิดอะไรขึ้น', back: 'รูปจะสเกลตามสัดส่วนจริง ความกว้างคำนวณให้อัตโนมัติ ภาพไม่บิดเบี้ยว' },
    { id: 'img-alt', topic: 'รูปภาพ', front: '`alt` มีไว้ทำอะไร', back: 'ข้อความที่แสดงแทนเมื่อรูปโหลดไม่ขึ้น (และช่วยโปรแกรมอ่านหน้าจอ)' },
    { id: 'block', topic: 'Block/Inline', front: 'block element คืออะไร ยกตัวอย่าง', back: 'element ที่ขึ้นบรรทัดใหม่เสมอและกินพื้นที่เต็มความกว้าง เช่น `<p>` `<div>` `<h1>` `<ul>` `<table>`' },
    { id: 'inline', topic: 'Block/Inline', front: 'inline element คืออะไร ยกตัวอย่าง', back: 'element ที่อยู่บรรทัดเดียวกัน ไม่ขึ้นบรรทัดใหม่ เช่น `<a>` `<img>` `<b>` `<span>` `<input>` — อยากขึ้นบรรทัดต้องใส่ `<br>`' },
    { id: 'b-strong', topic: 'จัดรูปแบบ', front: '`<b>` ต่างจาก `<strong>` อย่างไร', back: 'หน้าตาหนาเหมือนกัน แต่ `<strong>` มีความหมายว่า "ข้อความนี้สำคัญ" ซึ่งมีผลกับ SEO' },
    { id: 'sub-sup', topic: 'จัดรูปแบบ', front: '`<sub>` กับ `<sup>` ใช้ตอนไหน', back: '`<sub>` ตัวห้อย เช่น H2O · `<sup>` ตัวยก เช่น เลขยกกำลัง' },
    { id: 'ins-del', topic: 'จัดรูปแบบ', front: '`<ins>` กับ `<del>` แสดงผลอย่างไร', back: '`<ins>` ขีดเส้นใต้ (ข้อความที่เพิ่มเข้ามา) · `<del>` ขีดฆ่า (ข้อความที่ถูกลบ)' },
    { id: 'form-why', topic: 'ฟอร์ม', front: 'ทำไมต้องครอบ input ด้วย `<form>`', back: 'เพื่อรวบข้อมูลส่งไป server ได้ และได้ระบบ validation ในตัว เช่น type email จะเตือนเองถ้าไม่มี @' },
    { id: 'name-attr', topic: 'ฟอร์ม', front: '`name` ของ input สำคัญอย่างไร', back: 'เป็น **คีย์ของข้อมูล** ที่ส่งไป server เหมือน key ของ dictionary — ถ้าไม่ใส่ ข้อมูลช่องนั้นจะไม่ถูกส่งเลย' },
    { id: 'id-vs-name', topic: 'ฟอร์ม', front: '`id` กับ `name` ต่างกันอย่างไร', back: '`id` = ชื่อเฉพาะของ element ใช้ผูก label และ query ด้วย JavaScript · `name` = ชื่อคีย์ของข้อมูลที่ส่งไป server' },
    { id: 'label-for', topic: 'ฟอร์ม', front: '`<label for="...">` ได้ประโยชน์อะไร', back: 'ผูก label กับ input ที่มี id ตรงกัน ทำให้คลิกที่ข้อความเท่ากับคลิกในช่อง กดง่ายขึ้นบนมือถือ' },
    { id: 'value-attr', topic: 'ฟอร์ม', front: '`value` ของ choice คืออะไร', back: 'ค่าที่ถูกส่งไป server จริง ๆ ซึ่งอาจสั้นกว่าข้อความยาว ๆ ที่ผู้ใช้เห็นบนหน้าจอ' },
    { id: 'radio-name', topic: 'ฟอร์ม', front: 'radio หลายตัวจะเป็นชุดเดียวกันได้ต้องทำอย่างไร', back: 'ใส่ `name` เหมือนกันทุกตัว browser ถึงจะรู้ว่าเป็นชุดเดียวกัน (เลือกได้ทีละข้อ)' },
    { id: 'checkbox-radio', topic: 'ฟอร์ม', front: 'checkbox ต่างจาก radio อย่างไร', back: 'checkbox เลือกได้หลายข้อ · radio เลือกได้ข้อเดียวในกลุ่ม' },
    { id: 'required', topic: 'ฟอร์ม', front: '`required` `disabled` `readonly` `maxlength` ทำอะไร', back: 'required = บังคับกรอก · disabled = กดไม่ได้ · readonly = อ่านได้อย่างเดียว · maxlength = จำกัดจำนวนตัวอักษร' },
    { id: 'hidden', topic: 'ฟอร์ม', front: '`input type="hidden"` มีไว้ทำอะไร', back: 'ซ่อนข้อมูลไม่ให้แสดงบนหน้าเว็บ เช่นเก็บ token แล้วให้ JavaScript ตั้งค่าให้' },
    { id: 'textarea', topic: 'ฟอร์ม', front: '`<textarea>` ต่างจาก `input type="text"` อย่างไร', back: 'textarea พิมพ์ได้หลายบรรทัด กำหนดขนาดด้วย `rows` และ `cols` และเป็นแท็กเปิด-ปิด' },
    { id: 'select', topic: 'ฟอร์ม', front: 'ทำ dropdown ใช้แท็กอะไร', back: '`<select>` ครอบ `<option value="...">` และจัดหมวดด้วย `<optgroup label="...">`' },
    { id: 'fieldset', topic: 'ฟอร์ม', front: '`<fieldset>` กับ `<legend>` คืออะไร', back: '`<fieldset>` = กรอบจัดกลุ่ม input · `<legend>` = ชื่อหัวข้อของกรอบนั้น' },
    { id: 'get-post', topic: 'HTTP', front: 'GET ต่างจาก POST อย่างไร', back: 'GET เห็นข้อมูลใน URL เป็น query string ใช้ดึงข้อมูล · POST ไม่โชว์ใน URL ใช้ส่งไปอัปเดต database' },
    { id: 'url-param', topic: 'HTTP', front: 'ส่วน `?fname=A&lname=B` ท้าย URL เรียกว่าอะไร', back: '**URL parameter** หรือ query string (เห็นได้เวลาใช้ method GET)' },
    { id: 'action', topic: 'HTTP', front: '`action` กับ `method` ของ `<form>` คืออะไร', back: '`action` = ปลายทางที่จะส่งข้อมูลไป · `method` = วิธีส่ง (get / post)' },
    { id: 'http-flow', topic: 'HTTP', front: 'อธิบายลำดับที่เกิดขึ้นเมื่อกด submit', back: 'ผู้ใช้กรอกข้อมูล → กด submit → browser ส่ง **HTTP Request** ไปที่ web server → server ส่ง **HTML Response** กลับมา → browser render เป็นภาพ' },
    { id: 'json', topic: 'HTTP', front: 'postman-echo.com/get ตอบกลับมาเป็นรูปแบบอะไร', back: '**JSON** — เป็น object ที่บอกว่า server ได้รับ args, headers อะไรบ้าง' },
    { id: 'url-parts', topic: 'HTTP', front: 'URL ประกอบด้วยอะไรบ้าง', back: 'scheme (http/https) + host หรือ domain name + path + query parameter' },
    { id: 'semantic-def', topic: 'Semantic', front: 'semantic element คืออะไร', back: 'แท็กที่มีความหมายในตัว บอกว่าเนื้อหาส่วนนี้คืออะไร เช่น `<header>` `<nav>` `<section>` `<article>` `<footer>` `<aside>` `<figure>`' },
    { id: 'non-semantic', topic: 'Semantic', front: 'non-semantic element มีอะไรบ้าง ต่างกันตรงไหน', back: '`<div>` (block) และ `<span>` (inline) — มีหน้าที่แค่ grouping กับ styling ไม่มีผลกับ SEO' },
    { id: 'seo', topic: 'Semantic', front: 'SEO ย่อมาจากอะไร เกี่ยวอะไรกับ semantic', back: '**Search Engine Optimization** — การใช้ semantic element ช่วยให้ Google เข้าใจว่าเนื้อหาส่วนไหนคืออะไร ทำให้ค้นเจอง่ายขึ้น' },
    { id: 'class', topic: 'Semantic', front: '`class` คืออะไร', back: 'ชื่อกลุ่มที่เราตั้งเอง ไว้ให้ CSS เลือกไปตกแต่ง เป็นแค่ชื่อเหมือน id และ name' },
    { id: 'devtools', topic: 'เครื่องมือ', front: 'กดปุ่มอะไรเปิด DevTools และมีแท็บอะไรบ้างที่ใช้บ่อย', back: 'กด **F12** — Elements (ดู/แก้ HTML-CSS สด ๆ), Console (ดู error JavaScript), Network (ดู HTTP request/response)' },
    { id: 'liveserver', topic: 'เครื่องมือ', front: 'Live Server ช่วยอะไร', back: 'คลิกขวาที่ไฟล์ → Open with Live Server แล้วกดเซฟ หน้าเว็บอัปเดตทันที ไม่ต้องกด refresh เอง' },
    { id: 'format', topic: 'เครื่องมือ', front: 'คีย์ลัดจัดรูปแบบโค้ดใน VS Code', back: '`Shift + Alt + F` หรือเปิด Settings แล้วค้นหา "format on save"' }
  ],

  /* =======================================================
     3) QUIZ — ใช้ในโหมด "ควิซ"
     answer = ตำแหน่ง (index) ของคำตอบที่ถูกใน choices
     ======================================================= */
  quiz: [
    {
      id: 'q1', topic: 'พื้นฐาน',
      question: 'HTML ย่อมาจากอะไร',
      choices: ['HyperText Markup Language', 'High Text Machine Language', 'HyperTool Multi Language', 'Home Text Markup Language'],
      answer: 0,
      explain: 'Markup Language = ภาษาที่ใช้กำกับคุณสมบัติของข้อความ'
    },
    {
      id: 'q2', topic: 'พื้นฐาน',
      question: 'ข้อใดถูกต้องเกี่ยวกับ HTML',
      choices: ['เป็นภาษาโปรแกรมที่ต้อง compile ก่อนรัน', 'เป็น markup language ที่ตัวมันคือ output เลย', 'ต้องติดตั้ง interpreter ก่อนใช้งาน', 'เขียนผิดแล้วจะ error ทั้งหน้าทันที'],
      answer: 1,
      explain: 'HTML ไม่มี compiler ไม่มี process ภายใน เขียนผิดก็ยัง render ต่อได้'
    },
    {
      id: 'q3', topic: 'โครงสร้าง',
      question: 'บรรทัดแรกสุดของไฟล์ HTML5 ต้องเขียนว่าอะไร',
      choices: ['<html>', '<head>', '<!DOCTYPE html>', '<meta charset="UTF-8">'],
      answer: 2,
      explain: 'บอก browser ว่าเอกสารนี้เป็น HTML5 และเป็นแท็กที่ไม่มีแท็กปิด'
    },
    {
      id: 'q4', topic: 'โครงสร้าง',
      question: 'root node ของหน้าเว็บคือแท็กใด',
      choices: ['<body>', '<head>', '<!DOCTYPE html>', '<html>'],
      answer: 3,
      explain: '<html> เป็นโหนดรากที่แตกกิ่งเป็น <head> และ <body>'
    },
    {
      id: 'q5', topic: 'โครงสร้าง',
      question: 'ถ้าลืมใส่ <meta charset="UTF-8"> จะเกิดอะไรขึ้น',
      choices: ['เว็บเปิดไม่ได้', 'ภาษาไทยกลายเป็นตัวอักษรอ่านไม่ออก', 'รูปภาพหายไป', 'ฟอร์มส่งข้อมูลไม่ได้'],
      answer: 1,
      explain: 'charset บอกการเข้ารหัสตัวอักษร UTF-8 รองรับหลายภาษารวมถึงภาษาไทย'
    },
    {
      id: 'q6', topic: 'โครงสร้าง',
      question: 'meta tag ตัวใดทำให้เว็บสเกลตามขนาดจอของอุปกรณ์',
      choices: ['charset', 'viewport', 'description', 'keywords'],
      answer: 1,
      explain: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    },
    {
      id: 'q7', topic: 'แท็กข้อความ',
      question: 'ผลลัพธ์บนหน้าเว็บมีเส้นคั่นแนวนอน เกิดจากแท็กใด',
      choices: ['<br>', '<hr>', '<line>', '<div>'],
      answer: 1,
      explain: 'hr = Horizontal Rule และไม่ต้องมีแท็กปิด'
    },
    {
      id: 'q8', topic: 'แท็กข้อความ',
      question: 'ในโค้ด HTML กด Enter เว้นบรรทัด แต่หน้าเว็บกลับไม่ขึ้นบรรทัดใหม่ ต้องแก้อย่างไร',
      choices: ['ใส่ <br> ตรงที่ต้องการขึ้นบรรทัด', 'กด Enter 2 ครั้ง', 'ใส่ช่องว่างเยอะ ๆ', 'ใช้แท็ก <enter>'],
      answer: 0,
      explain: 'HTML ไม่สนใจการเว้นบรรทัดในโค้ด ต้องใช้แท็ก <br> เท่านั้น'
    },
    {
      id: 'q9', topic: 'แท็กข้อความ',
      question: 'ข้อใดคือกลุ่มแท็กที่ไม่มีแท็กปิดทั้งหมด',
      choices: ['<p> <div> <h1>', '<br> <hr> <img>', '<ul> <li> <ol>', '<form> <label> <select>'],
      answer: 1,
      explain: 'รวมถึง <input> และ <meta> ด้วย'
    },
    {
      id: 'q10', topic: 'ลิงก์',
      question: 'อยากให้ลิงก์เปิดในแท็บใหม่ ต้องใส่ attribute ใด',
      choices: ['href="_blank"', 'target="_blank"', 'rel="new"', 'open="tab"'],
      answer: 1,
      explain: 'ถ้าไม่ใส่ target ลิงก์จะเปลี่ยนหน้าเดิม'
    },
    {
      id: 'q11', topic: 'ลิงก์',
      question: '<a href="#contact"> ทำอะไร',
      choices: ['เปิดไฟล์ contact.html', 'ส่งอีเมล', 'เลื่อนไปหา element ที่มี id="contact" ในหน้าเดียวกัน', 'ค้นหาคำว่า contact'],
      answer: 2,
      explain: 'เครื่องหมาย # ตามด้วยชื่อ id คือการเลื่อนไปยัง element นั้นในหน้าเดียวกัน'
    },
    {
      id: 'q12', topic: 'ลิสต์',
      question: 'ต้องการลิสต์ที่มีเลข 1. 2. 3. นำหน้า ใช้แท็กใด',
      choices: ['<ul>', '<ol>', '<li>', '<dl>'],
      answer: 1,
      explain: 'ol = Ordered List ส่วน ul = Unordered List (จุด) ทั้งคู่ใช้ <li> ข้างใน'
    },
    {
      id: 'q13', topic: 'ตาราง',
      question: 'ในตาราง แท็กใดสร้าง "หนึ่งแถว"',
      choices: ['<td>', '<th>', '<tr>', '<table>'],
      answer: 2,
      explain: 'tr = table row ส่วน td/th คือช่องข้อมูลในแถวนั้น'
    },
    {
      id: 'q14', topic: 'ตาราง',
      question: 'ช่องหัวตารางที่ตัวหนาและจัดกึ่งกลางให้อัตโนมัติคือแท็กใด',
      choices: ['<td>', '<th>', '<thead>', '<tr>'],
      answer: 1,
      explain: 'th = table header ส่วน td = table data เป็นข้อความธรรมดา'
    },
    {
      id: 'q15', topic: 'รูปภาพ',
      question: 'ถ้าใส่เฉพาะ height="300" ให้รูปภาพ จะเกิดอะไรขึ้น',
      choices: ['รูปสูง 300 กว้าง 300', 'รูปสูง 300 ความกว้างสเกลตามสัดส่วนจริง', 'รูปไม่แสดง', 'รูปยืดจนบิดเบี้ยว'],
      answer: 1,
      explain: 'ใส่ด้านเดียว browser จะคำนวณอีกด้านตามสัดส่วนจริงของภาพ'
    },
    {
      id: 'q16', topic: 'รูปภาพ',
      question: 'attribute ใดของ <img> ใช้แสดงข้อความแทนเมื่อรูปโหลดไม่ขึ้น',
      choices: ['title', 'alt', 'src', 'caption'],
      answer: 1,
      explain: 'alt = alternate text'
    },
    {
      id: 'q17', topic: 'Block/Inline',
      question: 'ข้อใดเป็น block element ทั้งหมด',
      choices: ['<a> <img> <span>', '<p> <div> <h1>', '<b> <i> <label>', '<input> <a> <br>'],
      answer: 1,
      explain: 'block element ขึ้นบรรทัดใหม่เสมอและกินพื้นที่เต็มความกว้าง'
    },
    {
      id: 'q18', topic: 'Block/Inline',
      question: 'ใส่ <a> สองอันติดกันแล้วมันอยู่บรรทัดเดียวกัน จะแยกบรรทัดต้องทำอย่างไร',
      choices: ['ใส่ <br> คั่น', 'ใส่ <hr> คั่น', 'ใส่ช่องว่าง 4 ตัว', 'เปลี่ยนไปใช้ <p> เท่านั้น'],
      answer: 0,
      explain: '<a> เป็น inline element จึงไม่ขึ้นบรรทัดใหม่เอง'
    },
    {
      id: 'q19', topic: 'จัดรูปแบบ',
      question: 'ผลลัพธ์เป็นข้อความ "ขีดฆ่า" เกิดจากแท็กใด',
      choices: ['<ins>', '<del>', '<sub>', '<small>'],
      answer: 1,
      explain: 'del = delete ส่วน ins = insert จะขีดเส้นใต้'
    },
    {
      id: 'q20', topic: 'จัดรูปแบบ',
      question: 'อยากเขียน H2O ให้เลข 2 อยู่ข้างล่าง ใช้แท็กใด',
      choices: ['<sup>', '<sub>', '<small>', '<mark>'],
      answer: 1,
      explain: 'sub = ตัวห้อย, sup = ตัวยก (เลขยกกำลัง)'
    },
    {
      id: 'q21', topic: 'ฟอร์ม',
      question: 'attribute ใดของ input ที่เป็น "คีย์ของข้อมูล" ที่ถูกส่งไป server',
      choices: ['id', 'name', 'class', 'value'],
      answer: 1,
      explain: 'ถ้าไม่ใส่ name ข้อมูลช่องนั้นจะไม่ถูกส่งไปเลย ส่วน id ใช้ผูก label และใช้ใน JavaScript'
    },
    {
      id: 'q22', topic: 'ฟอร์ม',
      question: '<label for="email"> ต้องผูกกับอะไรของ input',
      choices: ['name', 'id', 'value', 'type'],
      answer: 1,
      explain: 'for ต้องตรงกับ id ของ input พอผูกแล้วคลิกที่ข้อความจะเท่ากับคลิกในช่อง'
    },
    {
      id: 'q23', topic: 'ฟอร์ม',
      question: 'radio 3 ตัวเลือกกดได้พร้อมกันหมด สาเหตุน่าจะเกิดจากอะไร',
      choices: ['ไม่ได้ใส่ value', 'ตั้ง name ไม่เหมือนกัน', 'ลืมใส่ id', 'ไม่ได้ครอบด้วย fieldset'],
      answer: 1,
      explain: 'radio ในกลุ่มเดียวกันต้องใช้ name เดียวกัน browser ถึงจะรู้ว่าเป็นชุดเดียวกัน'
    },
    {
      id: 'q24', topic: 'ฟอร์ม',
      question: 'ต้องการช่องกรอกข้อความหลายบรรทัด ใช้แท็กใด',
      choices: ['<input type="text">', '<textarea>', '<input type="multiline">', '<select>'],
      answer: 1,
      explain: 'กำหนดขนาดด้วย rows และ cols และเป็นแท็กเปิด-ปิด'
    },
    {
      id: 'q25', topic: 'ฟอร์ม',
      question: 'attribute ใดบังคับให้ผู้ใช้ต้องกรอกช่องนั้นก่อนจึงจะส่งฟอร์มได้',
      choices: ['disabled', 'readonly', 'required', 'maxlength'],
      answer: 2,
      explain: 'disabled = กดไม่ได้, readonly = อ่านอย่างเดียว, maxlength = จำกัดจำนวนตัวอักษร'
    },
    {
      id: 'q26', topic: 'ฟอร์ม',
      question: 'input type ใดที่ไม่แสดงบนหน้าเว็บ แต่ยังส่งค่าไปกับฟอร์ม',
      choices: ['password', 'hidden', 'reset', 'file'],
      answer: 1,
      explain: 'นิยมใช้แอบเก็บข้อมูลอย่าง token แล้วให้ JavaScript ตั้งค่าให้'
    },
    {
      id: 'q27', topic: 'HTTP',
      question: 'ส่งฟอร์มแล้วเห็น ?fname=Ann&lname=B ต่อท้าย URL แสดงว่าใช้ method ใด',
      choices: ['post', 'get', 'put', 'send'],
      answer: 1,
      explain: 'GET ส่งข้อมูลผ่าน URL parameter จึงเห็นค่าได้ ส่วน POST ไม่โชว์ใน URL'
    },
    {
      id: 'q28', topic: 'HTTP',
      question: 'attribute ใดของ <form> ระบุปลายทางที่จะส่งข้อมูลไป',
      choices: ['method', 'action', 'target', 'src'],
      answer: 1,
      explain: 'action = ปลายทาง, method = วิธีส่ง (get/post)'
    },
    {
      id: 'q29', topic: 'HTTP',
      question: 'ลำดับใดถูกต้องเมื่อกด submit',
      choices: [
        'browser render → ส่ง request → server ตอบ',
        'ผู้ใช้กรอก → browser ส่ง HTTP Request → server ส่ง Response กลับ → browser render',
        'server ส่ง request → browser ตอบ → render',
        'ผู้ใช้กรอก → server render → browser เก็บข้อมูล'
      ],
      answer: 1,
      explain: 'browser เป็นฝ่ายส่ง request เสมอ แล้ว server ตอบกลับมาเป็น response'
    },
    {
      id: 'q30', topic: 'Semantic',
      question: 'ข้อใดคือ non-semantic element',
      choices: ['<header>', '<nav>', '<div>', '<article>'],
      answer: 2,
      explain: '<div> และ <span> มีหน้าที่แค่ grouping/styling ไม่มีผลกับ SEO'
    },
    {
      id: 'q31', topic: 'Semantic',
      question: 'ใช้ semantic element แล้วหน้าเว็บเปลี่ยนไปอย่างไร',
      choices: ['สวยขึ้นอัตโนมัติ', 'หน้าตาเหมือนเดิม แต่ browser และ Google เข้าใจโครงสร้างมากขึ้น', 'โหลดเร็วขึ้น 2 เท่า', 'ไม่ต้องเขียน CSS อีกต่อไป'],
      answer: 1,
      explain: 'semantic ไม่มีผลกับ visual มีผลกับความหมาย SEO และความเป็นระเบียบของโค้ด'
    },
    {
      id: 'q32', topic: 'เครื่องมือ',
      question: 'กดปุ่มใดเพื่อเปิด Developer Tools',
      choices: ['F5', 'F12', 'Ctrl + S', 'Alt + Tab'],
      answer: 1,
      explain: 'หรือคลิกขวา → Inspect แท็บที่ใช้บ่อยคือ Elements, Console, Network'
    },
    {
      id: 'q33', topic: 'ประวัติ',
      question: 'องค์กรใดผลักดัน HTML5 จนได้ใช้กันทุกวันนี้',
      choices: ['W3C', 'WHATWG', 'IEEE', 'ISO'],
      answer: 1,
      explain: 'WHATWG ก่อตั้งโดย Apple + Mozilla (ภายหลัง Google) ส่วน W3C ผลักดัน XHTML'
    },
    {
      id: 'q34', topic: 'ประวัติ',
      question: 'ข้อใดคือข้อแตกต่างสำคัญของ HTML กับ XHTML',
      choices: ['HTML เขียนผิดแล้วยัง render ได้ แต่ XHTML จะ error', 'XHTML เขียนสั้นกว่า', 'HTML ต้องปิดทุกแท็กเสมอ', 'XHTML ไม่ต้องมี doctype'],
      answer: 0,
      explain: 'XHTML เข้มงวดมาก ผิดนิดเดียวก็ error ทั้งหน้า'
    }
  ],

  /* =======================================================
     4) WRITE — ใช้ในโหมด "ทดสอบเขียน"
     answers = รูปแบบที่ยอมรับ (ระบบตัดช่องว่างเกินและไม่สนตัวพิมพ์ใหญ่เล็กให้อยู่แล้ว)
     ======================================================= */
  write: [
    {
      id: 'w1', topic: 'โครงสร้าง',
      prompt: 'เขียนบรรทัดที่บอก browser ว่าเอกสารนี้เป็น HTML5',
      hint: 'เป็นแท็กพิเศษที่ไม่มีแท็กปิด ขึ้นต้นด้วยเครื่องหมายตกใจ',
      sample: '<!DOCTYPE html>',
      answers: ['<!DOCTYPE html>', '<!doctype html>'],
      explain: 'ต้องอยู่บรรทัดแรกสุดของไฟล์เสมอ'
    },
    {
      id: 'w2', topic: 'โครงสร้าง',
      prompt: 'เขียน meta tag ที่ทำให้หน้าเว็บรองรับภาษาไทย',
      hint: 'ใช้ attribute ชื่อ charset',
      sample: '<meta charset="UTF-8">',
      answers: ['<meta charset="UTF-8">', '<meta charset="UTF-8" />'],
      explain: 'UTF-8 รองรับตัวอักษรหลายภาษา ถ้าไม่ใส่ภาษาไทยจะเพี้ยน'
    },
    {
      id: 'w3', topic: 'โครงสร้าง',
      prompt: 'เขียน meta tag viewport ที่ทำให้เว็บสเกลตามขนาดจออุปกรณ์',
      hint: 'name="viewport" และ content ประกอบด้วย width กับ initial-scale',
      sample: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      answers: [
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
      ]
    },
    {
      id: 'w4', topic: 'โครงสร้าง',
      prompt: 'เขียน title ของหน้าเว็บให้ชื่อแท็บว่า My First Page',
      sample: '<title>My First Page</title>',
      answers: ['<title>My First Page</title>'],
      explain: 'title อยู่ใน <head> และแสดงเป็นชื่อแท็บของ browser'
    },
    {
      id: 'w5', topic: 'แท็กข้อความ',
      prompt: 'เขียนหัวข้อระดับ 2 ที่มีข้อความว่า About Me',
      hint: 'heading มี 6 ระดับ h1 ถึง h6',
      sample: '<h2>About Me</h2>',
      answers: ['<h2>About Me</h2>']
    },
    {
      id: 'w6', topic: 'แท็กข้อความ',
      prompt: 'เขียนย่อหน้าที่มีข้อความ Hello แล้วขึ้นบรรทัดใหม่ต่อด้วย World',
      hint: 'ขึ้นบรรทัดใหม่ใน HTML ต้องใช้แท็ก br',
      sample: '<p>Hello<br>World</p>',
      answers: ['<p>Hello<br>World</p>', '<p>Hello<br/>World</p>', '<p>Hello<br />World</p>'],
      explain: 'กด Enter ในโค้ดเฉย ๆ จะไม่ทำให้ขึ้นบรรทัดใหม่บนหน้าเว็บ'
    },
    {
      id: 'w7', topic: 'ลิงก์',
      prompt: 'เขียนลิงก์ไปที่ https://www.bu.ac.th ข้อความว่า BU และเปิดในแท็บใหม่',
      hint: 'ต้องมีทั้ง href และ target',
      sample: '<a href="https://www.bu.ac.th" target="_blank">BU</a>',
      answers: [
        '<a href="https://www.bu.ac.th" target="_blank">BU</a>',
        '<a target="_blank" href="https://www.bu.ac.th">BU</a>'
      ]
    },
    {
      id: 'w8', topic: 'ลิงก์',
      prompt: 'เขียนลิงก์ข้อความว่า Contact ที่เลื่อนไปหา element ซึ่งมี id="contact" ในหน้าเดียวกัน',
      hint: 'ใช้เครื่องหมาย # นำหน้าชื่อ id',
      sample: '<a href="#contact">Contact</a>',
      answers: ['<a href="#contact">Contact</a>']
    },
    {
      id: 'w9', topic: 'รูปภาพ',
      prompt: 'แทรกรูปจากไฟล์ images/cat.jpg กว้าง 300 พิกเซล และมีข้อความสำรองว่า my cat',
      hint: 'ใช้ attribute src, width และ alt',
      sample: '<img src="images/cat.jpg" width="300" alt="my cat">',
      answers: [
        '<img src="images/cat.jpg" width="300" alt="my cat">',
        '<img src="images/cat.jpg" alt="my cat" width="300">'
      ]
    },
    {
      id: 'w10', topic: 'ลิสต์',
      prompt: 'เขียนลิสต์แบบจุด 3 รายการ: HTML, CSS, JavaScript',
      hint: 'ลิสต์แบบจุดใช้ ul ส่วนแต่ละรายการใช้ li',
      sample: '<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>',
      answers: ['<ul><li>HTML</li><li>CSS</li><li>JavaScript</li></ul>']
    },
    {
      id: 'w11', topic: 'ลิสต์',
      prompt: 'เขียนลิสต์แบบมีตัวเลข 2 รายการ: Open VS Code, Create file',
      hint: 'ลิสต์แบบตัวเลขใช้ ol',
      sample: '<ol>\n  <li>Open VS Code</li>\n  <li>Create file</li>\n</ol>',
      answers: ['<ol><li>Open VS Code</li><li>Create file</li></ol>']
    },
    {
      id: 'w12', topic: 'ตาราง',
      prompt: 'เขียนตารางที่มีแถวหัวตาราง Name กับ Age และอีก 1 แถวข้อมูล Ann กับ 21',
      hint: 'table ครอบ tr, หัวตารางใช้ th ส่วนข้อมูลใช้ td',
      sample: '<table>\n  <tr>\n    <th>Name</th>\n    <th>Age</th>\n  </tr>\n  <tr>\n    <td>Ann</td>\n    <td>21</td>\n  </tr>\n</table>',
      answers: [
        '<table><tr><th>Name</th><th>Age</th></tr><tr><td>Ann</td><td>21</td></tr></table>',
        '<table border="1"><tr><th>Name</th><th>Age</th></tr><tr><td>Ann</td><td>21</td></tr></table>'
      ]
    },
    {
      id: 'w13', topic: 'ฟอร์ม',
      prompt: 'เขียนแท็กเปิด-ปิดของฟอร์มที่ส่งข้อมูลแบบ GET ไปที่ https://postman-echo.com/get (ข้างในเว้นว่างไว้ได้)',
      hint: 'ต้องมี attribute action และ method',
      sample: '<form action="https://postman-echo.com/get" method="get">\n</form>',
      answers: [
        '<form action="https://postman-echo.com/get" method="get"></form>',
        '<form method="get" action="https://postman-echo.com/get"></form>'
      ],
      explain: 'GET จะส่งค่าไปต่อท้าย URL เป็น query string'
    },
    {
      id: 'w14', topic: 'ฟอร์ม',
      prompt: 'เขียน label ข้อความ Username ที่ผูกกับช่องกรอกข้อความ ซึ่งมี id และ name เป็น username',
      hint: 'label ใช้ for ให้ตรงกับ id ของ input',
      sample: '<label for="username">Username</label>\n<input type="text" id="username" name="username">',
      answers: [
        '<label for="username">Username</label><input type="text" id="username" name="username">',
        '<label for="username">Username</label><input type="text" name="username" id="username">'
      ],
      explain: 'name คือคีย์ของข้อมูลที่ส่งไป server ส่วน id ใช้ผูก label'
    },
    {
      id: 'w15', topic: 'ฟอร์ม',
      prompt: 'เขียนช่องกรอกอีเมลที่บังคับต้องกรอก มี name เป็น email',
      hint: 'type email จะตรวจ @ ให้เอง ส่วนการบังคับกรอกใช้ attribute เดียวโดด ๆ',
      sample: '<input type="email" name="email" required>',
      answers: [
        '<input type="email" name="email" required>',
        '<input type="email" name="email" required="required">'
      ]
    },
    {
      id: 'w16', topic: 'ฟอร์ม',
      prompt: 'เขียน radio 2 ตัวเลือกที่เป็นชุดเดียวกันชื่อ gender โดยมี value เป็น male และ female (ยังไม่ต้องใส่ label)',
      hint: 'ตัวที่อยู่ชุดเดียวกันต้องใช้ name เหมือนกัน',
      sample: '<input type="radio" name="gender" value="male">\n<input type="radio" name="gender" value="female">',
      answers: ['<input type="radio" name="gender" value="male"><input type="radio" name="gender" value="female">']
    },
    {
      id: 'w17', topic: 'ฟอร์ม',
      prompt: 'เขียน dropdown ชื่อ faculty ที่มี 2 ตัวเลือก: value cs ข้อความ Computer Science และ value it ข้อความ Information Technology',
      hint: 'ใช้ select ครอบ option',
      sample: '<select name="faculty">\n  <option value="cs">Computer Science</option>\n  <option value="it">Information Technology</option>\n</select>',
      answers: ['<select name="faculty"><option value="cs">Computer Science</option><option value="it">Information Technology</option></select>']
    },
    {
      id: 'w18', topic: 'ฟอร์ม',
      prompt: 'เขียนช่องข้อความหลายบรรทัด ชื่อ message ขนาด 5 แถว 30 คอลัมน์ (ไม่มีข้อความเริ่มต้น)',
      hint: 'textarea เป็นแท็กเปิด-ปิด ใช้ rows และ cols',
      sample: '<textarea name="message" rows="5" cols="30"></textarea>',
      answers: [
        '<textarea name="message" rows="5" cols="30"></textarea>',
        '<textarea rows="5" cols="30" name="message"></textarea>'
      ]
    },
    {
      id: 'w19', topic: 'ฟอร์ม',
      prompt: 'เขียนกรอบจัดกลุ่ม input ที่มีหัวข้อว่า Account Security (ข้างในเว้นว่างไว้ได้)',
      hint: 'กรอบใช้ fieldset ส่วนหัวข้อของกรอบใช้ legend',
      sample: '<fieldset>\n  <legend>Account Security</legend>\n</fieldset>',
      answers: ['<fieldset><legend>Account Security</legend></fieldset>']
    },
    {
      id: 'w20', topic: 'ฟอร์ม',
      prompt: 'เขียนปุ่มส่งฟอร์มที่มีข้อความบนปุ่มว่า Send Data',
      hint: 'ใช้ input type submit และกำหนดข้อความด้วย value',
      sample: '<input type="submit" value="Send Data">',
      answers: [
        '<input type="submit" value="Send Data">',
        '<button type="submit">Send Data</button>'
      ]
    },
    {
      id: 'w21', topic: 'Semantic',
      prompt: 'เขียน semantic element ส่วนหัวเว็บ ที่ข้างในมี h1 ข้อความว่า My Store',
      hint: 'ส่วนหัวของเว็บใช้แท็กชื่อเดียวกับคำว่า "หัว" ในภาษาอังกฤษ',
      sample: '<header>\n  <h1>My Store</h1>\n</header>',
      answers: ['<header><h1>My Store</h1></header>']
    },
    {
      id: 'w22', topic: 'Semantic',
      prompt: 'เขียน semantic element สำหรับกลุ่มลิงก์นำทาง ที่ข้างในมีลิงก์ไป products.html ข้อความว่า Products',
      hint: 'กลุ่มลิงก์นำทาง = navigation',
      sample: '<nav>\n  <a href="products.html">Products</a>\n</nav>',
      answers: ['<nav><a href="products.html">Products</a></nav>']
    }
  ]
});
