const readPassage = `รูปที่ 1 แสดงการเปลี่ยนแปลงระดับน้ำของทะเลสาบชาด ในซาฮารา แอฟริกาเหนือ ทะเลสาบชาดสูญหายไร้ร่องรอย
ประมาณ 20,000 ปีก่อนคริสตศักราช (20,000 BC) ช่วงปลายยุคน้ำแข็ง และประมาณ 11,000 ปีก่อนคริสตศักราช
(11,000 BC) ทะเลสาบนี้ปรากฏขึ้นมาอีกครั้ง ปัจจุบันระดับน้ำของทะเลสาบมีระดับเดียวกับเมื่อปี ค.ศ. 1000 (AD 1000)

[รูปที่ 1: กราฟแสดงระดับความลึกของทะเลสาบชาด ตั้งแต่ 8000 BC ถึง AD 1000]

รูปที่ 2 แสดงถึงศิลปะบนหินแห่งซาฮารา (ภาพเขียนโบราณ หรือภาพวาดบนฝาผนังถ้ำ) และการเปลี่ยนแปลงของชีวิตสัตว์ป่า
เช่น นกกระจอกเทศ ยีราฟ แรด ฮิปโปโปเตมัส วัวป่า ที่ปรากฏหรือหายไปในแต่ละช่วงเวลา ตั้งแต่ 8000 BC ถึง AD 1000

[รูปที่ 2: แผนภาพศิลปะหินแห่งซาฮาราและช่วงเวลาที่พบสัตว์แต่ละชนิด]`;

