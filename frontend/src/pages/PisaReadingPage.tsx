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

const readingQuestions = (readingContent.questions ?? []) as ReadingQuestion[];

export const PisaReadingPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { questionId } = useParams<{ questionId: string }>();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [mcResults, setMcResults] = useState<Record<string, { correct: boolean; selected: string; answer: string }>>({});
  const [analysisMap, setAnalysisMap] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const figures = useMemo(() => readingContent.extractedImages ?? [], []);
  const isQuestionView = Boolean(questionId && questionId.trim()) && location.pathname.startsWith('/pisa/reading/question/');
  const activeQuestion = useMemo(
    () => (isQuestionView ? readingQuestions.find((question) => question.id === questionId) : undefined),
    [isQuestionView, questionId]
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
            <span>{language === 'th' ? `ข้อ ${index + 1}` : `Task ${index + 1}`}</span>
            <span>{typeLabel}</span>
            {question.difficulty && <span>{question.difficulty}</span>}
          </div>
        </div>
        <div className="menu-go">›</div>
      </div>
    );
  };

  if (activeQuestion) {
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
              <button className="pisa-btn secondary" type="button" onClick={() => navigate('/pisa/reading')}>
                {language === 'th' ? 'กลับหน้ารายการคำถาม' : 'Back to task list'}
              </button>
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
                        value={answers[activeQuestion.id] || ''}
                        onChange={(event) => setAnswers((prev) => ({ ...prev, [activeQuestion.id]: event.target.value }))}
                        rows={5}
                        placeholder={language === 'th' ? 'พิมพ์คำตอบของคุณที่นี่...' : 'Type your answer here...'}
                        style={{ width: '100%', borderRadius: 12, border: '1px solid #dfeaf5', padding: 12, fontSize: 15, resize: 'vertical' }}
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

  return (
    <div className="reading-page">
      <div className="reading-shell">
        <section className="pisa-card reading-hero">
          <div>
            <div className="pisa-eyebrow">📖 Reading</div>
            <h1 className="pisa-title">{language === 'th' ? 'แบบฝึกอ่านแบบ PISA' : 'PISA Reading Practice'}</h1>
            <p className="pisa-description">
              {language === 'th'
                ? 'เลือกบทอ่านและคำถามที่ต้องการฝึกด้วยตัวเองในสไตล์เดียวกับแบบทดสอบอ่านที่เป็นมิตรและชัดเจน'
                : 'Choose the passage and questions you want to practice in a clean, menu-style PISA reading experience.'}
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
              ? 'เลือกบทอ่านที่ต้องการทำก่อน 1 บท หรือกดทำข้อสอบทั้งหมดย้อนดูเดียว'
              : 'Pick the reading task you want to work on first, or open any question from the list below.'}
          </p>
          <div className="menu-grid">
            {readingQuestions.map((question, index) => renderQuestionCard(question, index))}
          </div>
          <button className="menu-allbtn" type="button" onClick={() => navigate(`/pisa/reading/question/${readingQuestions[0]?.id}`)}>
            {language === 'th' ? 'เริ่มจากข้อแรก' : 'Start with the first task'}
          </button>
        </section>
      </div>
    </div>
  );
};
