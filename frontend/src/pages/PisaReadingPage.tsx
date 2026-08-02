import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
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
  scoringRubric?: string;
  meta?: string;
  difficulty?: string;
  subject?: string;
  sourcePdfUrl?: string;
};

type ReadingUnit = {
  id: string;
  title: string;
  emoji?: string;
  tags?: string[];
  passage: string;
  passageNote?: string;
  images?: Array<{ id: string; src: string; alt: string; caption: string }>;
  questions: ReadingQuestion[];
};

const readingUnits = (readingContent.units ?? []) as ReadingUnit[];
const allReadingQuestions = readingUnits.flatMap((unit) => unit.questions ?? []);

export const PisaReadingPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { unitId, questionId } = useParams<{ unitId?: string; questionId?: string }>();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [mcResults, setMcResults] = useState<Record<string, { correct: boolean; selected: string; answer: string }>>({});
  const [analysisMap, setAnalysisMap] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const activeUnit = useMemo(
    () => (unitId ? readingUnits.find((unit) => unit.id === unitId) : undefined),
    [unitId]
  );

  const activeQuestion = useMemo(
    () => (questionId ? allReadingQuestions.find((question) => question.id === questionId) : undefined),
    [questionId]
  );

  const activeQuestionUnit = useMemo(
    () => activeQuestion ? readingUnits.find((unit) => unit.questions.some((question) => question.id === activeQuestion.id)) : undefined,
    [activeQuestion]
  );

  const isQuestionView = Boolean(questionId && questionId.trim()) && location.pathname.startsWith('/pisa/reading/question/');
  const isUnitView = Boolean(unitId && unitId.trim()) && location.pathname.startsWith('/pisa/reading/unit/');

  const currentImages = useMemo(
    () => activeUnit?.images ?? activeQuestionUnit?.images ?? [],
    [activeUnit, activeQuestionUnit]
  );

  const handleOpenSubmit = async (question: ReadingQuestion) => {
    const answer = (answers[question.id] ?? '').trim();
    if (!answer) {
      setError(language === 'th' ? 'กรุณาพิมพ์คำตอบก่อนส่ง' : 'Please type an answer before submitting.');
      return;
    }

    setError(null);
    setIsSubmitting((prev) => ({ ...prev, [question.id]: true }));

    const scoringGuideline = question.scoringRubric || question.rubric || 'Use the passage and grading rubric as your basis for assessment.';
    const propositionRubric = question.scoringRubric || question.rubric || undefined;

    try {
      const result = await analyzeStudentAnswer({
        transcription: answer,
        questionId: question.id,
        referenceAnswer: question.answer || 'Use evidence from the reading passage.',
        scoringGuideline,
        studentId: 'pisa-reading-user',
        proposition: {
          questionType: 'open',
          sourceType: 'reading',
          title: readingContent.title,
          questionText: question.text,
          rubric: propositionRubric,
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

  const renderUnitCard = (unit: ReadingUnit, index: number) => {
    return (
      <div key={unit.id} className="menu-card" onClick={() => navigate(`/pisa/reading/unit/${unit.id}`)}>
        <div className="menu-thumb">{unit.emoji || String(index + 1)}</div>
        <div className="menu-body">
          <h3 className="menu-title">{unit.title}</h3>
          <p className="menu-sub">{language === 'th' ? `${unit.questions.length} ข้อ` : `${unit.questions.length} questions`}</p>
          <div className="menu-tags">
            {unit.tags?.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="menu-go">›</div>
      </div>
    );
  };

  const renderQuestionCard = (question: ReadingQuestion, index: number) => {
    const isOpen = question.type === 'open';
    const typeLabel = isOpen
      ? language === 'th' ? 'เขียนตอบ (AI ตรวจ)' : 'Open response (AI checked)'
      : language === 'th' ? 'เลือกตอบ' : 'Multiple choice';

    return (
      <div key={question.id} className="menu-card" onClick={() => navigate(`/pisa/reading/question/${question.id}`)}>
        <div className="menu-thumb">{String(index + 1)}</div>
        <div className="menu-body">
          <h3 className="menu-title">{question.text}</h3>
          <p className="menu-sub">{question.meta || typeLabel}</p>
          <div className="menu-tags">
            <span>{language === 'th' ? `ข้อ ${index + 1}` : `Question ${index + 1}`}</span>
            <span>{typeLabel}</span>
            {question.difficulty && <span>{question.difficulty}</span>}
          </div>
        </div>
        <div className="menu-go">›</div>
      </div>
    );
  };

  const renderQuestionBlock = (question: ReadingQuestion, index: number) => {
    const isOpen = question.type === 'open';
    const typeLabel = isOpen
      ? language === 'th' ? 'เขียนตอบ (AI ตรวจ)' : 'Open response (AI checked)'
      : language === 'th' ? 'เลือกตอบ' : 'Multiple choice';

    return (
      <div key={question.id} className="pisa-question-box" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, color: '#5b6774' }}>{language === 'th' ? `ข้อ ${index + 1}` : `Question ${index + 1}`}</p>
            <p style={{ margin: '8px 0 0', fontWeight: 700, fontSize: 17 }}>{question.text}</p>
            {question.meta && <p style={{ color: '#566d80', fontSize: 13, marginTop: 8 }}>{question.meta}</p>}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#eef7ff', color: '#1c5d8b', borderRadius: 999, padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>{typeLabel}</div>
        </div>

        {isOpen ? (
          <>
            <textarea
              className="pisa-answer-textarea"
              value={answers[question.id] || ''}
              onChange={(event) => setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))}
              rows={12}
              placeholder={language === 'th' ? 'พิมพ์คำตอบของคุณที่นี่...' : 'Type your answer here...'}
              style={{ width: '100%', borderRadius: 12, border: '1px solid #dfeaf5', padding: 12, fontSize: 15, resize: 'vertical', minHeight: 280, marginTop: 16 }}
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
        ) : (
          <>
            <div className="pisa-options" style={{ marginTop: 16 }}>
              {question.options?.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  type="button"
                  className={`pisa-option ${selectedChoices[question.id] === option ? 'selected' : ''}`}
                  onClick={() => setSelectedChoices((prev) => ({ ...prev, [question.id]: option }))}
                >
                  <span>{String.fromCharCode(65 + optionIndex)}.</span>
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
        )}
      </div>
    );
  };

  if (isQuestionView && activeQuestion) {
    return (
      <div className="pisa-assessment-page">
        <div className="pisa-shell">
          <section className="pisa-card pisa-hero">
            <div>
              <div className="pisa-eyebrow">📖 Reading</div>
              <h1 className="pisa-title">{activeQuestion.text}</h1>
              <p className="pisa-description">
                {language === 'th'
                  ? 'เลือกคำถามนี้เพื่อฝึกทักษะการอ่านและรับคำแนะนำจากระบบ AI'
                  : 'Choose this task to practice reading comprehension and receive AI guidance.'}
              </p>
            </div>
            <div className="pisa-actions">
              <button className="pisa-btn secondary" type="button" onClick={() => navigate(activeQuestionUnit ? `/pisa/reading/unit/${activeQuestionUnit.id}` : '/pisa/reading')}>
                {language === 'th' ? 'กลับหน้าบทอ่าน' : 'Back to unit'}
              </button>
              <Link className="pisa-btn primary" to="/pisa">
                {language === 'th' ? 'กลับสู่หน้าหลัก PISA' : 'Back to PISA home'}
              </Link>
            </div>
          </section>

          <section className="pisa-card">
            <div className="pisa-question-box">
              <h3>{language === 'th' ? 'บทอ่าน' : 'Reading passage'}</h3>
              <p style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{activeQuestionUnit?.passage}</p>
              {activeQuestionUnit?.passageNote && <p style={{ marginTop: 12, color: '#6b7280', fontSize: 13 }}>{activeQuestionUnit.passageNote}</p>}
            </div>
          </section>

          {currentImages.length > 0 && (
            <section className="pisa-card">
              <div className="pisa-question-box">
                <h3>{language === 'th' ? 'ภาพประกอบจากบทอ่าน' : 'Reading figures'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  {currentImages.map((image) => (
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
          )}

          <section className="pisa-card">
            <div className="pisa-question-box">
              <h3>{language === 'th' ? 'คำถามที่เลือก' : 'Selected task'}</h3>
              <div style={{ display: 'grid', gap: 20 }}>
                <div key={activeQuestion.id} style={{ border: '1px solid #e3ebf6', borderRadius: 16, padding: 18, background: '#fff' }}>
                  <p style={{ fontWeight: 700, marginBottom: 8 }}>{activeQuestion.text}</p>
                  {activeQuestion.meta && <p style={{ color: '#566d80', fontSize: 13, marginTop: 0 }}>{activeQuestion.meta}</p>}

                  {activeQuestion.type === 'mc' ? (
                    <>
                      <div className="pisa-options">
                        {activeQuestion.options?.map((option, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`pisa-option ${selectedChoices[activeQuestion.id] === option ? 'selected' : ''}`}
                            onClick={() => setSelectedChoices((prev) => ({ ...prev, [activeQuestion.id]: option }))}
                          >
                            <span>{String.fromCharCode(65 + index)}.</span>
                            <span>{option}</span>
                          </button>
                        ))}
                      </div>

                      <div className="pisa-actions" style={{ marginTop: 12 }}>
                        <button className="pisa-btn primary" type="button" onClick={() => handleChoiceSubmit(activeQuestion)}>
                          {language === 'th' ? 'ตรวจคำตอบ' : 'Check answer'}
                        </button>
                      </div>

                      {mcResults[activeQuestion.id] && (
                        <div className="pisa-answer" style={{ marginTop: 12 }}>
                          <strong>{mcResults[activeQuestion.id].correct ? (language === 'th' ? 'ถูกต้อง' : 'Correct') : (language === 'th' ? 'ยังไม่ถูกต้อง' : 'Not quite right')}</strong>
                          <p style={{ margin: '8px 0 0' }}>
                            {language === 'th' ? 'คำตอบที่ถูกต้องคือ' : 'Correct answer is'}: <strong>{mcResults[activeQuestion.id].answer}</strong>
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <textarea
                        className="pisa-answer-textarea"
                        value={answers[activeQuestion.id] || ''}
                        onChange={(event) => setAnswers((prev) => ({ ...prev, [activeQuestion.id]: event.target.value }))}
                        rows={12}
                        placeholder={language === 'th' ? 'พิมพ์คำตอบของคุณที่นี่...' : 'Type your answer here...'}
                        style={{ width: '100%', borderRadius: 12, border: '1px solid #dfeaf5', padding: 12, fontSize: 15, resize: 'vertical', minHeight: 280 }}
                      />

                      <div className="pisa-actions" style={{ marginTop: 12 }}>
                        <button className="pisa-btn primary" type="button" onClick={() => handleOpenSubmit(activeQuestion)} disabled={isSubmitting[activeQuestion.id]}>
                          {isSubmitting[activeQuestion.id]
                            ? (language === 'th' ? 'กำลังตรวจ...' : 'Checking...')
                            : (language === 'th' ? 'ส่งคำตอบ' : 'Submit answer')}
                        </button>
                      </div>

                      {analysisMap[activeQuestion.id] && (
                        <div style={{ marginTop: 16 }}>
                          <AnalysisDisplay result={analysisMap[activeQuestion.id]} />
                        </div>
                      )}
                    </>
                  )}
                </div>
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
  }

  if (isUnitView && activeUnit) {
    return (
      <div className="reading-page">
        <div className="reading-shell">
          <section className="pisa-card reading-hero">
            <div>
              <div className="pisa-eyebrow">📖 Reading</div>
              <h1 className="pisa-title">{activeUnit.title}</h1>
              <p className="pisa-description">
                {language === 'th'
                  ? 'อ่านบทความนี้แล้วตอบคำถามทั้งหมดในบทนี้โดยไม่ต้องเลือกข้อย่อย'
                  : 'Read this passage and answer every question in this unit without selecting one separately.'}
              </p>
            </div>
            <div className="pisa-actions">
              <button className="pisa-btn secondary" type="button" onClick={() => navigate('/pisa/reading')}>
                {language === 'th' ? 'กลับหน้าบทอ่าน' : 'Back to reading menu'}
              </button>
              <Link className="pisa-btn primary" to="/pisa">
                {language === 'th' ? 'กลับสู่หน้าหลัก PISA' : 'Back to PISA home'}
              </Link>
            </div>
          </section>

          <section className="pisa-card">
            <div className="pisa-question-box">
              <h3>{language === 'th' ? 'บทอ่าน' : 'Reading passage'}</h3>
              <p style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{activeUnit.passage}</p>
              {activeUnit.passageNote && <p style={{ marginTop: 12, color: '#6b7280', fontSize: 13 }}>{activeUnit.passageNote}</p>}
            </div>
          </section>

          {currentImages.length > 0 && (
            <section className="pisa-card">
              <div className="pisa-question-box">
                <h3>{language === 'th' ? 'ภาพประกอบจากบทอ่าน' : 'Reading figures'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  {currentImages.map((image) => (
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
          )}

          <section className="pisa-card">
            <p className="menu-intro">
              {language === 'th'
                ? 'ตอบคำถามทั้งหมดในบทนี้จากบนลงล่าง โดยไม่ต้องเลือกข้อย่อย'
                : 'Answer all questions in this unit from top to bottom without choosing a separate subquestion.'}
            </p>
            <div style={{ display: 'grid', gap: 20 }}>
              {activeUnit.questions.map((question, index) => renderQuestionBlock(question, index))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="reading-page">
      <div className="reading-shell">
        <section className="pisa-card reading-hero">
          <div>
            <div className="pisa-eyebrow">📖 Reading</div>
            <h1 className="pisa-title">{language === 'th' ? 'แบบฝึกอ่านแบบ PISA' : 'PISA Reading Practice'}</h1>
            <p className="pisa-description">
              {language === 'th'
                ? 'เลือกบทอ่านที่ต้องการทำก่อน 1 บท หรือกดทำข้อสอบทั้งหมดย้อนดูเดียว'
                : 'Pick a reading unit to start with, or choose any unit from the menu.'}
            </p>
          </div>
          <div className="pisa-actions">
            <Link className="pisa-btn secondary" to="/pisa">
              {language === 'th' ? 'กลับสู่หน้าหลัก PISA' : 'Back to PISA home'}
            </Link>
          </div>
        </section>

        <section className="pisa-card">
          <p className="menu-intro">
            {language === 'th'
              ? 'หน้ารายการบทอ่านนี้แสดงหน่วยอ่านทั้งหมดในรูปแบบเดียวกับตัวอย่าง PISA — ไม่ใช่คำถามย่อยเพียงชุดเดียว'
              : 'This reading menu shows the full set of units from the PISA example, not just one passage with subquestions.'}
          </p>
          <div className="menu-grid">
            {readingUnits.map((unit, index) => renderUnitCard(unit, index))}
          </div>
        </section>
      </div>
    </div>
  );
};
