import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { AnalysisDisplay } from '../components/AnalysisDisplay';
import { analyzeStudentAnswer } from '../services/api';
import './PisaAssessmentPage.css';
import readingContent from './pisaReadingContent.js';
const readingUnits = (readingContent.units ?? []);
const allReadingQuestions = readingUnits.flatMap((unit) => unit.questions ?? []);
export const PisaReadingPage = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { unitId, questionId } = useParams();
    const [answers, setAnswers] = useState({});
    const [selectedChoices, setSelectedChoices] = useState({});
    const [mcResults, setMcResults] = useState({});
    const [analysisMap, setAnalysisMap] = useState({});
    const [isSubmitting, setIsSubmitting] = useState({});
    const [error, setError] = useState(null);
    const activeUnit = useMemo(() => (unitId ? readingUnits.find((unit) => unit.id === unitId) : undefined), [unitId]);
    const activeQuestion = useMemo(() => (questionId ? allReadingQuestions.find((question) => question.id === questionId) : undefined), [questionId]);
    const activeQuestionUnit = useMemo(() => activeQuestion ? readingUnits.find((unit) => unit.questions.some((question) => question.id === activeQuestion.id)) : undefined, [activeQuestion]);
    const isQuestionView = Boolean(questionId && questionId.trim()) && location.pathname.startsWith('/pisa/reading/question/');
    const isUnitView = Boolean(unitId && unitId.trim()) && location.pathname.startsWith('/pisa/reading/unit/');
    const currentImages = useMemo(() => activeUnit?.images ?? activeQuestionUnit?.images ?? [], [activeUnit, activeQuestionUnit]);
    const handleOpenSubmit = async (question) => {
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
                language: language,
            });
            setAnalysisMap((prev) => ({ ...prev, [question.id]: result }));
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
        }
        finally {
            setIsSubmitting((prev) => ({ ...prev, [question.id]: false }));
        }
    };
    const handleChoiceSubmit = (question) => {
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
    const renderUnitCard = (unit, index) => {
        return (_jsxs("div", { className: "menu-card", onClick: () => navigate(`/pisa/reading/unit/${unit.id}`), children: [_jsx("div", { className: "menu-thumb", children: unit.emoji || String(index + 1) }), _jsxs("div", { className: "menu-body", children: [_jsx("h3", { className: "menu-title", children: unit.title }), _jsx("p", { className: "menu-sub", children: language === 'th' ? `${unit.questions.length} ข้อ` : `${unit.questions.length} questions` }), _jsx("div", { className: "menu-tags", children: unit.tags?.map((tag) => (_jsx("span", { children: tag }, tag))) })] }), _jsx("div", { className: "menu-go", children: "\u203A" })] }, unit.id));
    };
    const renderQuestionCard = (question, index) => {
        const isOpen = question.type === 'open';
        const typeLabel = isOpen
            ? language === 'th' ? 'เขียนตอบ (AI ตรวจ)' : 'Open response (AI checked)'
            : language === 'th' ? 'เลือกตอบ' : 'Multiple choice';
        return (_jsxs("div", { className: "menu-card", onClick: () => navigate(`/pisa/reading/question/${question.id}`), children: [_jsx("div", { className: "menu-thumb", children: String(index + 1) }), _jsxs("div", { className: "menu-body", children: [_jsx("h3", { className: "menu-title", children: question.text }), _jsx("p", { className: "menu-sub", children: question.meta || typeLabel }), _jsxs("div", { className: "menu-tags", children: [_jsx("span", { children: language === 'th' ? `ข้อ ${index + 1}` : `Question ${index + 1}` }), _jsx("span", { children: typeLabel }), question.difficulty && _jsx("span", { children: question.difficulty })] })] }), _jsx("div", { className: "menu-go", children: "\u203A" })] }, question.id));
    };
    const renderQuestionBlock = (question, index) => {
        const isOpen = question.type === 'open';
        const typeLabel = isOpen
            ? language === 'th' ? 'เขียนตอบ (AI ตรวจ)' : 'Open response (AI checked)'
            : language === 'th' ? 'เลือกตอบ' : 'Multiple choice';
        return (_jsxs("div", { className: "pisa-question-box", style: { marginBottom: 20 }, children: [_jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { style: { minWidth: 0 }, children: [_jsx("p", { style: { margin: 0, fontSize: 14, color: '#5b6774' }, children: language === 'th' ? `ข้อ ${index + 1}` : `Question ${index + 1}` }), _jsx("p", { style: { margin: '8px 0 0', fontWeight: 700, fontSize: 17 }, children: question.text }), question.meta && _jsx("p", { style: { color: '#566d80', fontSize: 13, marginTop: 8 }, children: question.meta })] }), _jsx("div", { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#eef7ff', color: '#1c5d8b', borderRadius: 999, padding: '6px 12px', fontSize: 12, fontWeight: 700 }, children: typeLabel })] }), isOpen ? (_jsxs(_Fragment, { children: [_jsx("textarea", { className: "pisa-answer-textarea", value: answers[question.id] || '', onChange: (event) => setAnswers((prev) => ({ ...prev, [question.id]: event.target.value })), rows: 12, placeholder: language === 'th' ? 'พิมพ์คำตอบของคุณที่นี่...' : 'Type your answer here...', style: { width: '100%', borderRadius: 12, border: '1px solid #dfeaf5', padding: 12, fontSize: 15, resize: 'vertical', minHeight: 280, marginTop: 16 } }), _jsx("div", { className: "pisa-actions", style: { marginTop: 12 }, children: _jsx("button", { className: "pisa-btn primary", type: "button", onClick: () => handleOpenSubmit(question), disabled: isSubmitting[question.id], children: isSubmitting[question.id]
                                    ? (language === 'th' ? 'กำลังตรวจ...' : 'Checking...')
                                    : (language === 'th' ? 'ส่งคำตอบ' : 'Submit answer') }) }), analysisMap[question.id] && (_jsx("div", { style: { marginTop: 16 }, children: _jsx(AnalysisDisplay, { result: analysisMap[question.id] }) }))] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "pisa-options", style: { marginTop: 16 }, children: question.options?.map((option, optionIndex) => (_jsxs("button", { type: "button", className: `pisa-option ${selectedChoices[question.id] === option ? 'selected' : ''}`, onClick: () => setSelectedChoices((prev) => ({ ...prev, [question.id]: option })), children: [_jsxs("span", { children: [String.fromCharCode(65 + optionIndex), "."] }), _jsx("span", { children: option })] }, optionIndex))) }), _jsx("div", { className: "pisa-actions", style: { marginTop: 12 }, children: _jsx("button", { className: "pisa-btn primary", type: "button", onClick: () => handleChoiceSubmit(question), children: language === 'th' ? 'ตรวจคำตอบ' : 'Check answer' }) }), mcResults[question.id] && (_jsxs("div", { className: "pisa-answer", style: { marginTop: 12 }, children: [_jsx("strong", { children: mcResults[question.id].correct ? (language === 'th' ? 'ถูกต้อง' : 'Correct') : (language === 'th' ? 'ยังไม่ถูกต้อง' : 'Not quite right') }), _jsxs("p", { style: { margin: '8px 0 0' }, children: [language === 'th' ? 'คำตอบที่ถูกต้องคือ' : 'Correct answer is', ": ", _jsx("strong", { children: mcResults[question.id].answer })] })] }))] }))] }, question.id));
    };
    if (isQuestionView && activeQuestion) {
        return (_jsx("div", { className: "pisa-assessment-page", children: _jsxs("div", { className: "pisa-shell", children: [_jsxs("section", { className: "pisa-card pisa-hero", children: [_jsxs("div", { children: [_jsx("div", { className: "pisa-eyebrow", children: "\uD83D\uDCD6 Reading" }), _jsx("h1", { className: "pisa-title", children: activeQuestion.text }), _jsx("p", { className: "pisa-description", children: language === 'th'
                                            ? 'เลือกคำถามนี้เพื่อฝึกทักษะการอ่านและรับคำแนะนำจากระบบ AI'
                                            : 'Choose this task to practice reading comprehension and receive AI guidance.' })] }), _jsxs("div", { className: "pisa-actions", children: [_jsx("button", { className: "pisa-btn secondary", type: "button", onClick: () => navigate(activeQuestionUnit ? `/pisa/reading/unit/${activeQuestionUnit.id}` : '/pisa/reading'), children: language === 'th' ? 'กลับหน้าบทอ่าน' : 'Back to unit' }), _jsx(Link, { className: "pisa-btn primary", to: "/pisa", children: language === 'th' ? 'กลับสู่หน้าหลัก PISA' : 'Back to PISA home' })] })] }), _jsx("section", { className: "pisa-card", children: _jsxs("div", { className: "pisa-question-box", children: [_jsx("h3", { children: language === 'th' ? 'บทอ่าน' : 'Reading passage' }), _jsx("p", { style: { whiteSpace: 'pre-line', lineHeight: 1.8 }, children: activeQuestionUnit?.passage }), activeQuestionUnit?.passageNote && _jsx("p", { style: { marginTop: 12, color: '#6b7280', fontSize: 13 }, children: activeQuestionUnit.passageNote })] }) }), currentImages.length > 0 && (_jsx("section", { className: "pisa-card", children: _jsxs("div", { className: "pisa-question-box", children: [_jsx("h3", { children: language === 'th' ? 'ภาพประกอบจากบทอ่าน' : 'Reading figures' }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }, children: currentImages.map((image) => (_jsxs("div", { style: { border: '1px solid #dfeaf5', borderRadius: 12, overflow: 'hidden', background: '#fff' }, children: [_jsx("img", { src: image.src, alt: image.caption, style: { width: '100%', display: 'block', maxHeight: 320, objectFit: 'contain', borderBottom: '1px solid #dfeaf5', background: '#f6fbff' } }), _jsx("div", { style: { padding: '8px 12px', fontSize: 12, color: '#4d6075', fontWeight: 700 }, children: image.caption })] }, image.id))) })] }) })), _jsx("section", { className: "pisa-card", children: _jsxs("div", { className: "pisa-question-box", children: [_jsx("h3", { children: language === 'th' ? 'คำถามที่เลือก' : 'Selected task' }), _jsx("div", { style: { display: 'grid', gap: 20 }, children: _jsxs("div", { style: { border: '1px solid #e3ebf6', borderRadius: 16, padding: 18, background: '#fff' }, children: [_jsx("p", { style: { fontWeight: 700, marginBottom: 8 }, children: activeQuestion.text }), activeQuestion.meta && _jsx("p", { style: { color: '#566d80', fontSize: 13, marginTop: 0 }, children: activeQuestion.meta }), activeQuestion.type === 'mc' ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "pisa-options", children: activeQuestion.options?.map((option, index) => (_jsxs("button", { type: "button", className: `pisa-option ${selectedChoices[activeQuestion.id] === option ? 'selected' : ''}`, onClick: () => setSelectedChoices((prev) => ({ ...prev, [activeQuestion.id]: option })), children: [_jsxs("span", { children: [String.fromCharCode(65 + index), "."] }), _jsx("span", { children: option })] }, index))) }), _jsx("div", { className: "pisa-actions", style: { marginTop: 12 }, children: _jsx("button", { className: "pisa-btn primary", type: "button", onClick: () => handleChoiceSubmit(activeQuestion), children: language === 'th' ? 'ตรวจคำตอบ' : 'Check answer' }) }), mcResults[activeQuestion.id] && (_jsxs("div", { className: "pisa-answer", style: { marginTop: 12 }, children: [_jsx("strong", { children: mcResults[activeQuestion.id].correct ? (language === 'th' ? 'ถูกต้อง' : 'Correct') : (language === 'th' ? 'ยังไม่ถูกต้อง' : 'Not quite right') }), _jsxs("p", { style: { margin: '8px 0 0' }, children: [language === 'th' ? 'คำตอบที่ถูกต้องคือ' : 'Correct answer is', ": ", _jsx("strong", { children: mcResults[activeQuestion.id].answer })] })] }))] })) : (_jsxs(_Fragment, { children: [_jsx("textarea", { className: "pisa-answer-textarea", value: answers[activeQuestion.id] || '', onChange: (event) => setAnswers((prev) => ({ ...prev, [activeQuestion.id]: event.target.value })), rows: 12, placeholder: language === 'th' ? 'พิมพ์คำตอบของคุณที่นี่...' : 'Type your answer here...', style: { width: '100%', borderRadius: 12, border: '1px solid #dfeaf5', padding: 12, fontSize: 15, resize: 'vertical', minHeight: 280 } }), _jsx("div", { className: "pisa-actions", style: { marginTop: 12 }, children: _jsx("button", { className: "pisa-btn primary", type: "button", onClick: () => handleOpenSubmit(activeQuestion), disabled: isSubmitting[activeQuestion.id], children: isSubmitting[activeQuestion.id]
                                                                ? (language === 'th' ? 'กำลังตรวจ...' : 'Checking...')
                                                                : (language === 'th' ? 'ส่งคำตอบ' : 'Submit answer') }) }), analysisMap[activeQuestion.id] && (_jsx("div", { style: { marginTop: 16 }, children: _jsx(AnalysisDisplay, { result: analysisMap[activeQuestion.id] }) }))] }))] }, activeQuestion.id) }), error && (_jsx("div", { className: "pisa-answer", style: { marginTop: 16, background: '#fff4f4', borderColor: '#f1b5b5', color: '#8c2d2d' }, children: error }))] }) })] }) }));
    }
    if (isUnitView && activeUnit) {
        return (_jsx("div", { className: "reading-page", children: _jsxs("div", { className: "reading-shell", children: [_jsxs("section", { className: "pisa-card reading-hero", children: [_jsxs("div", { children: [_jsx("div", { className: "pisa-eyebrow", children: "\uD83D\uDCD6 Reading" }), _jsx("h1", { className: "pisa-title", children: activeUnit.title }), _jsx("p", { className: "pisa-description", children: language === 'th'
                                            ? 'อ่านบทความนี้แล้วตอบคำถามทั้งหมดในบทนี้โดยไม่ต้องเลือกข้อย่อย'
                                            : 'Read this passage and answer every question in this unit without selecting one separately.' })] }), _jsxs("div", { className: "pisa-actions", children: [_jsx("button", { className: "pisa-btn secondary", type: "button", onClick: () => navigate('/pisa/reading'), children: language === 'th' ? 'กลับหน้าบทอ่าน' : 'Back to reading menu' }), _jsx(Link, { className: "pisa-btn primary", to: "/pisa", children: language === 'th' ? 'กลับสู่หน้าหลัก PISA' : 'Back to PISA home' })] })] }), _jsx("section", { className: "pisa-card", children: _jsxs("div", { className: "pisa-question-box", children: [_jsx("h3", { children: language === 'th' ? 'บทอ่าน' : 'Reading passage' }), _jsx("p", { style: { whiteSpace: 'pre-line', lineHeight: 1.8 }, children: activeUnit.passage }), activeUnit.passageNote && _jsx("p", { style: { marginTop: 12, color: '#6b7280', fontSize: 13 }, children: activeUnit.passageNote })] }) }), currentImages.length > 0 && (_jsx("section", { className: "pisa-card", children: _jsxs("div", { className: "pisa-question-box", children: [_jsx("h3", { children: language === 'th' ? 'ภาพประกอบจากบทอ่าน' : 'Reading figures' }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }, children: currentImages.map((image) => (_jsxs("div", { style: { border: '1px solid #dfeaf5', borderRadius: 12, overflow: 'hidden', background: '#fff' }, children: [_jsx("img", { src: image.src, alt: image.caption, style: { width: '100%', display: 'block', maxHeight: 320, objectFit: 'contain', borderBottom: '1px solid #dfeaf5', background: '#f6fbff' } }), _jsx("div", { style: { padding: '8px 12px', fontSize: 12, color: '#4d6075', fontWeight: 700 }, children: image.caption })] }, image.id))) })] }) })), _jsxs("section", { className: "pisa-card", children: [_jsx("p", { className: "menu-intro", children: language === 'th'
                                    ? 'ตอบคำถามทั้งหมดในบทนี้จากบนลงล่าง โดยไม่ต้องเลือกข้อย่อย'
                                    : 'Answer all questions in this unit from top to bottom without choosing a separate subquestion.' }), _jsx("div", { style: { display: 'grid', gap: 20 }, children: activeUnit.questions.map((question, index) => renderQuestionBlock(question, index)) })] })] }) }));
    }
    return (_jsx("div", { className: "reading-page", children: _jsxs("div", { className: "reading-shell", children: [_jsxs("section", { className: "pisa-card reading-hero", children: [_jsxs("div", { children: [_jsx("div", { className: "pisa-eyebrow", children: "\uD83D\uDCD6 Reading" }), _jsx("h1", { className: "pisa-title", children: language === 'th' ? 'แบบฝึกอ่านแบบ PISA' : 'PISA Reading Practice' }), _jsx("p", { className: "pisa-description", children: language === 'th'
                                        ? 'เลือกบทอ่านที่ต้องการทำก่อน 1 บท หรือกดทำข้อสอบทั้งหมดย้อนดูเดียว'
                                        : 'Pick a reading unit to start with, or choose any unit from the menu.' })] }), _jsx("div", { className: "pisa-actions", children: _jsx(Link, { className: "pisa-btn secondary", to: "/pisa", children: language === 'th' ? 'กลับสู่หน้าหลัก PISA' : 'Back to PISA home' }) })] }), _jsxs("section", { className: "pisa-card", children: [_jsx("p", { className: "menu-intro", children: language === 'th'
                                ? 'หน้ารายการบทอ่านนี้แสดงหน่วยอ่านทั้งหมดในรูปแบบเดียวกับตัวอย่าง PISA — ไม่ใช่คำถามย่อยเพียงชุดเดียว'
                                : 'This reading menu shows the full set of units from the PISA example, not just one passage with subquestions.' }), _jsx("div", { className: "menu-grid", children: readingUnits.map((unit, index) => renderUnitCard(unit, index)) })] })] }) }));
};
