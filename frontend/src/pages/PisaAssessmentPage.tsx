import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './PisaAssessmentPage.css';

type SubjectKey = 'mathematics' | 'science' | 'reading' | 'collaborative' | 'global' | 'creative';

interface SubjectCard {
  key: SubjectKey;
  title: string;
  description: string;
  badge: string;
  ready: boolean;
  path: string;
}

const SUBJECTS: SubjectCard[] = [
  {
    key: 'mathematics',
    title: 'Mathematics',
    description: 'PISA-style mathematics challenges with friendly explanations and practice prompts.',
    badge: 'Ready',
    ready: true,
    path: '/pisa/mathematics',
  },
  {
    key: 'science',
    title: 'Science',
    description: 'Hands-on science reasoning activities and evidence-based prompts coming soon.',
    badge: 'Coming soon',
    ready: false,
    path: '/pisa/science',
  },
  {
    key: 'reading',
    title: 'Reading',
    description: 'Reading comprehension with a PISA-style passage and AI-assisted written response scoring.',
    badge: 'Ready',
    ready: true,
    path: '/pisa/reading',
  },
  {
    key: 'collaborative',
    title: 'Collaborative Problem Solving',
    description: 'Team-based reasoning challenges and scenario prompts will appear here soon.',
    badge: 'Coming soon',
    ready: false,
    path: '/pisa/collaborative',
  },
  {
    key: 'global',
    title: 'Global Competence',
    description: 'Cross-cultural and global citizenship scenarios to support future practice.',
    badge: 'Coming soon',
    ready: false,
    path: '/pisa/global',
  },
  {
    key: 'creative',
    title: 'Creative Thinking',
    description: 'Creative challenge prompts and open-ended tasks are being prepared.',
    badge: 'Coming soon',
    ready: false,
    path: '/pisa/creative',
  },
];

export const PisaAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { language } = useLanguage();
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>('mathematics');

  const selectedCard = useMemo(() => SUBJECTS.find((item) => item.key === selectedSubject) ?? SUBJECTS[0], [selectedSubject]);

  return (
    <div className="pisa-assessment-page">
      <div className="pisa-shell">
        <section className="pisa-card pisa-hero">
          <div>
            <div className="pisa-eyebrow">🌈 PISA Learning Studio</div>
            <h1 className="pisa-title">Explore the new PISA assessment experience</h1>
            <p className="pisa-description">
              {language === 'th'
                ? 'เลือกหัวข้อที่ต้องการฝึกได้ทันที พร้อมหน้าตาแบบน่ารักและเข้าถึงได้ทั้งครูและนักเรียน'
                : 'Choose a subject to practice with a playful experience that works for both teachers and students.'}
            </p>
          </div>
          <div className="pisa-actions">
            <button className="pisa-btn primary" onClick={() => navigate('/pisa/mathematics')}>
              {language === 'th' ? 'เริ่มคณิตศาสตร์' : 'Start Mathematics'}
            </button>
            <Link className="pisa-btn secondary" to="/home">
              {language === 'th' ? 'กลับหน้าหลัก' : 'Back to home'}
            </Link>
          </div>
        </section>

        <section className="pisa-card">
          <div className="pisa-grid">
            {SUBJECTS.map((subject) => (
              <button
                key={subject.key}
                className={`pisa-subject-card ${subject.ready ? 'ready' : ''}`}
                onClick={() => setSelectedSubject(subject.key)}
                style={{ textAlign: 'left', cursor: 'pointer' }}
              >
                <span className="pisa-badge">{subject.badge}</span>
                <h3>{subject.title}</h3>
                <p>{subject.description}</p>
                {subject.ready ? (
                  <div className="pisa-actions">
                    <Link className="pisa-btn secondary" to={subject.path}>
                      {language === 'th' ? 'เปิดหน้า' : 'Open'}
                    </Link>
                  </div>
                ) : (
                  <div className="pisa-metadata">
                    <span>{language === 'th' ? 'พร้อมให้ครูและนักเรียนดู' : 'Visible to teachers and students'}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="pisa-card pisa-quiz">
          <div className="pisa-question-box">
            <h3>{selectedCard.title}</h3>
            <p>{selectedCard.description}</p>
            <div className="pisa-metadata">
              <span>{language === 'th' ? 'สถานะ' : 'Status'}: {selectedCard.badge}</span>
              <span>{language === 'th' ? 'ผู้เข้าถึง' : 'Access'}: {userRole ? `${userRole}` : 'student'}</span>
            </div>
          </div>
          {selectedCard.ready ? (
            <div className="pisa-answer">
              {language === 'th'
                ? 'หน้านี้พร้อมใช้งานแล้วสำหรับการฝึกและติดตามผลในแบบฝึกหัด PISA'
                : 'This page is ready for practice and progress tracking in the PISA learning flow.'}
            </div>
          ) : (
            <div className="pisa-answer">
              {language === 'th'
                ? 'ยังเตรียมเนื้อหาสำหรับวิชานี้อยู่ ตอนนี้จะใช้หน้าจอ Placeholder เพื่อให้ครูและนักเรียนเห็นโครงสร้างก่อน'
                : 'This subject is being prepared. A placeholder page is ready so teachers and students can see the structure before full content arrives.'}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
