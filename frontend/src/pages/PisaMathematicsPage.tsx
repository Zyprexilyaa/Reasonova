import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './PisaAssessmentPage.css';

export const PisaMathematicsPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="pisa-assessment-page">
      <div className="pisa-shell">
        <section className="pisa-card pisa-hero">
          <div>
            <div className="pisa-eyebrow">🧮 Mathematics</div>
            <h1 className="pisa-title">PISA Mathematics practice</h1>
            <p className="pisa-description">
              {language === 'th'
                ? 'หน้าแบบฝึกคณิตศาสตร์นี้ออกแบบให้เข้ากับธีมเว็บไซต์ของเรา และพร้อมให้ครูและนักเรียนใช้ร่วมกัน'
                : 'This mathematics practice page follows the same playful style as the rest of the site and is ready for both teachers and students.'}
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
            <h3>{language === 'th' ? 'ตัวอย่างข้อสอบ PISA' : 'Sample PISA assessment'}</h3>
            <p>
              {language === 'th'
                ? 'เนื้อหาตัวอย่างนี้แสดงให้เห็นถึงรูปแบบข้อสอบที่สอดคล้องกับการเรียนรู้แบบ PISA และพร้อมสำหรับการอัปเดตเนื้อหาที่แท้จริงในภายหลัง'
                : 'This sample content demonstrates the assessment format and can be expanded with your future subject material.'}
            </p>
          </div>
          <iframe
            title="PISA Mathematics sample"
            src="/PISA_Math_mock.html"
            style={{ width: '100%', minHeight: '900px', border: '0', borderRadius: '16px', background: '#fff' }}
          />
        </section>
      </div>
    </div>
  );
};
