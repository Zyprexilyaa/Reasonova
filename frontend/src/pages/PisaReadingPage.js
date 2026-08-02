import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { AnalysisDisplay } from '../components/AnalysisDisplay';
import { analyzeStudentAnswer } from '../services/api';
import './PisaAssessmentPage.css';
import readingContent from './pisaReadingContent.js';
const readingQuestions = (readingContent.questions ?? []);
export const PisaReadingPage = () => {
    const { language } = useLanguage();
    const [answers, setAnswers] = useState({});
    const [selectedChoices, setSelectedChoices] = useState({});
    const [mcResults, setMcResults] = useState({});
    const [analysisMap, setAnalysisMap] = useState({});
    const [isSubmitting, setIsSubmitting] = useState({});
    const [error, setError] = useState(null);
    const figures = useMemo(() => readingContent.extractedImages ?? [], []);
    const handleOpenSubmit = async (question) => {
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
    return (_jsx("div", { className: "pisa-assessment-page", children: _jsxs("div", { className: "pisa-shell", children: [_jsxs("section", { className: "pisa-card pisa-hero", children: [_jsxs("div", { children: [_jsx("div", { className: "pisa-eyebrow", children: "\uD83D\uDCD6 Reading" }), _jsx("h1", { className: "pisa-title", children: "PISA Reading practice" }), _jsx("p", { className: "pisa-description", children: language === 'th'
                                        ? 'แบบฝึกอ่านนี้ใช้บทอ่าน “ทะเลสาบชาด (Lake Chad)” พร้อมกราฟและภาพประกอบ และเชื่อมต่อกับระบบ AI สำหรับตรวจคำตอบแบบเขียนตอบ'
                                        : 'This reading exercise uses the Lake Chad passage with charts and illustrations, and it is connected to the AI grading flow for open-response answers.' })] }), _jsx("div", { className: "pisa-actions", children: _jsx(Link, { className: "pisa-btn primary", to: "/pisa", children: language === 'th' ? 'กลับสู่หน้าหลัก PISA' : 'Back to PISA home' }) })] }), _jsx("section", { className: "pisa-card", children: _jsxs("div", { className: "pisa-question-box", children: [_jsx("h3", { children: language === 'th' ? 'บทอ่าน' : 'Reading passage' }), _jsx("p", { style: { whiteSpace: 'pre-line', lineHeight: 1.8 }, children: readingContent.passage })] }) }), _jsx("section", { className: "pisa-card", children: _jsxs("div", { className: "pisa-question-box", children: [_jsx("h3", { children: language === 'th' ? 'ภาพประกอบจากบทอ่าน' : 'Reading figures' }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }, children: figures.map((image) => (_jsxs("div", { style: { border: '1px solid #dfeaf5', borderRadius: 12, overflow: 'hidden', background: '#fff' }, children: [_jsx("img", { src: image.src, alt: image.caption, style: { width: '100%', display: 'block', maxHeight: 320, objectFit: 'contain', borderBottom: '1px solid #dfeaf5', background: '#f6fbff' } }), _jsx("div", { style: { padding: '8px 12px', fontSize: 12, color: '#4d6075', fontWeight: 700 }, children: image.caption })] }, image.id))) })] }) }), _jsx("section", { className: "pisa-card", children: _jsxs("div", { className: "pisa-question-box", children: [_jsx("h3", { children: language === 'th' ? 'คำถามทั้งหมด' : 'Questions' }), _jsx("div", { style: { display: 'grid', gap: 20 }, children: readingQuestions.map((question) => (_jsxs("div", { style: { border: '1px solid #e3ebf6', borderRadius: 16, padding: 18, background: '#fff' }, children: [_jsx("p", { style: { fontWeight: 700, marginBottom: 8 }, children: question.text }), question.meta && _jsx("p", { style: { color: '#566d80', fontSize: 13, marginTop: 0 }, children: question.meta }), question.type === 'mc' ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "pisa-options", children: question.options?.map((option, index) => (_jsxs("button", { type: "button", className: `pisa-option ${selectedChoices[question.id] === option ? 'selected' : ''}`, onClick: () => setSelectedChoices((prev) => ({ ...prev, [question.id]: option })), children: [_jsxs("span", { children: [String.fromCharCode(65 + index), "."] }), _jsx("span", { children: option })] }, index))) }), _jsx("div", { className: "pisa-actions", style: { marginTop: 12 }, children: _jsx("button", { className: "pisa-btn primary", type: "button", onClick: () => handleChoiceSubmit(question), children: language === 'th' ? 'ตรวจคำตอบ' : 'Check answer' }) }), mcResults[question.id] && (_jsxs("div", { className: "pisa-answer", style: { marginTop: 12 }, children: [_jsx("strong", { children: mcResults[question.id].correct ? (language === 'th' ? 'ถูกต้อง' : 'Correct') : (language === 'th' ? 'ยังไม่ถูกต้อง' : 'Not quite right') }), _jsxs("p", { style: { margin: '8px 0 0' }, children: [language === 'th' ? 'คำตอบที่ถูกต้องคือ' : 'Correct answer is', ": ", _jsx("strong", { children: mcResults[question.id].answer })] })] }))] })) : (_jsxs(_Fragment, { children: [_jsx("textarea", { value: answers[question.id] || '', onChange: (event) => setAnswers((prev) => ({ ...prev, [question.id]: event.target.value })), rows: 5, placeholder: language === 'th' ? 'พิมพ์คำตอบของคุณที่นี่...' : 'Type your answer here...', style: { width: '100%', borderRadius: 12, border: '1px solid #dfeaf5', padding: 12, fontSize: 15, resize: 'vertical' } }), _jsx("div", { className: "pisa-actions", style: { marginTop: 12 }, children: _jsx("button", { className: "pisa-btn primary", type: "button", onClick: () => handleOpenSubmit(question), disabled: isSubmitting[question.id], children: isSubmitting[question.id]
                                                            ? (language === 'th' ? 'กำลังตรวจ...' : 'Checking...')
                                                            : (language === 'th' ? 'ส่งคำตอบ' : 'Submit answer') }) }), analysisMap[question.id] && (_jsx("div", { style: { marginTop: 16 }, children: _jsx(AnalysisDisplay, { result: analysisMap[question.id] }) }))] }))] }, question.id))) }), error && (_jsx("div", { className: "pisa-answer", style: { marginTop: 16, background: '#fff4f4', borderColor: '#f1b5b5', color: '#8c2d2d' }, children: error }))] }) })] }) }));
};
