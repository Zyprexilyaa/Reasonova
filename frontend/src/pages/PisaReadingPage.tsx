import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './PisaAssessmentPage.css';
import readingContent from './pisaReadingContent.js';

type ReadingQuestion = {
  id: string;
  type: 'open' | 'choice';
  questionText: string;
  scoringRubric?: Record<string, string>;
  expectedAnswer?: string;
  difficulty?: string;
  subject?: string;
  sourcePdfUrl?: string;
};

const readingQuestions = (readingContent.questions ?? []) as ReadingQuestion[];

export const PisaReadingPage: React.FC = () => {
  const { language } = useLanguage();
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const question = useMemo(() => readingQuestions[0], []);

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  return (
    <div className="pisa-assessment-page">
      <div className="pisa-shell">
        <section className="pisa-card pisa-hero">
          <div>
            <div className="pisa-eyebrow">📖 Reading</div>
            <h1 className="pisa-title">PISA Reading practice</h1>
            <p className="pisa-description">
              {language === 'th'
                ? 'แบบฝึกอ่านนี้ใช้บทอ่าน PISA ที่สอดคล้องกับตัวอย่าง PDF และพร้อมเปิดใช้งานระบบ AI ตรวจคำตอบแบบเขียนตอบ'
                : 'This reading exercise follows the PISA reading sample and is ready for AI-assisted open-response grading.'}
            </p>
          </div>
          <div className="pisa-actions">
            <Link className="pisa-btn primary" to="/pisa">
              {language === 'th' ? 'กลับสู่หน้าหลัก PISA' : 'Back to PISA home'}
            </Link>
          </div>
        </section>

        <section className="pisa-card">
          <div className="pisa-question-box">
            <h3>{language === 'th' ? 'บทอ่าน' : 'Reading Passage'}</h3>
            <p style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
              {readingContent.passage}
            </p>
          </div>
        </section>

        <section className="pisa-card">
          <div className="pisa-question-box">
            <h3>{language === 'th' ? 'คำถาม' : 'Question'}</h3>
            <p style={{ fontWeight: 600 }}>{question?.questionText}</p>

            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={8}
              placeholder={language === 'th' ? 'พิมพ์คำตอบของคุณที่นี่...' : 'Type your answer here...'}
              style={{ width: '100%', borderRadius: 12, border: '1px solid #dfeaf5', padding: 12, fontSize: 15, resize: 'vertical' }}
            />

            <div className="pisa-actions" style={{ marginTop: 16 }}>
              <button className="pisa-btn primary" onClick={handleSubmit}>
                {language === 'th' ? 'ส่งคำตอบ' : 'Submit answer'}
              </button>
            </div>

            {isSubmitted && (
              <div className="pisa-answer" style={{ marginTop: 16 }}>
                <strong>{language === 'th' ? 'ระบบ AI จะตรวจคำตอบแบบเขียนตอบตาม rubric ด้านล่าง' : 'The AI system will grade this written response using the rubric below.'}</strong>
                <p style={{ marginTop: 8, marginBottom: 0 }}>
                  {question?.scoringRubric?.excellent || 'AI-assisted rubric is available for assessment.'}
                </p>
              </div>
            )}

            {question?.sourcePdfUrl && (
              <div style={{ marginTop: 16, fontSize: 13, color: '#4d6075' }}>
                {language === 'th' ? 'แหล่งข้อมูล PDF:' : 'Source PDF:'} {question.sourcePdfUrl}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
