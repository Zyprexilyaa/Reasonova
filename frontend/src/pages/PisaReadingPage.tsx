import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { AnalysisDisplay } from '../components/AnalysisDisplay';
import { analyzeStudentAnswer } from '../services/api';
import './PisaAssessmentPage.css';
import readingContent from './pisaReadingContent.js';

type ReadingQuestion = {
  id: string;
  type: 'mc' | 'open';
  text: string;
  options?: string[];
  correctIndex?: number;
  answer?: string;
  rubric?: string;
  meta?: string;
  difficulty?: string;
  subject?: string;
  sourcePdfUrl?: string;
};

const readingQuestions = (readingContent.questions ?? []) as ReadingQuestion[];

export const PisaReadingPage: React.FC = () => {
  const { language } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [mcResults, setMcResults] = useState<Record<string, { correct: boolean; selected: string; answer: string }>>({});
  const [analysisMap, setAnalysisMap] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const figures = useMemo(() => readingContent.extractedImages ?? [], []);

  const handleOpenSubmit = async (question: ReadingQuestion) => {
    const answer = (answers[question.id] ?? '').trim();
    if (!answer) {
      setError(language === 'th' ? 'กรุณาพิมพ์คำตอบก่อนส่ง' : 'Please type an answer before submitting.');
      return;
    }

    setError(null);
    setIsSubmitting((prev) => ({ ...prev, [question.id]: true }));

    try {
      const result = await analyzeStudentAnswer({
        transcription: answer,
        questionId: question.id,
        referenceAnswer: question.answer || 'Use evidence from the reading passage.',
        scoringGuideline: question.rubric || 'Use the passage and grading rubric as your basis for assessment.',
        studentId: 'pisa-reading-user',
        proposition: {
          questionType: 'open',
          sourceType: 'reading',
          title: readingContent.title,
          questionText: question.text,
          rubric: question.rubric,
        },
        language: language as 'th' | 'en',
      });

      setAnalysisMap((prev) => ({ ...prev, [question.id]: result }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [question.id]: false }));
    }
  };

  const handleChoiceSubmit = (question: ReadingQuestion) => {
    const selected = selectedChoices[question.id];
    const answer = question.answer || question.options?.[question.correctIndex || 0] || '';

    if (!selected) {
      setError(language === 'th' ? 'กรุณาเลือกตัวเลือกก่อนตรวจคำตอบ' : 'Please select an answer before checking.');
      return;
    }

    setError(null);
    setMcResults((prev) => ({
      ...prev,
      [question.id]: {
        correct: selected === answer,
        selected,
        answer,
      },
    }));
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
                ? 'แบบฝึกอ่านนี้ใช้บทอ่าน “ทะเลสาบชาด (Lake Chad)” พร้อมกราฟและภาพประกอบ และเชื่อมต่อกับระบบ AI สำหรับตรวจคำตอบแบบเขียนตอบ'
                : 'This reading exercise uses the Lake Chad passage with charts and illustrations, and it is connected to the AI grading flow for open-response answers.'}
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
            <h3>{language === 'th' ? 'บทอ่าน' : 'Reading passage'}</h3>
            <p style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{readingContent.passage}</p>
          </div>
        </section>

        <section className="pisa-card">
          <div className="pisa-question-box">
            <h3>{language === 'th' ? 'ภาพประกอบจากบทอ่าน' : 'Reading figures'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {figures.map((image) => (
                <div key={image.id} style={{ border: '1px solid #dfeaf5', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                  <img
                    src={image.src}
                    alt={image.caption}
                    style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'contain', borderBottom: '1px solid #dfeaf5', background: '#f6fbff' }}
                  />
                  <div style={{ padding: '8px 12px', fontSize: 12, color: '#4d6075', fontWeight: 700 }}>
                    {image.caption}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pisa-card">
          <div className="pisa-question-box">
            <h3>{language === 'th' ? 'คำถามทั้งหมด' : 'Questions'}</h3>
            <div style={{ display: 'grid', gap: 20 }}>
              {readingQuestions.map((question) => (
                <div key={question.id} style={{ border: '1px solid #e3ebf6', borderRadius: 16, padding: 18, background: '#fff' }}>
                  <p style={{ fontWeight: 700, marginBottom: 8 }}>{question.text}</p>
                  {question.meta && <p style={{ color: '#566d80', fontSize: 13, marginTop: 0 }}>{question.meta}</p>}

                  {question.type === 'mc' ? (
                    <>
                      <div className="pisa-options">
                        {question.options?.map((option, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`pisa-option ${selectedChoices[question.id] === option ? 'selected' : ''}`}
                            onClick={() => setSelectedChoices((prev) => ({ ...prev, [question.id]: option }))}
                          >
                            <span>{String.fromCharCode(65 + index)}.</span>
                            <span>{option}</span>
                          </button>
                        ))}
                      </div>

                      <div className="pisa-actions" style={{ marginTop: 12 }}>
                        <button className="pisa-btn primary" type="button" onClick={() => handleChoiceSubmit(question)}>
                          {language === 'th' ? 'ตรวจคำตอบ' : 'Check answer'}
                        </button>
                      </div>

                      {mcResults[question.id] && (
                        <div className="pisa-answer" style={{ marginTop: 12 }}>
                          <strong>{mcResults[question.id].correct ? (language === 'th' ? 'ถูกต้อง' : 'Correct') : (language === 'th' ? 'ยังไม่ถูกต้อง' : 'Not quite right')}</strong>
                          <p style={{ margin: '8px 0 0' }}>
                            {language === 'th' ? 'คำตอบที่ถูกต้องคือ' : 'Correct answer is'}: <strong>{mcResults[question.id].answer}</strong>
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <textarea
                        value={answers[question.id] || ''}
                        onChange={(event) => setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))}
                        rows={5}
                        placeholder={language === 'th' ? 'พิมพ์คำตอบของคุณที่นี่...' : 'Type your answer here...'}
                        style={{ width: '100%', borderRadius: 12, border: '1px solid #dfeaf5', padding: 12, fontSize: 15, resize: 'vertical' }}
                      />

                      <div className="pisa-actions" style={{ marginTop: 12 }}>
                        <button className="pisa-btn primary" type="button" onClick={() => handleOpenSubmit(question)} disabled={isSubmitting[question.id]}>
                          {isSubmitting[question.id]
                            ? (language === 'th' ? 'กำลังตรวจ...' : 'Checking...')
                            : (language === 'th' ? 'ส่งคำตอบ' : 'Submit answer')}
                        </button>
                      </div>

                      {analysisMap[question.id] && (
                        <div style={{ marginTop: 16 }}>
                          <AnalysisDisplay result={analysisMap[question.id]} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="pisa-answer" style={{ marginTop: 16, background: '#fff4f4', borderColor: '#f1b5b5', color: '#8c2d2d' }}>
                {error}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