const questions = [
  {
    id: 'lakechad-q1',
    type: 'mc',
    text: 'คำถามที่ 1: ปัจจุบันทะเลสาบชาดลึกเท่าไร',
    options: ['ประมาณ 2 เมตร', 'ประมาณ 15 เมตร', 'ประมาณ 50 เมตร', 'สาบสูญไปแล้ว', 'ข้อมูลไม่ได้ระบุ'],
    correctIndex: 0,
    answer: 'ประมาณ 2 เมตร',
    rubric: '[เกณฑ์การให้คะแนน] คำตอบที่ถูกต้องคือ "ประมาณ 2 เมตร" ซึ่งมาจากข้อมูลในกราฟที่แสดงระดับน้ำปัจจุบันของทะเลสาบชาดเทียบกับปี ค.ศ. 1000',
    meta: 'สมรรถนะ: ค้นสาระ · ชนิดบทความ: แผนภูมิและกราฟ · แบบข้อสอบ: เลือกตอบ',
    difficulty: 'easy',
    subject: 'reading',
    sourcePdfUrl: '/23.PISA-ReadingReleasedItems-2.pdf',
  },
  {
    id: 'lakechad-q2',
    type: 'open',
    text: 'คำถามที่ 2: ประมาณปีใดที่กราฟในรูปที่ 1 เริ่มต้น?',
    rubric: '[เกณฑ์การให้คะแนน — ถอดจากไฟล์ต้นฉบับ หน้า 15]\nได้คะแนนเต็ม: ตอบว่า 11,000 ปีก่อนคริสตศักราช (หรือค่าประมาณในช่วง 10,500–12,000 BC ที่อ่านจากมาตราส่วนของกราฟได้อย่างสมเหตุสมผล)\nไม่ได้คะแนน: คำตอบอื่น ๆ เช่น 10,000 BC / 20,000 BC / 8000 BC (อ่านค่าผิดตำแหน่ง) หรือชี้ลูกศรที่จุดเริ่มต้นของกราฟโดยไม่ระบุตัวเลข',
    answer: 'The graph starts around 11,000 BC.',
    meta: 'สมรรถนะ: ค้นสาระ · แบบข้อสอบ: สร้างคำตอบอิสระ',
    difficulty: 'medium',
    subject: 'reading',
    sourcePdfUrl: '/23.PISA-ReadingReleasedItems-2.pdf',
  },
  {
    id: 'lakechad-q3',
    type: 'open',
    text: 'คำถามที่ 3: ทำไมผู้เขียนจึงเลือกที่จะเริ่มต้นกราฟ ณ จุดนี้?',
    rubric: '[เกณฑ์การให้คะแนน — ถอดจากไฟล์ต้นฉบับ หน้า 16]\nได้คะแนนเต็ม: คำตอบอ้างถึง "การปรากฏขึ้นใหม่ของทะเลสาบ" หลังจากที่เคยสาบสูญไป เช่น "ทะเลสาบชาดปรากฏขึ้นใหม่ในปี 11,000 ก่อนคริสตกาล หลังจากที่หายสาบสูญไปในช่วงยุคน้ำแข็ง"\nไม่ได้คะแนน: คำตอบที่ไม่เชื่อมโยงกับการปรากฏขึ้นใหม่ของทะเลสาบ เช่น "เพราะเป็นจุดเริ่มต้นของกราฟ" หรือ "เพราะทะเลสาบแห้งสนิทในช่วงนั้น"',
    answer: 'The graph starts at the point where Lake Chad reappeared after disappearing during the ice age.',
    meta: 'สมรรถนะ: วิเคราะห์ · แบบข้อสอบ: สร้างคำตอบอิสระ',
    difficulty: 'hard',
    subject: 'reading',
    sourcePdfUrl: '/23.PISA-ReadingReleasedItems-2.pdf',
  },
  {
    id: 'lakechad-q4',
    type: 'mc',
    text: 'คำถามที่ 4: รูปที่ 2 ตั้งอยู่บนพื้นฐานที่ถือว่า...',
    options: ['สัตว์ต่าง ๆ ในศิลปะบนหิน คือสัตว์ที่มีอยู่ในพื้นที่นั้น ในเวลาที่มีการวาดภาพนั้น ๆ', 'ศิลปินที่วาดสัตว์มีทักษะสูงมาก', 'ศิลปินที่วาดรูปสัตว์เป็นผู้เดินทางท่องเที่ยวไปได้ในโลกกว้างอย่างทั่วถึง', 'ไม่ได้มีความพยายามที่จะนำสัตว์ที่วาดในภาพเหล่านั้นมาเป็นสัตว์เลี้ยง'],
    correctIndex: 0,
    answer: 'สัตว์ต่าง ๆ ในศิลปะบนหิน คือสัตว์ที่มีอยู่ในพื้นที่นั้น ในเวลาที่มีการวาดภาพนั้น ๆ',
    rubric: 'Select the option that matches the evidence in the rock-art timeline: the animals shown correspond to animals present in the region at that time.',
    meta: 'สมรรถนะ: ตีความ · แบบข้อสอบ: เลือกตอบ',
    difficulty: 'medium',
    subject: 'reading',
    sourcePdfUrl: '/23.PISA-ReadingReleasedItems-2.pdf',
  },
  {
    id: 'lakechad-q5',
    type: 'mc',
    text: 'คำถามที่ 5: การสาบสูญของแรด ฮิปโปโปเตมัสและวัวป่าในภาพศิลปะบนหินแห่งซาฮารา เกิดขึ้นเมื่อใด',
    options: ['ตอนเริ่มต้นของยุคน้ำแข็งซึ่งใกล้กับยุคปัจจุบันที่สุด', 'ช่วงกลางของยุคที่ทะเลสาบชาดมีระดับสูงสุด', 'หลังจากระดับของทะเลสาบชาดต่ำลงมานานกว่าพันปี', 'เมื่อตอนต้นของช่วงเวลาที่ทะเลสาบแห้งไป'],
    correctIndex: 2,
    answer: 'หลังจากระดับของทะเลสาบชาดต่ำลงมานานกว่าพันปี',
    rubric: 'The correct answer is the option showing the disappearance after the lake level had been low for many years, as supported by the combined evidence from the graph and rock-art timing.',
    meta: 'สมรรถนะ: ตีความ · แบบข้อสอบ: เลือกตอบ',
    difficulty: 'hard',
    subject: 'reading',
    sourcePdfUrl: '/23.PISA-ReadingReleasedItems-2.pdf',
  }
];

const extractedImages = [
  { id: 'lakechart-1', src: '/pisa-reading/Lake_Chart_1.png', caption: 'รูปที่ 1: กราฟระดับน้ำทะเลสาบชาด' },
  { id: 'lakechart-2', src: '/pisa-reading/Lake_Chart_2.png', caption: 'รูปที่ 2: แผนภาพศิลปะบนหินแห่งซาฮารา' },
];

const readingContent = {
  title: 'PISA Reading Sample',
  sourcePdfUrl: '/23.PISA-ReadingReleasedItems-2.pdf',
  passage: readPassage,
  questions,
  extractedImages,
  assessmentType: 'reading'
};

export default readingContent;
