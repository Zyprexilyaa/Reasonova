import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const InfoPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="page-content" style={{ padding: '2rem', maxWidth: 920, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Terms of Use / ข้อตกลงในการใช้ซอฟต์แวร์</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>English</h2>
        <p>
          This software is developed by Mr. Puranat Saksawat, Ms. Khotchaporn Phetthong,
          and Mr. Ronnisit Namkhao from Suratthani School, under the supervision of Ms.
          Atcharapan Luanmanee. It is part of the Reasonova project: a web application for
          developing analytical thinking and self-assessment skills for secondary students
          using artificial intelligence, supported by the National Science and Technology
          Development Agency (NSTDA). The objective is to promote learning and practice of
          skills development.
        </p>
        <p>
          The copyright of this software belongs to the developers. The developers have authorized
          NSTDA to distribute this software in its original form without any modification to the
          general public for personal use or non-commercial educational purposes without charge.
          Therefore, NSTDA has no obligation to maintain, support, train users, or improve the
          software, and does not guarantee the accuracy or performance of the software. NSTDA is
          not liable for any damages arising from the use of this software.
        </p>
      </section>

      <section>
        <h2>ภาษาไทย</h2>
        <p>
          ซอฟต์แวร์นี้เป็นผลงานที่พัฒนาขึ้นโดย นายภูริณัฐ ศักดิ์สวัสดิ์, นางสาวกชพร เพชรทอง,
          นายรณสิทธิน้ําขาว โรงเรียนสุราษฎร์ธานี ภายใต้การดูแลของ นางสาวอัจราพรรณ ล้วนมณี
          ภายใต้โครงการ เรซันโนวา : เว็บแอปพลิเคชันพัฒนาทักษะการคิดวิเคราะห์และประเมินตนเองสําหรับ
          นักเรียนมัธยมศึกษาด้วยปัญญาประดิษฐ์ ซึ่งสนับสนุนโดย สํานักงานพัฒนาวิทยาศาสตร์และ
          เทคโนโลยีแห่งชาติโดยมี วัตถุประสงค์เพื่อส่งเสริมให้นักเรียนและนักศึกษาได้เรียนรู้และฝึกทักษะ
          ในการพัฒนา
        </p>
        <p>
          ลิขสิทธิ์ของซอฟต์แวร์นี้จึงเป็นของผู้พัฒนา ซึ่งผู้พัฒนาได้อนุญาตให้สํานักงานพัฒนาวิทยาศาสตร์
          และเทคโนโลยีแห่งชาติเผยแพร่ซอฟต์แวร์นี้ตาม “ต้นฉบับ” โดยไม่มีการแก้ไขดัดแปลงใด ๆ ทั้งสิ้น
          ให้แก่บุคคลทั่วไปได้ใช้เพื่อประโยชน์ส่วนบุคคลหรือประโยชน์ทางการศึกษาที่ไม่มีวัตถุประสงค์ใน
          เชิงพาณิชย์โดยไม่คิดค่าตอบแทนการใช้ ซอฟต์แวร์ดังนั้น สํานักงานพัฒนาวิทยาศาสตร์และเทคโนโลยี
          แห่งชาติจึงไม่มีหน้าที่ในการดูแล บํารุงรักษา จัดการอบรมการใช้งาน หรือพัฒนาประสิทธิภาพ
          ซอฟต์แวร์ รวมทั้ง ไม่รับรองความถูกต้องหรือประสิทธิภาพการทํางานของซอฟต์แวร์ ตลอดจนไม่รับประกัน
          ความเสียหายต่าง ๆ อันเกิดจากการใช้ซอฟต์แวร์นี้ทั้งสิ้น
        </p>
      </section>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f7f9fc', borderRadius: 12 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>
          {language === 'th'
            ? 'หน้านี้แสดงข้อมูลทั้งภาษาอังกฤษและภาษาไทยสำหรับข้อตกลงในการใช้ซอฟต์แวร์'
            : 'This page displays the Terms of Use information in both English and Thai.'}
        </p>
      </div>
    </div>
  );
};
