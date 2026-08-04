export type ScienceImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
};

export type ScienceQuestion = {
  id: string;
  prompt: string;
  points: number;
  hint?: string;
  image?: ScienceImage;
};

export type ScienceUnit = {
  id: string;
  title: string;
  theme: string;
  intro: string;
  images: ScienceImage[];
  questions: ScienceQuestion[];
};

export const scienceUnits: ScienceUnit[] = [
  {
    id: 'greenhouse-observation',
    title: 'โจทย์ 1: ปรากฏการณ์เรือนกระจก',
    theme: 'โลกและอากาศ',
    intro: 'นักเรียนสังเกตว่าความร้อนในกล่องกระจกกับอากาศด้านนอกแตกต่างกันอย่างไร แล้วใช้หลักฐานจากภาพประกอบอธิบายเหตุผลว่าทำไมภายในถึงร้อนกว่า',
    images: [
      {
        id: 'greenhouse-figure',
        src: '/science-images/greenhouse-ecosystem.svg',
        alt: 'ภาพแสดงแสงอาทิตย์ส่องเข้ากล่องกระจก และความร้อนถูกกักไว้ด้านใน',
        caption: 'ภาพที่ 1: กล่องกระจกกักเก็บความร้อนภายใน',
      },
    ],
    questions: [
      {
        id: 'greenhouse-1',
        prompt: 'สาเหตุหลักที่อากาศภายในเรือนกระจกร้อนกว่าด้านนอกคืออะไร?',
        points: 2,
        hint: 'คิดถึงเส้นทางของแสงอาทิตย์และความร้อนหลังจากที่เข้าไปแล้ว',
        image: {
          id: 'greenhouse-figure',
          src: '/science-images/greenhouse-ecosystem.svg',
          alt: 'ภาพแสดงแสงอาทิตย์ส่องเข้ากล่องกระจก และความร้อนถูกกักไว้ด้านใน',
          caption: 'ใช้ภาพนี้เป็นหลักฐานในการอธิบาย',
        },
      },
      {
        id: 'greenhouse-2',
        prompt: 'ยกหลักฐานจากภาพ 2 ข้อที่ช่วยสนับสนุนคำอธิบายของคุณ',
        points: 3,
        hint: 'ดูเส้นทางแสงและทิศทางของความร้อน',
      },
      {
        id: 'greenhouse-3',
        prompt: 'อธิบายว่าปรากฏการณ์นี้ส่งผลต่อการเจริญเติบโตของพืชในเรือนกระจกอย่างไร',
        points: 3,
        hint: 'เชื่อมโยงอุณหภูมิเข้ากับการเติบโตและการสูญเสียน้ำ',
      },
    ],
  },
  {
    id: 'water-cycle',
    title: 'โจทย์ 2: วัฏจักรน้ำในบ่อน้ำ',
    theme: 'น้ำและสภาพอากาศ',
    intro: 'นักเรียนติดตามเรื่องราวการเปลี่ยนสถานะของน้ำในบ่อน้ำ และระบุว่าการเปลี่ยนแปลงใดเกิดจากความร้อนหรือการเย็นตัว',
    images: [
      {
        id: 'water-cycle-figure',
        src: '/science-images/water-cycle.svg',
        alt: 'ภาพประกอบน้ำระเหยจากบ่อน้ำขึ้นไปเป็นเมฆ',
        caption: 'ภาพที่ 2: ความร้อนทำให้น้ำระเหย แล้วเย็นตัวและตกลงมาเป็นฝน',
      },
    ],
    questions: [
      {
        id: 'water-1',
        prompt: 'ขั้นตอนใดในวัฏจักรน้ำนั้นเกิดขึ้นก่อนที่สุดหลังจากดวงอาทิตย์ให้ความร้อนกับบ่อน้ำ?',
        points: 2,
        image: {
          id: 'water-cycle-figure',
          src: '/science-images/water-cycle.svg',
          alt: 'ภาพประกอบน้ำระเหยจากบ่อน้ำขึ้นไปเป็นเมฆ',
          caption: 'ใช้ภาพนี้ในการหาขั้นตอนแรก',
        },
      },
      {
        id: 'water-2',
        prompt: 'อธิบายว่ามีอะไรเกิดขึ้นหลังจากไอน้ำขึ้นไปแล้วเย็นตัวลง',
        points: 3,
        hint: 'คิดถึงเมฆและการตกของน้ำ',
      },
      {
        id: 'water-3',
        prompt: 'ทำไมบ่อน้ำจึงสูญเสียน้ำเร็วกว่าในวันที่ร้อนกว่าวันที่เย็น?',
        points: 3,
        hint: 'เชื่อมโยงอุณหภูมิกับอัตราการระเหย',
      },
    ],
  },
  {
    id: 'plant-growth',
    title: 'โจทย์ 3: การเจริญเติบโตของพืชใต้แสง',
    theme: 'สิ่งมีชีวิตและพลังงาน',
    intro: 'นักเรียนเปรียบเทียบพืชสองต้นในสภาพแวดล้อมแสงต่างกันและตัดสินว่าพื้นที่ใดเหมาะสมสำหรับการเติบโตอย่างสม่ำเสมอ',
    images: [
      {
        id: 'plant-growth-figure',
        src: '/science-images/plant-growth.svg',
        alt: 'ภาพเปรียบเทียบการเจริญเติบโตของพืชภายใต้แสงต่างกัน',
        caption: 'ภาพที่ 3: พืชต้นหนึ่งได้รับแสงมากกว่าอีกต้นหนึ่ง',
      },
    ],
    questions: [
      {
        id: 'plant-1',
        prompt: 'พืชต้นใดน่าจะเติบโตเร็วกว่าเมื่อเวลาผ่านไป และเพราะเหตุใด?',
        points: 2,
        image: {
          id: 'plant-growth-figure',
          src: '/science-images/plant-growth.svg',
          alt: 'ภาพเปรียบเทียบการเจริญเติบโตของพืชภายใต้แสงต่างกัน',
          caption: 'ใช้ภาพนี้เปรียบเทียบพืชทั้งสอง',
        },
      },
      {
        id: 'plant-2',
        prompt: 'บอกข้อจำกัดหนึ่งของการเปรียบเทียบนี้และวิธีปรับปรุงการทดลอง',
        points: 3,
        hint: 'คิดถึงตัวแปรที่ต้องควบคุม เช่น น้ำและดิน',
      },
    ],
  },
];
