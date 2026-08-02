import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './PisaAssessmentPage.css';

const SUBJECT_LABELS: Record<string, { title: string; description: string }> = {
  mathematics: { title: 'Mathematics', description: 'A friendly PISA-style mathematics practice experience is ready and accessible to teachers and students.' },
  science: { title: 'Science', description: 'Science content will be added here soon. The placeholder is now visible for both teachers and students.' },
  reading: { title: 'Reading', description: 'Reading tasks are now active. The page includes a sample PISA passage and an AI-assisted written-response workflow.' },
  collaborative: { title: 'Collaborative Problem Solving', description: 'Collaborative tasks will be added here soon. The placeholder is now visible for both teachers and students.' },
  global: { title: 'Global Competence', description: 'Global competence tasks will be added here soon. The placeholder is now visible for both teachers and students.' },
  creative: { title: 'Creative Thinking', description: 'Creative thinking tasks will be added here soon. The placeholder is now visible for both teachers and students.' },
};

export const PisaPlaceholderPage: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const { language } = useLanguage();
  const subjectInfo = SUBJECT_LABELS[subject || 'mathematics'] || SUBJECT_LABELS.mathematics;

  return (
    <div className="pisa-assessment-page">
      <div className="pisa-shell">
        <section className="pisa-card pisa-hero">
          <div>
            <div className="pisa-eyebrow">🧩 Subject Placeholder</div>
            <h1 className="pisa-title">{subjectInfo.title}</h1>
            <p className="pisa-description">{subjectInfo.description}</p>
          </div>
          <div className="pisa-actions">
            <Link className="pisa-btn primary" to="/pisa">
              {language === 'th' ? 'กลับสู่หน้าหลัก PISA' : 'Back to PISA home'}
            </Link>
          </div>
        </section>

        <section className="pisa-card">
          <div className="pisa-question-box">
            <h3>{language === 'th' ? 'เนื้อหาจะถูกเพิ่มในภายหลัง' : 'Content will be added later'}</h3>
            <p>
              {language === 'th'
                ? 'ตอนนี้หน้าแบบสำรองนี้พร้อมให้ครูและนักเรียนเข้าถึง เพื่อเตรียมตัวสำหรับชุดข้อสอบจริงในอนาคต'
                : 'The placeholder page is now accessible to both teachers and students so the space is ready for the real assessments later.'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
