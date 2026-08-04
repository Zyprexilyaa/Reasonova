import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './PisaAssessmentPage.css';
import { scienceUnits } from './scienceContent';

export const PisaSciencePage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId?: string }>();
  const [responses, setResponses] = useState<Record<string, string>>({});

  const selectedUnit = useMemo(
    () => scienceUnits.find((unit) => unit.id === unitId),
    [unitId]
  );

  const totalPoints = useMemo(
    () => scienceUnits.reduce((sum, unit) => sum + unit.questions.reduce((qsum, question) => qsum + question.points, 0), 0),
    []
  );

  return (
    <div className="pisa-assessment-page">
      <div className="pisa-shell">
        <section className="pisa-card pisa-hero">
          <div>
            <div className="pisa-eyebrow">🔬 วิทยาศาสตร์</div>
            <h1 className="pisa-title">ฝึก PISA วิทยาศาสตร์</h1>
            <p className="pisa-description">
              {language === 'th'
                ? 'เลือกโจทย์ที่ต้องการทำ แล้วตอบคำถามย่อยพร้อมภาพประกอบและคะแนน เพื่อฝึกการคิดแบบ PISA'
                : 'Choose the problem you want to answer, then work through each sub-question using images and point values to practice the PISA thinking style.'}
            </p>
          </div>
          <div className="pisa-actions">
            <Link className="pisa-btn primary" to="/pisa">
              {language === 'th' ? 'กลับสู่หน้าหลัก PISA' : 'Back to PISA subjects'}
            </Link>
          </div>
        </section>

        {!selectedUnit ? (
          <section className="pisa-card">
            <div className="pisa-question-box">
              <h3>{language === 'th' ? 'เลือกโจทย์ที่ต้องการทำ' : 'Choose a problem to work on'}</h3>
              <p>
                {language === 'th'
                  ? 'แต่ละหัวข้อเป็นโจทย์วิทยาศาสตร์แยกส่วน พร้อมคะแนนและภาพประกอบในตัว เพื่อให้นักเรียนเลือกทำได้ตามความสนใจ'
                  : 'Each topic is a standalone science problem with its own points and images so students can choose what to practice.'}
              </p>

              <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
                {scienceUnits.map((unit, index) => (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => navigate(`/pisa/science/unit/${unit.id}`)}
                    className="pisa-question-box"
                    style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid #dce7f2', padding: 18, borderRadius: 16, background: '#fff' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <h3 style={{ margin: 0 }}>{unit.title}</h3>
                        <p style={{ margin: '8px 0 0', color: '#5b6774' }}>{unit.theme}</p>
                      </div>
                      <span style={{ fontWeight: 700, color: '#1c5d8b' }}>{unit.questions.reduce((sum, q) => sum + q.points, 0)} {language === 'th' ? 'คะแนน' : 'pts'}</span>
                    </div>
                    <p style={{ margin: '14px 0 0', color: '#4d6075' }}>{unit.intro}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="pisa-card" style={{ marginTop: 20 }}>
            <div className="pisa-question-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <div className="pisa-eyebrow" style={{ marginBottom: 6 }}>{language === 'th' ? 'โจทย์' : 'Problem'}</div>
                  <h2 style={{ margin: 0 }}>{selectedUnit.title}</h2>
                  <p style={{ margin: '8px 0 0', color: '#5b6774' }}>{selectedUnit.theme}</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button className="pisa-btn secondary" type="button" onClick={() => navigate('/pisa/science')}>
                    {language === 'th' ? 'ย้อนกลับไปเลือกโจทย์' : 'Back to problem list'}
                  </button>
                </div>
              </div>

              <p style={{ marginTop: 16, lineHeight: 1.8 }}>{selectedUnit.intro}</p>

              {selectedUnit.images.map((image) => (
                <div key={image.id} style={{ marginTop: 18, border: '1px solid #dfeaf5', borderRadius: 16, overflow: 'hidden', background: '#fbfdff' }}>
                  <img src={image.src} alt={image.alt} style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'contain', background: '#f7fbff' }} />
                  <div style={{ padding: '10px 12px', fontSize: 13, color: '#4d6075' }}>{image.caption}</div>
                </div>
              ))}

              <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
                {selectedUnit.questions.map((question, questionIndex) => (
                  <div key={question.id} style={{ border: '1px solid #e2ebf6', borderRadius: 16, padding: 18, background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
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
        )}

        <section className="pisa-card" style={{ marginTop: 20 }}>
          <div className="pisa-question-box">
            <h3>{language === 'th' ? 'สรุปคะแนน' : 'Score overview'}</h3>
            <p>{language === 'th' ? 'นักเรียนสามารถเลือกโจทย์และตอบคำถามย่อยทีละข้อด้วยโครงสร้างที่ชัดเจน' : 'Students can choose a problem and answer sub-questions one at a time with a clear structure.'}</p>
            <div className="pisa-answer" style={{ marginTop: 12 }}>
              {language === 'th' ? `รวมคะแนนทั้งหมด ${totalPoints} คะแนน` : `Total possible points: ${totalPoints}`}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
