import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './PisaAssessmentPage.css';

export const PisaSciencePage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="pisa-assessment-page">
      <div className="pisa-shell">
        <section className="pisa-card pisa-hero">
          <div>
            <div className="pisa-eyebrow">🔬 Science</div>
            <h1 className="pisa-title">PISA Science practice</h1>
            <p className="pisa-description">
              {language === 'th'
                ? 'หน้าสำหรับฝึกทักษะวิทยาศาสตร์แบบ PISA พร้อมข้อคำถามเลือกตอบและคำตอบอิสระที่ใช้แนวคิดเชิงเหตุผลและหลักฐาน'
                : 'This science practice page follows the PISA-style format with evidence-based reasoning, multiple-choice prompts, and open-ended tasks.'}
            </p>
          </div>
          <div className="pisa-actions">
            <Link className="pisa-btn primary" to="/pisa">
              {language === 'th' ? 'กลับสู่หน้าหลัก PISA' : 'Back to PISA subjects'}
            </Link>
          </div>
        </section>

        <section className="pisa-card">
          <div className="pisa-question-box">
            <h3>{language === 'th' ? 'ตัวอย่างบทเรียนวิทยาศาสตร์' : 'Sample science lesson'}</h3>
            <p>
              {language === 'th'
                ? 'ข้อสอบนี้ถูกออกแบบให้คล้ายกับแบบทดสอบวิทยาศาสตร์ของ PISA/TIMSS และแสดงผลในหน้าเดียวเพื่อให้ครูและนักเรียนทดลองใช้งานได้ทันที'
                : 'This sample lesson mirrors the science assessment style and is ready for teachers and students to explore immediately.'}
            </p>
          </div>
          <iframe
            title="PISA Science sample"
            src="/sci_example/pisa-mock-test.html"
            style={{ width: '100%', minHeight: '1100px', border: '0', borderRadius: '16px', background: '#fff' }}
          />
        </section>
      </div>
    </div>
  );
};
