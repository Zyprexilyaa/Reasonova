import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './PisaAssessmentPage.css';
import { scienceUnits } from './scienceContent';

export const PisaSciencePage: React.FC = () => {
  const { language } = useLanguage();
  const [responses, setResponses] = useState<Record<string, string>>({});

  const totalPoints = useMemo(() => scienceUnits.reduce((sum, unit) => sum + unit.questions.reduce((qsum, question) => qsum + question.points, 0), 0), []);

  return (
    <div className="pisa-assessment-page">
      <div className="pisa-shell">
        <section className="pisa-card pisa-hero">
          <div>
            <div className="pisa-eyebrow">🔬 Science</div>
            <h1 className="pisa-title">PISA Science practice</h1>
            <p className="pisa-description">
              {language === 'th'
                ? 'หน้านี้แยกคำถามออกเป็นชุดย่อยตามสถานการณ์วิทยาศาสตร์ พร้อมภาพประกอบและคะแนนแต่ละคำถาม เพื่อให้เหมือนกับกิจกรรม PISA ที่เน้นการสืบเสาะและอธิบายเหตุผล'
                : 'This science practice page breaks each task into smaller sub-questions with images and point values so it follows the same guided PISA structure.'}
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
            <h3>{language === 'th' ? 'ชุดกิจกรรมวิทยาศาสตร์' : 'Science practice set'}</h3>
            <p>
              {language === 'th'
                ? 'นักเรียนจะตอบคำถามทีละขั้นตามภาพประกอบและคำใบ้ เพื่อพัฒนาทักษะสังเกต วิเคราะห์และอธิบายเหตุผล'
                : 'Students progress through each sub-question using visuals and hints to build observation, analysis, and explanation skills.'}
            </p>
          </div>
        </section>

        {scienceUnits.map((unit, unitIndex) => (
          <section key={unit.id} className="pisa-card" style={{ marginTop: 20 }}>
            <div className="pisa-question-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <div className="pisa-eyebrow" style={{ marginBottom: 6 }}>{language === 'th' ? 'ชุดที่' : 'Set'} {unitIndex + 1}</div>
                  <h3 style={{ margin: 0 }}>{unit.title}</h3>
                  <p style={{ margin: '6px 0 0', color: '#5b6774' }}>{unit.theme}</p>
                </div>
                <div style={{ fontSize: 13, color: '#4d6075', fontWeight: 700 }}>{language === 'th' ? 'รวมคะแนน' : 'Points'}: {unit.questions.reduce((sum, q) => sum + q.points, 0)}</div>
              </div>

              <p style={{ marginTop: 12, lineHeight: 1.8 }}>{unit.intro}</p>

              <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
                {unit.images.map((image) => (
                  <div key={image.id} style={{ border: '1px solid #dfeaf5', borderRadius: 16, overflow: 'hidden', background: '#fbfdff' }}>
                    <img src={image.src} alt={image.alt} style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'contain', background: '#f7fbff' }} />
                    <div style={{ padding: '10px 12px', fontSize: 13, color: '#4d6075' }}>{image.caption}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
                {unit.questions.map((question, questionIndex) => (
                  <div key={question.id} style={{ border: '1px solid #e2ebf6', borderRadius: 16, padding: 16, background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                      <strong>{language === 'th' ? `คำถามย่อยที่ ${questionIndex + 1}` : `Sub-question ${questionIndex + 1}`}</strong>
                      <span style={{ color: '#1c5d8b', fontWeight: 700 }}>{question.points} {language === 'th' ? 'คะแนน' : 'pts'}</span>
                    </div>
                    <p style={{ margin: '6px 0 0', lineHeight: 1.8 }}>{question.prompt}</p>
                    {question.hint && <p style={{ marginTop: 10, color: '#5b6774', fontStyle: 'italic' }}>{language === 'th' ? 'คำใบ้:' : 'Hint:'} {question.hint}</p>}
                    {question.image && (
                      <div style={{ marginTop: 12, border: '1px solid #edf3fa', borderRadius: 12, overflow: 'hidden' }}>
                        <img src={question.image.src} alt={question.image.alt} style={{ width: '100%', display: 'block', maxHeight: 260, objectFit: 'contain', background: '#f7fbff' }} />
                        <div style={{ padding: '8px 10px', fontSize: 12, color: '#546579' }}>{question.image.caption}</div>
                      </div>
                    )}
                    <textarea
                      rows={4}
                      value={responses[question.id] || ''}
                      onChange={(event) => setResponses((prev) => ({ ...prev, [question.id]: event.target.value }))}
                      placeholder={language === 'th' ? 'พิมพ์คำตอบของคุณที่นี่...' : 'Type your answer here...'}
                      style={{ width: '100%', marginTop: 12, borderRadius: 12, border: '1px solid #dfeaf5', padding: 12, fontSize: 14, resize: 'vertical' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="pisa-card" style={{ marginTop: 20 }}>
          <div className="pisa-question-box">
            <h3>{language === 'th' ? 'สรุปคะแนน' : 'Score overview'}</h3>
            <p>{language === 'th' ? 'นักเรียนสามารถตอบคำถามย่อยทีละข้อและตรวจให้เห็นความก้าวหน้าอย่างชัดเจน' : 'Students can respond to each sub-question and track their progress clearly.'}</p>
            <div className="pisa-answer" style={{ marginTop: 12 }}>
              {language === 'th' ? `รวมคะแนนทั้งหมด ${totalPoints} คะแนน` : `Total possible points: ${totalPoints}`}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
